import { useEffect, useState } from "react";
import api from "../../api/axios";
import { StatCard } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

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
    <div className="flex items-center justify-center min-h-64">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  const stats = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Ringkasan kondisi sistem SIMPAR UKM</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="📦" label="Total Barang"     value={stats.items?.total}     color="indigo" />
        <StatCard icon="✅" label="Barang Tersedia"  value={stats.items?.available}  color="green" />
        <StatCard icon="🔄" label="Sedang Dipinjam"  value={stats.items?.borrowed}   color="blue" />
        <StatCard icon="⚠️" label="Barang Rusak"     value={stats.items?.damaged}    color="red" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="🗂️" label="Total Arsip"         value={stats.archives?.total}            color="indigo" />
        <StatCard icon="⏳" label="Request Peminjaman"   value={stats.borrowings?.pending}        color="yellow" />
        <StatCard icon="🔐" label="Request Akses Dokumen" value={stats.access_requests?.pending} color="orange" />
        <StatCard icon="🚨" label="Peminjaman Terlambat" value={stats.borrowings?.late}          color="red" />
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="font-semibold text-slate-100">Aktivitas Terbaru</h2>
        </div>
        <div className="divide-y divide-slate-700/30">
          {stats.recent_activity?.length > 0 ? stats.recent_activity.map((log) => (
            <div key={log.id} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-700/20 transition-colors">
              <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                {log.user_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">
                  <span className="font-medium">{log.user_name}</span> — {log.description}
                </p>
                <p className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString("id-ID")}</p>
              </div>
              <span className="text-xs text-slate-500 shrink-0 capitalize">{log.module}</span>
            </div>
          )) : (
            <div className="px-6 py-8 text-center text-slate-500 text-sm">Belum ada aktivitas.</div>
          )}
        </div>
      </div>
    </div>
  );
}
