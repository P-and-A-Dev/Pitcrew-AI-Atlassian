import { useState } from "react";
import { useTelemetry } from "../hooks/useTelemetry";
import type { TelemetryPR } from "../hooks/useTelemetry";

import { PRList } from "../Components/pr/PRList";
import { PRTelemetryPanel } from "../Components/pr/PRTelemetryPanel";

export function PRTelemetryView() {
    const { data, loading, error } = useTelemetry();
    const [selectedPR, setSelectedPR] = useState<TelemetryPR | null>(null);

    if (loading) {
        return (
            <div className="rounded-lg bg-[#0F1629] p-4 opacity-60">
                Loading PR telemetry…
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-[#0F1629] p-4 text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT — PR LIST */}
            <div className="lg:col-span-1">
                <PRList
                    prs={data}
                    onSelect={setSelectedPR}
                />
            </div>

            {/* RIGHT — PR TELEMETRY PANEL */}
            <div className="lg:col-span-2 rounded-lg bg-[#0F1629] p-6">
                {selectedPR ? (
                    <PRTelemetryPanel pr={selectedPR} />
                ) : (
                    <div className="opacity-50">
                        Select a PR to view telemetry
                    </div>
                )}
            </div>
        </div>
    );
}
