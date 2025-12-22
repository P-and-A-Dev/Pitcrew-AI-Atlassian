import Header from "./Header";

interface Props {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
    return (
        <div className="min-h-screen bg-[#0A0F1F] text-white">
            <Header />

            <main className="max-w-7xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
