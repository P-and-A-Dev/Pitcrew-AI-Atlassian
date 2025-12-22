# Security Documentation - PitCrew AI

This document describes the security model, required permissions, and data handling for the PitCrew AI Forge app.

---

## Forge Scopes Required

### `storage:app`

**Purpose:** Store PR analysis state and metadata

**Justification:**
- Webhook handlers need to persist PR analysis results
- Track analysis history to avoid re-analyzing unchanged commits
- Store risk scores and analysis timestamps

**Data Stored:**
- PR metadata (title, author, state)
- Risk scores and color classifications
- Analysis metrics (files changed, lines added/removed)
- Commit hashes for smart gating
- Comment fingerprints to avoid duplicate updates

**Retention Policy:**
- Data stored until PR is merged, declined, or superseded
- Automatic cleanup on PR closure
- No indefinite storage

**Access Pattern:**
- Read: On webhook events to check previous analysis
- Write: After completing PR analysis
- Delete: When PR is closed/merged

---

### `read:pullrequest:bitbucket`

**Purpose:** Read PR details and diff statistics from Bitbucket API

**Justification:**
- Fetch PR metadata (title, description, reviewers)
- Retrieve diff statistics (files changed, lines modified)
- Access commit information for analysis

**Data Accessed:**
- PR title and description
- List of files changed
- Line counts (added/removed per file)
- Source and destination branches
- Commit hashes
- Reviewer list

**Privacy:**
- **No code content accessed** - only metadata
- Read-only access
- No sensitive repository data stored

**Frequency:**
- Only on PR created/updated webhook events
- Cached for 5 minutes to reduce API calls

---

### `write:comment:bitbucket`

**Purpose:** Post risk analysis comments on pull requests

**Justification:**
- Communicate risk assessment to developers
- Provide actionable recommendations
- Update comments when analysis changes

**Data Written:**
- Risk score (0-100) and color classification
- Analysis metrics (critical files, test coverage)
- Risk factors (e.g., "off-hours", "no reviewers")
- Recommendations

**Comment Format:**
- Public comments (visible to all PR viewers)
- Markdown formatted for readability
- Updated in-place when PR changes

**Comment Policy:**
- One comment per PR (updated, not duplicated)
- Fingerprint-based deduplication
- Comments deleted when PR is closed

---

## Permission Checks

Before performing sensitive operations, the app verifies permissions:

### Before Writing Comments

```typescript
// Verify write:comment scope before creating/updating comments
if (!hasPermission('write:comment:bitbucket', event)) {
  logger.warn('Missing write:comment permission, skipping comment');
  return null;
}
```

### Before Storage Operations

```typescript
// Storage operations assume storage:app scope
// Gracefully degrade if storage unavailable
try {
  await storage.set(key, data);
} catch (error) {
  logger.error('Storage failed, analysis not persisted', error);
}
```

### Workspace/Repository Validation

```typescript
// Validate UUIDs before API calls
if (!validateWorkspaceRepo(workspaceUuid, repoUuid)) {
  logger.error('Invalid workspace/repo UUIDs', { workspaceUuid, repoUuid });
  return null;
}
```

---

## Data Security

### Personal Identifiable Information (PII)

**Not Collected:**
- User email addresses
- User real names
- IP addresses
- Session tokens

**Minimal Data:**
- Bitbucket account IDs (opaque identifiers)
- PR IDs (public repository identifiers)
- Repository UUIDs (public)

### Data Encryption

- **At Rest:** Forge platform handles encryption
- **In Transit:** HTTPS for all API calls
- **Storage:** Forge storage is encrypted by default

### Data Retention

- PR analysis data deleted when PR closes
- No historical data accumulated
- Cache expires after 5 minutes automatically

---

## Threat Model

### Threats Mitigated

1. **Malformed Webhook Payloads**
   - **Mitigation:** Zod schema validation
   - **Impact:** Prevents injection attacks

2. **Excessive API Calls**
   - **Mitigation:** Diff cache (5min TTL), smart gating
   - **Impact:** Reduces rate limiting risks

3. **Unauthorized Actions**
   - **Mitigation:** Permission checks before writes
   - **Impact:** Prevents privilege escalation

### Threats Not Addressed

1. **Bitbucket API Vulnerabilities**
   - **Assumption:** Bitbucket API is secure and trusted
   - **Mitigation:** Use official Forge SDK only

2. **Malicious Repository Content**
   - **Assumption:** Repository code is not analyzed
   - **Note:** Only metadata (filenames, line counts) accessed

---

## Security Best Practices

### Input Validation

- All webhook payloads validated with Zod schemas
- Type-safe parsing ensures data integrity
- Reject malformed inputs early

### Least Privilege

- Request only necessary scopes
- No write:repository access requested
- Read-only access to PR metadata

### Error Handling

- Errors logged but not exposed to users
- No sensitive data in error messages
- Graceful degradation on failures

### Logging

- Structured logs with request IDs
- No PII in logs
- Error stack traces sanitized

---

## Compliance

### GDPR Considerations

- No personal data stored beyond account IDs
- Data retention limited to PR lifecycle
- Users can delete PRs (triggers cleanup)

### Audit Trail

- All actions logged with timestamps
- Request IDs for correlation
- Logs retained per Forge platform policy

---

## Updates

**Last Updated:** 2025-12-22  
**Security Contact:** [Your contact information]  
**Report Vulnerabilities:** [Security email/process]

For questions or security concerns, please contact the maintainers.
