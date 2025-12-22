import "./App.css";

import DashboardLayout from "./layout/DashboardLayout";
import { GlobalHeader } from "./Components/header/GlobalHeader";

import { KpiCard } from "./Components/cards/KpiCard";
import { useDashboardKpis } from "./hooks/useDashboardKpis";

import { FlagsView } from "./views/FlagsView";
import { SprintRaceView } from "./views/SprintRaceView";
import { PRTelemetryView } from "./views/PRTelemetryView";
import { TeamLoadView } from "./views/TeamLoadView";
import { PRDetailView } from "./views/PRDetailView";

import { RiskDistributionChart } from "./Components/RiskDistributionChart";
import { TelemetryFeed } from "./Components/telemetry/TelemetryFeed";
import { FlagsSummary } from "./Components/flags/FlagsSummary";

import {
    Routes,
    Route,
    NavLink,
    Navigate,
} from "react-router-dom";

export default function App() {
    const { data: kpis } = useDashboardKpis();

    const navClass = ({ isActive }: { isActive: boolean }) =>
        `px-3 py-1 rounded text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isActive
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-white/80 hover:bg-gray-600"
        }`;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <GlobalHeader />

                {/* ===== NAV ===== */}
                <nav
                    className="flex flex-wrap gap-2"
                    aria-label="Primary navigation"
                >
                    <NavLink to="/" end className={navClass}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/telemetry" className={navClass}>
                        PR Telemetry
                    </NavLink>
                    <NavLink to="/team-load" className={navClass}>
                        Team Load
                    </NavLink>
                    <NavLink to="/flags" className={navClass}>
                        Flags
                    </NavLink>
                    <NavLink to="/sprint" className={navClass}>
                        Sprint Race
                    </NavLink>
                </nav>

                {/* ===== ROUTES ===== */}
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                {kpis && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                        <KpiCard label="Open PRs" value={kpis.openPRs} />
                                        <KpiCard label="Risky PRs" value={kpis.riskyPRs} severity="critical" />
                                        <KpiCard label="Avg PR Size" value={kpis.avgPrSize} hint="lines changed" />
                                        <KpiCard label="PRs Without Tests" value={kpis.prsWithoutTests} severity="warning" />
                                        <KpiCard label="Critical Files" value={kpis.criticalFilesTouched} severity="critical" />
                                    </div>
                                )}

                                <TelemetryFeed />
                                <FlagsSummary onOpenFlags={() => {}} />

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                        <RiskDistributionChart />
                                    </div>
                                </div>
                            </>
                        }
                    />

                    <Route path="/telemetry" element={<PRTelemetryView />} />
                    <Route path="/telemetry/pr/:id" element={<PRDetailView />} />
                    <Route path="/team-load" element={<TeamLoadView />} />
                    <Route path="/flags" element={<FlagsView />} />
                    <Route path="/sprint" element={<SprintRaceView />} />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </DashboardLayout>
    );
}
