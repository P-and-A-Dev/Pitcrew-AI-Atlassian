import { useTelemetry } from "../hooks/useTelemetry";

export function TelemetryView() {
    const { data, loading, error } = useTelemetry();

    if (loading) {
        return (
            <div className="text-sm text-williams-muted">
                Loading telemetry…
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-sm text-williams-danger">
                Telemetry error: {error}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-sm text-williams-muted">
                No telemetry data available
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {data.map(pr => (
                <div
                    key={pr.id}
                    className="
                        rounded-lg
                        bg-williams-surface
                        border border-white/5
                        p-4
                        transition-all
                        duration-150
                        ease-out
                        hover:shadow-lg
                        hover:shadow-black/30
                        hover:-translate-y-0.5
                    "
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-williams-text">
                            {pr.title}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
