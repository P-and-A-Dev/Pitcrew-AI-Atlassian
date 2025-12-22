/**
 * Zod Validation Schemas for Bitbucket Webhooks
 * 
 * Provides strict validation for incoming webhook payloads to ensure:
 * - All required fields are present
 * - Types are correct
 * - Constraints are respected (sizes, formats)
 * - Early rejection of malformed payloads
 */

import { z } from 'zod';

/**
 * Actor (user who triggered the event)
 */
export const BitbucketActorSchema = z.object({
    accountId: z.string().min(1, "Actor accountId is required"),
    uuid: z.string().optional(),
    type: z.string().optional(),
});

/**
 * Repository information
 */
export const BitbucketRepositorySchema = z.object({
    uuid: z.string().min(1, "Repository UUID is required"),
});

/**
 * Workspace information
 */
export const BitbucketWorkspaceSchema = z.object({
    uuid: z.string().min(1, "Workspace UUID is required"),
});

/**
 * Branch reference (can be object or string)
 */
export const BitbucketBranchSchema = z.union([
    z.object({
        name: z.string().min(1, "Branch name cannot be empty"),
    }),
    z.string().min(1, "Branch name cannot be empty"),
]);

/**
 * Commit information
 */
export const BitbucketCommitSchema = z.object({
    hash: z.string().min(1, "Commit hash is required"),
});

/**
 * Pull Request data
 */
export const BitbucketPullRequestSchema = z.object({
    id: z.number().positive("PR ID must be a positive number"),
    title: z.string().min(1, "PR title cannot be empty").max(500, "PR title too long (max 500 chars)"),
    state: z.enum(["OPEN", "MERGED", "DECLINED", "SUPERSEDED"], {
        errorMap: () => ({ message: "Invalid PR state" })
    }).optional(),
    source: z.object({
        branch: BitbucketBranchSchema,
        commit: BitbucketCommitSchema.optional(),
    }),
    destination: z.object({
        branch: BitbucketBranchSchema,
        commit: BitbucketCommitSchema.optional(),
    }),
    mergeCommit: z.object({
        hash: z.string(),
    }).optional(),
    reviewers: z.array(z.object({
        accountId: z.string().optional(),
    })).optional(),
});

/**
 * Context information (Forge-specific)
 */
export const BitbucketContextSchema = z.object({
    cloudId: z.string().optional(),
    moduleKey: z.string().optional(),
    userAccess: z.object({
        enabled: z.boolean().optional(),
    }).optional(),
}).optional();

/**
 * Permissions information
 */
export const BitbucketPermissionsSchema = z.object({
    scopes: z.array(z.string()).optional(),
}).optional();

/**
 * Supported event types
 */
export const BitbucketEventTypeSchema = z.enum([
    "avi:bitbucket:created:pullrequest",
    "avi:bitbucket:updated:pullrequest",
    "avi:bitbucket:fulfilled:pullrequest",
    "avi:bitbucket:rejected:pullrequest",
], {
    errorMap: () => ({ message: "Unsupported event type" })
});

/**
 * Complete Bitbucket Webhook Event payload
 * This is the main schema used to validate incoming webhooks
 */
export const BitbucketWebhookEventSchema = z.object({
    timestamp: z.string().datetime({ message: "Invalid ISO timestamp" }).optional(),
    eventType: BitbucketEventTypeSchema,
    actor: BitbucketActorSchema,
    repository: BitbucketRepositorySchema,
    workspace: BitbucketWorkspaceSchema.optional(),
    pullrequest: BitbucketPullRequestSchema,
    context: BitbucketContextSchema,
    permissions: BitbucketPermissionsSchema,
    selfGenerated: z.boolean().optional(),
    contextToken: z.string().optional(),
});

/**
 * Type inference from schema
 */
export type ValidatedBitbucketWebhookEvent = z.infer<typeof BitbucketWebhookEventSchema>;

/**
 * Validation helper with detailed error logging
 */
export function validateWebhookPayload(payload: unknown): {
    success: true;
    data: ValidatedBitbucketWebhookEvent;
} | {
    success: false;
    error: z.ZodError;
} {
    const result = BitbucketWebhookEventSchema.safeParse(payload);

    if (!result.success) {
        console.error("❌ [VALIDATION] Webhook payload validation failed", {
            errors: result.error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
                code: err.code,
            })),
        });
    }

    return result;
}
