interface PRMetricCardProps {
    label: string;
    value: string | number;
    highlight?: "normal" | "warning" | "critical";
}

export function PRMetricCard({
    label,
    value,
    highlight = "normal",
}: PRMetricCardProps) {
    const styles = {
        normal: "border-slate-600",
        warning: "border-yellow-500",
        critical: "border-red-600",
    };

    return (
        <div
            className={`rounded-lg bg-[#0F1629] border-l-4 ${styles[highlight]} p-4`}
        >
            <p className="text-xs uppercase tracking-wide opacity-70">
                {label}
            </p>
            <p className="mt-2 text-2xl font-bold">
                {value}
            </p>
        </div>
    );
}
