import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import Badge from "../../components/ui/Badge";

export default function MemberDashboard() {
  const { user } = useAuth();
  const [myBorrowings, setMyBorrowings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/borrowings/my?status=pending"),
      api.get("/borrowings/my?status=borrowed"),
      api.get("/access-requests/my"),
    ]).then(([pb, bb, ar]) => {
      setMyBorrowings([...pb.data.borrowings, ...bb.data.borrowings]);
      setMyRequests(ar.data.requests.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Selamat datang, {user?.name?.split(" ")[0]}! 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Kelola peminjaman dan akses dokumen Anda</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/items" className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-5 hover:-translate-y-1 transition-transform duration-200 block">
          <div className="text-2xl mb-2">📦</div>
          <div className="font-semibold text-slate-200">Lihat Barang</div>
          <div className="text-xs text-slate-400 mt-1">Ajukan peminjaman</div>
        </Link>
        <Link to="/archives" className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl p-5 hover:-translate-y-1 transition-transform duration-200 block">
          <div className="text-2xl mb-2">🗂️</div>
          <div className="font-semibold text-slate-200">Arsip Dokumen</div>
          <div className="text-xs text-slate-400 mt-1">Lihat dokumen UKM</div>
        </Link>
        <Link to="/borrowings/my" className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-5 hover:-translate-y-1 transition-transform duration-200 block">
          <div className="text-2xl mb-2">🔄</div>
          <div className="font-semibold text-slate-200">Peminjaman Saya</div>
          <div className="text-xs text-slate-400 mt-1">{myBorrowings.length} aktif</div>
        </Link>
        <Link to="/access-requests/my" className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-5 hover:-translate-y-1 transition-transform duration-200 block">
          <div className="text-2xl mb-2">🔐</div>
          <div className="font-semibold text-slate-200">Permintaan Akses</div>
          <div className="text-xs text-slate-400 mt-1">Kelola akses dokumen</div>
        </Link>
      </div>

      {/* Active Borrowings */}
      {myBorrowings.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-100">Peminjaman Aktif</h2>
            <Link to="/borrowings/my" className="text-xs text-indigo-400 hover:text-indigo-300">Lihat semua →</Link>
          </div>
          <div className="divide-y divide-slate-700/30">
            {loading ? <div className="px-6 py-4 text-slate-500 text-sm">Memuat...</div>
            : myBorrowings.map((b) => (
              <div key={b.id} className="px-6 py-3 flex items-center gap-4">
                <div className="text-xl">📦</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200">{b.item_name}</div>
                  <div className="text-xs text-slate-500">Kembali: {new Date(b.return_date).toLocaleDateString("id-ID")}</div>
                </div>
                <Badge status={b.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Access Requests */}
      {myRequests.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-100">Permintaan Akses Terbaru</h2>
            <Link to="/access-requests/my" className="text-xs text-indigo-400 hover:text-indigo-300">Lihat semua →</Link>
          </div>
          <div className="divide-y divide-slate-700/30">
            {myRequests.map((r) => (
              <div key={r.id} className="px-6 py-3 flex items-center gap-4">
                <div className="text-xl">🗂️</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200 truncate">{r.archive_title}</div>
                  <div className="text-xs text-slate-500">{new Date(r.requested_at).toLocaleDateString("id-ID")}</div>
                </div>
                <Badge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
