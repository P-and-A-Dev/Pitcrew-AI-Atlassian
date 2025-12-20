import { storage } from "@forge/api";

const PR_ANALYSIS_PREFIX = "pr-analysis";

export interface PrAnalysisState {
	lastSourceCommitHash: string | null;
	lastAnalyzedAt: string;
}

export class StorageService {
	private getPrKey(prId: number): string {
		return `${PR_ANALYSIS_PREFIX}:${prId}`;
	}

	async getPrAnalysisState(prId: number): Promise<PrAnalysisState | undefined> {
		try {
			return await storage.get(this.getPrKey(prId));
		} catch (error) {
			console.error(`Failed to get analysis state for PR ${prId}`, error);
			return undefined;
		}
	}

	async setPrAnalysisState(prId: number, state: PrAnalysisState): Promise<void> {
		try {
			await storage.set(this.getPrKey(prId), state);
		} catch (error) {
			console.error(`Failed to set analysis state for PR ${prId}`, error);
		}
	}
}

export const storageService = new StorageService();
