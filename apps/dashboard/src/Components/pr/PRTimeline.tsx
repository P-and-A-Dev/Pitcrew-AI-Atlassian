type TimelineEventType = "created" | "updated" | "blocked" | "merged";

interface TimelineEvent {
    id: string;
    type: TimelineEventType;
    label: string;
    timestamp: string;
}

function EventIcon({ type }: { type: TimelineEventType }) {
    const map = {
        created: "🟢",
        updated: "🟡",
        blocked: "🔴",
        merged: "🏁",
    };

    return <span className="text-lg">{map[type]}</span>;
}

function EventLabel({
    type,
    label,
}: {
    type: TimelineEventType;
    label: string;
}) {
    const color = {
        created: "text-green-400",
        updated: "text-yellow-400",
        blocked: "text-red-400",
        merged: "text-blue-400",
    };

    return (
        <span className={`text-sm font-medium ${color[type]}`}>
            {label}
        </span>
    );
}

export function PRTimeline({
    prId,
}: {
    prId: string;
}) {

    const events: TimelineEvent[] = [
        {
            id: "1",
            type: "created",
            label: "PR created",
            timestamp: "3 days ago",
        },
        {
            id: "2",
            type: "updated",
            label: "Code updated",
            timestamp: "2 days ago",
        },
        {
            id: "3",
            type: "blocked",
            label: "CI failing",
            timestamp: "1 day ago",
        },
        {
            id: "4",
            type: "merged",
            label: "PR merged",
            timestamp: "2 hours ago",
        },
    ];

    return (
        <div className="rounded-lg bg-[#0F1629] p-4 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
                PR Timeline
            </h3>

            <div className="space-y-3">
                {events.map(event => (
                    <div
                        key={event.id}
                        className="flex items-center gap-3"
                    >
                        <EventIcon type={event.type} />

                        <div className="flex-1">
                            <EventLabel
                                type={event.type}
                                label={event.label}
                            />
                            <div className="text-xs opacity-50">
                                {event.timestamp}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
