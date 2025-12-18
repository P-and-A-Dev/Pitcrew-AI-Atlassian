interface RiskBadgeProps {
    score: number;
}

function getRiskConfig(score: number) {
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

export function RiskBadge({ score }: RiskBadgeProps) {
    const { label, className } = getRiskConfig(score);

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold
            rounded border ${className}`}
        >
            {label}
        </span>
    );
}
