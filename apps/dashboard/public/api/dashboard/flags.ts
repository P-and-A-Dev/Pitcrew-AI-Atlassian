import Resolver from "@forge/resolver";

const resolver = new Resolver();

resolver.define("getFlags", async () => {
    return {
        highRiskPRs: [
            {
                id: 1,
                title: "Refactor auth middleware",
                author: "alice",
                files: 12,
                riskScore: 82,
            },
            {
                id: 2,
                title: "Payment flow update",
                author: "bob",
                files: 8,
                riskScore: 74,
            },
        ],
        blockedPRs: [
            {
                id: 101,
                title: "Infra config update",
                reason: "Waiting for security review",
                daysBlocked: 3,
            },
            {
                id: 102,
                title: "New billing webhook",
                reason: "CI failing",
                daysBlocked: 2,
            },
        ],
    };
});

export const handler = resolver.getDefinitions();
