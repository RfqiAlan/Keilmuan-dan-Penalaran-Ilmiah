import { useEffect, useState } from "react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Textarea } from "../../components/ui/Input";

export default function AdminBorrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [actionModal, setActionModal] = useState({ open: false, type: "", borrowing: null });
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchBorrowings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (search) params.set("search", search);
    api.get(`/borrowings?${params}`).then((r) => setBorrowings(r.data.borrowings)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBorrowings(); }, [filterStatus, search]);

  const openAction = (type, borrowing) => { setNote(""); setActionModal({ open: true, type, borrowing }); };

  const handleAction = async () => {
    setProcessing(true);
    const { type, borrowing } = actionModal;
    try {
      if (type === "approve") await api.put(`/borrowings/${borrowing.id}/approve`, { admin_note: note });
      else if (type === "reject") await api.put(`/borrowings/${borrowing.id}/reject`, { admin_note: note });
      else if (type === "return") await api.put(`/borrowings/${borrowing.id}/return`);
      setActionModal({ open: false });
      fetchBorrowings();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Manajemen Peminjaman</h1>
        <p className="text-slate-400 text-sm mt-1">Kelola pengajuan dan status peminjaman barang</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Cari peminjam atau barang..."
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-48 placeholder-slate-500" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Semua Status</option>
          {["pending","approved","borrowed","returned","rejected","late","cancelled"].map((s) =>
            <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-700/50">
              <tr>
                {["Peminjam","Barang","Jml","Tgl Pinjam","Tgl Kembali","Status","Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Memuat...</td></tr>
              ) : borrowings.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Tidak ada data peminjaman.</td></tr>
              ) : borrowings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3"><div className="text-slate-200 font-medium">{b.user_name}</div><div className="text-xs text-slate-500">{b.user_email}</div></td>
                  <td className="px-4 py-3"><div className="text-slate-200">{b.item_name}</div><div className="text-xs text-slate-500 font-mono">{b.item_code}</div></td>
                  <td className="px-4 py-3 text-slate-300">{b.quantity}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(b.borrow_date).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(b.return_date).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-3"><Badge status={b.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {b.status === "pending" && <><Button size="sm" variant="success" onClick={() => openAction("approve", b)}>✓</Button><Button size="sm" variant="danger" onClick={() => openAction("reject", b)}>✗</Button></>}
                      {(b.status === "borrowed" || b.status === "late") && <Button size="sm" variant="secondary" onClick={() => openAction("return", b)}>Kembalikan</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={actionModal.open} onClose={() => setActionModal({ open: false })} title={actionModal.type === "approve" ? "Setujui Peminjaman" : actionModal.type === "reject" ? "Tolak Peminjaman" : "Verifikasi Pengembalian"} size="sm">
        <div className="space-y-4">
          {actionModal.borrowing && <div className="p-3 bg-slate-700/40 rounded-lg text-sm text-slate-300"><strong>{actionModal.borrowing.user_name}</strong> — {actionModal.borrowing.item_name} (x{actionModal.borrowing.quantity})</div>}
          {actionModal.type !== "return" && <Textarea label="Catatan Admin (opsional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tambahkan catatan..." rows={3} />}
          {actionModal.type === "return" && <p className="text-slate-300 text-sm">Konfirmasi bahwa barang telah dikembalikan?</p>}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setActionModal({ open: false })}>Batal</Button>
            <Button variant={actionModal.type === "reject" ? "danger" : "primary"} onClick={handleAction} disabled={processing}>
              {processing ? "Memproses..." : actionModal.type === "approve" ? "Setujui" : actionModal.type === "reject" ? "Tolak" : "Konfirmasi"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
