import { useTelemetry } from "../../hooks/useTelemetry";

function StatusBadge({
    status,
}: {
    status: "on_track" | "pit_stop" | "finished";
}) {
    const styles = {
        on_track: "bg-green-500/20 text-green-400",
        pit_stop: "bg-yellow-500/20 text-yellow-400",
        finished: "bg-blue-500/20 text-blue-400",
    };

    const labels = {
        on_track: "On Track",
        pit_stop: "Pit Stop",
        finished: "Finished",
    };

    return (
        <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${styles[status]}`}
        >
            {labels[status]}
        </span>
    );
}

function RiskBadge({ score }: { score: number }) {
    let color = "text-green-400";

    if (score >= 70) color = "text-red-400";
    else if (score >= 40) color = "text-yellow-400";

    return (
        <span className={`text-sm font-semibold ${color}`}>
            {score}
        </span>
    );
}

export function TelemetryFeed() {
    const { data, loading, error } = useTelemetry();

    if (loading) {
        return (
            <div className="rounded-lg bg-[#0F1629] p-4 text-sm opacity-60">
                Loading telemetry…
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-[#0F1629] p-4 text-sm text-red-400">
                Telemetry error: {error}
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-[#0F1629] p-4 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
                Live Telemetry
            </h3>

            <div className="space-y-2">
                {data.map(pr => (
                    <div
                        key={pr.id}
                        className="flex items-center gap-4 rounded-md bg-[#11162A] px-3 py-2 text-sm"
                    >
                        {/* PR title */}
                        <div className="flex-1">
                            <div className="font-medium">
                                {pr.title}
                            </div>
                            <div className="text-xs opacity-60">
                                {pr.author} · updated {pr.updatedAt}
                            </div>
                        </div>

                        {/* Risk */}
                        <RiskBadge score={pr.riskScore} />

                        {/* Status */}
                        <StatusBadge status={pr.status} />
                    </div>
                ))}
            </div>
        </div>
    );
}
