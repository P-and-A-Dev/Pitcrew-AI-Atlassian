/**
 * Unit Tests for PR Webhook Handler
 * Tests the main webhook orchestration logic
 */

import { onPullRequestEvent } from '../pr-webhook';

// Mock all dependencies
jest.mock('../pr-event/pr-event.mapper');
jest.mock('../services/diff-analyzer.service');
jest.mock('../services/process-analyzer.service');
jest.mock('../services/risk-scoring.service');
jest.mock('../services/storage.service');
jest.mock('../services/pr-storage.service');
jest.mock('../services/bitbucket-comments.service');
jest.mock('../templates/pitcrew-comment.template');

import { parsePrEvent, fetchPrDiffStat } from '../pr-event/pr-event.mapper';
import { diffAnalyzerService } from '../services/diff-analyzer.service';
import { processAnalyzerService } from '../services/process-analyzer.service';
import { riskScoringService } from '../services/risk-scoring.service';
import { storageService } from '../services/storage.service';
import { prStorageService } from '../services/pr-storage.service';
import { bitbucketCommentsService } from '../services/bitbucket-comments.service';
import { buildPitCrewComment, computeCommentFingerprint } from '../templates/pitcrew-comment.template';
import { InternalPr } from '../models/internal-pr';

describe('PR Webhook Handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Valid payload - Storage + Comment', () => {
        it('should process valid PR event and save + comment', async () => {
            const mockPr: InternalPr = {
                timestamp: new Date().toISOString(),
                eventType: 'avi:bitbucket:created:pullrequest',
                prId: 1,
                title: 'Test PR',
                authorAccountId: 'user-123',
                repoUuid: 'repo-123',
                workspaceUuid: 'workspace-123',
                state: 'OPEN',
                sourceBranch: 'feature/test',
                destinationBranch: 'main',
                sourceCommitHash: 'abc123',
                mergeCommitHash: null,
                cloudId: null,
                moduleKey: null,
                scopes: [],
                selfGenerated: false,
            };

            // Mock parsePrEvent
            (parsePrEvent as jest.Mock).mockResolvedValue(mockPr);

            // Mock fetchPrDiffStat
            (fetchPrDiffStat as jest.Mock).mockResolvedValue({
                modifiedFiles: [
                    { path: 'src/app.ts', status: 'modified', linesAdded: 10, linesRemoved: 5 },
                ],
                totalLinesAdded: 10,
                totalLinesRemoved: 5,
            });

            // Mock diffAnalyzerService
            (diffAnalyzerService.analyzeFiles as jest.Mock).mockReturnValue({
                criticalFilesCount: 0,
                testFilesCount: 0,
                criticalPaths: [],
                docFilesCount: 0,
                generatedFilesCount: 0,
                renameOnlyFilesCount: 0,
                regularCodeFilesCount: 1,
            });

            // Mock processAnalyzerService
            (processAnalyzerService.determineSizeCategory as jest.Mock).mockReturnValue('small');
            (processAnalyzerService.checkReviewers as jest.Mock).mockReturnValue({
                hasReviewers: true,
            });
            (processAnalyzerService.analyzeTiming as jest.Mock).mockReturnValue({
                isLate: false,
                isWeekend: false,
                utcHour: 10,
                utcDay: 2,
            });

            // Mock riskScoringService
            (riskScoringService.calculateRisk as jest.Mock).mockReturnValue({
                score: 85,
                color: 'green',
                factors: ['Files: 1', 'Lines: 15'],
            });

            // Mock storage services
            (storageService.getPrAnalysisState as jest.Mock).mockResolvedValue(null);
            (storageService.setPrAnalysisState as jest.Mock).mockResolvedValue(undefined);
            (prStorageService.getPullRequest as jest.Mock).mockResolvedValue(null);
            (prStorageService.saveOrUpdatePullRequest as jest.Mock).mockResolvedValue(undefined);

            // Mock comment services
            (buildPitCrewComment as jest.Mock).mockReturnValue('# PitCrew Analysis');
            (computeCommentFingerprint as jest.Mock).mockReturnValue('fingerprint-123');
            (bitbucketCommentsService.createPullRequestComment as jest.Mock).mockResolvedValue({
                id: 'comment-123',
            });

            const mockEvent = { payload: 'test' };
            const result = await onPullRequestEvent(mockEvent, {});

            expect(result).toBe(true);
            expect(parsePrEvent).toHaveBeenCalledWith(mockEvent);
            expect(fetchPrDiffStat).toHaveBeenCalled();
            expect(diffAnalyzerService.analyzeFiles).toHaveBeenCalled();
            expect(riskScoringService.calculateRisk).toHaveBeenCalled();
            expect(storageService.setPrAnalysisState).toHaveBeenCalled();
            expect(prStorageService.saveOrUpdatePullRequest).toHaveBeenCalled();
            expect(bitbucketCommentsService.createPullRequestComment).toHaveBeenCalled();
        });
    });

    describe('Invalid payload - Graceful rejection', () => {
        it('should return early if parsePrEvent returns null', async () => {
            (parsePrEvent as jest.Mock).mockResolvedValue(null);

            const mockEvent = { payload: 'invalid' };
            const result = await onPullRequestEvent(mockEvent, {});

            expect(result).toBeUndefined();
            expect(parsePrEvent).toHaveBeenCalledWith(mockEvent);
            // Should not call any other services
            expect(fetchPrDiffStat).not.toHaveBeenCalled();
            expect(riskScoringService.calculateRisk).not.toHaveBeenCalled();
        });

        it('should return early if no sourceCommitHash', async () => {
            const mockPr: InternalPr = {
                timestamp: new Date().toISOString(),
                eventType: 'avi:bitbucket:created:pullrequest',
                prId: 2,
                title: 'Test PR',
                authorAccountId: 'user-123',
                repoUuid: 'repo-123',
                workspaceUuid: 'workspace-123',
                state: 'OPEN',
                sourceBranch: 'feature/test',
                destinationBranch: 'main',
                sourceCommitHash: null, // No commit hash
                mergeCommitHash: null,
                cloudId: null,
                moduleKey: null,
                scopes: [],
                selfGenerated: false,
            };

            (parsePrEvent as jest.Mock).mockResolvedValue(mockPr);

            const mockEvent = { payload: 'test' };
            const result = await onPullRequestEvent(mockEvent, {});

            expect(result).toBeUndefined();
            expect(fetchPrDiffStat).not.toHaveBeenCalled();
        });
    });

    describe('API Bitbucket fail - Error handling', () => {
        it('should continue flow if fetchPrDiffStat fails', async () => {
            const mockPr: InternalPr = {
                timestamp: new Date().toISOString(),
                eventType: 'avi:bitbucket:created:pullrequest',
                prId: 3,
                title: 'Test PR',
                authorAccountId: 'user-123',
                repoUuid: 'repo-123',
                workspaceUuid: 'workspace-123',
                state: 'OPEN',
                sourceBranch: 'feature/test',
                destinationBranch: 'main',
                sourceCommitHash: 'abc123',
                mergeCommitHash: null,
                cloudId: null,
                moduleKey: null,
                scopes: [],
                selfGenerated: false,
            };

            (parsePrEvent as jest.Mock).mockResolvedValue(mockPr);
            (fetchPrDiffStat as jest.Mock).mockResolvedValue(null); // API failed

            // Mock storage
            (storageService.getPrAnalysisState as jest.Mock).mockResolvedValue(null);
            (storageService.setPrAnalysisState as jest.Mock).mockResolvedValue(undefined);
            (prStorageService.saveOrUpdatePullRequest as jest.Mock).mockResolvedValue(undefined);

            const mockEvent = { payload: 'test' };
            const result = await onPullRequestEvent(mockEvent, {});

            expect(result).toBe(true);
            // Should still save PR state even if diff fetch failed
            expect(storageService.setPrAnalysisState).toHaveBeenCalled();
            expect(prStorageService.saveOrUpdatePullRequest).toHaveBeenCalled();
            // Should NOT call risk scoring if no diff stats
            expect(riskScoringService.calculateRisk).not.toHaveBeenCalled();
        });
    });

    describe('Smart gating - Skip re-analysis', () => {
        it('should skip analysis if sourceCommitHash matches last analysis', async () => {
            const mockPr: InternalPr = {
                timestamp: new Date().toISOString(),
                eventType: 'avi:bitbucket:updated:pullrequest',
                prId: 4,
                title: 'Test PR',
                authorAccountId: 'user-123',
                repoUuid: 'repo-123',
                workspaceUuid: 'workspace-123',
                state: 'OPEN',
                sourceBranch: 'feature/test',
                destinationBranch: 'main',
                sourceCommitHash: 'same-hash-123',
                mergeCommitHash: null,
                cloudId: null,
                moduleKey: null,
                scopes: [],
                selfGenerated: false,
            };

            (parsePrEvent as jest.Mock).mockResolvedValue(mockPr);

            // Mock storage to return existing analysis with same hash
            (storageService.getPrAnalysisState as jest.Mock).mockResolvedValue({
                lastSourceCommitHash: 'same-hash-123',
                lastAnalyzedAt: new Date().toISOString(),
            });

            const mockEvent = { payload: 'test' };
            const result = await onPullRequestEvent(mockEvent, {});

            expect(result).toBe(true);
            expect(parsePrEvent).toHaveBeenCalledWith(mockEvent);
            expect(storageService.getPrAnalysisState).toHaveBeenCalled();
            // Should NOT fetch diff or analyze
            expect(fetchPrDiffStat).not.toHaveBeenCalled();
            expect(diffAnalyzerService.analyzeFiles).not.toHaveBeenCalled();
            expect(riskScoringService.calculateRisk).not.toHaveBeenCalled();
        });

        it('should proceed with analysis if sourceCommitHash is different', async () => {
            const mockPr: InternalPr = {
                timestamp: new Date().toISOString(),
                eventType: 'avi:bitbucket:updated:pullrequest',
                prId: 5,
                title: 'Test PR',
                authorAccountId: 'user-123',
                repoUuid: 'repo-123',
                workspaceUuid: 'workspace-123',
                state: 'OPEN',
                sourceBranch: 'feature/test',
                destinationBranch: 'main',
                sourceCommitHash: 'new-hash-456',
                mergeCommitHash: null,
                cloudId: null,
                moduleKey: null,
                scopes: [],
                selfGenerated: false,
            };

            (parsePrEvent as jest.Mock).mockResolvedValue(mockPr);

            // Mock storage with different hash
            (storageService.getPrAnalysisState as jest.Mock).mockResolvedValue({
                lastSourceCommitHash: 'old-hash-123',
                lastAnalyzedAt: new Date().toISOString(),
            });

            (fetchPrDiffStat as jest.Mock).mockResolvedValue({
                modifiedFiles: [
                    { path: 'src/app.ts', status: 'modified', linesAdded: 10, linesRemoved: 5 },
                ],
                totalLinesAdded: 10,
                totalLinesRemoved: 5,
            });

            (diffAnalyzerService.analyzeFiles as jest.Mock).mockReturnValue({
                criticalFilesCount: 0,
                testFilesCount: 0,
                criticalPaths: [],
                docFilesCount: 0,
                generatedFilesCount: 0,
                renameOnlyFilesCount: 0,
                regularCodeFilesCount: 1,
            });

            (processAnalyzerService.determineSizeCategory as jest.Mock).mockReturnValue('small');
            (processAnalyzerService.analyzeTiming as jest.Mock).mockReturnValue({
                isLate: false,
                isWeekend: false,
            });

            (riskScoringService.calculateRisk as jest.Mock).mockReturnValue({
                score: 85,
                color: 'green',
                factors: [],
            });

            (storageService.setPrAnalysisState as jest.Mock).mockResolvedValue(undefined);
            (prStorageService.getPullRequest as jest.Mock).mockResolvedValue(null);
            (prStorageService.saveOrUpdatePullRequest as jest.Mock).mockResolvedValue(undefined);
            (buildPitCrewComment as jest.Mock).mockReturnValue('# PitCrew Analysis');
            (computeCommentFingerprint as jest.Mock).mockReturnValue('fingerprint-123');
            (bitbucketCommentsService.createPullRequestComment as jest.Mock).mockResolvedValue({
                id: 'comment-123',
            });

            const mockEvent = { payload: 'test' };
            const result = await onPullRequestEvent(mockEvent, {});

            expect(result).toBe(true);
            // Should fetch diff and analyze
            expect(fetchPrDiffStat).toHaveBeenCalled();
            expect(diffAnalyzerService.analyzeFiles).toHaveBeenCalled();
            expect(riskScoringService.calculateRisk).toHaveBeenCalled();
        });
    });

    describe('PR merged/rejected - Cleanup storage', () => {
        it('should delete analysis state when PR is fulfilled', async () => {
            const mockPr: InternalPr = {
                timestamp: new Date().toISOString(),
                eventType: 'avi:bitbucket:fulfilled:pullrequest',
                prId: 6,
                title: 'Test PR',
                authorAccountId: 'user-123',
                repoUuid: 'repo-123',
                workspaceUuid: 'workspace-123',
                state: 'MERGED',
                sourceBranch: 'feature/test',
                destinationBranch: 'main',
                sourceCommitHash: 'abc123',
                mergeCommitHash: 'merge-123',
                cloudId: null,
                moduleKey: null,
                scopes: [],
                selfGenerated: false,
            };

            (parsePrEvent as jest.Mock).mockResolvedValue(mockPr);
            (storageService.deletePrAnalysisState as jest.Mock).mockResolvedValue(undefined);
            (prStorageService.saveOrUpdatePullRequest as jest.Mock).mockResolvedValue(undefined);

            const mockEvent = { payload: 'test' };
            const result = await onPullRequestEvent(mockEvent, {});

            expect(result).toBe(true);
            expect(storageService.deletePrAnalysisState).toHaveBeenCalledWith('repo-123', 6);
            expect(prStorageService.saveOrUpdatePullRequest).toHaveBeenCalledWith(mockPr);
            // Should NOT analyze
            expect(fetchPrDiffStat).not.toHaveBeenCalled();
        });

        it('should delete analysis state when PR is rejected', async () => {
            const mockPr: InternalPr = {
                timestamp: new Date().toISOString(),
                eventType: 'avi:bitbucket:rejected:pullrequest',
                prId: 7,
                title: 'Test PR',
                authorAccountId: 'user-123',
                repoUuid: 'repo-123',
                workspaceUuid: 'workspace-123',
                state: 'DECLINED',
                sourceBranch: 'feature/test',
                destinationBranch: 'main',
                sourceCommitHash: 'abc123',
                mergeCommitHash: null,
                cloudId: null,
                moduleKey: null,
                scopes: [],
                selfGenerated: false,
            };

            (parsePrEvent as jest.Mock).mockResolvedValue(mockPr);
            (storageService.deletePrAnalysisState as jest.Mock).mockResolvedValue(undefined);
            (prStorageService.saveOrUpdatePullRequest as jest.Mock).mockResolvedValue(undefined);

            const mockEvent = { payload: 'test' };
            const result = await onPullRequestEvent(mockEvent, {});

            expect(result).toBe(true);
            expect(storageService.deletePrAnalysisState).toHaveBeenCalledWith('repo-123', 7);
            expect(prStorageService.saveOrUpdatePullRequest).toHaveBeenCalledWith(mockPr);
        });
    });

    describe('Comment update logic', () => {
        it('should update existing comment if fingerprint changed', async () => {
            const mockPr: InternalPr = {
                timestamp: new Date().toISOString(),
                eventType: 'avi:bitbucket:updated:pullrequest',
                prId: 8,
                title: 'Test PR',
                authorAccountId: 'user-123',
                repoUuid: 'repo-123',
                workspaceUuid: 'workspace-123',
                state: 'OPEN',
                sourceBranch: 'feature/test',
                destinationBranch: 'main',
                sourceCommitHash: 'abc123',
                mergeCommitHash: null,
                cloudId: null,
                moduleKey: null,
                scopes: [],
                selfGenerated: false,
            };

            (parsePrEvent as jest.Mock).mockResolvedValue(mockPr);
            (storageService.getPrAnalysisState as jest.Mock).mockResolvedValue(null);
            (fetchPrDiffStat as jest.Mock).mockResolvedValue({
                modifiedFiles: [],
                totalLinesAdded: 10,
                totalLinesRemoved: 5,
            });
            (diffAnalyzerService.analyzeFiles as jest.Mock).mockReturnValue({
                criticalFilesCount: 0,
                testFilesCount: 0,
                criticalPaths: [],
                docFilesCount: 0,
                generatedFilesCount: 0,
                renameOnlyFilesCount: 0,
                regularCodeFilesCount: 1,
            });
            (processAnalyzerService.determineSizeCategory as jest.Mock).mockReturnValue('small');
            (processAnalyzerService.analyzeTiming as jest.Mock).mockReturnValue({
                isLate: false,
                isWeekend: false,
            });
            (riskScoringService.calculateRisk as jest.Mock).mockReturnValue({
                score: 75,
                color: 'yellow',
                factors: [],
            });
            (storageService.setPrAnalysisState as jest.Mock).mockResolvedValue(undefined);

            // Existing PR with comment
            (prStorageService.getPullRequest as jest.Mock).mockResolvedValue({
                pitcrewCommentId: 'comment-old',
                pitcrewCommentFingerprint: 'old-fingerprint',
            });

            (buildPitCrewComment as jest.Mock).mockReturnValue('# Updated Analysis');
            (computeCommentFingerprint as jest.Mock).mockReturnValue('new-fingerprint');
            (bitbucketCommentsService.updatePullRequestComment as jest.Mock).mockResolvedValue(true);
            (prStorageService.saveOrUpdatePullRequest as jest.Mock).mockResolvedValue(undefined);

            const mockEvent = { payload: 'test' };
            const result = await onPullRequestEvent(mockEvent, {});

            expect(result).toBe(true);
            expect(bitbucketCommentsService.updatePullRequestComment).toHaveBeenCalledWith(
                'workspace-123',
                'repo-123',
                8,
                'comment-old',
                '# Updated Analysis'
            );
            expect(bitbucketCommentsService.createPullRequestComment).not.toHaveBeenCalled();
        });

        it('should skip comment if fingerprint unchanged', async () => {
            const mockPr: InternalPr = {
                timestamp: new Date().toISOString(),
                eventType: 'avi:bitbucket:updated:pullrequest',
                prId: 9,
                title: 'Test PR',
                authorAccountId: 'user-123',
                repoUuid: 'repo-123',
                workspaceUuid: 'workspace-123',
                state: 'OPEN',
                sourceBranch: 'feature/test',
                destinationBranch: 'main',
                sourceCommitHash: 'abc123',
                mergeCommitHash: null,
                cloudId: null,
                moduleKey: null,
                scopes: [],
                selfGenerated: false,
            };

            (parsePrEvent as jest.Mock).mockResolvedValue(mockPr);
            (storageService.getPrAnalysisState as jest.Mock).mockResolvedValue(null);
            (fetchPrDiffStat as jest.Mock).mockResolvedValue({
                modifiedFiles: [],
                totalLinesAdded: 10,
                totalLinesRemoved: 5,
            });
            (diffAnalyzerService.analyzeFiles as jest.Mock).mockReturnValue({
                criticalFilesCount: 0,
                testFilesCount: 0,
                criticalPaths: [],
                docFilesCount: 0,
                generatedFilesCount: 0,
                renameOnlyFilesCount: 0,
                regularCodeFilesCount: 1,
            });
            (processAnalyzerService.determineSizeCategory as jest.Mock).mockReturnValue('small');
            (processAnalyzerService.analyzeTiming as jest.Mock).mockReturnValue({
                isLate: false,
                isWeekend: false,
            });
            (riskScoringService.calculateRisk as jest.Mock).mockReturnValue({
                score: 75,
                color: 'yellow',
                factors: [],
            });
            (storageService.setPrAnalysisState as jest.Mock).mockResolvedValue(undefined);

            // Existing PR with same fingerprint
            (prStorageService.getPullRequest as jest.Mock).mockResolvedValue({
                pitcrewCommentId: 'comment-123',
                pitcrewCommentFingerprint: 'same-fingerprint',
            });

            (buildPitCrewComment as jest.Mock).mockReturnValue('# Analysis');
            (computeCommentFingerprint as jest.Mock).mockReturnValue('same-fingerprint');
            (prStorageService.saveOrUpdatePullRequest as jest.Mock).mockResolvedValue(undefined);

            const mockEvent = { payload: 'test' };
            const result = await onPullRequestEvent(mockEvent, {});

            expect(result).toBe(true);
            // Should NOT update or create comment
            expect(bitbucketCommentsService.updatePullRequestComment).not.toHaveBeenCalled();
            expect(bitbucketCommentsService.createPullRequestComment).not.toHaveBeenCalled();
        });
    });
});
