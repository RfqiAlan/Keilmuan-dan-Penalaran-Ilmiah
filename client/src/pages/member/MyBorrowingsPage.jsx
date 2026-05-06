import { useEffect, useState } from "react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";

export default function MyBorrowingsPage() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = filterStatus ? `?status=${filterStatus}` : "";
    api.get(`/borrowings/my${params}`).then((r) => setBorrowings(r.data.borrowings)).finally(() => setLoading(false));
  }, [filterStatus]);

  const statuses = ["pending","approved","borrowed","returned","rejected","late","cancelled"];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-100">Peminjaman Saya</h1><p className="text-slate-400 text-sm mt-1">Riwayat dan status peminjaman barang Anda</p></div>

      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
        className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="">Semua Status</option>
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <div className="space-y-3">
        {loading ? <div className="flex items-center justify-center min-h-40"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>
        : borrowings.length === 0 ? <div className="text-center py-16 text-slate-500 bg-slate-800/50 rounded-xl border border-slate-700/50">Belum ada data peminjaman.</div>
        : borrowings.map((b) => (
          <div key={b.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-2xl shrink-0">📦</div>
                <div>
                  <h3 className="font-semibold text-slate-100">{b.item_name}</h3>
                  <div className="text-xs text-slate-500 font-mono">{b.item_code}</div>
                  <div className="text-sm text-slate-400 mt-1">Jumlah: {b.quantity}</div>
                </div>
              </div>
              <Badge status={b.status} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/50">
              <div><div className="text-xs text-slate-500">Tgl Pinjam</div><div className="text-sm text-slate-300">{new Date(b.borrow_date).toLocaleDateString("id-ID")}</div></div>
              <div><div className="text-xs text-slate-500">Rencana Kembali</div><div className="text-sm text-slate-300">{new Date(b.return_date).toLocaleDateString("id-ID")}</div></div>
              <div><div className="text-xs text-slate-500">Tujuan</div><div className="text-sm text-slate-300 truncate">{b.purpose}</div></div>
              {b.admin_note && <div><div className="text-xs text-slate-500">Catatan Admin</div><div className="text-sm text-slate-300">{b.admin_note}</div></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
