import { useEffect, useState } from "react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "create", item: null });
  const [delModal, setDelModal] = useState({ open: false, item: null });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterCat) params.set("category", filterCat);
    if (filterStatus) params.set("status", filterStatus);
    api.get(`/items?${params}`).then((r) => setItems(r.data.items)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, [search, filterCat, filterStatus]);

  const openCreate = () => {
    setForm({ code: "", name: "", category: "elektronik", total_stock: 1, condition: "baik", location: "", description: "" });
    setError("");
    setModal({ open: true, mode: "create", item: null });
  };

  const openEdit = (item) => {
    setForm({ ...item });
    setError("");
    setModal({ open: true, mode: "edit", item });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (modal.mode === "create") await api.post("/items", form);
      else await api.put(`/items/${modal.item.id}`, form);
      setModal({ open: false });
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/items/${delModal.item.id}`);
      setDelModal({ open: false });
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus.");
    }
  };

  const categories = ["elektronik","dokumentasi","perlengkapan_acara","buku","seragam","properti_kegiatan","alat_tulis","lainnya"];
  const statuses = ["available","borrowed","damaged","lost","maintenance"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Manajemen Barang</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola inventaris barang UKM</p>
        </div>
        <Button onClick={openCreate}>+ Tambah Barang</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Cari barang..."
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-48 placeholder-slate-500" />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Semua Kategori</option>
          {categories.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Semua Status</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-700/50">
              <tr>
                {["Kode","Nama Barang","Kategori","Stok","Tersedia","Status","Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Memuat...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Tidak ada data barang.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.code}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-slate-400 capitalize">{item.category?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-slate-300">{item.total_stock}</td>
                  <td className="px-4 py-3 text-slate-300">{item.available_stock}</td>
                  <td className="px-4 py-3"><Badge status={item.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => setDelModal({ open: true, item })}>Hapus</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === "create" ? "Tambah Barang" : "Edit Barang"} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Kode Barang" value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} required disabled={modal.mode === "edit"} />
            <Input label="Nama Barang" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Kategori" value={form.category || "elektronik"} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </Select>
            <Select label="Status" value={form.status || "available"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Stok" type="number" min="0" value={form.total_stock || 1} onChange={(e) => setForm({ ...form, total_stock: e.target.value })} />
            <Input label="Kondisi" value={form.condition || "baik"} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
          </div>
          <Input label="Lokasi Penyimpanan" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Contoh: Gudang UKM Lt.2" />
          <Input label="Deskripsi" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal({ open: false })}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={delModal.open} onClose={() => setDelModal({ open: false })} title="Konfirmasi Hapus" size="sm">
        <p className="text-slate-300 mb-6">Hapus barang <strong className="text-slate-100">{delModal.item?.name}</strong>? Tindakan ini tidak bisa dibatalkan.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDelModal({ open: false })}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>
    </div>
  );
}
