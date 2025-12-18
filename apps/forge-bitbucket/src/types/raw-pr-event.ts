export type RawPrEvent = {
    timestamp?: string;
    actor?: {
        type?: string;
        accountId?: string;
        uuid?: string;
    };

    repository?: {
        uuid?: string;
    };

    workspace?: {
        uuid?: string;
    };

    pullrequest?: {
        id?: number;
        title?: string;
        state?: string;
        source?: {
            branch?: any;
            commit?: { hash?: string };
        };
        destination?: {
            branch?: any;
            commit?: { hash?: string };
        };
        mergeCommit?: { hash?: string };
    };

    eventType?: string;

    context?: {
        cloudId?: string;
        moduleKey?: string;
        userAccess?: { enabled?: boolean };
    };

    permissions?: {
        scopes?: string[];
    };

    selfGenerated?: boolean;
    contextToken?: string;
};
