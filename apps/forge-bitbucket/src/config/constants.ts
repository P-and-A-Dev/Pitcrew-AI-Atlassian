/**
 * Configuration constants for PR analysis.
 * Centralized here for easy tuning and maintainability.
 */

// ───────────────────────────────────────────────────────────────
// PR Size Thresholds (based on total lines changed)
// ───────────────────────────────────────────────────────────────
export const SIZE_THRESHOLDS = {
	VERY_SMALL_MAX: 10, // < 10 lines = very_small
	SMALL_MAX: 50,      // < 50 lines = small
	MEDIUM_MAX: 200,    // < 200 lines = medium
	// >= 200 lines = large
} as const;

// ───────────────────────────────────────────────────────────────
// Risk Scoring Weights
// ───────────────────────────────────────────────────────────────
export const RISK_WEIGHTS = {
	NO_REVIEWERS_PENALTY: 30,
	CRITICAL_FILE_PENALTY_PER_FILE: 20,
	NO_TESTS_PENALTY: 20,
	LARGE_PR_PENALTY: 20,
	MEDIUM_PR_PENALTY: 10,
	OFF_HOURS_PENALTY: 10,
	VERY_SMALL_PR_BONUS: 10,
} as const;

// ───────────────────────────────────────────────────────────────
// Risk Score Thresholds (for color classification)
// ───────────────────────────────────────────────────────────────
export const RISK_THRESHOLDS = {
	RED_BELOW: 50,      // score < 50 = red
	YELLOW_BELOW: 80,   // score < 80 = yellow, else green
} as const;

// ───────────────────────────────────────────────────────────────
// Timing Analysis (UTC hours)
// ───────────────────────────────────────────────────────────────
export const TIMING_THRESHOLDS = {
	LATE_START_HOUR: 20,    // 8 PM UTC
	LATE_END_HOUR: 6,       // 6 AM UTC
} as const;

// ───────────────────────────────────────────────────────────────
// Critical Path Detection Keywords
// ───────────────────────────────────────────────────────────────
export const CRITICAL_KEYWORDS = [
	"core",
	"auth",
	"infra",
	"payments",
	"security",
	"database",
] as const;

// ───────────────────────────────────────────────────────────────
// Test File Detection Keywords
// ───────────────────────────────────────────────────────────────
export const TEST_KEYWORDS = [
	".test.",
	".spec.",
	"__tests__",
	"test/",
] as const;
