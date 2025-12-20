import { InternalPr } from "../models/internal-pr";
import { RISK_WEIGHTS, RISK_THRESHOLDS, TIMING_THRESHOLDS } from "../config/constants";

export class RiskScoringService {

	calculateRisk(pr: InternalPr): { score: number; color: "green" | "yellow" | "red"; factors: string[] } {
		let score = 100;
		const factors: string[] = [];

		if (!pr.reviewers || pr.reviewers.length === 0) {
			score -= RISK_WEIGHTS.NO_REVIEWERS_PENALTY;
			factors.push(`No Reviewers (-${RISK_WEIGHTS.NO_REVIEWERS_PENALTY})`);
		}

		if (pr.analysisMetrics && pr.analysisMetrics.criticalFilesCount > 0) {
			const penalty = pr.analysisMetrics.criticalFilesCount * RISK_WEIGHTS.CRITICAL_FILE_PENALTY_PER_FILE;
			score -= penalty;
			factors.push(`Critical Files Modified: ${pr.analysisMetrics.criticalFilesCount} (-${penalty})`);
		}

		const hasCodeChanges = (pr.modifiedFiles?.length ?? 0) > 0;
		const hasTests = (pr.analysisMetrics?.testFilesCount ?? 0) > 0;

		if (hasCodeChanges && !hasTests) {
			score -= RISK_WEIGHTS.NO_TESTS_PENALTY;
			factors.push(`No Tests Detected (-${RISK_WEIGHTS.NO_TESTS_PENALTY})`);
		}

		if (pr.sizeCategory === "large") {
			score -= RISK_WEIGHTS.LARGE_PR_PENALTY;
			factors.push(`Large PR Size (-${RISK_WEIGHTS.LARGE_PR_PENALTY})`);
		} else if (pr.sizeCategory === "medium") {
			score -= RISK_WEIGHTS.MEDIUM_PR_PENALTY;
			factors.push(`Medium PR Size (-${RISK_WEIGHTS.MEDIUM_PR_PENALTY})`);
		}

		if (pr.sizeCategory === "very_small") {
			score += RISK_WEIGHTS.VERY_SMALL_PR_BONUS;
			factors.push(`Bonus: Very Small PR (+${RISK_WEIGHTS.VERY_SMALL_PR_BONUS})`);
		}

		const date = new Date(pr.timestamp);
		const day = date.getUTCDay();
		const hour = date.getUTCHours();
		const isWeekend = day === 0 || day === 6;
		const isLate = hour >= TIMING_THRESHOLDS.LATE_START_HOUR || hour < TIMING_THRESHOLDS.LATE_END_HOUR;

		if (isWeekend || isLate) {
			score -= RISK_WEIGHTS.OFF_HOURS_PENALTY;
			factors.push(`Off-hours Submission (-${RISK_WEIGHTS.OFF_HOURS_PENALTY})`);
		}

		score = Math.max(0, Math.min(100, score));

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
