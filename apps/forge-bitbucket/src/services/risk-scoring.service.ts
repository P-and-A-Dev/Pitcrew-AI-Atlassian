import { InternalPr } from "../models/internal-pr";

export class RiskScoringService {

	calculateRisk(pr: InternalPr): { score: number; color: "green" | "yellow" | "red"; factors: string[] } {
		let score = 100;
		const factors: string[] = [];

		if (!pr.reviewers || pr.reviewers.length === 0) {
			score -= 30;
			factors.push("No Reviewers (-30)");
		}

		if (pr.analysisMetrics && pr.analysisMetrics.criticalFilesCount > 0) {
			const penalty = pr.analysisMetrics.criticalFilesCount * 20;
			score -= penalty;
			factors.push(`Critical Files Modified: ${pr.analysisMetrics.criticalFilesCount} (-${penalty})`);
		}

		const hasCodeChanges = (pr.modifiedFiles?.length ?? 0) > 0;
		const hasTests = (pr.analysisMetrics?.testFilesCount ?? 0) > 0;

		if (hasCodeChanges && !hasTests) {
			score -= 20;
			factors.push("No Tests Detected (-20)");
		}

		if (pr.sizeCategory === "large") {
			score -= 20;
			factors.push("Large PR Size (-20)");
		} else if (pr.sizeCategory === "medium") {
			score -= 10;
			factors.push("Medium PR Size (-10)");
		}

		if (pr.sizeCategory === "very_small") {
			score += 10;
			factors.push("Bonus: Very Small PR (+10)");
		}

		const date = new Date(pr.timestamp);
		const day = date.getUTCDay();
		const hour = date.getUTCHours();
		const isWeekend = day === 0 || day === 6;
		const isLate = hour >= 20 || hour < 6;

		if (isWeekend || isLate) {
			score -= 10;
			factors.push("Off-hours Submission (-10)");
		}

		score = Math.max(0, Math.min(100, score));

		let color: "green" | "yellow" | "red" = "green";
		if (score < 50) {
			color = "red";
		} else if (score < 80) {
			color = "yellow";
		}

		return {score, color, factors};
	}
}

export const riskScoringService = new RiskScoringService();
