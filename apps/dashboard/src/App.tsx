import "./App.css";
import DashboardLayout from "./layout/DashboardLayout";
import { RiskDistributionChart } from "./Components/RiskDistributionChart";
import { FlagsView} from "./views/FlagsView.tsx";

function App() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <FlagsView />

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
