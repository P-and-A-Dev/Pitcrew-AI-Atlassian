interface SectionTitleProps {
    title: string;
    subtitle?: string;
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
    return (
        <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-wide">
                {title}
            </h2>

            {subtitle && (
                <p className="text-xs opacity-60 mt-1">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
