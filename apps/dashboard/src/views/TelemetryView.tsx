import { useTelemetry } from "../hooks/useTelemetry";

export function TelemetryView() {
    const { data, loading, error } = useTelemetry();

    if (loading) {
        return (
            <div className="text-sm text-white/60">
                Loading telemetry…
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-sm text-red-400">
                Telemetry error: {error}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-sm text-white/50">
                No telemetry data available
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {data.map(pr => (
                <div
                    key={pr.id}
                    className="rounded-md bg-[#11162A] p-3"
                >
                    {pr.title}
                </div>
            ))}
        </div>
    );
}
