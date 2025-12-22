import "./App.css";
import { useState } from "react";

import DashboardLayout from "./layout/DashboardLayout";
import { GlobalHeader } from "./Components/header/GlobalHeader";

import { KpiCard } from "./Components/cards/KpiCard";
import { useDashboardKpis } from "./hooks/useDashboardKpis";

import { FlagsView } from "./views/FlagsView";
import { SprintRaceView } from "./views/SprintRaceView";
import { PRTelemetryView } from "./views/PRTelemetryView";
import { TeamLoadView } from "./views/TeamLoadView";

import { RiskDistributionChart } from "./Components/RiskDistributionChart";
import { TelemetryFeed } from "./Components/telemetry/TelemetryFeed";
import { FlagsSummary } from "./Components/flags/FlagsSummary";

type View =
    | "dashboard"
    | "pr-telemetry"
    | "flags"
    | "sprint"
    | "team-load";

export default function App() {
    const [view, setView] = useState<View>("dashboard");
    const { data: kpis } = useDashboardKpis();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* ===== GLOBAL HEADER ===== */}
                <GlobalHeader />

                {/* ===== TOP NAV (DEV / HACKATHON) ===== */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setView("dashboard")}
                        className={`px-3 py-1 rounded text-sm ${
                            view === "dashboard"
                                ? "bg-blue-600"
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() => setView("pr-telemetry")}
                        className={`px-3 py-1 rounded text-sm ${
                            view === "pr-telemetry"
                                ? "bg-blue-600"
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        PR Telemetry
                    </button>

                    <button
                        onClick={() => setView("team-load")}
                        className={`px-3 py-1 rounded text-sm ${
                            view === "team-load"
                                ? "bg-blue-600"
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        Team Load
                    </button>

                    <button
                        onClick={() => setView("flags")}
                        className={`px-3 py-1 rounded text-sm ${
                            view === "flags"
                                ? "bg-blue-600"
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        Flags
                    </button>

                    <button
                        onClick={() => setView("sprint")}
                        className={`px-3 py-1 rounded text-sm ${
                            view === "sprint"
                                ? "bg-blue-600"
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                        Sprint Race
                    </button>
                </div>

                {/* ================= DASHBOARD HOME ================= */}
                {view === "dashboard" && (
                    <>
                        {/* KPIs */}
                        {kpis && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                <KpiCard
                                    label="Open PRs"
                                    value={kpis.openPRs}
                                />

                                <KpiCard
                                    label="Risky PRs"
                                    value={kpis.riskyPRs}
                                    severity="critical"
                                />

                                <KpiCard
                                    label="Avg PR Size"
                                    value={kpis.avgPrSize}
                                    hint="lines changed"
                                />

                                <KpiCard
                                    label="PRs Without Tests"
                                    value={kpis.prsWithoutTests}
                                    severity="warning"
                                />

                                <KpiCard
                                    label="Critical Files"
                                    value={kpis.criticalFilesTouched}
                                    severity="critical"
                                />
                            </div>
                        )}

                        {/* Live Telemetry */}
                        <TelemetryFeed />

                        {/* Flags Summary */}
                        <FlagsSummary
                            onOpenFlags={() => setView("flags")}
                        />

                        {/* Extra visual */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <RiskDistributionChart />
                            </div>
                        </div>
                    </>
                )}

                {/* ================= PR TELEMETRY ================= */}
                {view === "pr-telemetry" && <PRTelemetryView />}

                {/* ================= TEAM LOAD ================= */}
                {view === "team-load" && <TeamLoadView />}

                {/* ================= FLAGS ================= */}
                {view === "flags" && <FlagsView />}

                {/* ================= SPRINT ================= */}
                {view === "sprint" && <SprintRaceView />}
            </div>
        </DashboardLayout>
    );
}
