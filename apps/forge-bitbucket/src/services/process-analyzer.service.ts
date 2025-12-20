
export type PrSizeCategory = "very_small" | "small" | "medium" | "large" | "unknown";

export class ProcessAnalyzerService {

    determineSizeCategory(linesAdded: number, linesRemoved: number): PrSizeCategory {
        const totalChanges = linesAdded + linesRemoved;

        if (totalChanges < 10) return "very_small";
        if (totalChanges < 50) return "small";
        if (totalChanges < 200) return "medium";
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
    analyzeTiming(eventTimestamp: string): { isLate: boolean; isWeekend: boolean } {
        const date = new Date(eventTimestamp);
        const day = date.getUTCDay();
        const hour = date.getUTCHours();

        // 0 = Sunday, 6 = Saturday
        const isWeekend = day === 0 || day === 6;

        // Late = after 8 PM (20:00) or before 6 AM (06:00) UTC
        // Adjust timezone as needed, assuming UTC for now for simplicity.
        const isLate = hour >= 20 || hour < 6;

        return { isLate, isWeekend };
    }
}

export const processAnalyzerService = new ProcessAnalyzerService();
