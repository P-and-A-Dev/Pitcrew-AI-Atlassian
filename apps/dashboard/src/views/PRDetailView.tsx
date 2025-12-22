import { useParams } from "react-router-dom";
import { Breadcrumbs } from "../Components/navigation/Breadcrumbs";

export function PRDetailView() {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="space-y-4">
            {/* ===== BREADCRUMBS ===== */}
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/" },
                    { label: "PR Telemetry", to: "/telemetry" },
                    { label: `PR #${id}` },
                ]}
            />

            {/* ===== HEADER ===== */}
            <div className="bg-[#111A33] rounded-lg p-4 space-y-2">
                <h1 className="text-lg font-semibold">
                    Pull Request #{id}
                </h1>

                <p className="text-sm text-white/70">
                    Detailed telemetry and risk analysis for this pull request.
                </p>
            </div>

            {/* ===== PLACEHOLDER CONTENT ===== */}
            <div className="bg-[#111A33] rounded-lg p-4">
                <p className="text-sm text-white/80">
                    (PR details, risk breakdown, file changes, comments, etc.)
                </p>
            </div>
        </div>
    );
}
