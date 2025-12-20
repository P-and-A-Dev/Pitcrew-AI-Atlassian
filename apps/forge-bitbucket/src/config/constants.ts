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
// Normalization Thresholds (for 0-1 scoring)
// ───────────────────────────────────────────────────────────────
export const NORMALIZATION = {
	// Number of files: 10 files or more = normalized score of 1.0
	MAX_FILES_FOR_NORMALIZATION: 10,
	// Total lines changed: 300 lines or more = normalized score of 1.0
	MAX_LINES_FOR_NORMALIZATION: 300,
} as const;

// ───────────────────────────────────────────────────────────────
// Weighted Scoring Factors (must sum to 1.0)
// ───────────────────────────────────────────────────────────────
export const SCORING_WEIGHTS = {
	FILES_WEIGHT: 0.4,        // Surface d'impact (40%)
	LINES_WEIGHT: 0.3,        // Complexité logique (30%)
	OTHER_SIGNALS_WEIGHT: 0.3, // Reviewers, critical files, tests, timing (30%)
} as const;

// ───────────────────────────────────────────────────────────────
// Risk Scoring Weights (for "other signals" component)
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

// ───────────────────────────────────────────────────────────────
// Documentation File Detection Keywords
// ───────────────────────────────────────────────────────────────
export const DOC_KEYWORDS = [
	".md",
	".txt",
	"readme",
	"changelog",
	"license",
	"docs/",
	"documentation/",
] as const;

// ───────────────────────────────────────────────────────────────
// Generated File Detection Keywords
// ───────────────────────────────────────────────────────────────
export const GENERATED_KEYWORDS = [
	"package-lock.json",
	"yarn.lock",
	"pnpm-lock.yaml",
	".lock",
	"dist/",
	"build/",
	"generated/",
	".min.js",
	".bundle.js",
] as const;

// ───────────────────────────────────────────────────────────────
// Special Case Scoring Modifiers
// ───────────────────────────────────────────────────────────────
export const SPECIAL_CASE_MODIFIERS = {
	DOCS_ONLY_MAX_RISK: 20,     // Docs-only PR: cap risk score to this value
	TESTS_ONLY_BONUS: 20,       // Tests-only PR: bonus points
	RENAME_LINES_WEIGHT: 0.1,   // Rename-only file: weight for lines calculation
	GENERATED_FILE_WEIGHT: 0.2, // Generated files: weight for file count
} as const;
