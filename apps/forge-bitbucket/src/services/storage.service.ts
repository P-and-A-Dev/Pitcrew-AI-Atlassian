import { storage } from "@forge/api";
import { createLogger } from "../utils/logger";

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
			const logger = createLogger({ prId, repoUuid, component: 'storage' });
			logger.error('Failed to get analysis state', error, { event: 'get_state_failed' });
			return undefined;
		}
	}

	async setPrAnalysisState(repoUuid: string, prId: number, state: PrAnalysisState): Promise<void> {
		try {
			await storage.set(this.getPrKey(repoUuid, prId), state);
		} catch (error) {
			const logger = createLogger({ prId, repoUuid, component: 'storage' });
			logger.error('Failed to set analysis state', error, { event: 'set_state_failed' });
		}
	}

	/**
	 * Cleanup: Deletes the analysis state for a PR when it's closed (merged/declined).
	 * Call this on fulfilled/rejected events to prevent storage bloat.
	 */
	async deletePrAnalysisState(repoUuid: string, prId: number): Promise<void> {
		const logger = createLogger({ prId, repoUuid, component: 'storage' });
		try {
			await storage.delete(this.getPrKey(repoUuid, prId));
			logger.info('Cleaned up analysis state', { event: 'state_deleted' });
		} catch (error) {
			logger.error('Failed to delete analysis state', error, { event: 'delete_state_failed' });
		}
	}
}

export const storageService = new StorageService();
