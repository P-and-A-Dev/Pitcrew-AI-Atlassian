import "./App.css";
import DashboardLayout from "./layout/DashboardLayout";
import { TelemetryKpis } from "./Components/TelemetryKpis.tsx";
import { RiskDistributionChart } from "./Components/RiskDistributionChart";

function App() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <TelemetryKpis />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <RiskDistributionChart />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default App;
