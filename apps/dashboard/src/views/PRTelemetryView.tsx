import { useState } from "react";
import { useTelemetry } from "../hooks/useTelemetry";
import type { TelemetryPR } from "../hooks/useTelemetry";

import { PRList } from "../Components/pr/PRList";

export function PRTelemetryView() {
    const { data, loading, error } = useTelemetry();
    const [selectedPR, setSelectedPR] = useState<TelemetryPR | null>(null);

    if (loading) {
        return <div className="opacity-60">Loading PR telemetry…</div>;
    }

    if (error) {
        return <div className="text-red-400">{error}</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PR LIST */}
            <div className="lg:col-span-1">
                <PRList prs={data} onSelect={setSelectedPR} />
            </div>

            {/* PR DETAILS */}
            <div className="lg:col-span-2 rounded-lg bg-[#0F1629] p-6">
                {selectedPR ? (
                    <div>
                        <h2 className="text-lg font-bold">
                            {selectedPR.title}
                        </h2>
                        <p className="text-sm opacity-60">
                            {selectedPR.author}
                        </p>

                        <p className="mt-4">
                            Risk Score:{" "}
                            <span className="font-semibold">
                                {selectedPR.riskScore}
                            </span>
                        </p>
                    </div>
                ) : (
                    <div className="opacity-50">
                        Select a PR to view telemetry
                    </div>
                )}
            </div>
        </div>
    );
}
