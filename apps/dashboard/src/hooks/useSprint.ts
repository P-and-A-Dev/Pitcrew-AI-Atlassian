import { useEffect, useState } from "react";

export type SprintStatus = "ON_TRACK" | "PIT_STOP" | "FINISHED";

export interface SprintPR {
    id: number;
    title: string;
    author: string;
    status: SprintStatus;
    riskScore: number;
}

interface SprintResponse {
    onTrack: SprintPR[];
    pitStop: SprintPR[];
    finished: SprintPR[];
}

export function useSprint() {
    const [onTrack, setOnTrack] = useState<SprintPR[]>([]);
    const [pitStop, setPitStop] = useState<SprintPR[]>([]);
    const [finished, setFinished] = useState<SprintPR[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSprint() {
            try {
                setIsLoading(true);
                const response: SprintResponse = {
                    onTrack: [
                        {
                            id: 1,
                            title: "Refactor auth middleware",
                            author: "alice",
                            status: "ON_TRACK",
                            riskScore: 45,
                        },
                    ],
                    pitStop: [
                        {
                            id: 2,
                            title: "Payment webhook fix",
                            author: "bob",
                            status: "PIT_STOP",
                            riskScore: 68,
                        },
                    ],
                    finished: [
                        {
                            id: 3,
                            title: "Dashboard UI polish",
                            author: "carol",
                            status: "FINISHED",
                            riskScore: 22,
                        },
                    ],
                };
                await new Promise((r) => setTimeout(r, 400));

                setOnTrack(response.onTrack);
                setPitStop(response.pitStop);
                setFinished(response.finished);
            } catch (err) {
                setError("Failed to load sprint data");
            } finally {
                setIsLoading(false);
            }
        }

        fetchSprint();
    }, []);

    return {
        onTrack,
        pitStop,
        finished,
        isLoading,
        error,
    };
}
