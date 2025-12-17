export interface Context {
    installContext: string;
    installation: Installation;
    workspaceId: string;
}

export interface Installation {
    ari: Ari;
    contexts: ContextElement[];
}

export interface Ari {
    installationId: string;
}

export interface ContextElement {
    workspaceId: string;
}
