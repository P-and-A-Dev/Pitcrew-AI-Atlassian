/**
 * Persistent storage model for Pull Requests
 * Optimized for dashboard queries and KV storage
 */

export type PrState = "OPEN" | "MERGED" | "DECLINED";
export type RiskColor = "green" | "yellow" | "red";

export interface StoredPullRequest {
    key: string; // Full storage key: ${workspaceUuid}:${repoUuid}:${prId}
    workspaceUuid: string;
    repoUuid: string;
    prId: number;
    sourceBranch: string;
    destinationBranch: string;

    title: string;
    state: PrState;
    author: {
        accountId: string;
        uuid?: string;
        displayName?: string;
    };
    url?: string;

    createdAt: string;
    updatedAt: string;
    lastAnalyzedAt: string;
    mergedAt?: string;
    closedAt?: string;

    diff: {
        filesChanged: number;
        linesAdded: number;
        linesRemoved: number;
        linesChanged: number;
        criticalFilesTouched: boolean;
        criticalPaths: string[];
        testsTouched: boolean;
        testFilesChanged: number;
        nonTestFilesChanged: number;
    };

    risk: {
        score: number; // 0-100
        color: RiskColor;
        factors: string[];
        version: string;
    };

    linkedIssueKeys: string[];

    statusFlags: {
        isHighRisk: boolean; // score < 50
        isStale: boolean; // open for > 3 days
        isBlocked: boolean;
    };

    metrics: {
        ageHours: number;
    };

    // PitCrew Comment Tracking
    pitcrewCommentId?: string; // Bitbucket comment ID (stored as string to handle 64-bit IDs)
    pitcrewCommentFingerprint?: string; // SHA256 hash to detect material changes
    pitcrewCommentLastPostedAt?: string; // ISO timestamp of last comment interaction
}

/**
 * Index types for fast lookups
 */
export interface PrIndexes {
    byRepo: string[];

    open: string[];

    byRisk: {
        red: string[];
        yellow: string[];
        green: string[];
    };
}

/**
 * Helper to build storage keys
 */
export const PR_KEY_PREFIX = "PR";
export const PR_INDEX_PREFIX = "PR_INDEX";

/**
 * Sanitize UUID by removing curly braces (Forge storage doesn't allow them)
 */
function sanitizeUuid(uuid: string): string {
    return uuid.replace(/[{}]/g, '');
}

export function buildPrKey(workspaceUuid: string, repoUuid: string, prId: number): string {
    return `${PR_KEY_PREFIX}:${sanitizeUuid(workspaceUuid)}:${sanitizeUuid(repoUuid)}:${prId}`;
}

export function buildIndexKey(indexType: string, workspaceUuid: string, repoUuid: string, suffix?: string): string {
    const base = `${PR_INDEX_PREFIX}:${indexType}:${sanitizeUuid(workspaceUuid)}:${sanitizeUuid(repoUuid)}`;
    return suffix ? `${base}:${suffix}` : base;
}
