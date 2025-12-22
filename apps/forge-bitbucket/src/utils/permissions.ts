/**
 * Permission and Validation Utilities
 *
 * Helpers for verifying Forge permissions and validating UUIDs
 */

import { createLogger } from './logger';

const logger = createLogger({ component: 'permissions' });

/**
 * Check if required scope is present in event permissions
 * @param requiredScope Scope to check (e.g., 'write:comment:bitbucket')
 * @param event Webhook event object
 * @returns true if scope is available
 */
export function hasPermission(requiredScope: string, event: any): boolean {
    const scopes = event?.permissions?.scopes || [];
    const hasScope = scopes.includes(requiredScope);

    if (!hasScope) {
        logger.warn('Missing required permission', {
            requiredScope,
            availableScopes: scopes,
        });
    }

    return hasScope;
}

/**
 * Validate workspace and repository UUIDs
 * @param workspaceUuid Workspace UUID (optional)
 * @param repoUuid Repository UUID
 * @returns true if UUIDs are valid
 */
export function validateWorkspaceRepo(
    workspaceUuid?: string | null,
    repoUuid?: string | null
): boolean {
    // Repository UUID is required
    if (!repoUuid || typeof repoUuid !== 'string' || repoUuid.length < 10) {
        logger.error('Invalid repository UUID', { repoUuid });
        return false;
    }

    // Workspace UUID is optional but must be valid if present
    if (workspaceUuid && (typeof workspaceUuid !== 'string' || workspaceUuid.length < 10)) {
        logger.error('Invalid workspace UUID', { workspaceUuid });
        return false;
    }

    return true;
}

/**
 * Validate PR ID
 * @param prId PR identifier
 * @returns true if PR ID is valid
 */
export function validatePrId(prId: any): prId is number {
    if (typeof prId !== 'number' || prId <= 0 || !Number.isInteger(prId)) {
        logger.error('Invalid PR ID', { prId, type: typeof prId });
        return false;
    }
    return true;
}
