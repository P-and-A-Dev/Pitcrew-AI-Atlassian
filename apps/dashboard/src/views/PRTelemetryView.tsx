import { useTelemetry } from "../hooks/useTelemetry";
import { PrCard } from "../Components/cards/PrCard";

export function PRTelemetryView() {
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
            <div className="text-sm text-red-400 space-y-2">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-xs underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-sm text-white/60">
                No telemetry data available.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {data.map(pr => (
                <PrCard
                    key={pr.id}
                    title={pr.title}
                    author={pr.author}
                    risk={
                        pr.riskScore > 70
                            ? "high"
                            : pr.riskScore > 40
                                ? "medium"
                                : "low"
                    }
                />
            ))}
        </div>
    );
}
