import { route, asApp } from "@forge/api";

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
        try {
            console.log(`💬 [COMMENT] Creating new comment on PR #${prId}`);

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
                console.error(
                    `❌ [COMMENT] Failed to create comment on PR #${prId}: ${response.status} ${response.statusText}`
                );
                return null;
            }

            const data = await response.json();
            const commentId = String(data.id);

            console.log(`✅ [COMMENT] Successfully created comment ${commentId} on PR #${prId}`);
            return { id: commentId };
        } catch (error) {
            console.error(`❌ [COMMENT] Error creating comment on PR #${prId}:`, error);
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
        try {
            console.log(`💬 [COMMENT] Updating existing comment ${commentId} on PR #${prId}`);

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
                console.warn(
                    `⚠️ [COMMENT] Comment ${commentId} not found (404) on PR #${prId}, likely deleted manually`
                );
                return false;
            }

            if (!response.ok) {
                console.error(
                    `❌ [COMMENT] Failed to update comment ${commentId} on PR #${prId}: ${response.status} ${response.statusText}`
                );
                return null;
            }

            console.log(`✅ [COMMENT] Successfully updated comment ${commentId} on PR #${prId}`);
            return true;
        } catch (error) {
            console.error(`❌ [COMMENT] Error updating comment ${commentId} on PR #${prId}:`, error);
            return null;
        }
    }
}

export const bitbucketCommentsService = new BitbucketCommentsService();
