import { KpiCard } from "./cards/KpiCard";
import { RiskBadge } from "./badges/RiskBadge";

interface TelemetryKpisProps {
    openPRs: number;
    highRiskPRs: number;
}

export function TelemetryKpis({
    openPRs,
    highRiskPRs,
}: TelemetryKpisProps) {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <KpiCard
                label="Open PRs"
                value={openPRs}
                hint="Pull requests awaiting review"
            />

            <KpiCard
                label="High Risk PRs"
                value={highRiskPRs}
                hint="Risk score above 70"
                severity="critical"
            />

            <div className="flex gap-2">
                <RiskBadge level="high" />
                <RiskBadge level="medium" />
                <RiskBadge level="low" />
            </div>
        </section>
    );
}
