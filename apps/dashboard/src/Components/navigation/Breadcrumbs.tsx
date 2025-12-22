import { Link } from "react-router-dom";

interface BreadcrumbItem {
    label: string;
    to?: string;
}

interface Props {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: Props) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="text-xs text-white/70 flex flex-wrap gap-1"
        >
            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-1">
                    {item.to ? (
                        <Link
                            to={item.to}
                            className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-white/90">
                            {item.label}
                        </span>
                    )}

                    {index < items.length - 1 && (
                        <span className="opacity-50">›</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
