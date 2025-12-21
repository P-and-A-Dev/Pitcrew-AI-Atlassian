import { useDashboardSummary } from "../../hooks/useDashboardSummary";

function StatusBadge({ status }: { status: "green" | "yellow" | "red" }) {
  const styles = {
    green: "bg-green-500/20 text-green-400 border-green-500/40",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    red: "bg-red-500/20 text-red-400 border-red-500/40",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function GlobalHeader() {
  const { data, loading } = useDashboardSummary();

  if (loading || !data) {
    return (
      <div className="h-16 rounded-md bg-[#11162A] animate-pulse" />
    );
  }

  return (
    <header className="flex items-center justify-between rounded-md bg-[#0E1325] px-6 py-4">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">
          {data.productName}
        </h1>
        <div className="text-sm text-white/60">
          {data.repository} · {data.sprint}
        </div>
      </div>

      <StatusBadge status={data.status} />
    </header>
  );
}
}