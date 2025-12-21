interface RiskGaugeProps {
    score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
    let barColor = "bg-green-500";

    if (score >= 70) barColor = "bg-red-500";
    else if (score >= 40) barColor = "bg-yellow-500";

    return (
        <div className="w-28">
            {/* Gauge */}
            <div className="h-1 w-full rounded bg-white/10">
                <div
                    className={`h-1 rounded ${barColor} transition-all`}
                    style={{ width: `${score}%` }}
                />
            </div>

            {/* Label */}
            <div className="mt-1 text-xs font-semibold opacity-70 text-center">
                Risk {score}
            </div>
        </div>
    );
}
