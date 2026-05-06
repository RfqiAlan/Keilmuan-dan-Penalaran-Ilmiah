import { useEffect, useState } from "react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";

export default function MyAccessRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/access-requests/my").then((r) => setRequests(r.data.requests)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-100">Permintaan Akses Saya</h1><p className="text-slate-400 text-sm mt-1">Status permintaan akses dokumen Anda</p></div>
      <div className="space-y-3">
        {loading ? <div className="flex items-center justify-center min-h-40"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>
        : requests.length === 0 ? <div className="text-center py-16 text-slate-500 bg-slate-800/50 rounded-xl border border-slate-700/50">Belum ada permintaan akses dokumen.</div>
        : requests.map((r) => (
          <div key={r.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-100">{r.archive_title}</h3>
                <div className="text-sm text-slate-400 capitalize mt-0.5">{r.archive_category?.replace(/_/g," ")}</div>
              </div>
              <Badge status={r.status} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-700/50 text-sm">
              <div><div className="text-xs text-slate-500">Alasan</div><div className="text-slate-300 mt-0.5">{r.reason}</div></div>
              <div><div className="text-xs text-slate-500">Tgl Permintaan</div><div className="text-slate-300 mt-0.5">{new Date(r.requested_at).toLocaleDateString("id-ID")}</div></div>
              {r.expired_at && <div><div className="text-xs text-slate-500">Kedaluwarsa</div><div className={`mt-0.5 ${new Date(r.expired_at) < new Date() ? "text-red-400" : "text-slate-300"}`}>{new Date(r.expired_at).toLocaleString("id-ID")}</div></div>}
              {r.admin_note && <div className="col-span-2 md:col-span-3"><div className="text-xs text-slate-500">Catatan Admin</div><div className="text-slate-300 mt-0.5 italic">"{r.admin_note}"</div></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
