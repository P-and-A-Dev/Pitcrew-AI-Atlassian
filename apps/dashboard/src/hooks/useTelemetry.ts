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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTelemetry() {
            try {
                setLoading(true);

                let response: TelemetryResponse;

                if (typeof window !== "undefined" && (window as any).AP) {
                    const { invoke } = await import("@forge/bridge");
                    response = await invoke<TelemetryResponse>("getTelemetry");
                } else {
                    response = {
                        prs: [
                            {
                                id: "1",
                                title: "Refactor auth middleware",
                                author: "alice",
                                riskScore: 82,
                                status: "pit_stop",
                                updatedAt: "2 min ago",
                            },
                            {
                                id: "2",
                                title: "Payment flow update",
                                author: "bob",
                                riskScore: 45,
                                status: "on_track",
                                updatedAt: "5 min ago",
                            },
                        ],
                    };
                }


                if (!response || !Array.isArray(response.prs)) {
                    throw new Error("Invalid telemetry response");
                }

                setData(response.prs);
            } catch (err) {
                console.error(err);
                setError("Failed to load telemetry data");
                setData([]);
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
