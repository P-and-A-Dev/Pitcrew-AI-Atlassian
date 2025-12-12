import './App.css'
import DashboardLayout from "./layout/DashboardLayout.tsx";

function App() {
    return (
        <DashboardLayout>
            <div className="min-h-screen bg-williamsBlueDark text-white flex items-center justify-center">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">
                        PitCrew AI – F1 Telemetry Dashboard
                    </h1>
                    <p className="text-sm opacity-80">
                    </p>
                </div>
            </div>

        </DashboardLayout>
    );
}

export default App;
