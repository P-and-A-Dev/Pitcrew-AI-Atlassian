export type InternalPrEventType =
	| "avi:bitbucket:created:pullrequest"
	| "avi:bitbucket:updated:pullrequest"
	| "avi:bitbucket:fulfilled:pullrequest"
	| "avi:bitbucket:rejected:pullrequest"
	| "unknown";

export type InternalPrState = "OPEN" | "MERGED" | "DECLINED" | "UNKNOWN";

export type InternalPr = {
	timestamp: string;
	eventType: InternalPrEventType;

	prId: number;
	title: string;

	authorAccountId: string;

	repoUuid: string;
	workspaceUuid: string | null;

	state: InternalPrState;

	sourceBranch: string;
	destinationBranch: string;

	sourceCommitHash: string | null;
	mergeCommitHash: string | null;

	cloudId: string | null;
	moduleKey: string | null;

	scopes: string[];
	selfGenerated: boolean;

	modifiedFiles?: InternalFileMod[];
	totalLinesAdded?: number;
	totalLinesRemoved?: number;

	analysisMetrics?: PrAnalysisMetrics;

	reviewers?: string[];
	sizeCategory?: "very_small" | "small" | "medium" | "large" | "unknown";

	riskScore?: number;
	riskColor?: "green" | "yellow" | "red";
	riskFactors?: string[];
};

export type PrAnalysisMetrics = {
	criticalFilesCount: number;
	testFilesCount: number;
	criticalPaths: string[];
};

export type InternalFileMod = {
	path: string;
	status: "added" | "modified" | "removed" | "renamed" | "unknown";
	linesAdded: number;
	linesRemoved: number;
	oldPath?: string;
};
