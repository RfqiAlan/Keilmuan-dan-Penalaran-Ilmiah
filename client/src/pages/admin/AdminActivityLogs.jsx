import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = filterModule ? `?module=${filterModule}` : "";
    api.get(`/activity-logs${params}`).then((r) => setLogs(r.data.logs)).finally(() => setLoading(false));
  }, [filterModule]);

  const modules = ["auth","items","borrowings","archives","access_requests"];
  const moduleIcons = { auth: "🔑", items: "📦", borrowings: "🔄", archives: "🗂️", access_requests: "🔐" };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-100">Log Aktivitas</h1><p className="text-slate-400 text-sm mt-1">Riwayat aktivitas pengguna dalam sistem</p></div>
      <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)}
        className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="">Semua Modul</option>
        {modules.map((m) => <option key={m} value={m}>{m.replace(/_/g," ")}</option>)}
      </select>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-700/30">
          {loading ? <div className="px-6 py-8 text-center text-slate-500">Memuat...</div>
          : logs.length === 0 ? <div className="px-6 py-8 text-center text-slate-500">Tidak ada log aktivitas.</div>
          : logs.map((log) => (
            <div key={log.id} className="px-6 py-3 flex items-start gap-4 hover:bg-slate-700/20 transition-colors">
              <div className="text-xl shrink-0 mt-0.5">{moduleIcons[log.module] || "📋"}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200"><span className="font-medium text-indigo-400">{log.user_name || "System"}</span> — {log.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500 capitalize">{log.module?.replace(/_/g," ")}</span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString("id-ID")}</span>
                </div>
              </div>
              <span className="text-xs text-slate-500 shrink-0 font-mono">{log.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
