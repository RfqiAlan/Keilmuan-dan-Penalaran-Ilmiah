import { useEffect, useState } from "react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Select, Textarea } from "../../components/ui/Input";

export default function AdminAccessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [actionModal, setActionModal] = useState({ open: false, type: "", request: null });
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState("1d");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    api.get(`/access-requests?${params}`).then((r) => setRequests(r.data.requests)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, [filterStatus]);

  const openAction = (type, request) => { setNote(""); setDuration("1d"); setActionModal({ open: true, type, request }); };

  const handleAction = async () => {
    setProcessing(true);
    const { type, request } = actionModal;
    try {
      if (type === "approve") await api.put(`/access-requests/${request.id}/approve`, { admin_note: note, duration });
      else await api.put(`/access-requests/${request.id}/reject`, { admin_note: note });
      setActionModal({ open: false }); fetchRequests();
    } catch (err) { alert(err.response?.data?.message || "Gagal."); }
    finally { setProcessing(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Permintaan Akses Dokumen</h1>
        <p className="text-slate-400 text-sm mt-1">Kelola permintaan akses dokumen terbatas</p>
      </div>

      <div className="flex gap-3">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Semua Status</option>
          {["pending","approved","rejected","expired"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-700/50">
              <tr>
                {["User","Dokumen","Alasan","Status","Tgl Request","Kedaluwarsa","Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Memuat...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Tidak ada permintaan akses.</td></tr>
              ) : requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3"><div className="text-slate-200 font-medium">{r.user_name}</div><div className="text-xs text-slate-500">{r.user_email}</div></td>
                  <td className="px-4 py-3"><div className="text-slate-200 max-w-40 truncate" title={r.archive_title}>{r.archive_title}</div><div className="text-xs text-slate-500 capitalize">{r.archive_category?.replace(/_/g," ")}</div></td>
                  <td className="px-4 py-3 text-slate-400 max-w-40 truncate" title={r.reason}>{r.reason}</td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3 text-slate-400">{new Date(r.requested_at).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-3 text-slate-400">{r.expired_at ? new Date(r.expired_at).toLocaleDateString("id-ID") : "—"}</td>
                  <td className="px-4 py-3">
                    {r.status === "pending" && (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="success" onClick={() => openAction("approve", r)}>✓</Button>
                        <Button size="sm" variant="danger" onClick={() => openAction("reject", r)}>✗</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={actionModal.open} onClose={() => setActionModal({ open: false })} title={actionModal.type === "approve" ? "Setujui Akses Dokumen" : "Tolak Permintaan Akses"} size="sm">
        <div className="space-y-4">
          {actionModal.request && (
            <div className="p-3 bg-slate-700/40 rounded-lg text-sm">
              <div className="text-slate-300 font-medium">{actionModal.request.user_name}</div>
              <div className="text-slate-400 text-xs mt-1">{actionModal.request.archive_title}</div>
              <div className="text-slate-400 text-xs mt-1 italic">"{actionModal.request.reason}"</div>
            </div>
          )}
          {actionModal.type === "approve" && (
            <Select label="Durasi Akses" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="1d">1 x 24 Jam</option>
              <option value="3d">3 Hari</option>
              <option value="7d">7 Hari</option>
              <option value="permanent">Permanen</option>
            </Select>
          )}
          <Textarea label="Catatan Admin (opsional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tambahkan catatan..." rows={3} />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setActionModal({ open: false })}>Batal</Button>
            <Button variant={actionModal.type === "reject" ? "danger" : "success"} onClick={handleAction} disabled={processing}>
              {processing ? "Memproses..." : actionModal.type === "approve" ? "Setujui" : "Tolak"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
