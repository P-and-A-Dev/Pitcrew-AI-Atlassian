import { fetchPrDiffStat, parsePrEvent } from "./pr-event/pr-event.mapper";
import { diffAnalyzerService } from "./services/diff-analyzer.service";
import { processAnalyzerService } from "./services/process-analyzer.service";
import { storageService } from "./services/storage.service";

export async function onPullRequestEvent(e: any, _: any) {
	const pr = await parsePrEvent(e);

	if (!pr) {
		console.error("Failed to parse PR event");
		return;
	}

	if (!pr.sourceCommitHash) {
		console.warn("Skipping analysis: No source commit hash found");
		return;
	}

	const lastAnalysis = await storageService.getPrAnalysisState(pr.prId);

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
				console.warn(`⚠️ PR #${pr.prId} created during off-hours (Weekend: ${timing.isWeekend}, Late: ${timing.isLate})`);
			}

			console.log(`✅ Diff fetched & Analyzed: ${pr.modifiedFiles.length} files. Critical: ${metrics.criticalFilesCount}, Tests: ${metrics.testFilesCount}, Size: ${size}`);
		}
	}

	await storageService.setPrAnalysisState(pr.prId, {
		lastSourceCommitHash: pr.sourceCommitHash,
		lastAnalyzedAt: new Date().toISOString()
	});

	console.log(JSON.stringify(pr, null, 2));

	return true;
}
