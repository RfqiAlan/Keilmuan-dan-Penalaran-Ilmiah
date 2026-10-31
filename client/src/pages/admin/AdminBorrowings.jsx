import { useEffect, useState } from "react";
import { Search, Check, X, RotateCcw, ClipboardList } from "lucide-react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Textarea } from "../../components/ui/Input";
import { SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../contexts/ToastContext";

export default function AdminBorrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [actionModal, setActionModal] = useState({ open: false, type: "", borrowing: null });
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  const fetchBorrowings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (search) params.set("search", search);
    api.get(`/borrowings?${params}`)
      .then((r) => setBorrowings(r.data.borrowings || []))
      .catch(() => setBorrowings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBorrowings();
  }, [filterStatus, search]);

  const openAction = (type, borrowing) => {
    setNote("");
    setActionModal({ open: true, type, borrowing });
  };

  const handleAction = async () => {
    setProcessing(true);
    const { type, borrowing } = actionModal;
    try {
      if (type === "approve") {
        await api.put(`/borrowings/${borrowing.id}/approve`, { admin_note: note });
        showToast("Peminjaman berhasil disetujui!", "success");
      } else if (type === "reject") {
        await api.put(`/borrowings/${borrowing.id}/reject`, { admin_note: note });
        showToast("Peminjaman berhasil ditolak.", "info");
      } else if (type === "return") {
        await api.put(`/borrowings/${borrowing.id}/return`);
        showToast("Pengembalian barang berhasil dikonfirmasi!", "success");
      }
      setActionModal({ open: false, type: "", borrowing: null });
      fetchBorrowings();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal memproses aksi.";
      showToast(msg, "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Manajemen Peminjaman
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Kelola pengajuan, persetujuan, dan pengembalian barang inventaris
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        <div className="relative w-full sm:w-auto sm:flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari peminjam atau nama barang..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] placeholder-slate-400 shadow-xs"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs w-full sm:w-auto"
        >
          <option value="">Semua Status</option>
          {["pending", "approved", "borrowed", "returned", "rejected", "late", "cancelled"].map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : borrowings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Tidak Ada Data Peminjaman"
          description={
            search || filterStatus
              ? "Tidak ada peminjaman yang cocok dengan filter yang dipilih."
              : "Belum ada catatan peminjaman barang saat ini."
          }
          actionLabel={search || filterStatus ? "Reset Filter" : undefined}
          onAction={
            search || filterStatus
              ? () => {
                  setSearch("");
                  setFilterStatus("");
                }
              : undefined
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60">
                <tr>
                  {["Peminjam", "Barang", "Jml", "Tgl Pinjam", "Tgl Kembali", "Status", "Aksi"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {borrowings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="text-slate-900 dark:text-slate-100 font-medium">
                        {b.user_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {b.user_email}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {b.item_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {b.item_code}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {b.quantity}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {b.borrow_date ? new Date(b.borrow_date).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {b.return_date ? new Date(b.return_date).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={b.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {b.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => openAction("approve", b)}
                              title="Setujui Pengajuan"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => openAction("reject", b)}
                              title="Tolak Pengajuan"
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Tolak
                            </Button>
                          </>
                        )}
                        {(b.status === "borrowed" || b.status === "late") && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openAction("return", b)}
                            title="Konfirmasi Pengembalian"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Kembalikan
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: "", borrowing: null })}
        title={
          actionModal.type === "approve"
            ? "Setujui Peminjaman"
            : actionModal.type === "reject"
            ? "Tolak Peminjaman"
            : "Verifikasi Pengembalian"
        }
        size="sm"
      >
        <div className="space-y-4">
          {actionModal.borrowing && (
            <div className="p-3 bg-sky-50 dark:bg-slate-700/40 rounded-xl text-sm text-slate-700 dark:text-slate-300 border border-sky-100 dark:border-slate-600">
              <strong className="text-slate-900 dark:text-slate-100">
                {actionModal.borrowing.user_name}
              </strong>{" "}
              — {actionModal.borrowing.item_name} ({actionModal.borrowing.quantity} unit)
            </div>
          )}
          {actionModal.type !== "return" && (
            <Textarea
              label="Catatan Admin (opsional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahkan catatan untuk peminjam..."
              rows={3}
            />
          )}
          {actionModal.type === "return" && (
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              Pastikan kondisi fisik barang telah diperiksa sebelum menyelesaikan peminjaman ini.
            </p>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => setActionModal({ open: false, type: "", borrowing: null })}
            >
              Batal
            </Button>
            <Button
              variant={actionModal.type === "reject" ? "danger" : "primary"}
              onClick={handleAction}
              disabled={processing}
            >
              {processing
                ? "Memproses..."
                : actionModal.type === "approve"
                ? "Setujui"
                : actionModal.type === "reject"
                ? "Tolak"
                : "Konfirmasi Pengembalian"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
