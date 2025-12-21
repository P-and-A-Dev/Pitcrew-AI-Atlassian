import type { TelemetryPR } from "../../hooks/useTelemetry";
import { RiskGauge } from "../ui/RiskGauge";



function StatusBadge({
    status,
}: {
    status: "on_track" | "pit_stop" | "finished";
}) {
    const styles = {
        on_track: "bg-green-500/20 text-green-400",
        pit_stop: "bg-yellow-500/20 text-yellow-400 animate-pulse",
        finished: "bg-blue-500/20 text-blue-400",
    };

    const labels = {
        on_track: "On Track",
        pit_stop: "Pit Stop",
        finished: "Finished",
    };

    return (
        <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${styles[status]}`}
        >
            {labels[status]}
        </span>
    );
}


interface PRListProps {
    prs: TelemetryPR[];
    selectedPRId?: string;
    onSelect: (pr: TelemetryPR) => void;
}

export function PRList({
    prs,
    selectedPRId,
    onSelect,
}: PRListProps) {
    return (
        <div className="rounded-lg bg-[#0F1629] divide-y divide-white/5">
            {prs.map(pr => {
                const isSelected = pr.id === selectedPRId;

                return (
                    <div
                        key={pr.id}
                        onClick={() => onSelect(pr)}
                        className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition
                            ${
                                isSelected
                                    ? "bg-[#1A2142] ring-1 ring-blue-500"
                                    : "hover:bg-[#141A33]"
                            }
                        `}
                    >
                        {/* PR Info */}
                        <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">
                                {pr.title}
                            </p>
                            <p className="text-xs opacity-60">
                                {pr.author}
                            </p>
                        </div>

                        {/* Risk + Status */}
                        <RiskGauge score={pr.riskScore} />
                        <StatusBadge status={pr.status} />
                    </div>
                );
            })}
        </div>
    );
}
