import type { TelemetryPR } from "../../hooks/useTelemetry";
import { PRMetricCard } from "./PRMetricCard";

interface PRTelemetryPanelProps {
    pr: TelemetryPR;
}

export function PRTelemetryPanel({ pr }: PRTelemetryPanelProps) {

    const details = {
        linesChanged: pr.riskScore > 70 ? 520 : 180,
        filesChanged: pr.riskScore > 70 ? 14 : 6,
        hasTests: pr.riskScore < 60,
        criticalPaths: pr.riskScore > 70
            ? ["auth", "core"]
            : ["payments"],
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-bold">
                    {pr.title}
                </h2>
                <p className="text-sm opacity-60">
                    {pr.author} · last update {pr.updatedAt}
                </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <PRMetricCard
                    label="Lines Changed"
                    value={details.linesChanged}
                    highlight={
                        details.linesChanged > 400 ? "critical" : "normal"
                    }
                />

                <PRMetricCard
                    label="Files Modified"
                    value={details.filesChanged}
                    highlight={
                        details.filesChanged > 10 ? "warning" : "normal"
                    }
                />

                <PRMetricCard
                    label="Tests Updated"
                    value={details.hasTests ? "Yes" : "No"}
                    highlight={
                        details.hasTests ? "normal" : "critical"
                    }
                />

                <PRMetricCard
                    label="Critical Paths"
                    value={details.criticalPaths.length}
                    highlight={
                        details.criticalPaths.length > 0
                            ? "warning"
                            : "normal"
                    }
                />
            </div>

            {/* Critical paths badges */}
            {details.criticalPaths.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {details.criticalPaths.map(path => (
                        <span
                            key={path}
                            className="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400"
                        >
                            {path}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
