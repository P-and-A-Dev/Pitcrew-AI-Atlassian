import { TelemetryCard } from "../Components/cards/TelemetryCard";
import { RiskBadge } from "../Components/badges/RiskBadge";
import { SectionTitle } from "../Components/typography/SectionTitle";
import { useFlags } from "../hooks/useFlags";

export function FlagsView() {
    const { highRiskPRs, blockedPRs, isLoading, error } = useFlags();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <SectionTitle
                    title="Red Flags"
                    subtitle="Pull requests requiring immediate attention"
                />
                <p className="opacity-60">Loading flags...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <SectionTitle
                    title="Red Flags"
                    subtitle="Pull requests requiring immediate attention"
                />
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SectionTitle
                title="Red Flags"
                subtitle="Pull requests requiring immediate attention"
            />

            <TelemetryCard title="High Risk Pull Requests">
                <table className="w-full text-sm">
                    <thead className="opacity-60">
                        <tr>
                            <th className="text-left py-2">PR</th>
                            <th className="text-left py-2">Author</th>
                            <th className="text-left py-2">Files</th>
                            <th className="text-left py-2">Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {highRiskPRs.map((pr) => (
                            <tr
                                key={pr.id}
                                className="border-t border-white/5"
                            >
                                <td className="py-2">{pr.title}</td>
                                <td className="py-2">{pr.author}</td>
                                <td className="py-2">{pr.files}</td>
                                <td className="py-2 flex items-center gap-2">
                                    <RiskBadge score={pr.riskScore} />
                                    <span className="text-xs opacity-60">
                                        {pr.riskScore}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </TelemetryCard>

            <TelemetryCard title="Blocked Pull Requests">
                <div className="space-y-3">
                    {blockedPRs.map((pr) => (
                        <div
                            key={pr.id}
                            className="flex items-center justify-between
                            border border-white/5 rounded-lg px-4 py-3"
                        >
                            <div>
                                <p className="font-medium">{pr.title}</p>
                                <p className="text-xs opacity-60">{pr.reason}</p>
                            </div>

                             <div className="text-right">
                                <p className="text-sm font-semibold text-yellow-400">
                                    {pr.daysBlocked}d blocked
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </TelemetryCard>
        </div>
    );
}
