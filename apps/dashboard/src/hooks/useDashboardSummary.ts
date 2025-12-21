export type GlobalStatus = "green" | "yellow" | "red";

export interface DashboardSummary {
  productName: string;
  repository: string;
  sprint: string;
  status: GlobalStatus;
}

export function useDashboardSummary(): {
  data: DashboardSummary | null;
  loading: boolean;
} {
  // Mock inicial
  const data: DashboardSummary = {
    productName: "PitCrew AI",
    repository: "bitbucket/pitcrew-ai",
    sprint: "Sprint 12",
    status: "yellow",
  };

  return {
    data,
    loading: false,
  };
}