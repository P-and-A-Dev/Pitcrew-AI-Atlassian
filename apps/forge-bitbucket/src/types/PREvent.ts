export interface PREvent {
    timestamp: Date;
    actor: Actor;
    repository: Project;
    project: Project;
    workspace: Project;
    pullrequest: PullRequest;
    eventType: eventType;
    selfGenerated: boolean;
    permissions: Permissions;
    context: EventContext;
    contextToken: string;
}

export interface Actor {
    type: string;
    accountId: string;
    uuid: string;
}

export interface Project {
    uuid: string;
}

export interface PullRequest {
    id: number;
    state: PullRequestState;
    source: Branch;
    destination: Branch;
    mergeCommit: Commit;
}

export enum PullRequestState {
    OPEN = "OPEN",
    MERGED = "MERGED",
    DECLINED = "DECLINED"
}

export interface Branch {
    branch: string;
    commit: Commit;
}

export interface Commit {
    hash: string;
}

export enum eventType {
    CREATED = "avi:bitbucket:created:pullrequest",
    UPDATED = "avi:bitbucket:updated:pullrequest",
    MERGED = "avi:bitbucket:fulfilled:pullrequest",
    REJECTED = "avi:bitbucket:rejected:pullrequest"
}

export interface Permissions {
    scopes: string[];
}

export interface EventContext {
    cloudId: string;
    moduleKey: string;
    userAccess: UserAccess;
}

export interface UserAccess {
    enabled: boolean;
}
