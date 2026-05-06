import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select, Textarea } from "../../components/ui/Input";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [borrowModal, setBorrowModal] = useState({ open: false, item: null });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchItems = () => {
    setLoading(true);
    const params = new URLSearchParams({ status: "available" });
    if (search) params.set("search", search);
    if (filterCat) params.set("category", filterCat);
    api.get(`/items?${params}`).then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, [search, filterCat]);

  const openBorrow = (item) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    setForm({ item_id: item.id, quantity: 1, borrow_date: today, return_date: tomorrow, purpose: "" });
    setError("");
    setBorrowModal({ open: true, item });
  };

  const handleBorrow = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await api.post("/borrowings", form);
      setBorrowModal({ open: false });
      navigate("/borrowings/my");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengajukan peminjaman.");
    } finally { setSaving(false); }
  };

  const categories = ["elektronik","dokumentasi","perlengkapan_acara","buku","seragam","properti_kegiatan","alat_tulis","lainnya"];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-100">Daftar Barang</h1><p className="text-slate-400 text-sm mt-1">Pilih barang yang ingin dipinjam</p></div>

      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Cari barang..."
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-48 placeholder-slate-500" />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Semua Kategori</option>
          {categories.map((c) => <option key={c} value={c}>{c.replace(/_/g," ")}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-64"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-slate-500">Tidak ada barang tersedia.</div>
          ) : items.map((item) => (
            <div key={item.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/40 transition-all duration-200">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover rounded-lg mb-4" />
              ) : (
                <div className="w-full h-40 bg-slate-700/50 rounded-lg mb-4 flex items-center justify-center text-4xl">📦</div>
              )}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-100">{item.name}</h3>
                  <Badge status={item.status} />
                </div>
                <div className="text-xs text-slate-500 font-mono">{item.code}</div>
                <div className="text-sm text-slate-400 capitalize">{item.category?.replace(/_/g," ")}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Tersedia: <span className="text-slate-200 font-medium">{item.available_stock}</span></span>
                  <Button size="sm" onClick={() => openBorrow(item)} disabled={item.available_stock < 1}>Pinjam</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={borrowModal.open} onClose={() => setBorrowModal({ open: false })} title={`Pinjam: ${borrowModal.item?.name}`} size="md">
        <form onSubmit={handleBorrow} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
          <div className="p-3 bg-slate-700/40 rounded-lg text-sm">
            <div className="text-slate-300">Stok tersedia: <strong className="text-slate-100">{borrowModal.item?.available_stock}</strong></div>
          </div>
          <Input label="Jumlah" type="number" min="1" max={borrowModal.item?.available_stock} value={form.quantity || 1}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal Pinjam" type="date" value={form.borrow_date || ""} onChange={(e) => setForm({ ...form, borrow_date: e.target.value })} required />
            <Input label="Tanggal Rencana Kembali" type="date" value={form.return_date || ""} onChange={(e) => setForm({ ...form, return_date: e.target.value })} required />
          </div>
          <Textarea label="Tujuan Peminjaman" value={form.purpose || ""} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Jelaskan tujuan peminjaman..." required rows={3} />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setBorrowModal({ open: false })}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Mengirim..." : "Ajukan Peminjaman"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
