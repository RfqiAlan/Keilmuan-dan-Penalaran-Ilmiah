import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function MyBorrowingsPage() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = filterStatus ? `?status=${filterStatus}` : "";
    api.get(`/borrowings/my${params}`)
      .then((r) => setBorrowings(r.data.borrowings || []))
      .catch(() => setBorrowings([]))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const statuses = [
    "pending",
    "approved",
    "borrowed",
    "returned",
    "rejected",
    "late",
    "cancelled",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Peminjaman Saya
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Pantau riwayat permohonan dan masa tenggang peminjaman barang Anda
        </p>
      </div>

      <div className="flex gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs"
        >
          <option value="">Semua Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 w-1/2">
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <div className="space-y-1.5 w-full">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : borrowings.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Belum Ada Peminjaman"
            description={
              filterStatus
                ? "Tidak ada riwayat peminjaman dengan status yang dipilih."
                : "Anda belum pernah mengajukan peminjaman barang inventaris."
            }
            actionLabel={filterStatus ? "Tampilkan Semua" : "Cari Barang Sekarang"}
            onAction={
              filterStatus
                ? () => setFilterStatus("")
                : () => navigate("/items")
            }
          />
        ) : (
          borrowings.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 hover:border-[#0284c7]/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 rounded-xl flex items-center justify-center text-[#0284c7] dark:text-[#38bdf8] shrink-0">
                    <Package className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                      {b.item_name}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {b.item_code}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                      Jumlah: <strong className="text-slate-900 dark:text-slate-100">{b.quantity}</strong> unit
                    </div>
                  </div>
                </div>
                <Badge status={b.status} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Tgl Pinjam</div>
                  <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                    {b.borrow_date ? new Date(b.borrow_date).toLocaleDateString("id-ID") : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Rencana Kembali</div>
                  <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                    {b.return_date ? new Date(b.return_date).toLocaleDateString("id-ID") : "-"}
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <div className="text-slate-500 dark:text-slate-400">Tujuan</div>
                  <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 truncate" title={b.purpose}>
                    {b.purpose || "-"}
                  </div>
                </div>
                {b.admin_note && (
                  <div className="col-span-2 md:col-span-1">
                    <div className="text-slate-500 dark:text-slate-400">Catatan Admin</div>
                    <div className="text-[#0284c7] dark:text-[#38bdf8] font-medium mt-0.5 truncate" title={b.admin_note}>
                      {b.admin_note}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
