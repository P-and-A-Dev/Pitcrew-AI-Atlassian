import { SIZE_THRESHOLDS, TIMING_THRESHOLDS } from "../config/constants";

export type PrSizeCategory = "very_small" | "small" | "medium" | "large" | "unknown";

export class ProcessAnalyzerService {

	determineSizeCategory(linesAdded: number, linesRemoved: number): PrSizeCategory {
		const totalChanges = linesAdded + linesRemoved;

		if (totalChanges < SIZE_THRESHOLDS.VERY_SMALL_MAX) return "very_small";
		if (totalChanges < SIZE_THRESHOLDS.SMALL_MAX) return "small";
		if (totalChanges < SIZE_THRESHOLDS.MEDIUM_MAX) return "medium";
		return "large";
	}

	checkReviewers(reviewers: string[]): { hasReviewers: boolean; count: number } {
		return {
			hasReviewers: reviewers.length > 0,
			count: reviewers.length
		};
	}

	/**
	 * Proxy for "Sprint Timing" analysis.
	 * Checks if PR is submitted during weekend or late hours (risk proxy).
	 */
	analyzeTiming(eventTimestamp: string): { isLate: boolean; isWeekend: boolean; utcHour: number; utcDay: number } {
		const date = new Date(eventTimestamp);
		const utcDay = date.getUTCDay();
		const utcHour = date.getUTCHours();

		// 0 = Sunday, 6 = Saturday
		const isWeekend = utcDay === 0 || utcDay === 6;

		const isLate = utcHour >= TIMING_THRESHOLDS.LATE_START_HOUR || utcHour < TIMING_THRESHOLDS.LATE_END_HOUR;

		return { isLate, isWeekend, utcHour, utcDay };
	}
}

export const processAnalyzerService = new ProcessAnalyzerService();
