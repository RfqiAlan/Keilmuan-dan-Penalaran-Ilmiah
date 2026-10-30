import { useEffect, useState } from "react";
import { KeyRound, Package, RefreshCw, Archive, ShieldCheck, Activity } from "lucide-react";
import api from "../../api/axios";
import { Skeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = filterModule ? `?module=${filterModule}` : "";
    api.get(`/activity-logs${params}`)
      .then((r) => setLogs(r.data.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [filterModule]);

  const modules = ["auth", "items", "borrowings", "archives", "access_requests"];

  const renderModuleIcon = (mod) => {
    switch (mod) {
      case "auth":
        return <KeyRound className="w-4 h-4 text-amber-500" />;
      case "items":
        return <Package className="w-4 h-4 text-[#0284c7]" />;
      case "borrowings":
        return <RefreshCw className="w-4 h-4 text-emerald-500" />;
      case "archives":
        return <Archive className="w-4 h-4 text-violet-500" />;
      case "access_requests":
        return <ShieldCheck className="w-4 h-4 text-sky-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Log Aktivitas Sistem
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Audit jejak digital dan riwayat operasional seluruh pengguna sistem
        </p>
      </div>

      <div className="flex gap-3">
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs"
        >
          <option value="">Semua Modul Sistem</option>
          {modules.map((m) => (
            <option key={m} value={m}>
              Modul {m.replace(/_/g, " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-xs space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Tidak Ada Log Aktivitas"
          description={
            filterModule
              ? "Belum ada catatan aktivitas tercatat pada modul yang dipilih."
              : "Riwayat aktivitas pengguna sistem masih kosong."
          }
          actionLabel={filterModule ? "Tampilkan Semua Modul" : undefined}
          onAction={filterModule ? () => setFilterModule("") : undefined}
        />
      ) : (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {logs.map((log) => (
              <div
                key={log.id}
                className="px-6 py-3.5 flex items-start gap-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-700/20 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60 dark:border-slate-600/40">
                  {renderModuleIcon(log.module)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-slate-100">
                    <span className="font-semibold text-[#0284c7] dark:text-[#38bdf8]">
                      {log.user_name || "Sistem"}
                    </span>{" "}
                    — {log.description}
                  </p>
                  <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                      {log.module?.replace(/_/g, " ")}
                    </span>
                    <span>•</span>
                    <span>{new Date(log.created_at).toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-mono bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600/60">
                  {log.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
