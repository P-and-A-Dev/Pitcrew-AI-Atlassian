import { InternalFileMod, PrAnalysisMetrics } from "../models/internal-pr";
import { CRITICAL_KEYWORDS, TEST_KEYWORDS, DOC_KEYWORDS, GENERATED_KEYWORDS } from "../config/constants";

/**
 * Diff Analyzer Service
 * 
 * Categorizes modified files into types (critical, tests, docs, generated, rename-only, regular code).
 * Used for risk scoring and analysis metrics.
 */
export class DiffAnalyzerService {

	/**
	 * Analyzes a list of modified files and categorizes them.
	 * 
	 * Prioritization order (first match wins):
	 * 1. Rename-only files (no lines changed)
	 * 2. Generated files (package-lock, dist/, etc.)
	 * 3. Documentation files (.md, docs/, etc.)
	 * 4. Test files (.spec., .test., __tests__/)
	 * 5. Regular code files (checked for critical keywords)
	 * 
	 * @param files - List of modified files with paths and line counts
	 * @returns Analysis metrics with file counts by category
	 * 
	 * @example
	 * ```typescript
	 * const metrics = diffAnalyzerService.analyzeFiles(modifiedFiles);
	 * console.log(metrics.criticalFilesCount); // 2
	 * console.log(metrics.testFilesCount); // 5
	 * ```
	 */
	analyzeFiles(files: InternalFileMod[]): PrAnalysisMetrics {
		const criticalPaths = new Set<string>();
		let testFilesCount = 0;
		let criticalFilesCount = 0;
		let docFilesCount = 0;
		let generatedFilesCount = 0;
		let renameOnlyFilesCount = 0;
		let regularCodeFilesCount = 0;

		for (const file of files) {
			const path = file.path.toLowerCase();

			const isRenameOnly = file.status === "renamed" && file.linesAdded === 0 && file.linesRemoved === 0;
			if (isRenameOnly) {
				renameOnlyFilesCount++;
				continue;
			}

			const isGenerated = GENERATED_KEYWORDS.some(k => path.includes(k));
			if (isGenerated) {
				generatedFilesCount++;
				continue;
			}

			const isDoc = DOC_KEYWORDS.some(k => path.includes(k));
			if (isDoc) {
				docFilesCount++;
				continue;
			}

			const isTest = TEST_KEYWORDS.some(k => path.includes(k));
			if (isTest) {
				testFilesCount++;
				continue;
			}

			regularCodeFilesCount++;
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
			criticalPaths: Array.from(criticalPaths),
			docFilesCount,
			generatedFilesCount,
			renameOnlyFilesCount,
			regularCodeFilesCount,
		};
	}
}

export const diffAnalyzerService = new DiffAnalyzerService();
