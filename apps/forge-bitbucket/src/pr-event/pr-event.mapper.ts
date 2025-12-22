import { route, asApp } from "@forge/api";
import { RawPrEvent } from "../types/raw-pr-event";
import { InternalFileMod, InternalPr, InternalPrEventType, InternalPrState } from "../models/internal-pr";
import { validateWebhookPayload } from "../validation/schemas";
import { safeForgeCall } from "../utils/safe-forge-call";

function isObject(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null;
}

function asString(v: unknown): string | null {
	return typeof v === "string" ? v : null;
}

function asNumber(v: unknown): number | null {
	return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function normalizeEventType(v: unknown): InternalPrEventType {
	const s = asString(v);
	if (!s) return "unknown";
	if (
		s === "avi:bitbucket:created:pullrequest" ||
		s === "avi:bitbucket:updated:pullrequest" ||
		s === "avi:bitbucket:fulfilled:pullrequest" ||
		s === "avi:bitbucket:rejected:pullrequest"
	) return s;
	return "unknown";
}

function normalizeState(v: unknown): InternalPrState {
	const s = asString(v);
	if (s === "OPEN" || s === "MERGED" || s === "DECLINED") return s;
	return "UNKNOWN";
}

/**
 * Bitbucket payloads can vary
 * - branch can be a string
 * - or an object { name: "main" }
 */
function normalizeBranchName(branchField: unknown): string | null {
	const s = asString(branchField);
	if (s) return s;

	if (isObject(branchField)) {
		const name = asString(branchField.name);
		if (name) return name;
	}

	return null;
}

function logInvalid(reason: string, raw: RawPrEvent) {
	console.error("Invalid Bitbucket PR event", {
		reason,
		eventType: raw.eventType ?? null,
		prId: raw.pullrequest?.id ?? null,
		repoUuid: raw.repository?.uuid ?? null,
	});
}

/**
 * Fetch diffstat from Bitbucket API to get modified files and line counts.
 */
export async function fetchPrDiffStat(
	workspaceUuid: string,
	repoUuid: string,
	prId: number
): Promise<{ modifiedFiles: InternalFileMod[]; totalLinesAdded: number; totalLinesRemoved: number } | null> {
	try {
		const res = await safeForgeCall(
			() => asApp().requestBitbucket(
				route`/2.0/repositories/${workspaceUuid}/${repoUuid}/pullrequests/${prId}/diffstat`
			),
			{ context: 'fetchPrDiffStat' }
		);

		if (!res) {
			console.warn(`safeForgeCall failed for fetchPrDiffStat after retries`);
			return null;
		}

		if (!res.ok) {
			console.warn(`Failed to fetch PR diffstat: ${res.status} ${res.statusText}`);
			return null;
		}

		const data = await res.json();
		const values = Array.isArray(data.values) ? data.values : [];

		const modifiedFiles: InternalFileMod[] = [];
		let totalLinesAdded = 0;
		let totalLinesRemoved = 0;

		for (const v of values) {
			const status = asString(v.status) ?? "unknown";
			const linesAdded = asNumber(v.lines_added) ?? 0;
			const linesRemoved = asNumber(v.lines_removed) ?? 0;
			const path = asString(v.new?.path) ?? asString(v.old?.path) ?? "unknown";
			const oldPath = asString(v.old?.path) ?? undefined;

			totalLinesAdded += linesAdded;
			totalLinesRemoved += linesRemoved;

			modifiedFiles.push({
				path,
				status: status as any,
				linesAdded,
				linesRemoved,
				oldPath: status === "renamed" ? oldPath : undefined,
			});
		}

		return { modifiedFiles, totalLinesAdded, totalLinesRemoved };
	} catch (err) {
		console.error("Error fetching PR diffstat:", err);
		return null;
	}
}

/**
 * Map raw payload -> internal stable model.
 * Return null if invalid (and log the error).
 */
export async function parsePrEvent(rawUnknown: unknown): Promise<InternalPr | null> {
	// ============================================================
	// STEP 1: Validate payload with Zod BEFORE any processing
	// ============================================================
	const validationResult = validateWebhookPayload(rawUnknown);

	if (!validationResult.success) {
		console.error("🚫 [VALIDATION] Webhook rejected due to validation failure");
		return null;
	}

	// Type-safe after validation
	const raw = validationResult.data as any as RawPrEvent;

	const prId = asNumber(raw.pullrequest?.id);
	if (prId === null) {
		logInvalid("Missing pullrequest.id", raw);
		return null;
	}

	const authorAccountId = asString(raw.actor?.accountId);
	if (!authorAccountId) {
		logInvalid("Missing actor.accountId", raw);
		return null;
	}

	const repoUuid = asString(raw.repository?.uuid);
	if (!repoUuid) {
		logInvalid("Missing repository.uuid", raw);
		return null;
	}

	const sourceBranch = normalizeBranchName(raw.pullrequest?.source?.branch);
	if (!sourceBranch) {
		logInvalid("Missing pullrequest.source.branch", raw);
		return null;
	}

	const destinationBranch = normalizeBranchName(raw.pullrequest?.destination?.branch);
	if (!destinationBranch) {
		logInvalid("Missing pullrequest.destination.branch", raw);
		return null;
	}

	const timestamp = asString(raw.timestamp) ?? new Date().toISOString();
	const workspaceUuid = asString(raw.workspace?.uuid);

	let title = asString(raw.pullrequest?.title) ?? "";

	if (!title && workspaceUuid && prId && repoUuid) {
		try {
			const res = await safeForgeCall(
				() => asApp().requestBitbucket(
					route`/2.0/repositories/${workspaceUuid}/${repoUuid}/pullrequests/${prId}`
				),
				{ context: 'fetchPrDetails', maxRetries: 2 }
			);

			if (!res) {
				console.error(`safeForgeCall failed for fetchPrDetails after retries`);
			} else if (!res.ok)
				console.error(`Failed to fetch PR details: ${res.status} ${res.statusText}`);
			else {
				const data = await res.json();
				if (data.title)
					title = data.title;
			}
		} catch (err) {
			console.error("Error fetching PR details via API:", err);
		}
	}

	return {
		timestamp,
		eventType: normalizeEventType(raw.eventType),
		prId,
		title,
		authorAccountId,
		repoUuid,
		workspaceUuid,
		state: normalizeState(raw.pullrequest?.state),
		sourceBranch,
		destinationBranch,
		sourceCommitHash: asString(raw.pullrequest?.source?.commit?.hash),
		mergeCommitHash: asString(raw.pullrequest?.mergeCommit?.hash),
		cloudId: asString(raw.context?.cloudId),
		moduleKey: asString(raw.context?.moduleKey),
		scopes: Array.isArray(raw.permissions?.scopes)
			? raw.permissions!.scopes!.filter((x): x is string => typeof x === "string")
			: [],
		selfGenerated: raw.selfGenerated === true,
		reviewers: Array.isArray((raw.pullrequest as any)?.reviewers)
			? (raw.pullrequest as any).reviewers.map((r: any) => asString(r.accountId)).filter((x: any): x is string => !!x)
			: []
	};
}
