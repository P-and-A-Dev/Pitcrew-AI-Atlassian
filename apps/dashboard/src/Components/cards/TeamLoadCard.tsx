interface TeamLoadCardProps {
    name: string;
    activePRs: number;
    highRiskPRs: number;
    avgPrSize: number;
    onSelect?: () => void;
}

export function TeamLoadCard({
    name,
    activePRs,
    highRiskPRs,
    avgPrSize,
    onSelect,
}: TeamLoadCardProps) {
    let loadLevel: "low" | "medium" | "high" = "low";

    if (activePRs >= 5 || highRiskPRs >= 3) {
        loadLevel = "high";
    } else if (activePRs >= 3 || highRiskPRs >= 1) {
        loadLevel = "medium";
    }

    const loadColor = {
        low: "text-green-400",
        medium: "text-yellow-400",
        high: "text-red-400",
    };

    return (
        <div
            onClick={onSelect}
            className="rounded-lg bg-[#0F1629] p-4 space-y-3 cursor-pointer hover:bg-[#141A33]"
        >
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">{name}</h3>
                <span className={`text-xs font-semibold ${loadColor[loadLevel]}`}>
                    {loadLevel.toUpperCase()} LOAD
                </span>
            </div>

            <div className="text-sm space-y-1 opacity-80">
                <div>Active PRs: {activePRs}</div>
                <div>High Risk PRs: {highRiskPRs}</div>
                <div>Avg PR Size: {avgPrSize} lines</div>
            </div>
        </div>
    );
}
