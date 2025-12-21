import { InternalPr } from "../models/internal-pr";
import {
	NORMALIZATION,
	SCORING_WEIGHTS,
	RISK_WEIGHTS,
	RISK_THRESHOLDS,
	TIMING_THRESHOLDS,
	SPECIAL_CASE_MODIFIERS
} from "../config/constants";

export class RiskScoringService {

	calculateRisk(pr: InternalPr): { score: number; color: "green" | "yellow" | "red"; factors: string[] } {
		const factors: string[] = [];

		const totalFiles = pr.modifiedFiles?.length ?? 0;
		const metrics = pr.analysisMetrics;

		if (!metrics || totalFiles === 0) {
			return {score: 100, color: "green", factors: ["No files modified"]};
		}

		const isDocsOnly = metrics.docFilesCount > 0 &&
			metrics.regularCodeFilesCount === 0 &&
			metrics.testFilesCount === 0;

		if (isDocsOnly) {
			factors.push(`Docs-only PR (capped risk at ${SPECIAL_CASE_MODIFIERS.DOCS_ONLY_MAX_RISK})`);
			return {
				score: Math.max(100 - SPECIAL_CASE_MODIFIERS.DOCS_ONLY_MAX_RISK, 0),
				color: "green",
				factors
			};
		}

		const isTestsOnly = metrics.testFilesCount > 0 &&
			metrics.regularCodeFilesCount === 0;

		let testsOnlyBonus = 0;
		if (isTestsOnly) {
			testsOnlyBonus = SPECIAL_CASE_MODIFIERS.TESTS_ONLY_BONUS;
			factors.push(`Tests-only PR (+${testsOnlyBonus} bonus)`);
		}

		const effectiveFileCount =
			metrics.regularCodeFilesCount +
			metrics.testFilesCount +
			metrics.docFilesCount * 0.3 +  // Docs count less
			metrics.generatedFilesCount * SPECIAL_CASE_MODIFIERS.GENERATED_FILE_WEIGHT +
			metrics.renameOnlyFilesCount * SPECIAL_CASE_MODIFIERS.RENAME_LINES_WEIGHT;

		const filesScore = Math.min(effectiveFileCount / NORMALIZATION.MAX_FILES_FOR_NORMALIZATION, 1);

		const totalLinesAdded = pr.totalLinesAdded ?? 0;
		const totalLinesRemoved = pr.totalLinesRemoved ?? 0;
		const totalLinesChanged = totalLinesAdded + totalLinesRemoved;

		const linesScore = Math.min(totalLinesChanged / NORMALIZATION.MAX_LINES_FOR_NORMALIZATION, 1);

		let signalsScore = 0;

		if (!pr.reviewers || pr.reviewers.length === 0) {
			signalsScore += 0.3;
			factors.push("No Reviewers");
		}

		if (metrics.criticalFilesCount > 0) {
			const criticalPenalty = Math.min(metrics.criticalFilesCount * 0.15, 0.4);
			signalsScore += criticalPenalty;
			factors.push(`${metrics.criticalFilesCount} Critical File(s)`);
		}

		const hasCodeChanges = metrics.regularCodeFilesCount > 0;
		const hasTests = metrics.testFilesCount > 0;
		if (hasCodeChanges && !hasTests) {
			signalsScore += 0.2; // 20% of signals component
			factors.push("No Tests Detected");
		}

		const date = new Date(pr.timestamp);
		const day = date.getUTCDay();
		const hour = date.getUTCHours();
		const isWeekend = day === 0 || day === 6;
		const isLate = hour >= TIMING_THRESHOLDS.LATE_START_HOUR || hour < TIMING_THRESHOLDS.LATE_END_HOUR;

		if (isWeekend || isLate) {
			signalsScore += 0.1;
			factors.push("Off-hours Submission");
		}

		signalsScore = Math.min(signalsScore, 1);

		const riskScore =
			(filesScore * SCORING_WEIGHTS.FILES_WEIGHT) +
			(linesScore * SCORING_WEIGHTS.LINES_WEIGHT) +
			(signalsScore * SCORING_WEIGHTS.OTHER_SIGNALS_WEIGHT);

		let score = Math.round((1 - riskScore) * 100);

		score = Math.min(100, score + testsOnlyBonus);

		factors.push(`Files: ${effectiveFileCount.toFixed(1)} (score: ${(filesScore * 100).toFixed(0)}%)`);
		factors.push(`Lines: ${totalLinesChanged} (score: ${(linesScore * 100).toFixed(0)}%)`);
		factors.push(`Signals: (score: ${(signalsScore * 100).toFixed(0)}%)`);

		let color: "green" | "yellow" | "red" = "green";
		if (score < RISK_THRESHOLDS.RED_BELOW) {
			color = "red";
		} else if (score < RISK_THRESHOLDS.YELLOW_BELOW) {
			color = "yellow";
		}

		return {score, color, factors};
	}
}

export const riskScoringService = new RiskScoringService();
