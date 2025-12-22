import { useFlags } from "../../hooks/useFlags";

function FlagRow({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-md bg-[#11162A] px-3 py-2">
            <span className="text-sm opacity-70">{label}</span>
            <span className={`text-sm font-semibold ${color}`}>
                {value}
            </span>
        </div>
    );
}

interface FlagsSummaryProps {
    onOpenFlags?: () => void;
}

export function FlagsSummary({ onOpenFlags }: FlagsSummaryProps) {
    const { highRiskPRs, blockedPRs, isLoading, error } = useFlags();

    if (isLoading) {
        return (
            <div className="rounded-lg bg-[#0F1629] p-4 text-sm opacity-60">
                Loading flags summary…
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-[#0F1629] p-4 text-sm text-red-400">
                {error}
            </div>
        );
    }

    const yellowFlags = highRiskPRs.length;
    const redFlags = blockedPRs.length;

    return (
        <section
            onClick={onOpenFlags}
            className="cursor-pointer rounded-lg bg-[#0F1629] p-4 space-y-3 hover:bg-[#141A33]"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
                    Flags Summary
                </h3>

                {redFlags > 0 && (
                    <span className="text-xs font-semibold text-red-400">
                        BLOCKED
                    </span>
                )}
            </div>

            {/* Flags */}
            <div className="space-y-2">
                <FlagRow
                    label="Yellow Flags (High Risk PRs)"
                    value={yellowFlags}
                    color="text-yellow-400"
                />

                <FlagRow
                    label="Red Flags (Blocked PRs)"
                    value={redFlags}
                    color="text-red-400"
                />
            </div>
        </section>
    );
}
