import {RawPrEvent} from "../types/raw-pr-event";
import {InternalPr, InternalPrEventType, InternalPrState} from "../models/internal-pr";

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
 * Map raw payload -> internal stable model.
 * Return null if invalid (and log the error).
 */
export function parsePrEvent(rawUnknown: unknown): InternalPr | null {
    if (!isObject(rawUnknown)) {
        console.error("Invalid Bitbucket PR event: payload is not an object");
        return null;
    }

    const raw = rawUnknown as RawPrEvent;

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

    const internal: InternalPr = {
        timestamp,
        eventType: normalizeEventType(raw.eventType),

        prId,
        title: asString(raw.pullrequest?.title) ?? "",

        authorAccountId,

        repoUuid,
        workspaceUuid: asString(raw.workspace?.uuid),

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
    };

    return internal;
}
