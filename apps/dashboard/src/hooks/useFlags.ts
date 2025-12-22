import { useEffect, useState } from "react";

export interface HighRiskPR {
    id: number;
    title: string;
    author: string;
    files: number;
    riskScore: number;
}

export interface BlockedPR {
    id: number;
    title: string;
    reason: string;
    daysBlocked: number;
}

interface FlagsResponse {
    highRiskPRs: HighRiskPR[];
    blockedPRs: BlockedPR[];
}

export function useFlags() {
    const [highRiskPRs, setHighRiskPRs] = useState<HighRiskPR[]>([]);
    const [blockedPRs, setBlockedPRs] = useState<BlockedPR[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFlags() {
            try {
                setIsLoading(true);

                let response: FlagsResponse;
                if (typeof window !== "undefined" && (window as any).AP) {
                    const { invoke } = await import("@forge/bridge");
                    response = await invoke<FlagsResponse>("getFlags");
                } else {

                    response = {
                        highRiskPRs: [
                            {
                                id: 1,
                                title: "Refactor auth middleware",
                                author: "alice",
                                files: 12,
                                riskScore: 82,
                            },
                        ],
                        blockedPRs: [
                            {
                                id: 101,
                                title: "Infra config update",
                                reason: "Waiting for security review",
                                daysBlocked: 3,
                            },
                        ],
                    };
                }

                setHighRiskPRs(response.highRiskPRs);
                setBlockedPRs(response.blockedPRs);
            } catch (err) {
                console.error(err);
                setError("Failed to load flags data");
            } finally {
                setIsLoading(false);
            }
        }

        fetchFlags();
    }, []);

    return {
        highRiskPRs,
        blockedPRs,
        isLoading,
        error,
    };
}
