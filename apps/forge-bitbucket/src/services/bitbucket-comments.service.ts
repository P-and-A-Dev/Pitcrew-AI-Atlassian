import { route, asApp } from "@forge/api";
import { createLogger } from "../utils/logger";

/**
 * Bitbucket Comments Service
 * Handles creating and updating comments on Pull Requests via Bitbucket Cloud API v2.
 */
export class BitbucketCommentsService {

    /**
     * Create a new comment on a Pull Request.
     * 
     * @param workspace - Workspace UUID (e.g., "{workspace-uuid}")
     * @param repoSlug - Repository slug or UUID
     * @param prId - Pull Request ID
     * @param content - Markdown content of the comment
     * @returns Created comment ID as string
     */
    async createPullRequestComment(
        workspace: string,
        repoSlug: string,
        prId: number,
        content: string
    ): Promise<{ id: string } | null> {
        const logger = createLogger({ prId, repoUuid: repoSlug, component: 'bitbucket-comments' });
        try {
            logger.info('Creating comment', { event: 'comment_create_start' });

            const response = await asApp().requestBitbucket(
                route`/2.0/repositories/${workspace}/${repoSlug}/pullrequests/${prId}/comments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: {
                            raw: content,
                        },
                    }),
                }
            );

            if (!response.ok) {
                logger.error('Failed to create comment', null, {
                    event: 'comment_create_failed',
                    status: response.status,
                    statusText: response.statusText,
                });
                return null;
            }

            const data = await response.json();
            const commentId = String(data.id);

            logger.info('Comment created successfully', {
                event: 'comment_created',
                commentId,
            });
            return { id: commentId };
        } catch (error) {
            logger.error('Error creating comment', error, { event: 'comment_create_exception' });
            return null;
        }
    }

    /**
     * Update an existing comment on a Pull Request.
     * If the comment is not found (404), returns null to allow fallback to create.
     * 
     * @param workspace - Workspace UUID
     * @param repoSlug - Repository slug or UUID
     * @param prId - Pull Request ID
     * @param commentId - Comment ID to update (as string)
     * @param content - New markdown content
     * @returns true if successful, false if 404 (deleted), null on other errors
     */
    async updatePullRequestComment(
        workspace: string,
        repoSlug: string,
        prId: number,
        commentId: string,
        content: string
    ): Promise<boolean | null> {
        const logger = createLogger({ prId, repoUuid: repoSlug, component: 'bitbucket-comments' });
        try {
            logger.info('Updating comment', { event: 'comment_update_start', commentId });

            const response = await asApp().requestBitbucket(
                route`/2.0/repositories/${workspace}/${repoSlug}/pullrequests/${prId}/comments/${commentId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: {
                            raw: content,
                        },
                    }),
                }
            );

            if (response.status === 404) {
                logger.warn('Comment not found (likely deleted)', {
                    event: 'comment_not_found',
                    commentId,
                });
                return false;
            }

            if (!response.ok) {
                logger.error('Failed to update comment', null, {
                    event: 'comment_update_failed',
                    commentId,
                    status: response.status,
                    statusText: response.statusText,
                });
                return null;
            }

            logger.info('Comment updated successfully', {
                event: 'comment_updated',
                commentId,
            });
            return true;
        } catch (error) {
            logger.error('Error updating comment', error, {
                event: 'comment_update_exception',
                commentId,
            });
            return null;
        }
    }
}

export const bitbucketCommentsService = new BitbucketCommentsService();
