import { TelemetryCard } from "../Components/cards/TelemetryCard";
import { RiskBadge } from "../Components/badges/RiskBadge";
import { SectionTitle } from "../Components/typography/SectionTitle";

const highRiskPrs = [
    {
        id: 1,
        title: "Refactor auth middleware",
        author: "alice",
        files: 12,
    },
    {
        id: 2,
        title: "Payment flow update",
        author: "bob",
        files: 8,
    },
];

const blockedPrs = [
    {
        id: 101,
        title: "Infra config update",
        reason: "Waiting for security review",
        daysBlocked: 3,
    },
    {
        id: 102,
        title: "New billing webhook",
        reason: "CI failing",
        daysBlocked: 2,
    },
];

export function FlagsView() {
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
                    {highRiskPrs.map((pr) => (
                        <tr
                            key={pr.id}
                            className="border-t border-white/5"
                        >
                            <td className="py-2">{pr.title}</td>
                            <td className="py-2">{pr.author}</td>
                            <td className="py-2">{pr.files}</td>
                            <td className="py-2">
                                <RiskBadge level="high" />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </TelemetryCard>

            <TelemetryCard title="Blocked Pull Requests">
                <div className="space-y-3">
                    {blockedPrs.map((pr) => (
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
