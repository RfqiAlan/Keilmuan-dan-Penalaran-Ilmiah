import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Archive,
  RefreshCw,
  KeyRound,
  ArrowRight,
  Clock,
  IdCard,
  ShieldCheck,
  Search,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import Badge from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  return hasTime
    ? d.toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

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
    ])
      .then(([pb, bb, ar]) => {
        setMyBorrowings([...pb.data.borrowings, ...bb.data.borrowings]);
        setMyRequests(ar.data.requests.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingBorrowings = myBorrowings.filter((b) => b.status === "pending").length;
  const activeBorrowings = myBorrowings.filter((b) => b.status === "borrowed").length;

  return (
    <div className="space-y-6">
      {/* Member Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Halo, {user?.name?.split(" ")[0]}
            </h1>
            {user?.nra && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-[#38bdf8] border border-sky-200 dark:border-sky-800/60">
                <IdCard className="w-3 h-3" />
                NRA: {user.nra}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              {user?.role?.replace("_", " ") || "Anggota"}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Portal terpadu peminjaman sarana dan akses arsip dokumen kegiatan UKM KPI.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/items"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0284c7] text-white hover:bg-[#0369a1] transition-colors shadow-xs"
          >
            <Package className="w-4 h-4" />
            Pinjam Barang
          </Link>
          <Link
            to="/archives"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs border border-slate-200/80 dark:border-slate-700"
          >
            <Archive className="w-4 h-4" />
            Cari Dokumen
          </Link>
        </div>
      </div>

      {/* Services Hub (Two Asymmetric Action Panels) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Panel 1: Inventaris Peralatan */}
        <div className="bg-gradient-to-br from-white to-sky-50/40 dark:from-slate-900 dark:to-sky-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 dark:bg-[#0284c7]/20 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Pilihan Harian & Per Jam
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Katalog Peralatan & Sarana
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Ajukan permohonan pinjam sound system, proyektor, kabel roll, dan perlengkapan kegiatan organisasi secara tertib.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {loading ? "Memuat..." : `${myBorrowings.length} peminjaman dalam catatan`}
            </div>
            <Link
              to="/items"
              className="text-xs font-semibold text-[#0284c7] dark:text-[#38bdf8] hover:text-[#0369a1] inline-flex items-center gap-1 group"
            >
              Jelajahi Katalog
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Panel 2: Repositori Arsip */}
        <div className="bg-gradient-to-br from-white to-amber-50/40 dark:from-slate-900 dark:to-amber-950/10 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Archive className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Google Drive Terproteksi
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Repositori Dokumen Organisasi
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Akses LPJ kepengurusan, modul pelatihan ilmiah, proposal kegiatan, dan surat keputusan dengan izin berjenjang.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {loading ? "Memuat..." : `${myRequests.length} permohonan akses diajukan`}
            </div>
            <Link
              to="/archives"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 inline-flex items-center gap-1 group"
            >
              Buka Berkas Arsip
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Borrowings */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : myBorrowings.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Status Peminjaman Barang Anda
              </h2>
            </div>
            <Link
              to="/borrowings/my"
              className="text-xs text-[#0284c7] dark:text-[#38bdf8] hover:text-[#0369a1] font-medium flex items-center gap-1"
            >
              Lihat semua ({myBorrowings.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {myBorrowings.map((b) => (
              <div
                key={b.id}
                className="px-5 py-3.5 flex items-center gap-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {b.item_name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Jadwal Pengembalian: {formatDateTime(b.return_date)}</span>
                  </div>
                </div>
                <Badge status={b.status} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Recent Access Requests */}
      {!loading && myRequests.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Permintaan Akses Dokumen Terkini
              </h2>
            </div>
            <Link
              to="/access-requests/my"
              className="text-xs text-[#0284c7] dark:text-[#38bdf8] hover:text-[#0369a1] font-medium flex items-center gap-1"
            >
              Lihat di Riwayat Permintaan <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {myRequests.map((r) => (
              <div
                key={r.id}
                className="px-5 py-3.5 flex items-center gap-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Archive className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {r.archive_title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>Diajukan: {new Date(r.requested_at).toLocaleDateString("id-ID")}</span>
                  </div>
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
          description="Anda belum memiliki peminjaman barang atau pengajuan akses dokumen yang aktif saat ini."
          actionLabel="Jelajahi Katalog Barang"
          onAction={() => (window.location.href = "/items")}
        />
      )}
    </div>
  );
}
