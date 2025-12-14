import React from "react";

interface TelemetryCardProps {
    title: string;
    value?: string | number;
    badge?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export function TelemetryCard({
                                  title,
                                  value,
                                  badge,
                                  children,
                                  className,
                              }: TelemetryCardProps) {
    return (
        <div
            className={`bg-[#0F1629] rounded-xl p-5 shadow-md
                  hover:shadow-lg transition-shadow
                  ${className ?? ""}`}
        >
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <p className="text-xs uppercase tracking-wide opacity-70">
                        {title}
                    </p>
                    {value !== undefined && (
                        <p className="text-3xl font-bold mt-1">
                            {value}
                        </p>
                    )}
                </div>

                {badge && <div>{badge}</div>}
            </div>

            {children && <div>{children}</div>}
        </div>
    );
}
