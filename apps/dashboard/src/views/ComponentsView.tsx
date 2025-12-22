import { RiskBadge } from "../Components/badges/RiskBadge";
import { KpiCard } from "../Components/cards/KpiCard";

export function ComponentsView() {
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-lg font-semibold">
                    Components Library
                </h1>
                <p className="text-sm text-white/70">
                    Visual reference for reusable UI components
                </p>
            </header>

            {/* ===== RiskBadge ===== */}
            <section className="space-y-3">
                <h2 className="text-sm font-medium">
                    RiskBadge
                </h2>

                <div className="flex gap-3">
                    <RiskBadge level="low" />
                    <RiskBadge level="medium" />
                    <RiskBadge level="high" />
                </div>
            </section>

            {/* ===== KPI Card ===== */}
            <section className="space-y-3">
                <h2 className="text-sm font-medium">
                    KPI Card
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <KpiCard label="Open PRs" value={12} />
                    <KpiCard
                        label="Risky PRs"
                        value={4}
                        severity="critical"
                    />
                    <KpiCard
                        label="PRs Without Tests"
                        value={2}
                        severity="warning"
                    />
                </div>
            </section>
        </div>
    );
}
