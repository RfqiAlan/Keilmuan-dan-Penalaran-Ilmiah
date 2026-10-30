import { useEffect, useState } from "react";
import {
  Package,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Archive,
  Clock,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";
import { StatCard } from "../../components/ui/Card";
import { Skeleton, SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/summary")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-44 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <SkeletonTable rows={4} cols={3} />
    </div>
  );

  const stats = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Ringkasan kondisi sistem SIMPAR UKM</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Package}       label="Total Barang"     value={stats.items?.total}     color="indigo" />
        <StatCard icon={CheckCircle2}  label="Barang Tersedia"  value={stats.items?.available}  color="green" />
        <StatCard icon={RefreshCw}     label="Sedang Dipinjam"  value={stats.items?.borrowed}   color="blue" />
        <StatCard icon={AlertTriangle} label="Barang Rusak"     value={stats.items?.damaged}    color="red" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Archive}       label="Total Arsip"          value={stats.archives?.total}            color="indigo" />
        <StatCard icon={Clock}         label="Request Peminjaman"    value={stats.borrowings?.pending}        color="yellow" />
        <StatCard icon={KeyRound}      label="Request Akses Dokumen" value={stats.access_requests?.pending} color="orange" />
        <StatCard icon={AlertCircle}   label="Peminjaman Terlambat"  value={stats.borrowings?.late}          color="red" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Aktivitas Terbaru</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
          {stats.recent_activity?.length > 0 ? stats.recent_activity.map((log) => (
            <div key={log.id} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
              <div className="w-8 h-8 bg-[#0284c7]/15 border border-[#0284c7]/30 rounded-full flex items-center justify-center text-xs font-bold text-[#0284c7] dark:text-[#38bdf8] shrink-0">
                {log.user_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
                  <span className="font-medium">{log.user_name}</span> — {log.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">{new Date(log.created_at).toLocaleString("id-ID")}</p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-500 shrink-0 capitalize">{log.module}</span>
            </div>
          )) : (
            <div className="p-8 text-center">
              <EmptyState title="Belum Ada Aktivitas" description="Aktivitas pengguna terbaru akan dicatat di sini." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
