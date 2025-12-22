import { RiskBadge } from "../badges/RiskBadge";

interface PrCardProps {
    title?: string;
    author?: string;
    risk?: "low" | "medium" | "high";
    loading?: boolean;
    error?: string;
}

export function PrCard({
                           title,
                           author,
                           risk,
                           loading,
                           error,
                       }: PrCardProps) {
    if (loading) {
        return (
            <div
                aria-label="loading"
                className="bg-[#111A33] border border-white/5 rounded-lg p-3 h-20 animate-pulse"
            />
        );
    }

    if (error) {
        return (
            <div className="bg-[#111A33] border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                {error}
            </div>
        );
    }

    if (!title || !author || !risk) {
        return null;
    }

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
