import type { TelemetryPR } from "../../hooks/useTelemetry";

function StatusBadge({ status }: { status: TelemetryPR["status"] }) {
    const map = {
        on_track: "text-green-400",
        pit_stop: "text-yellow-400",
        finished: "text-blue-400",
    };

    return (
        <span className={`text-xs font-semibold ${map[status]}`}>
            {status.replace("_", " ").toUpperCase()}
        </span>
    );
}

function RiskScore({ score }: { score: number }) {
    let color = "text-green-400";
    if (score >= 70) color = "text-red-400";
    else if (score >= 40) color = "text-yellow-400";

    return <span className={`font-semibold ${color}`}>{score}</span>;
}

export function PRList({
    prs,
    onSelect,
}: {
    prs: TelemetryPR[];
    onSelect: (pr: TelemetryPR) => void;
}) {
    return (
        <div className="rounded-lg bg-[#0F1629] divide-y divide-white/5">
            {prs.map(pr => (
                <div
                    key={pr.id}
                    onClick={() => onSelect(pr)}
                    className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[#141A33]"
                >
                    <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{pr.title}</p>
                        <p className="text-xs opacity-60">{pr.author}</p>
                    </div>

                    <RiskScore score={pr.riskScore} />
                    <StatusBadge status={pr.status} />
                </div>
            ))}
        </div>
    );
}
