type RiskBadgeProps =
    | { score: number }
    | { level: "low" | "medium" | "high" };

export function getRiskConfig(scoreOrLevel: number | "low" | "medium" | "high") {
    let score: number;

    if (typeof scoreOrLevel === "string") {
        const levelMap = {
            high: 75,
            medium: 50,
            low: 25,
        };
        score = levelMap[scoreOrLevel];
    } else {
        score = scoreOrLevel;
    }

    if (score >= 70) {
        return {
            label: "High",
            className: "bg-red-500/20 text-red-400 border-red-500/30",
        };
    }

    if (score >= 40) {
        return {
            label: "Medium",
            className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        };
    }

    return {
        label: "Low",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
    };
}

export function RiskBadge(props: RiskBadgeProps) {
    const scoreOrLevel = "score" in props ? props.score : props.level;
    const { label, className } = getRiskConfig(scoreOrLevel);

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold
            rounded border ${className}`}
        >
            {label}
        </span>
    );
}
