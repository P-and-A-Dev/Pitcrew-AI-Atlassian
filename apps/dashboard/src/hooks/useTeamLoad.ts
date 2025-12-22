export type DeveloperLoad = {
    id: string;
    name: string;
    activePRs: number;
    highRiskPRs: number;
    avgPrSize: number;
};

export function useTeamLoad() {
    const data: DeveloperLoad[] = [
        {
            id: "alice",
            name: "Alice",
            activePRs: 4,
            highRiskPRs: 2,
            avgPrSize: 420,
        },
        {
            id: "antonin",
            name: "Antonin",
            activePRs: 2,
            highRiskPRs: 0,
            avgPrSize: 180,
        },
        {
            id: "pietro",
            name: "Pietro",
            activePRs: 5,
            highRiskPRs: 3,
            avgPrSize: 510,
        },
    ];

    return {
        data,
        loading: false,
    };
}
