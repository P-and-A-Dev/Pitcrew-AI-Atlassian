interface KpiCardProps {
    label: string;
    value: number | string;
    hint?: string;
    severity?: "normal" | "warning" | "critical";
}

export function KpiCard({
                            label,
                            value,
                            hint,
                            severity = "normal",
                        }: KpiCardProps) {
    const severityStyle = {
        normal: "border-slate-600",
        warning: "border-yellow-500",
        critical: "border-red-600",
    };

    return (
        <div
            className={`bg-[#0F1629] border-l-4 ${severityStyle[severity]} rounded-lg p-5`}
        >
            <p className="text-xs uppercase tracking-wide opacity-70">
                {label}
            </p>

            <p className="text-3xl font-bold mt-2">
                {value}
            </p>

            {hint && (
                <p className="text-xs opacity-60 mt-1">
                    {hint}
                </p>
            )}
        </div>
    );
}
