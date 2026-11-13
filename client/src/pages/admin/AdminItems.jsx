import { useEffect, useState, useRef } from "react";
import { Search, Plus, Edit, Trash2, Package, Upload, Camera } from "lucide-react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../contexts/ToastContext";

// Helper to downscale and optimize item photos
const compressItemImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Format file gambar tidak valid."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

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
  const fileInputRef = useRef(null);
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
      image_url: null,
    });
    setError("");
    setModal({ open: true, mode: "create", item: null });
  };

  const openEdit = (item) => {
    setForm({ ...item, image_url: item.image_url || null });
    setError("");
    setModal({ open: true, mode: "edit", item });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Format file foto barang harus berupa JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file foto maksimal 5MB.");
      return;
    }

    setError("");
    try {
      const optimizedUrl = await compressItemImage(file, 800, 800, 0.85);
      setForm((prev) => ({ ...prev, image_url: optimizedUrl }));
      showToast("Foto barang berhasil dimuat!", "info");
    } catch (err) {
      setError(err.message || "Gagal memproses gambar foto barang.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        <div className="relative w-full sm:w-auto sm:flex-1 min-w-[200px]">
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
          className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs w-full sm:w-auto"
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
          className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs w-full sm:w-auto"
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
        <SkeletonTable rows={6} cols={8} />
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
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60">
                <tr>
                  {["Foto", "Kode", "Nama Barang", "Kategori", "Total Stok", "Tersedia", "Status", "Aksi"].map(
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
                    <td className="px-4 py-2.5">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700/60 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                          <Package className="w-5 h-5 stroke-[1.5]" />
                        </div>
                      )}
                    </td>
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

          {/* Foto Barang Upload & Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Foto Barang
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />

            {form.image_url ? (
              <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden group bg-slate-100 dark:bg-slate-900 max-h-56">
                <img
                  src={form.image_url}
                  alt={form.name || "Foto Barang"}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" /> Ganti Foto
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => setForm((prev) => ({ ...prev, image_url: null }))}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus Foto
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-[#0284c7] dark:hover:border-[#38bdf8] rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/60 dark:bg-slate-700/20 group"
              >
                <div className="w-11 h-11 mx-auto rounded-full bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Klik untuk mengunggah foto barang
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Format: JPG, PNG, WEBP (Maksimal 5MB). Otomatis dioptimalkan.
                </div>
              </div>
            )}
          </div>
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
