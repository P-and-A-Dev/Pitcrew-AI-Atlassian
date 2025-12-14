import { SectionTitle} from "../Components/typography/SectionTitle.tsx";
import { TelemetryCard} from "../Components/cards/TelemetryCard.tsx";
import { PrCard} from "../Components/cards/PrCard.tsx";

const sprintPrs = {
    onTrack: [
        {
            id: 1,
            title: "Improve dashboard layout",
            author: "alice",
            risk: "low",
        },
    ],
    pitStop: [
        {
            id: 2,
            title: "Fix failing tests",
            author: "bob",
            risk: "medium",
        },
    ],
    finished: [
        {
            id: 3,
            title: "Refactor API client",
            author: "carol",
            risk: "high",
        },
    ],
} as const;


export function SprintRaceView() {
    return (
        <div className="space-y-6">
            <SectionTitle
                title="Sprint Race"
                subtitle="Live sprint progress overview"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TelemetryCard
                    title="On Track"
                    className="border-l-4 border-green-500"
                >
                    <div className="relative space-y-3">
                        <div className="absolute left-2 top-0 bottom-0 w-px bg-green-500/30" />
                        {sprintPrs.onTrack.map((pr) => (
                            <PrCard
                                key={pr.id}
                                title={pr.title}
                                author={pr.author}
                                risk={pr.risk}
                            />
                        ))}
                    </div>
                </TelemetryCard>

                <TelemetryCard
                    title="Pit Stop"
                    className="border-l-4 border-yellow-400"
                >
                    <div className="relative space-y-3">
                        <div className="absolute left-2 top-0 bottom-0 w-px bg-yellow-400/30" />
                        {sprintPrs.pitStop.map((pr) => (
                            <PrCard
                                key={pr.id}
                                title={pr.title}
                                author={pr.author}
                                risk={pr.risk}
                            />
                        ))}
                    </div>
                </TelemetryCard>

                <TelemetryCard
                    title="Finished"
                    className="border-l-4 border-blue-500"
                >
                    <div className="relative space-y-3">
                        <div className="absolute left-2 top-0 bottom-0 w-px bg-blue-500/30" />
                        {sprintPrs.finished.map((pr) => (
                            <PrCard
                                key={pr.id}
                                title={pr.title}
                                author={pr.author}
                                risk={pr.risk}
                            />
                        ))}
                    </div>
                </TelemetryCard>
            </div>
        </div>
    );
}
