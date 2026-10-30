import { useEffect, useState } from "react";
import { KeyRound, Check, X, Clock } from "lucide-react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Select, Textarea } from "../../components/ui/Input";
import { SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../contexts/ToastContext";

export default function AdminAccessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [actionModal, setActionModal] = useState({ open: false, type: "", request: null });
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState("1d");
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  const fetchRequests = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    api.get(`/access-requests?${params}`)
      .then((r) => setRequests(r.data.requests || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const openAction = (type, request) => {
    setNote("");
    setDuration("1d");
    setActionModal({ open: true, type, request });
  };

  const handleAction = async () => {
    setProcessing(true);
    const { type, request } = actionModal;
    try {
      if (type === "approve") {
        await api.put(`/access-requests/${request.id}/approve`, { admin_note: note, duration });
        showToast("Permintaan akses berhasil disetujui!", "success");
      } else {
        await api.put(`/access-requests/${request.id}/reject`, { admin_note: note });
        showToast("Permintaan akses telah ditolak.", "info");
      }
      setActionModal({ open: false, type: "", request: null });
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal memproses permintaan akses.";
      showToast(msg, "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Permintaan Akses Dokumen
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Tinjau dan beri izin akses pada dokumen arsip terbatas
        </p>
      </div>

      <div className="flex gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs"
        >
          <option value="">Semua Status</option>
          {["pending", "approved", "rejected", "expired"].map((s) => (
            <option key={s} value={s}>
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="Tidak Ada Permintaan Akses"
          description={
            filterStatus === "pending"
              ? "Tidak ada permohonan akses arsip yang menunggu persetujuan saat ini."
              : "Belum ada catatan permintaan akses dengan status ini."
          }
          actionLabel={filterStatus !== "" ? "Tampilkan Semua Status" : undefined}
          onAction={filterStatus !== "" ? () => setFilterStatus("") : undefined}
        />
      ) : (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60">
                <tr>
                  {["User", "Dokumen", "Alasan", "Status", "Tgl Request", "Kedaluwarsa", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="text-slate-900 dark:text-slate-100 font-medium">
                        {r.user_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {r.user_email}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div
                        className="text-slate-900 dark:text-slate-100 font-medium max-w-44 truncate"
                        title={r.archive_title}
                      >
                        {r.archive_title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {r.archive_category?.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-44 truncate text-xs" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={r.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {new Date(r.requested_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {r.expired_at ? new Date(r.expired_at).toLocaleDateString("id-ID") : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      {r.status === "pending" && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => openAction("approve", r)}
                            title="Setujui Izin Akses"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => openAction("reject", r)}
                            title="Tolak Permintaan"
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Tolak
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: "", request: null })}
        title={
          actionModal.type === "approve"
            ? "Setujui Akses Dokumen"
            : "Tolak Permintaan Akses"
        }
        size="sm"
      >
        <div className="space-y-4">
          {actionModal.request && (
            <div className="p-3.5 bg-sky-50 dark:bg-slate-700/40 rounded-xl text-sm border border-sky-100 dark:border-slate-600 space-y-1">
              <div className="text-slate-900 dark:text-slate-100 font-semibold">
                {actionModal.request.user_name}
              </div>
              <div className="text-slate-600 dark:text-slate-300 text-xs">
                Dokumen: {actionModal.request.archive_title}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs italic pt-1">
                "{actionModal.request.reason}"
              </div>
            </div>
          )}

          {actionModal.type === "approve" && (
            <Select
              label="Durasi Akses Diberikan"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="1d">1 x 24 Jam (Standar)</option>
              <option value="3d">3 Hari</option>
              <option value="7d">7 Hari (1 Minggu)</option>
              <option value="permanent">Permanen</option>
            </Select>
          )}

          <Textarea
            label="Catatan Admin (opsional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tambahkan catatan untuk pemohon..."
            rows={3}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => setActionModal({ open: false, type: "", request: null })}
            >
              Batal
            </Button>
            <Button
              variant={actionModal.type === "reject" ? "danger" : "success"}
              onClick={handleAction}
              disabled={processing}
            >
              {processing
                ? "Memproses..."
                : actionModal.type === "approve"
                ? "Beri Akses"
                : "Tolak Permintaan"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
