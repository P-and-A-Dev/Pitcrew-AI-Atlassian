import { fetchPrDiffStat, parsePrEvent } from "./pr-event/pr-event.mapper";
import { diffAnalyzerService } from "./services/diff-analyzer.service";
import { processAnalyzerService } from "./services/process-analyzer.service";
import { riskScoringService } from "./services/risk-scoring.service";
import { storageService } from "./services/storage.service";
import { prStorageService } from "./services/pr-storage.service";
import { bitbucketCommentsService } from "./services/bitbucket-comments.service";
import { buildPitCrewComment, computeCommentFingerprint } from "./templates/pitcrew-comment.template";
import { createLogger } from "./utils/logger";

export async function onPullRequestEvent(e: any, _: any) {
	const pr = await parsePrEvent(e);

	if (!pr) {
		const logger = createLogger({ event: 'pr_webhook' });
		logger.error('Failed to parse PR event');
		return;
	}

	// Create logger with PR context
	const logger = createLogger({
		prId: pr.prId,
		repoUuid: pr.repoUuid,
		workspaceUuid: pr.workspaceUuid,
		commitHash: pr.sourceCommitHash,
	});

	if (pr.eventType === "avi:bitbucket:fulfilled:pullrequest" || pr.eventType === "avi:bitbucket:rejected:pullrequest") {
		await storageService.deletePrAnalysisState(pr.repoUuid, pr.prId);
		logger.info('PR closed, storage cleaned up', {
			event: 'pr_closed',
			state: pr.state,
			eventType: pr.eventType,
		});

		await prStorageService.saveOrUpdatePullRequest(pr);

		return true;
	}

	if (!pr.sourceCommitHash) {
		logger.warn('Skipping analysis: No source commit hash', {
			event: 'skip_no_commit',
		});
		return;
	}

	const lastAnalysis = await storageService.getPrAnalysisState(pr.repoUuid, pr.prId);

	if (lastAnalysis && lastAnalysis.lastSourceCommitHash === pr.sourceCommitHash) {
		logger.info('Smart gating: Skipping analysis, commit unchanged', {
			event: 'skip_smart_gating',
			lastAnalyzed: lastAnalysis.lastSourceCommitHash,
		});
		return true;
	}

	logger.info('Analysis started', {
		event: 'analysis_start',
		oldCommit: lastAnalysis?.lastSourceCommitHash || 'none',
		newCommit: pr.sourceCommitHash,
	});

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

				logger.warn('PR activity during off-hours', {
					event: 'off_hours_activity',
					activityType,
					isWeekend: timing.isWeekend,
					isLate: timing.isLate,
					utcHour: timing.utcHour,
					utcDay: timing.utcDay,
				});
			}

			const risk = riskScoringService.calculateRisk(pr);
			pr.riskScore = risk.score;
			pr.riskColor = risk.color;
			pr.riskFactors = risk.factors;

			logger.info('Analysis completed', {
				event: 'analysis_complete',
				filesCount: pr.modifiedFiles.length,
				criticalFiles: metrics.criticalFilesCount,
				testFiles: metrics.testFilesCount,
				sizeCategory: size,
				riskScore: pr.riskScore,
				riskColor: pr.riskColor,
				riskFactors: pr.riskFactors,
			});
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
			logger.info('Skip comment update, fingerprint unchanged', {
				event: 'comment_skip',
				fingerprint: newFingerprint,
			});
		} else if (commentId) {
			const updateResult = await bitbucketCommentsService.updatePullRequestComment(
				pr.workspaceUuid,
				pr.repoUuid,
				pr.prId,
				commentId,
				commentMarkdown
			);

			if (updateResult === false) {
				logger.info('Comment update failed (404), creating new comment', {
					event: 'comment_fallback_create',
					oldCommentId: commentId,
				});
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
