import type { DeveloperLoad } from "../../hooks/useTeamLoad";
interface TeamLoadChartProps {
    data: DeveloperLoad[];
}

export function TeamLoadChart({ data }: TeamLoadChartProps) {
    const maxPRs = Math.max(...data.map(d => d.activePRs), 1);

    return (
        <div className="rounded-lg bg-[#0F1629] p-4 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
                Load Distribution
            </h3>

            <div className="space-y-3">
                {data.map(dev => {
                    const width = (dev.activePRs / maxPRs) * 100;

                    let color = "bg-green-500";
                    if (dev.activePRs >= 5) color = "bg-red-500";
                    else if (dev.activePRs >= 3) color = "bg-yellow-500";

                    return (
                        <div key={dev.id} className="space-y-1">
                            <div className="flex justify-between text-xs opacity-70">
                                <span>{dev.name}</span>
                                <span>{dev.activePRs} PRs</span>
                            </div>

                            <div className="h-2 w-full rounded bg-white/10">
                                <div
                                    className={`h-2 rounded ${color}`}
                                    style={{ width: `${width}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
