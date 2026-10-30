import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../contexts/ToastContext";

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
  const { showToast } = useToast();

  const fetchItems = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterCat) params.set("category", filterCat);
    if (filterStatus) params.set("status", filterStatus);
    api.get(`/items?${params}`)
      .then((r) => setItems(r.data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [search, filterCat, filterStatus]);

  const openCreate = () => {
    setForm({
      code: "",
      name: "",
      category: "elektronik",
      total_stock: 1,
      condition: "baik",
      location: "",
      description: "",
    });
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
      if (modal.mode === "create") {
        await api.post("/items", form);
        showToast("Barang baru berhasil ditambahkan!", "success");
      } else {
        await api.put(`/items/${modal.item.id}`, form);
        showToast("Data barang berhasil diperbarui!", "success");
      }
      setModal({ open: false, item: null });
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyimpan barang.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/items/${delModal.item.id}`);
      setDelModal({ open: false, item: null });
      showToast("Barang berhasil dihapus!", "success");
      fetchItems();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menghapus barang.";
      showToast(msg, "error");
    }
  };

  const categories = [
    "elektronik",
    "dokumentasi",
    "perlengkapan_acara",
    "buku",
    "seragam",
    "properti_kegiatan",
    "alat_tulis",
    "lainnya",
  ];
  const statuses = ["available", "borrowed", "damaged", "lost", "maintenance"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Manajemen Barang
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Kelola data dan status inventaris aset UKM
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Barang
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama barang..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] placeholder-slate-400 shadow-xs"
          />
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>

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

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Tidak Ada Data Barang"
          description={
            search || filterCat || filterStatus
              ? "Tidak ada barang yang cocok dengan filter pencarian saat ini."
              : "Belum ada barang inventaris yang didaftarkan ke dalam sistem."
          }
          actionLabel={search || filterCat || filterStatus ? "Reset Filter" : "Tambah Barang Baru"}
          onAction={
            search || filterCat || filterStatus
              ? () => {
                  setSearch("");
                  setFilterCat("");
                  setFilterStatus("");
                }
              : openCreate
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60">
                <tr>
                  {["Kode", "Nama Barang", "Kategori", "Total Stok", "Tersedia", "Status", "Aksi"].map(
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
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {item.code}
                    </td>
                    <td className="px-4 py-3.5 text-slate-900 dark:text-slate-100 font-medium">
                      {item.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 capitalize text-xs">
                      {item.category?.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                      {item.total_stock}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      {item.available_stock}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEdit(item)}
                          title="Edit Barang"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDelModal({ open: true, item })}
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, item: null })}
        title={modal.mode === "create" ? "Tambah Barang Baru" : "Edit Data Barang"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kode Barang"
              value={form.code || ""}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Contoh: ELE-001"
              required
              disabled={modal.mode === "edit"}
            />
            <Input
              label="Nama Barang"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Proyektor Epson"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Kategori"
              value={form.category || "elektronik"}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={form.status || "available"}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Stok"
              type="number"
              min="0"
              value={form.total_stock || 1}
              onChange={(e) => setForm({ ...form, total_stock: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Kondisi Fisik"
              value={form.condition || "baik"}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              placeholder="Contoh: Baik / Perlu Pengecekan"
            />
          </div>
          <Input
            label="Lokasi Penyimpanan"
            value={form.location || ""}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Contoh: Lemari A, Sekretariat UKM"
          />
          <Input
            label="Deskripsi & Kelengkapan"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Catatan tambahan spesifikasi barang..."
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModal({ open: false, item: null })}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan Data..." : "Simpan Barang"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={delModal.open}
        onClose={() => setDelModal({ open: false, item: null })}
        title="Konfirmasi Hapus Barang"
        size="sm"
      >
        <p className="text-slate-700 dark:text-slate-300 mb-6 text-sm">
          Apakah Anda yakin ingin menghapus barang{" "}
          <strong className="text-slate-900 dark:text-slate-100 font-semibold">
            {delModal.item?.name}
          </strong>
          ? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setDelModal({ open: false, item: null })}
          >
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
