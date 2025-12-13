import { KpiCard } from "./KpiCard";
import {RiskBadge} from "./badges/RiskBadge.tsx";
export function TelemetryKpis() {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <KpiCard
                label="Open PRs"
                value={12}
                hint="Pull requests awaiting review"
            />
            <RiskBadge level="high" />
            <RiskBadge level="medium" />
            <RiskBadge level="low" />

            <KpiCard
                label="High Risk PRs"
                value={70}
                hint="Risk score above 70"
                severity="critical"
            />
        </section>
    );
}
