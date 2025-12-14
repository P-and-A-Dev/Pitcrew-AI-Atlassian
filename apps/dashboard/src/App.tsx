import "./App.css";
import DashboardLayout from "./layout/DashboardLayout";
import { RiskDistributionChart } from "./Components/RiskDistributionChart";
import { FlagsView } from "./views/FlagsView";
import { SprintRaceView } from "./views/SprintRaceView";
import { useState } from "react";

function App() {
    const [view, setView] = useState<"flags" | "sprint">("flags");

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex gap-2">
                    <button
                        className={`px-3 py-1 rounded ${
                            view === "flags" ? "bg-blue-600" : "bg-gray-700"
                        }`}
                        onClick={() => setView("flags")}
                    >
                        Flags View
                    </button>

                    <button
                        className={`px-3 py-1 rounded ${
                            view === "sprint" ? "bg-blue-600" : "bg-gray-700"
                        }`}
                        onClick={() => setView("sprint")}
                    >
                        Sprint Race View
                    </button>
                </div>

                {view === "flags" && (
                    <>
                        <FlagsView />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <RiskDistributionChart />
                            </div>
                        </div>
                    </>
                )}

                {view === "sprint" && <SprintRaceView />}
            </div>
        </DashboardLayout>
    );
}

export default App;
