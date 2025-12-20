import { InternalFileMod, PrAnalysisMetrics } from "../models/internal-pr";
import { CRITICAL_KEYWORDS, TEST_KEYWORDS } from "../config/constants";

export class DiffAnalyzerService {

	analyzeFiles(files: InternalFileMod[]): PrAnalysisMetrics {
		const criticalPaths = new Set<string>();
		let testFilesCount = 0;
		let criticalFilesCount = 0;

		for (const file of files) {
			const path = file.path.toLowerCase();

			if (TEST_KEYWORDS.some(k => path.includes(k))) {
				testFilesCount++;
				continue;
			}

			for (const keyword of CRITICAL_KEYWORDS) {
				if (path.includes(keyword)) {
					criticalPaths.add(keyword);
					criticalFilesCount++;
					break;
				}
			}
		}

		return {
			criticalFilesCount,
			testFilesCount,
			criticalPaths: Array.from(criticalPaths)
		};
	}
}

export const diffAnalyzerService = new DiffAnalyzerService();
