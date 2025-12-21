interface RiskExplanationProps {
    reasons: string[];
}

export function RiskExplanation({ reasons }: RiskExplanationProps) {
    if (reasons.length === 0) {
        return (
            <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-400">
                This car is running clean. No risk signals detected.
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-[#0F1629] p-4 space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
                Race Engineer Analysis
            </h3>

            <ul className="list-disc list-inside space-y-1 text-sm">
                {reasons.map((reason, index) => (
                    <li key={index} className="text-red-400">
                        {reason}
                    </li>
                ))}
            </ul>
        </div>
    );
}
