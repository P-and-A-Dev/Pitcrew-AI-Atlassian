import { fetchPrDiffStat, parsePrEvent } from "./pr-event/pr-event.mapper";
import { diffAnalyzerService } from "./services/diff-analyzer.service";
import { processAnalyzerService } from "./services/process-analyzer.service";
import { riskScoringService } from "./services/risk-scoring.service";
import { storageService } from "./services/storage.service";
import { prStorageService } from "./services/pr-storage.service";
import { bitbucketCommentsService } from "./services/bitbucket-comments.service";
import { buildPitCrewComment, computeCommentFingerprint } from "./templates/pitcrew-comment.template";

export async function onPullRequestEvent(e: any, _: any) {
	const pr = await parsePrEvent(e);

	if (!pr) {
		console.error("Failed to parse PR event");
		return;
	}

	if (pr.eventType === "avi:bitbucket:fulfilled:pullrequest" || pr.eventType === "avi:bitbucket:rejected:pullrequest") {
		await storageService.deletePrAnalysisState(pr.repoUuid, pr.prId);
		console.log(`🏁 PR #${pr.prId} closed (${pr.state}). Storage cleaned up.`);

		await prStorageService.saveOrUpdatePullRequest(pr);

		return true;
	}

	if (!pr.sourceCommitHash) {
		console.warn("Skipping analysis: No source commit hash found");
		return;
	}

	const lastAnalysis = await storageService.getPrAnalysisState(pr.repoUuid, pr.prId);

	if (lastAnalysis && lastAnalysis.lastSourceCommitHash === pr.sourceCommitHash) {
		console.log(`ℹ️ [SMART GATING] Skipping analysis for PR #${pr.prId}: Source hash ${pr.sourceCommitHash} matches last analysis.`);
		return true;
	}

	console.log(`🚀 [ANALYSIS START] PR #${pr.prId} changed. Old: ${lastAnalysis?.lastSourceCommitHash ?? "none"} -> New: ${pr.sourceCommitHash}`);

	if (pr.workspaceUuid && pr.repoUuid) {
		const stats = await fetchPrDiffStat(pr.workspaceUuid, pr.repoUuid, pr.prId);
		if (stats) {
			pr.modifiedFiles = stats.modifiedFiles;
			pr.totalLinesAdded = stats.totalLinesAdded;
			pr.totalLinesRemoved = stats.totalLinesRemoved;

			const metrics = diffAnalyzerService.analyzeFiles(pr.modifiedFiles);
			pr.analysisMetrics = metrics;

			const size = processAnalyzerService.determineSizeCategory(pr.totalLinesAdded, pr.totalLinesRemoved);
			pr.sizeCategory = size;

			if (pr.reviewers) {
				const reviewerStatus = processAnalyzerService.checkReviewers(pr.reviewers);
				if (!reviewerStatus.hasReviewers) {
					console.warn(`⚠️ PR #${pr.prId} has NO reviewers!`);
				}
			}

			const timing = processAnalyzerService.analyzeTiming(pr.timestamp);
			if (timing.isLate || timing.isWeekend) {
				let activityType = "activity";

				if (pr.eventType.includes("created")) {
					activityType = "created";
				} else if (pr.eventType.includes("updated")) {
					activityType = "updated";
				} else if (pr.eventType.includes("fulfilled")) {
					activityType = "merged";
				}

				console.warn(`⚠️ PR #${pr.prId} ${activityType} during off-hours (Weekend: ${timing.isWeekend}, Late: ${timing.isLate}, UTC Hour: ${timing.utcHour}, UTC Day: ${timing.utcDay})`);
			}

			const risk = riskScoringService.calculateRisk(pr);
			pr.riskScore = risk.score;
			pr.riskColor = risk.color;
			pr.riskFactors = risk.factors;

			console.log(`✅ Diff fetched & Analyzed: ${pr.modifiedFiles.length} files. Critical: ${metrics.criticalFilesCount}, Tests: ${metrics.testFilesCount}, Size: ${size}`);
			console.log(`🎯 Risk Score: ${pr.riskScore} (${pr.riskColor})`);
			if (pr.riskFactors.length > 0) {
				console.log(`   Factors: ${pr.riskFactors.join(", ")}`);
			}
		}
	}

	await storageService.setPrAnalysisState(pr.repoUuid, pr.prId, {
		lastSourceCommitHash: pr.sourceCommitHash,
		lastAnalyzedAt: new Date().toISOString()
	});

	if (pr.workspaceUuid && pr.repoUuid && pr.riskScore !== undefined) {
		const existingPr = await prStorageService.getPullRequest(pr.workspaceUuid, pr.repoUuid, pr.prId);

		const commentMarkdown = buildPitCrewComment(pr);
		const newFingerprint = computeCommentFingerprint(pr);

		let commentId: string | undefined = existingPr?.pitcrewCommentId;
		let shouldPostComment = false;

		if (existingPr?.pitcrewCommentFingerprint === newFingerprint) {
			console.log(`💬 [COMMENT] Skip comment update, fingerprint unchanged for PR #${pr.prId}`);
		} else if (commentId) {
			const updateResult = await bitbucketCommentsService.updatePullRequestComment(
				pr.workspaceUuid,
				pr.repoUuid,
				pr.prId,
				commentId,
				commentMarkdown
			);

			if (updateResult === false) {
				console.log(`⚠️ [COMMENT] Update failed (404), falling back to create new comment on PR #${pr.prId}`);
				const createResult = await bitbucketCommentsService.createPullRequestComment(
					pr.workspaceUuid,
					pr.repoUuid,
					pr.prId,
					commentMarkdown
				);
				if (createResult) {
					commentId = createResult.id;
					shouldPostComment = true;
				}
			} else if (updateResult === true) {
				shouldPostComment = true;
			}
		} else {
			const createResult = await bitbucketCommentsService.createPullRequestComment(
				pr.workspaceUuid,
				pr.repoUuid,
				pr.prId,
				commentMarkdown
			);
			if (createResult) {
				commentId = createResult.id;
				shouldPostComment = true;
			}
		}

		if (shouldPostComment && commentId) {
			(pr as any).pitcrewCommentId = commentId;
			(pr as any).pitcrewCommentFingerprint = newFingerprint;
			(pr as any).pitcrewCommentLastPostedAt = new Date().toISOString();
		}
	}

	await prStorageService.saveOrUpdatePullRequest(pr);

	console.log(JSON.stringify(pr, null, 2));

	return true;
}
