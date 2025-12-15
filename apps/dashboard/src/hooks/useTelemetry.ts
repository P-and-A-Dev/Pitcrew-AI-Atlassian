import { useEffect, useState } from "react";

export interface TelemetryPR {
    id: string;
    title: string;
    author: string;
    riskScore: number;
    status: "on_track" | "pit_stop" | "finished";
    updatedAt: string;
}

interface TelemetryResponse {
    prs: TelemetryPR[];
}

export function useTelemetry() {
    const [data, setData] = useState<TelemetryPR[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTelemetry() {
            try {
                setLoading(true);

                const response = await fetch("/api/dashboard/telemetry");

                if (!response.ok) {
                    throw new Error("Telemetry API error");
                }

                const json: TelemetryResponse = await response.json();
                setData(json.prs);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Unknown error"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchTelemetry();
    }, []);

    return {
        data,
        loading,
        error,
    };
}
