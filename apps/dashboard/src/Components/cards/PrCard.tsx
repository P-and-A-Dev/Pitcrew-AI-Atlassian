import {RiskBadge} from "../badges/RiskBadge.tsx";

interface PrCardProps {
    title: string;
    author: string;
    risk: "low" | "medium" | "high";
}

export function PrCard({ title, author, risk }: PrCardProps) {
    return (
        <div className="bg-[#111A33] border border-white/5 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-snug">
                    {title}
                </p>
                <RiskBadge level={risk} />
            </div>

            <p className="text-xs opacity-60">
                by {author}
            </p>
        </div>
    );
}
