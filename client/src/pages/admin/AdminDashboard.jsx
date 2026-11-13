import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Archive,
  Clock,
  KeyRound,
  AlertCircle,
  Users,
  ArrowRight,
  TrendingUp,
  FilePlus,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import api from "../../api/axios";
import { Skeleton, SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-44 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
        <SkeletonTable rows={4} cols={3} />
      </div>
    );
  }

  const stats = data || {};
  const pendingBorrowings = parseInt(stats.borrowings?.pending || 0, 10);
  const pendingAccess = parseInt(stats.access_requests?.pending || 0, 10);
  const pendingUsers = parseInt(stats.users?.pending || 0, 10);
  const lateBorrowings = parseInt(stats.borrowings?.late || 0, 10);

  const totalItems = parseInt(stats.items?.total || 0, 10);
  const availableItems = parseInt(stats.items?.available || 0, 10);
  const borrowedItems = parseInt(stats.items?.borrowed || 0, 10);
  const damagedItems = parseInt(stats.items?.damaged || 0, 10);

  const totalArchives = parseInt(stats.archives?.total || 0, 10);
  const urgentCount = pendingBorrowings + pendingAccess + pendingUsers + lateBorrowings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Pusat Kendali Operasional
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
            Sistem Informasi Peminjaman Sarana & Arsip Dokumen UKM KPI
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/items"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#0284c7] text-white hover:bg-[#0369a1] transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Tambah Barang
          </Link>
          <Link
            to="/admin/archives"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
          >
            <FilePlus className="w-3.5 h-3.5" />
            Unggah Arsip
          </Link>
        </div>
      </div>

      {/* Tier 1: Action-Required Banner */}
      {urgentCount > 0 ? (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Perlu Tindakan Administrator ({urgentCount} Permintaan)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {pendingBorrowings > 0 && (
              <Link
                to="/admin/borrowings"
                className="group p-3 bg-white dark:bg-slate-900/90 border border-amber-200/80 dark:border-amber-900/40 rounded-xl hover:border-amber-400 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Peminjaman Baru</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {pendingBorrowings} menunggu
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
              </Link>
            )}

            {pendingAccess > 0 && (
              <Link
                to="/admin/access-requests"
                className="group p-3 bg-white dark:bg-slate-900/90 border border-amber-200/80 dark:border-amber-900/40 rounded-xl hover:border-amber-400 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Akses Dokumen</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {pendingAccess} menunggu
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0284c7] transition-colors shrink-0" />
              </Link>
            )}

            {pendingUsers > 0 && (
              <Link
                to="/admin/users"
                className="group p-3 bg-white dark:bg-slate-900/90 border border-amber-200/80 dark:border-amber-900/40 rounded-xl hover:border-amber-400 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Verifikasi User</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {pendingUsers} akun baru
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
              </Link>
            )}

            {lateBorrowings > 0 && (
              <Link
                to="/admin/borrowings"
                className="group p-3 bg-white dark:bg-slate-900/90 border border-rose-200 dark:border-rose-900/40 rounded-xl hover:border-rose-400 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Jatuh Tempo</div>
                    <div className="font-semibold text-rose-600 dark:text-rose-400 text-sm">
                      {lateBorrowings} terlambat
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Semua antrean operasional telah bersih. Tidak ada permintaan pending yang memerlukan tindakan saat ini.</span>
        </div>
      )}

      {/* Tier 2: Summary Status (Inventory & Archives) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inventory Status Card */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Inventaris Sarana & Alat
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total {totalItems} unit tercatat di sistem
                  </p>
                </div>
              </div>
              <Link
                to="/admin/items"
                className="text-xs font-semibold text-[#0284c7] dark:text-[#38bdf8] hover:text-[#0369a1] flex items-center gap-1"
              >
                Kelola <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Visual Bar */}
            {totalItems > 0 && (
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 flex overflow-hidden mb-4">
                <div
                  style={{ width: `${(availableItems / totalItems) * 100}%` }}
                  className="bg-emerald-500"
                  title={`Tersedia: ${availableItems}`}
                />
                <div
                  style={{ width: `${(borrowedItems / totalItems) * 100}%` }}
                  className="bg-[#0284c7]"
                  title={`Dipinjam: ${borrowedItems}`}
                />
                <div
                  style={{ width: `${(damagedItems / totalItems) * 100}%` }}
                  className="bg-rose-500"
                  title={`Rusak: ${damagedItems}`}
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Tersedia
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {availableItems}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                  Dipinjam
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {borrowedItems}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Rusak
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {damagedItems}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Archives & Governance Card */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Tata Kelola Dokumen & Arsip
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Google Drive Terintegrasi & Berkas Keorganisasian
                  </p>
                </div>
              </div>
              <Link
                to="/admin/archives"
                className="text-xs font-semibold text-[#0284c7] dark:text-[#38bdf8] hover:text-[#0369a1] flex items-center gap-1"
              >
                Buka Repositori <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Berkas & Folder Terdata</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalArchives} Arsip</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  <ShieldAlert className="w-3 h-3" /> Proteksi Akses
                </span>
                <span className="text-[11px] text-slate-400">Terbuka / Tertutup</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
              <span>Laporan & Evaluasi Bulanan</span>
              <Link
                to="/admin/reports"
                className="font-medium text-[#0284c7] dark:text-[#38bdf8] hover:underline flex items-center gap-1"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Lihat Analisis Laporan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 3: Recent Activity Log */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Catatan Aktivitas Terbaru
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit trail dari aksi anggota dan administrator
            </p>
          </div>
          <Link
            to="/admin/activity-logs"
            className="text-xs font-medium text-[#0284c7] dark:text-[#38bdf8] hover:underline flex items-center gap-1"
          >
            Lihat semua log <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
          {stats.recent_activity?.length > 0 ? (
            stats.recent_activity.map((log) => (
              <div
                key={log.id}
                className="px-5 py-3 flex items-center gap-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-700/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-[#0284c7] dark:text-[#38bdf8] shrink-0 border border-slate-200 dark:border-slate-600">
                  {log.user_name ? log.user_name.charAt(0).toUpperCase() : "S"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {log.user_name || "Sistem"}
                    </span>
                    : {log.description}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {new Date(log.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 shrink-0 capitalize">
                  {log.module}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <EmptyState
                title="Belum Ada Aktivitas"
                description="Aktivitas pengguna terbaru akan dicatat di sini."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
