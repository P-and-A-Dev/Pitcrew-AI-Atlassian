/**
 * Unit Tests for Diff Analyzer Service
 * Tests file categorization and weight calculations
 */

import { DiffAnalyzerService } from '../diff-analyzer.service';
import { InternalFileMod } from '../../models/internal-pr';

describe('DiffAnalyzerService', () => {
    let service: DiffAnalyzerService;

    beforeEach(() => {
        service = new DiffAnalyzerService();
    });

    describe('Rename-only files', () => {
        it('should detect rename-only files (0 lines changed)', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'src/utils.ts',
                    status: 'renamed',
                    linesAdded: 0,
                    linesRemoved: 0,
                    oldPath: 'src/helpers.ts',
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.renameOnlyFilesCount).toBe(1);
            expect(result.regularCodeFilesCount).toBe(0);
            expect(result.testFilesCount).toBe(0);
        });

        it('should NOT count as rename-only if lines changed', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'src/utils.ts',
                    status: 'renamed',
                    linesAdded: 5,
                    linesRemoved: 3,
                    oldPath: 'src/helpers.ts',
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.renameOnlyFilesCount).toBe(0);
            expect(result.regularCodeFilesCount).toBe(1);
        });
    });

    describe('Generated files', () => {
        it('should detect package-lock.json as generated', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'package-lock.json',
                    status: 'modified',
                    linesAdded: 1000,
                    linesRemoved: 500,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.generatedFilesCount).toBe(1);
            expect(result.regularCodeFilesCount).toBe(0);
        });

        it('should detect yarn.lock, pnpm-lock.yaml as generated', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'yarn.lock',
                    status: 'modified',
                    linesAdded: 500,
                    linesRemoved: 300,
                },
                {
                    path: 'pnpm-lock.yaml',
                    status: 'modified',
                    linesAdded: 400,
                    linesRemoved: 200,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.generatedFilesCount).toBe(2);
        });

        it('should detect dist/ and build/ files as generated', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'dist/bundle.js',
                    status: 'modified',
                    linesAdded: 2000,
                    linesRemoved: 1500,
                },
                {
                    path: 'build/app.min.js',
                    status: 'modified',
                    linesAdded: 1500,
                    linesRemoved: 1000,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.generatedFilesCount).toBe(2);
        });
    });

    describe('Documentation files', () => {
        it('should detect .md and .txt as doc files', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'README.md',
                    status: 'modified',
                    linesAdded: 20,
                    linesRemoved: 10,
                },
                {
                    path: 'docs/guide.txt',
                    status: 'added',
                    linesAdded: 100,
                    linesRemoved: 0,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.docFilesCount).toBe(2);
            expect(result.regularCodeFilesCount).toBe(0);
        });

        it('should detect docs/ directory files', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'docs/architecture.md',
                    status: 'added',
                    linesAdded: 50,
                    linesRemoved: 0,
                },
                {
                    path: 'documentation/api.md',
                    status: 'modified',
                    linesAdded: 30,
                    linesRemoved: 15,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.docFilesCount).toBe(2);
        });
    });

    describe('Test files', () => {
        it('should detect .test. and .spec. files', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'src/app.test.ts',
                    status: 'added',
                    linesAdded: 100,
                    linesRemoved: 0,
                },
                {
                    path: 'src/utils.spec.ts',
                    status: 'modified',
                    linesAdded: 50,
                    linesRemoved: 20,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.testFilesCount).toBe(2);
            expect(result.regularCodeFilesCount).toBe(0);
        });

        it('should detect __tests__/ directory', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'src/__tests__/integration.ts',
                    status: 'added',
                    linesAdded: 150,
                    linesRemoved: 0,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.testFilesCount).toBe(1);
        });

        it('should detect test/ directory', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'test/unit/service.test.js',
                    status: 'modified',
                    linesAdded: 75,
                    linesRemoved: 30,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.testFilesCount).toBe(1);
        });
    });

    describe('Critical files', () => {
        it('should detect core/ files as critical', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'src/core/auth.ts',
                    status: 'modified',
                    linesAdded: 50,
                    linesRemoved: 30,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.criticalFilesCount).toBe(1);
            expect(result.criticalPaths).toContain('core');
            expect(result.regularCodeFilesCount).toBe(1);
        });

        it('should detect multiple critical keywords', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'src/core/engine.ts',
                    status: 'modified',
                    linesAdded: 30,
                    linesRemoved: 20,
                },
                {
                    path: 'src/infra/database.ts',
                    status: 'modified',
                    linesAdded: 40,
                    linesRemoved: 10,
                },
                {
                    path: 'src/payments/processor.ts',
                    status: 'modified',
                    linesAdded: 60,
                    linesRemoved: 25,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.criticalFilesCount).toBe(3);
            expect(result.criticalPaths).toContain('core');
            expect(result.criticalPaths).toContain('infra');
            expect(result.criticalPaths).toContain('payments');
            expect(result.criticalPaths.length).toBe(3);
        });

        it('should detect auth and security files', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'src/auth/login.ts',
                    status: 'modified',
                    linesAdded: 25,
                    linesRemoved: 15,
                },
                {
                    path: 'src/security/validator.ts',
                    status: 'modified',
                    linesAdded: 35,
                    linesRemoved: 10,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.criticalFilesCount).toBe(2);
            expect(result.criticalPaths).toContain('auth');
            expect(result.criticalPaths).toContain('security');
        });
    });

    describe('Mix of multiple types with correct weighting', () => {
        it('should correctly categorize mixed file types', () => {
            const files: InternalFileMod[] = [
                // Rename-only
                {
                    path: 'src/old.ts',
                    status: 'renamed',
                    linesAdded: 0,
                    linesRemoved: 0,
                    oldPath: 'src/new.ts',
                },
                // Generated
                {
                    path: 'package-lock.json',
                    status: 'modified',
                    linesAdded: 500,
                    linesRemoved: 300,
                },
                // Docs
                {
                    path: 'README.md',
                    status: 'modified',
                    linesAdded: 10,
                    linesRemoved: 5,
                },
                {
                    path: 'docs/api.md',
                    status: 'added',
                    linesAdded: 50,
                    linesRemoved: 0,
                },
                // Tests
                {
                    path: 'src/app.test.ts',
                    status: 'added',
                    linesAdded: 100,
                    linesRemoved: 0,
                },
                {
                    path: 'src/__tests__/utils.spec.ts',
                    status: 'added',
                    linesAdded: 75,
                    linesRemoved: 0,
                },
                // Regular code
                {
                    path: 'src/utils.ts',
                    status: 'modified',
                    linesAdded: 30,
                    linesRemoved: 15,
                },
                {
                    path: 'src/helpers.ts',
                    status: 'added',
                    linesAdded: 40,
                    linesRemoved: 0,
                },
                // Critical code
                {
                    path: 'src/core/auth.ts',
                    status: 'modified',
                    linesAdded: 50,
                    linesRemoved: 25,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.renameOnlyFilesCount).toBe(1);
            expect(result.generatedFilesCount).toBe(1);
            expect(result.docFilesCount).toBe(2);
            expect(result.testFilesCount).toBe(2);
            expect(result.regularCodeFilesCount).toBe(3); // utils, helpers, auth
            expect(result.criticalFilesCount).toBe(1);
            expect(result.criticalPaths).toContain('core');

            // Total should be 9 files
            const total =
                result.renameOnlyFilesCount +
                result.generatedFilesCount +
                result.docFilesCount +
                result.testFilesCount +
                result.regularCodeFilesCount;
            expect(total).toBe(9);
        });

        it('should prioritize categorization correctly (rename > generated > doc > test > regular)', () => {
            // This tests the priority: first match wins
            const files: InternalFileMod[] = [
                // Should be counted as rename-only (not test, even if path has .test.)
                {
                    path: 'src/app.test.ts',
                    status: 'renamed',
                    linesAdded: 0,
                    linesRemoved: 0,
                    oldPath: 'src/app.spec.ts',
                },
                // Should be counted as generated (not doc)
                {
                    path: 'dist/README.md',
                    status: 'modified',
                    linesAdded: 100,
                    linesRemoved: 50,
                },
            ];

            const result = service.analyzeFiles(files);

            expect(result.renameOnlyFilesCount).toBe(1);
            expect(result.generatedFilesCount).toBe(1);
            expect(result.testFilesCount).toBe(0);
            expect(result.docFilesCount).toBe(0);
        });
    });

    describe('Edge cases', () => {
        it('should handle empty files array', () => {
            const files: InternalFileMod[] = [];

            const result = service.analyzeFiles(files);

            expect(result.renameOnlyFilesCount).toBe(0);
            expect(result.generatedFilesCount).toBe(0);
            expect(result.docFilesCount).toBe(0);
            expect(result.testFilesCount).toBe(0);
            expect(result.regularCodeFilesCount).toBe(0);
            expect(result.criticalFilesCount).toBe(0);
            expect(result.criticalPaths).toEqual([]);
        });

        it('should handle case-insensitive path matching', () => {
            const files: InternalFileMod[] = [
                {
                    path: 'SRC/CORE/AUTH.TS',
                    status: 'modified',
                    linesAdded: 10,
                    linesRemoved: 5,
                },
            ];

            const result = service.analyzeFiles(files);

            // Should detect as critical despite uppercase
            expect(result.criticalFilesCount).toBe(1);
            expect(result.criticalPaths).toContain('core');
        });
    });
});
