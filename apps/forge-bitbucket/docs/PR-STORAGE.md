# PR Storage System - Documentation

## Overview

Persistent storage system for Pull Requests using Forge KV storage with optimized indexing for dashboard queries.

## Architecture

### Storage Strategy

- **Primary Storage**: Forge KV (key-value)
- **Indexing**: Separate index keys for fast filtering
- **Idempotency**: Safe to call save/update multiple times

### Key Structure

```
PR:{workspaceUuid}:{repoUuid}:{prId} → StoredPullRequest object
```

### Index Structure

```
PR_INDEX:byRepo:{workspaceUuid}:{repoUuid} → string[] (all PRs)
PR_INDEX:open:{workspaceUuid}:{repoUuid} → string[] (open PRs)
PR_INDEX:byRisk:{workspaceUuid}:{repoUuid}:red → string[] (red PRs)
PR_INDEX:byRisk:{workspaceUuid}:{repoUuid}:yellow → string[] (yellow PRs)
PR_INDEX:byRisk:{workspaceUuid}:{repoUuid}:green → string[] (green PRs)
```

## Data Model

### StoredPullRequest

```typescript
interface StoredPullRequest {
  // Identity
  key: string;
  workspaceUuid: string;
  repoUuid: string;
  prId: number;
  
  // PR Data
  title: string;
  state: "OPEN" | "MERGED" | "DECLINED";
  author: { accountId: string; ... };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastAnalyzedAt: string;
  mergedAt?: string;
  closedAt?: string;
  
  // Diff Metadata
  diff: {
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
    linesChanged: number;
    criticalFilesTouched: boolean;
    criticalPaths: string[];
    testsTouched: boolean;
    testFilesChanged: number;
    nonTestFilesChanged: number;
  };
  
  // Risk
  risk: {
    score: number; // 0-100
    color: "green" | "yellow" | "red";
    factors: string[];
    version: string;
  };
  
  // Dashboard flags
  statusFlags: {
    isHighRisk: boolean;
    isStale: boolean;
    isBlocked: boolean;
  };
  
  // Metrics
  metrics: {
    ageHours: number;
  };
}
```

## API Reference

### Core Operations

#### `saveOrUpdatePullRequest(pr: InternalPr)`

Saves or updates a PR (idempotent). Automatically:
- Creates/updates PR record
- Updates all relevant indexes
- Handles risk color changes
- Handles state changes (OPEN → MERGED)

```typescript
await prStorageService.saveOrUpdatePullRequest(pr);
```

#### `getPullRequest(workspaceUuid, repoUuid, prId)`

Get a single PR by coordinates.

```typescript
const pr = await prStorageService.getPullRequest("ws-123", "repo-456", 1);
```

#### `getPullRequestsByKeys(prKeys: string[])`

Batch read multiple PRs.

```typescript
const prs = await prStorageService.getPullRequestsByKeys(prKeys);
```

### Dashboard Queries

#### `getTelemetryCounts(workspaceUuid, repoUuid)`

Get counts WITHOUT loading all PRs (fast).

```typescript
const counts = await prStorageService.getTelemetryCounts("ws-123", "repo-456");
// {total: 45, open: 12, red: 3, yellow: 7, green: 2}
```

#### `getHighRiskPrs(workspaceUuid, repoUuid, limit?)`

Get red PRs only (default limit: 50).

```typescript
const redPrs = await prStorageService.getHighRiskPrs("ws-123", "repo-456", 10);
```

#### `getOpenPrs(workspaceUuid, repoUuid, limit?)`

Get open PRs (default limit: 100).

```typescript
const openPrs = await prStorageService.getOpenPrs("ws-123", "repo-456");
```

#### `getPrsByRisk(workspaceUuid, repoUuid, color, limit?)`

Get PRs by specific risk color.

```typescript
const yellowPrs = await prStorageService.getPrsByRisk("ws-123", "repo-456", "yellow");
```

## Index Management

Indexes are managed automatically:

- **Add to index**: Idempotent, no duplicates
- **Remove from index**: Safe if key doesn't exist
- **Risk change**: Automatically moves PR between risk indexes
- **State change**: Automatically adds/removes from open index

## Flow Examples

### New PR Created

```
1. Webhook receives PR created event
2. Parse & analyze PR
3. Calculate risk score
4. saveOrUpdatePullRequest()
   - Creates PR record with key PR:ws:repo:1
   - Adds to PR_INDEX:byRepo:ws:repo
   - Adds to PR_INDEX:open:ws:repo
   - Adds to PR_INDEX:byRisk:ws:repo:yellow
```

### PR Updated (risk changes)

```
1. Webhook receives PR updated event
2. Re-analyze PR
3. Risk changes from yellow → red
4. saveOrUpdatePullRequest()
   - Updates PR record
   - Keeps in byRepo index
   - Keeps in open index
   - Removes from PR_INDEX:byRisk:ws:repo:yellow
   - Adds to PR_INDEX:byRisk:ws:repo:red
```

### PR Merged

```
1. Webhook receives PR fulfilled event
2. saveOrUpdatePullRequest()
   - Updates PR state to MERGED
   - Sets mergedAt timestamp
   - Removes from PR_INDEX:open:ws:repo
   - Keeps in byRepo for history
   - Keeps in risk index
```

## Performance Optimization

1. **Index-first queries**: Read counts from index array length
2. **Batch reads**: Use `getPullRequestsByKeys()` for multiple PRs
3. **Limits**: Always specify limits to avoid loading too much
4. **Pre-calculated flags**: `isHighRisk`, `isStale` stored directly

## Testing

Run tests with:

```bash
cd src/tests
ts-node pr-storage.test.ts
```

Tests cover:
- ✅ Save new PR → creates indexes
- ✅ Update same PR →  no duplicates
- ✅ Risk change → updates risk indexes
- ✅ State change → updates open index

## Logs

Storage operations log:
```
💾 [STORAGE] Saving PR PR:ws:repo:1
🎨 [STORAGE] Risk color changed: yellow → red
✅ [STORAGE] Saved PR PR:ws:repo:1 | State: OPEN | Risk: red (45)
```

## Future Enhancements

- Pagination for large index arrays
- Workspace-level global indexes
- Search by linked Jira issues
- Time-based queries (PRs created this week)
- Stale PR detection (auto-flagging > 3 days old)
