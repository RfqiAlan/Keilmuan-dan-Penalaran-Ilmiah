import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Archive, RefreshCw, KeyRound, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import Badge from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Selamat datang, {user?.name?.split(" ")[0]}! 👋</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Kelola peminjaman barang dan akses dokumen Anda</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link to="/items" className="group bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 sm:p-5 hover:border-[#0284c7] transition-all duration-200 shadow-sm block">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-[#0284c7] transition-colors truncate">Lihat Barang</div>
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">Ajukan peminjaman</div>
        </Link>
        <Link to="/archives" className="group bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 sm:p-5 hover:border-emerald-500 transition-all duration-200 shadow-sm block">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform">
            <Archive className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors truncate">Arsip Dokumen</div>
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">Lihat dokumen UKM</div>
        </Link>
        <Link to="/borrowings/my" className="group bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 sm:p-5 hover:border-sky-500 transition-all duration-200 shadow-sm block">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform">
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors truncate">Peminjaman Saya</div>
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">{loading ? "..." : `${myBorrowings.length} aktif`}</div>
        </Link>
        <Link to="/access-requests/my" className="group bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 sm:p-5 hover:border-amber-500 transition-all duration-200 shadow-sm block">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-105 transition-transform">
            <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors truncate">Permintaan Akses</div>
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">{loading ? "..." : `${myRequests.length} diajukan`}</div>
        </Link>
      </div>

      {/* Active Borrowings */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 shadow-sm space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : myBorrowings.length > 0 ? (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Peminjaman Aktif</h2>
            <Link to="/borrowings/my" className="text-xs text-[#0284c7] dark:text-[#38bdf8] hover:text-[#f97316] font-medium flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {myBorrowings.map((b) => (
              <div key={b.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{b.item_name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Kembali: {new Date(b.return_date).toLocaleDateString("id-ID")}</div>
                </div>
                <Badge status={b.status} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Recent Access Requests */}
      {!loading && myRequests.length > 0 && (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Permintaan Akses Terbaru</h2>
            <Link to="/access-requests/my" className="text-xs text-[#0284c7] dark:text-[#38bdf8] hover:text-[#f97316] font-medium flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {myRequests.map((r) => (
              <div key={r.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Archive className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{r.archive_title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(r.requested_at).toLocaleDateString("id-ID")}</div>
                </div>
                <Badge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* If totally empty */}
      {!loading && myBorrowings.length === 0 && myRequests.length === 0 && (
        <EmptyState
          icon={Package}
          title="Belum Ada Peminjaman atau Pengajuan"
          description="Anda belum memiliki peminjaman barang atau pengajuan akses dokumen yang aktif."
          actionLabel="Jelajahi Daftar Barang"
          onAction={() => window.location.href = "/items"}
        />
      )}
    </div>
  );
}
