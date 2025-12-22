import { storage } from "@forge/api";
import { StoredPullRequest, buildPrKey, buildIndexKey, RiskColor, PrState } from "../models/stored-pr";
import { InternalPr } from "../models/internal-pr";

/**
 * PR Storage Service
 * Manages persistent storage of PRs with KV store and indexes
 */
export class PrStorageService {

	/**
	 * Save or update a pull request (idempotent)
	 * Handles index updates automatically
	 */
	async saveOrUpdatePullRequest(pr: InternalPr): Promise<void> {
		const prKey = buildPrKey(pr.workspaceUuid || "", pr.repoUuid, pr.prId);

		console.log(`💾 [STORAGE] Saving PR ${prKey}`);

		const existing = await this.getPullRequest(pr.workspaceUuid || "", pr.repoUuid, pr.prId);

		const now = new Date().toISOString();

		const createdAt = existing?.createdAt || now;
		const ageHours = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));

		const isStale = ageHours > 72;

		const diff = {
			filesChanged: pr.modifiedFiles?.length || 0,
			linesAdded: pr.totalLinesAdded || 0,
			linesRemoved: pr.totalLinesRemoved || 0,
			linesChanged: (pr.totalLinesAdded || 0) + (pr.totalLinesRemoved || 0),
			criticalFilesTouched: (pr.analysisMetrics?.criticalFilesCount || 0) > 0,
			criticalPaths: pr.analysisMetrics?.criticalPaths || [],
			testsTouched: (pr.analysisMetrics?.testFilesCount || 0) > 0,
			testFilesChanged: pr.analysisMetrics?.testFilesCount || 0,
			nonTestFilesChanged: (pr.analysisMetrics?.regularCodeFilesCount || 0),
		};

		const risk = {
			score: pr.riskScore || 100,
			color: (pr.riskColor || "green") as RiskColor,
			factors: pr.riskFactors || [],
			version: "v1",
		};

		const state = this.mapState(pr.state);

		const storedPr: StoredPullRequest = {
			key: prKey,
			workspaceUuid: pr.workspaceUuid || "",
			repoUuid: pr.repoUuid,
			prId: pr.prId,
			sourceBranch: pr.sourceBranch,
			destinationBranch: pr.destinationBranch,

			title: pr.title,
			state,
			author: {
				accountId: pr.authorAccountId,
			},
			url: undefined,

			createdAt,
			updatedAt: now,
			lastAnalyzedAt: now,
			mergedAt: state === "MERGED" ? (existing?.mergedAt || now) : undefined,
			closedAt: (state === "MERGED" || state === "DECLINED") ? (existing?.closedAt || now) : undefined,

			diff,
			risk,

			linkedIssueKeys: existing?.linkedIssueKeys || [],

			statusFlags: {
				isHighRisk: risk.score < 50,
				isStale,
				isBlocked: false,
			},

			metrics: {
				ageHours,
			},

			// PitCrew Comment Tracking (preserve from existing or use new values)
			pitcrewCommentId: (pr as any).pitcrewCommentId || existing?.pitcrewCommentId,
			pitcrewCommentFingerprint: (pr as any).pitcrewCommentFingerprint || existing?.pitcrewCommentFingerprint,
			pitcrewCommentLastPostedAt: (pr as any).pitcrewCommentLastPostedAt || existing?.pitcrewCommentLastPostedAt,
		};

		await storage.set(prKey, storedPr);

		await this.updateIndexes(storedPr, existing);

		console.log(`✅ [STORAGE] Saved PR ${prKey} | State: ${state} | Risk: ${risk.color} (${risk.score})`);
	}

	/**
	 * Get a single PR by coordinates
	 */
	async getPullRequest(workspaceUuid: string, repoUuid: string, prId: number): Promise<StoredPullRequest | null> {
		try {
			const prKey = buildPrKey(workspaceUuid, repoUuid, prId);
			const pr = await storage.get(prKey);
			return pr as StoredPullRequest | null;
		} catch (error) {
			console.error(`❌ [STORAGE] Failed to get PR`, error);
			return null;
		}
	}

	/**
	 * Get multiple PRs by keys (batch read)
	 */
	async getPullRequestsByKeys(prKeys: string[]): Promise<StoredPullRequest[]> {
		try {
			const promises = prKeys.map(key => storage.get(key));
			const results = await Promise.all(promises);
			return results.filter(pr => pr !== null && pr !== undefined) as StoredPullRequest[];
		} catch (error) {
			console.error(`❌ [STORAGE] Failed to batch get PRs`, error);
			return [];
		}
	}

	/**
	 * Delete a PR (also updates indexes)
	 */
	async deletePullRequest(workspaceUuid: string, repoUuid: string, prId: number): Promise<void> {
		const prKey = buildPrKey(workspaceUuid, repoUuid, prId);
		const existing = await this.getPullRequest(workspaceUuid, repoUuid, prId);

		if (existing) {
			await storage.delete(prKey);
			await this.removeFromAllIndexes(existing);
			console.log(`🗑️ [STORAGE] Deleted PR ${prKey}`);
		}
	}

	/**
	 * Update all relevant indexes for a PR
	 */
	private async updateIndexes(pr: StoredPullRequest, existing: StoredPullRequest | null): Promise<void> {
		const { workspaceUuid, repoUuid, state, risk } = pr;
		const prKey = pr.key;

		await this.addToIndex(buildIndexKey("byRepo", workspaceUuid, repoUuid), prKey);

		if (state === "OPEN") {
			await this.addToIndex(buildIndexKey("open", workspaceUuid, repoUuid), prKey);
		} else {
			await this.removeFromIndex(buildIndexKey("open", workspaceUuid, repoUuid), prKey);
		}

		const oldColor = existing?.risk.color;
		const newColor = risk.color;

		if (oldColor !== newColor) {
			if (oldColor) {
				await this.removeFromIndex(buildIndexKey("byRisk", workspaceUuid, repoUuid, oldColor), prKey);
			}
			await this.addToIndex(buildIndexKey("byRisk", workspaceUuid, repoUuid, newColor), prKey);

			console.log(`🎨 [STORAGE] Risk color changed: ${oldColor || "none"} → ${newColor}`);
		} else if (!existing) {
			await this.addToIndex(buildIndexKey("byRisk", workspaceUuid, repoUuid, newColor), prKey);
		}
	}

	/**
	 * Remove PR from all indexes (used on delete)
	 */
	private async removeFromAllIndexes(pr: StoredPullRequest): Promise<void> {
		const { workspaceUuid, repoUuid, risk } = pr;
		const prKey = pr.key;

		await this.removeFromIndex(buildIndexKey("byRepo", workspaceUuid, repoUuid), prKey);
		await this.removeFromIndex(buildIndexKey("open", workspaceUuid, repoUuid), prKey);
		await this.removeFromIndex(buildIndexKey("byRisk", workspaceUuid, repoUuid, risk.color), prKey);
	}

	/**
	 * Add a prKey to an index (idempotent - no duplicates)
	 */
	private async addToIndex(indexKey: string, prKey: string): Promise<void> {
		try {
			const index = (await storage.get(indexKey) as string[]) || [];
			if (!index.includes(prKey)) {
				index.push(prKey);
				await storage.set(indexKey, index);
			}
		} catch (error) {
			console.error(`❌ [STORAGE] Failed to add to index ${indexKey}`, error);
		}
	}

	/**
	 * Remove a prKey from an index
	 */
	private async removeFromIndex(indexKey: string, prKey: string): Promise<void> {
		try {
			const index = (await storage.get(indexKey) as string[]) || [];
			const filtered = index.filter(key => key !== prKey);
			if (filtered.length !== index.length) {
				await storage.set(indexKey, filtered);
			}
		} catch (error) {
			console.error(`❌ [STORAGE] Failed to remove from index ${indexKey}`, error);
		}
	}

	/**
	 * Get telemetry counts without loading all PRs
	 */
	async getTelemetryCounts(workspaceUuid: string, repoUuid: string): Promise<{
		total: number;
		open: number;
		red: number;
		yellow: number;
		green: number;
	}> {
		try {
			const byRepoIndex = (await storage.get(buildIndexKey("byRepo", workspaceUuid, repoUuid)) as string[]) || [];
			const openIndex = (await storage.get(buildIndexKey("open", workspaceUuid, repoUuid)) as string[]) || [];
			const redIndex = (await storage.get(buildIndexKey("byRisk", workspaceUuid, repoUuid, "red")) as string[]) || [];
			const yellowIndex = (await storage.get(buildIndexKey("byRisk", workspaceUuid, repoUuid, "yellow")) as string[]) || [];
			const greenIndex = (await storage.get(buildIndexKey("byRisk", workspaceUuid, repoUuid, "green")) as string[]) || [];

			return {
				total: byRepoIndex.length,
				open: openIndex.length,
				red: redIndex.length,
				yellow: yellowIndex.length,
				green: greenIndex.length,
			};
		} catch (error) {
			console.error(`❌ [STORAGE] Failed to get telemetry counts`, error);
			return { total: 0, open: 0, red: 0, yellow: 0, green: 0 };
		}
	}

	/**
	 * Get high-risk PRs (red only)
	 */
	async getHighRiskPrs(workspaceUuid: string, repoUuid: string, limit: number = 50): Promise<StoredPullRequest[]> {
		try {
			const redIndex = (await storage.get(buildIndexKey("byRisk", workspaceUuid, repoUuid, "red")) as string[]) || [];
			const prKeys = redIndex.slice(0, limit);
			return await this.getPullRequestsByKeys(prKeys);
		} catch (error) {
			console.error(`❌ [STORAGE] Failed to get high-risk PRs`, error);
			return [];
		}
	}

	/**
	 * Get open PRs
	 */
	async getOpenPrs(workspaceUuid: string, repoUuid: string, limit: number = 100): Promise<StoredPullRequest[]> {
		try {
			const openIndex = (await storage.get(buildIndexKey("open", workspaceUuid, repoUuid)) as string[]) || [];
			const prKeys = openIndex.slice(0, limit);
			return await this.getPullRequestsByKeys(prKeys);
		} catch (error) {
			console.error(`❌ [STORAGE] Failed to get open PRs`, error);
			return [];
		}
	}

	/**
	 * Get PRs by risk color
	 */
	async getPrsByRisk(workspaceUuid: string, repoUuid: string, color: RiskColor, limit: number = 100): Promise<StoredPullRequest[]> {
		try {
			const riskIndex = (await storage.get(buildIndexKey("byRisk", workspaceUuid, repoUuid, color)) as string[]) || [];
			const prKeys = riskIndex.slice(0, limit);
			return await this.getPullRequestsByKeys(prKeys);
		} catch (error) {
			console.error(`❌ [STORAGE] Failed to get PRs by risk ${color}`, error);
			return [];
		}
	}

	private mapState(state: string): PrState {
		if (state === "MERGED") return "MERGED";
		if (state === "DECLINED") return "DECLINED";
		return "OPEN";
	}
}

export const prStorageService = new PrStorageService();
