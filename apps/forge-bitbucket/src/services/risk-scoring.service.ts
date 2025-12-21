import { InternalPr } from "../models/internal-pr";
import {
	NORMALIZATION,
	RISK_THRESHOLDS,
	SCORING_WEIGHTS,
	SPECIAL_CASE_MODIFIERS,
	TIMING_THRESHOLDS
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

		const filesChangedRaw = totalFiles;
		const filesChangedWeighted =
			metrics.regularCodeFilesCount +
			metrics.testFilesCount +
			metrics.docFilesCount * 0.3 +
			metrics.generatedFilesCount * SPECIAL_CASE_MODIFIERS.GENERATED_FILE_WEIGHT +
			metrics.renameOnlyFilesCount * SPECIAL_CASE_MODIFIERS.RENAME_LINES_WEIGHT;

		const filesScore = Math.min(filesChangedWeighted / NORMALIZATION.MAX_FILES_FOR_NORMALIZATION, 1);

		const totalLinesAdded = pr.totalLinesAdded ?? 0;
		const totalLinesRemoved = pr.totalLinesRemoved ?? 0;
		const totalLinesChanged = totalLinesAdded + totalLinesRemoved;

		const linesScore = Math.min(totalLinesChanged / NORMALIZATION.MAX_LINES_FOR_NORMALIZATION, 1);

		let signalsScore = 0;
		const signalsBreakdown: string[] = [];

		const prCreatedAt = new Date(pr.timestamp);
		const prAgeHours = (Date.now() - prCreatedAt.getTime()) / (1000 * 60 * 60);
		const isNewPr = pr.eventType === "avi:bitbucket:created:pullrequest";

		if (!pr.reviewers || pr.reviewers.length === 0) {
			if (!isNewPr || prAgeHours > 2) {
				const reviewersPenalty = 0.3;
				signalsScore += reviewersPenalty;
				signalsBreakdown.push(`reviewers(${(reviewersPenalty * 100).toFixed(0)}%)`);
				factors.push(`No Reviewers (age: ${prAgeHours.toFixed(1)}h)`);
			}
		}

		if (metrics.criticalFilesCount > 0) {
			const sizeCategory = pr.sizeCategory || "unknown";
			let criticalPenalty: number;

			if (sizeCategory === "very_small") {
				criticalPenalty = Math.min(metrics.criticalFilesCount * 0.1, 0.3); // Reduced
			} else if (sizeCategory === "small") {
				criticalPenalty = Math.min(metrics.criticalFilesCount * 0.12, 0.35);
			} else {
				criticalPenalty = Math.min(metrics.criticalFilesCount * 0.15, 0.4); // Normal/large
			}

			signalsScore += criticalPenalty;
			signalsBreakdown.push(`critical(${(criticalPenalty * 100).toFixed(0)}%)`);
			factors.push(`${metrics.criticalFilesCount} Critical File(s)`);
		}

		const hasCodeChanges = metrics.regularCodeFilesCount > 0;
		const hasTests = metrics.testFilesCount > 0;
		const logicChanged = hasCodeChanges;

		if (logicChanged && !hasTests) {
			const sizeCategory = pr.sizeCategory || "unknown";
			let testsPenalty: number;

			if (sizeCategory === "very_small") {
				testsPenalty = 0.1; // Mild
			} else if (sizeCategory === "small") {
				testsPenalty = 0.15;
			} else if (sizeCategory === "medium") {
				testsPenalty = 0.2; // Normal
			} else {
				testsPenalty = 0.25; // Large = stronger penalty
			}

			signalsScore += testsPenalty;
			signalsBreakdown.push(`tests(${(testsPenalty * 100).toFixed(0)}%)`);
			factors.push("No Tests Detected");
		}

		const date = new Date(pr.timestamp);
		const utcDay = date.getUTCDay();
		const utcHour = date.getUTCHours();
		const isWeekend = utcDay === 0 || utcDay === 6;
		const isLate = utcHour >= TIMING_THRESHOLDS.LATE_START_HOUR || utcHour < TIMING_THRESHOLDS.LATE_END_HOUR;

		if (isWeekend || isLate) {
			const offHoursPenalty = 0.1;
			signalsScore += offHoursPenalty;
			signalsBreakdown.push(`timing(${(offHoursPenalty * 100).toFixed(0)}%)`);
			factors.push("Off-hours Submission");
		}

		signalsScore = Math.min(signalsScore, 1);

		const riskScore =
			(filesScore * SCORING_WEIGHTS.FILES_WEIGHT) +
			(linesScore * SCORING_WEIGHTS.LINES_WEIGHT) +
			(signalsScore * SCORING_WEIGHTS.OTHER_SIGNALS_WEIGHT);

		let score = Math.round((1 - riskScore) * 100);

		score = Math.min(100, score + testsOnlyBonus);

		const sizeCategory = pr.sizeCategory || "unknown";
		if (sizeCategory === "very_small" && totalLinesChanged <= 10 && score < 60) {
			score = 60; // Floor at yellow
			factors.push("Very small PR (risk floor applied)");
		}

		factors.push(`Files: ${filesChangedRaw} raw, ${filesChangedWeighted.toFixed(1)} weighted (${(filesScore * 100).toFixed(0)}%)`);
		factors.push(`Lines: ${totalLinesChanged} (${(linesScore * 100).toFixed(0)}%)`);

		if (signalsBreakdown.length > 0) {
			factors.push(`Signals: ${signalsBreakdown.join(" + ")} = ${(signalsScore * 100).toFixed(0)}%`);
		} else {
			factors.push(`Signals: 0%`);
		}

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
