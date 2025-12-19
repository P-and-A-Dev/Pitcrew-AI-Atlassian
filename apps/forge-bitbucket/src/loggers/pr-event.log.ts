import { InternalPr } from "../models/internal-pr";

export function prToLog(pr: InternalPr) {
	return {
		eventType: pr.eventType,
		prId: pr.prId,
		title: pr.title,
		author: pr.authorAccountId,
		repoUuid: pr.repoUuid,
		workspaceUuid: pr.workspaceUuid,
		state: pr.state,
		source: pr.sourceBranch,
		destination: pr.destinationBranch,
		sourceCommit: pr.sourceCommitHash,
		mergeCommit: pr.mergeCommitHash,
		timestamp: pr.timestamp,
	};
}
