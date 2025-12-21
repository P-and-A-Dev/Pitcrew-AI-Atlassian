import { storage } from "@forge/api";

const PR_ANALYSIS_PREFIX = "pr-analysis";

export interface PrAnalysisState {
	lastSourceCommitHash: string | null;
	lastAnalyzedAt: string;
}

export class StorageService {
	/**
	 * Creates a composite key using repoUuid and prId to prevent collisions
	 * across different repositories that may have the same PR numbers.
	 * Sanitizes UUIDs to remove curly braces (not allowed in Forge storage keys).
	 */
	private getPrKey(repoUuid: string, prId: number): string {
		const sanitizedRepoUuid = repoUuid.replace(/[{}]/g, '');
		return `${PR_ANALYSIS_PREFIX}:${sanitizedRepoUuid}:${prId}`;
	}

	async getPrAnalysisState(repoUuid: string, prId: number): Promise<PrAnalysisState | undefined> {
		try {
			return await storage.get(this.getPrKey(repoUuid, prId));
		} catch (error) {
			console.error(`Failed to get analysis state for PR ${prId} in repo ${repoUuid}`, error);
			return undefined;
		}
	}

	async setPrAnalysisState(repoUuid: string, prId: number, state: PrAnalysisState): Promise<void> {
		try {
			await storage.set(this.getPrKey(repoUuid, prId), state);
		} catch (error) {
			console.error(`Failed to set analysis state for PR ${prId} in repo ${repoUuid}`, error);
		}
	}

	/**
	 * Cleanup: Deletes the analysis state for a PR when it's closed (merged/declined).
	 * Call this on fulfilled/rejected events to prevent storage bloat.
	 */
	async deletePrAnalysisState(repoUuid: string, prId: number): Promise<void> {
		try {
			await storage.delete(this.getPrKey(repoUuid, prId));
			console.log(`🧹 Cleaned up analysis state for PR ${prId} in repo ${repoUuid}`);
		} catch (error) {
			console.error(`Failed to delete analysis state for PR ${prId} in repo ${repoUuid}`, error);
		}
	}
}

export const storageService = new StorageService();
