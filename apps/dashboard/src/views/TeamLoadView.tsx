import { useState } from "react";
import { useTeamLoad } from "../hooks/useTeamLoad";
import { TeamLoadCard } from "../Components/cards/TeamLoadCard";
import { TeamLoadChart } from "../Components/cards/TeamLoadChart";
import { RiskHotspots } from "../Components/cards/RiskHotspots";
import { PRTelemetryView } from "./PRTelemetryView";

export function TeamLoadView() {
    const { data, loading } = useTeamLoad();
    const [selectedDeveloper, setSelectedDeveloper] = useState<string | null>(null);

    if (loading) {
        return <div className="opacity-60">Analyzing driver performance…</div>;
    }

    if (selectedDeveloper) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => setSelectedDeveloper(null)}
                    className="text-sm text-blue-400 hover:underline"
                >
                    ← Back to Team Load
                </button>

                <h2 className="text-lg font-bold">
                    PR Telemetry — {selectedDeveloper}
                </h2>

                {/* Reuse PR Telemetry */}
                <PRTelemetryView />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold">
                Team Load — Driver Performance
            </h2>

            <TeamLoadChart data={data} />
            <RiskHotspots data={data} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map(dev => (
                    <TeamLoadCard
                        key={dev.id}
                        name={dev.name}
                        activePRs={dev.activePRs}
                        highRiskPRs={dev.highRiskPRs}
                        avgPrSize={dev.avgPrSize}
                        onSelect={() => setSelectedDeveloper(dev.name)}
                    />
                ))}
            </div>
        </div>
    );
}
