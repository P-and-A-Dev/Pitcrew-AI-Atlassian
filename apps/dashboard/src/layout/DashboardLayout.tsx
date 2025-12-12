import Header from "./Header";

interface Props {
    children: React.ReactNode
}

export default function DashboardLayout({children}: Props) {
    return (
        <div className="min-h-screen bg-[#0A0F1F] text-white">
            <Header/>
            <main className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {children}
            </main>
        </div>
    );
}