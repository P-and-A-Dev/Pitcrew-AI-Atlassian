/**
 * Unit Tests for Zod Validation Schemas
 * Tests strict validation of incoming Bitbucket webhooks
 */

import {
    BitbucketWebhookEventSchema,
    validateWebhookPayload,
} from '../schemas';

describe('Bitbucket Webhook Validation', () => {
    describe('Valid payloads', () => {
        it('should accept a complete valid payload', () => {
            const validPayload = {
                timestamp: '2025-12-22T10:00:00Z',
                eventType: 'avi:bitbucket:created:pullrequest',
                actor: {
                    accountId: 'user-123',
                    uuid: '{uuid-456}',
                    type: 'user',
                },
                repository: {
                    uuid: '{repo-uuid}',
                },
                workspace: {
                    uuid: '{workspace-uuid}',
                },
                pullrequest: {
                    id: 42,
                    title: 'Add new feature',
                    state: 'OPEN',
                    source: {
                        branch: { name: 'feature/test' },
                        commit: { hash: 'abc123' },
                    },
                    destination: {
                        branch: 'main',
                        commit: { hash: 'def456' },
                    },
                    reviewers: [{ accountId: 'reviewer-1' }],
                },
                context: {
                    cloudId: 'cloud-123',
                    moduleKey: 'module-456',
                },
                permissions: {
                    scopes: ['read:pullrequest', 'write:pullrequest'],
                },
                selfGenerated: false,
            };

            const result = validateWebhookPayload(validPayload);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.pullrequest.id).toBe(42);
                expect(result.data.actor.accountId).toBe('user-123');
            }
        });

        it('should accept payload with minimal required fields', () => {
            const minimalPayload = {
                eventType: 'avi:bitbucket:updated:pullrequest',
                actor: {
                    accountId: 'user-456',
                },
                repository: {
                    uuid: '{repo-uuid}',
                },
                pullrequest: {
                    id: 10,
                    title: 'Fix bug',
                    source: {
                        branch: 'hotfix/bug',
                    },
                    destination: {
                        branch: 'main',
                    },
                },
            };

            const result = validateWebhookPayload(minimalPayload);

            expect(result.success).toBe(true);
        });

        it('should accept all supported event types', () => {
            const eventTypes = [
                'avi:bitbucket:created:pullrequest',
                'avi:bitbucket:updated:pullrequest',
                'avi:bitbucket:fulfilled:pullrequest',
                'avi:bitbucket:rejected:pullrequest',
            ];

            for (const eventType of eventTypes) {
                const payload = {
                    eventType,
                    actor: { accountId: 'user' },
                    repository: { uuid: 'repo' },
                    pullrequest: {
                        id: 1,
                        title: 'Test',
                        source: { branch: 'src' },
                        destination: { branch: 'dest' },
                    },
                };

                const result = validateWebhookPayload(payload);
                expect(result.success).toBe(true);
            }
        });
    });

    describe('Missing required fields', () => {
        it('should reject payload without pullrequest.id', () => {
            const invalidPayload = {
                eventType: 'avi:bitbucket:created:pullrequest',
                actor: { accountId: 'user' },
                repository: { uuid: 'repo' },
                pullrequest: {
                    // Missing id!
                    title: 'Test',
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
            if (result.success === false) {
                const error = result.error.errors.find(e =>
                    e.path.join('.') === 'pullrequest.id'
                );
                expect(error).toBeDefined();
            }
        });

        it('should reject payload without actor.accountId', () => {
            const invalidPayload = {
                eventType: 'avi:bitbucket:created:pullrequest',
                actor: {}, // Missing accountId!
                repository: { uuid: 'repo' },
                pullrequest: {
                    id: 1,
                    title: 'Test',
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
            if (result.success === false) {
                const error = result.error.errors.find(e =>
                    e.path.join('.') === 'actor.accountId'
                );
                expect(error).toBeDefined();
            }
        });

        it('should reject payload without repository.uuid', () => {
            const invalidPayload = {
                eventType: 'avi:bitbucket:created:pullrequest',
                actor: { accountId: 'user' },
                repository: {}, // Missing uuid!
                pullrequest: {
                    id: 1,
                    title: 'Test',
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
            if (result.success === false) {
                const error = result.error.errors.find(e =>
                    e.path.join('.') === 'repository.uuid'
                );
                expect(error).toBeDefined();
            }
        });

        it('should reject payload without eventType', () => {
            const invalidPayload = {
                // Missing eventType!
                actor: { accountId: 'user' },
                repository: { uuid: 'repo' },
                pullrequest: {
                    id: 1,
                    title: 'Test',
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
            if (result.success === false) {
                const error = result.error.errors.find(e =>
                    e.path.join('.') === 'eventType'
                );
                expect(error).toBeDefined();
            }
        });
    });

    describe('Invalid types', () => {
        it('should reject if pullrequest.id is string', () => {
            const invalidPayload = {
                eventType: 'avi:bitbucket:created:pullrequest',
                actor: { accountId: 'user' },
                repository: { uuid: 'repo' },
                pullrequest: {
                    id: 'not-a-number', // Wrong type!
                    title: 'Test',
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error.errors.some(e =>
                    e.path.join('.') === 'pullrequest.id'
                )).toBe(true);
            }
        });

        it('should reject if pullrequest.id is negative', () => {
            const invalidPayload = {
                eventType: 'avi:bitbucket:created:pullrequest',
                actor: { accountId: 'user' },
                repository: { uuid: 'repo' },
                pullrequest: {
                    id: -5, // Negative!
                    title: 'Test',
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
        });

        it('should reject if timestamp is not ISO date', () => {
            const invalidPayload = {
                timestamp: 'not-a-date', // Invalid ISO format
                eventType: 'avi:bitbucket:created:pullrequest',
                actor: { accountId: 'user' },
                repository: { uuid: 'repo' },
                pullrequest: {
                    id: 1,
                    title: 'Test',
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
        });
    });

    describe('Constraint violations', () => {
        it('should reject if PR title is empty', () => {
            const invalidPayload = {
                eventType: 'avi:bitbucket:created:pullrequest',
                actor: { accountId: 'user' },
                repository: { uuid: 'repo' },
                pullrequest: {
                    id: 1,
                    title: '', // Empty!
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
            if (result.success === false) {
                expect(result.error.errors.some(e =>
                    e.path.join('.') === 'pullrequest.title'
                )).toBe(true);
            }
        });

        it('should reject if PR title is too long (> 500 chars)', () => {
            const longTitle = 'A'.repeat(501);

            const invalidPayload = {
                eventType: 'avi:bitbucket:created:pullrequest',
                actor: { accountId: 'user' },
                repository: { uuid: 'repo' },
                pullrequest: {
                    id: 1,
                    title: longTitle,
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
            if (result.success === false) {
                const error = result.error.errors.find(e =>
                    e.path.join('.') === 'pullrequest.title'
                );
                expect(error).toBeDefined();
                expect(error?.message).toContain('too long');
            }
        });

        it('should accept PR title at exactly 500 chars', () => {
            const maxTitle = 'A'.repeat(500);

            const payload = {
                eventType: 'avi:bitbucket:created:pullrequest',
                actor: { accountId: 'user' },
                repository: { uuid: 'repo' },
                pullrequest: {
                    id: 1,
                    title: maxTitle,
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(payload);

            expect(result.success).toBe(true);
        });
    });

    describe('Invalid event types', () => {
        it('should reject unsupported event type', () => {
            const invalidPayload = {
                eventType: 'avi:bitbucket:commented:pullrequest', // Not supported!
                actor: { accountId: 'user' },
                repository: { uuid: 'repo' },
                pullrequest: {
                    id: 1,
                    title: 'Test',
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
            if (result.success === false) {
                const error = result.error.errors.find(e =>
                    e.path.join('.') === 'eventType'
                );
                expect(error).toBeDefined();
                expect(error?.message).toContain('Unsupported event type');
            }
        });

        it('should reject random event type', () => {
            const invalidPayload = {
                eventType: 'random:event',
                actor: { accountId: 'user' },
                repository: { uuid: 'repo' },
                pullrequest: {
                    id: 1,
                    title: 'Test',
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
        });
    });

    describe('Error messages', () => {
        it('should provide detailed error messages with paths', () => {
            const invalidPayload = {
                eventType: 'invalid',
                actor: {}, // Missing accountId
                repository: {}, // Missing uuid
                pullrequest: {
                    // Missing id
                    title: '',  // Empty title
                    source: { branch: 'src' },
                    destination: { branch: 'dest' },
                },
            };

            const result = validateWebhookPayload(invalidPayload);

            expect(result.success).toBe(false);
            if (result.success === false) {
                // Should have multiple errors
                expect(result.error.errors.length).toBeGreaterThan(1);

                // Each error should have a path and message
                result.error.errors.forEach(err => {
                    expect(err.path).toBeDefined();
                    expect(err.message).toBeDefined();
                    expect(err.message.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Edge cases', () => {
        it('should reject null payload', () => {
            const result = validateWebhookPayload(null);

            expect(result.success).toBe(false);
        });

        it('should reject undefined payload', () => {
            const result = validateWebhookPayload(undefined);

            expect(result.success).toBe(false);
        });

        it('should reject string payload', () => {
            const result = validateWebhookPayload('not an object');

            expect(result.success).toBe(false);
        });

        it('should reject array payload', () => {
            const result = validateWebhookPayload([]);

            expect(result.success).toBe(false);
        });
    });
});

