
export interface DashboardKpis {
    openPRs: number;
    riskyPRs: number;
    avgPrSize: number;
    prsWithoutTests: number;
    criticalFilesTouched: number;
}

export function useDashboardKpis() {
    const data: DashboardKpis = {
        openPRs: 14,
        riskyPRs: 4,
        avgPrSize: 320,
        prsWithoutTests: 3,
        criticalFilesTouched: 6,
    };

    return {
        data,
        loading: false,
    };
}
