import { TelemetryCard } from "../Components/cards/TelemetryCard";
import { RiskBadge } from "../Components/badges/RiskBadge";
import { SectionTitle } from "../Components/typography/SectionTitle";
import { useSprint } from "../hooks/useSprint";

function SprintLane({
    title,
    items,
}: {
    title: string;
    items: {
        id: number;
        title: string;
        author: string;
        riskScore: number;
    }[];
}) {
    return (
        <TelemetryCard title={title}>
            <div className="space-y-3">
                {items.map((pr) => (
                    <div
                        key={pr.id}
                        className="flex items-center justify-between
                        border border-white/5 rounded-lg px-4 py-3"
                    >
                        <div>
                            <p className="font-medium">{pr.title}</p>
                            <p className="text-xs opacity-60">{pr.author}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <RiskBadge score={pr.riskScore} />
                            <span className="text-xs opacity-60">
                                {pr.riskScore}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </TelemetryCard>
    );
}

export function SprintRaceView() {
    const { onTrack, pitStop, finished, isLoading, error } = useSprint();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <SectionTitle
                    title="Sprint Race"
                    subtitle="Live sprint execution status"
                />
                <p className="opacity-60">Loading sprint data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <SectionTitle
                    title="Sprint Race"
                    subtitle="Live sprint execution status"
                />
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SectionTitle
                title="Sprint Race"
                subtitle="Live sprint execution status"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SprintLane title="On Track" items={onTrack} />
                <SprintLane title="Pit Stop" items={pitStop} />
                <SprintLane title="Finished" items={finished} />
            </div>
        </div>
    );
}
