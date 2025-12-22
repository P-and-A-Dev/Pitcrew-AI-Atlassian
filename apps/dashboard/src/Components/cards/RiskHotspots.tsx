import type { DeveloperLoad } from "../../hooks/useTeamLoad";

interface RiskHotspotsProps {
    data: DeveloperLoad[];
}

export function RiskHotspots({ data }: RiskHotspotsProps) {
    const hotspots = data.filter(dev => dev.highRiskPRs > 0);

    if (hotspots.length === 0) {
        return (
            <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-400">
                Track is clear. No risk hotspots detected.
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-[#0F1629] p-4 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-red-400">
                Risk Hotspots
            </h3>

            <div className="space-y-3">
                {hotspots.map(dev => (
                    <div
                        key={dev.id}
                        className="flex items-center justify-between rounded-md bg-[#11162A] px-3 py-2"
                    >
                        <div>
                            <p className="font-medium">
                                {dev.name}
                            </p>
                            <p className="text-xs opacity-60">
                                {dev.highRiskPRs} high-risk PR
                                {dev.highRiskPRs > 1 ? "s" : ""}
                            </p>
                        </div>

                        <span className="text-xs font-semibold text-red-400">
                            ATTENTION
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
