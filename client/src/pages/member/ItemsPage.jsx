import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, PlusCircle } from "lucide-react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Textarea } from "../../components/ui/Input";
import FilterChips from "../../components/ui/FilterChips";
import { SkeletonCard } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../contexts/ToastContext";

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
  const { showToast } = useToast();

  useEffect(() => {
    fetchItems();
  }, [search, filterCat]);

  const fetchItems = () => {
    setLoading(true);
    const params = new URLSearchParams({ status: "available" });
    if (search) params.set("search", search);
    if (filterCat) params.set("category", filterCat);
    api.get(`/items?${params}`)
      .then((r) => setItems(r.data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  const openBorrow = (item) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    setForm({ item_id: item.id, quantity: 1, borrow_date: today, return_date: tomorrow, purpose: "" });
    setError("");
    setBorrowModal({ open: true, item });
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/borrowings", form);
      setBorrowModal({ open: false, item: null });
      showToast("Pengajuan peminjaman berhasil dikirim!", "success");
      navigate("/borrowings/my");
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal mengajukan peminjaman.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Daftar Barang</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Pilih barang inventaris yang ingin dipinjam</p>
      </div>

      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama barang atau kode inventaris..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] placeholder-slate-400 transition-all shadow-xs"
          />
        </div>

        <FilterChips
          categories={categories}
          selected={filterCat}
          onSelect={setFilterCat}
          multiple={true}
          allLabel="Semua Kategori"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Barang Tidak Ditemukan"
          description={
            search || filterCat
              ? "Tidak ada barang yang cocok dengan filter atau kata kunci saat ini."
              : "Saat ini belum ada barang yang tersedia untuk dipinjam."
          }
          actionLabel={search || filterCat ? "Reset Filter" : undefined}
          onAction={
            search || filterCat
              ? () => {
                  setSearch("");
                  setFilterCat("");
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 hover:border-[#0284c7]/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-44 object-cover rounded-lg mb-4 bg-slate-100 dark:bg-slate-700"
                  />
                ) : (
                  <div className="w-full h-44 bg-sky-50/60 dark:bg-slate-700/40 rounded-lg mb-4 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border border-dashed border-sky-200 dark:border-slate-600">
                    <Package className="w-10 h-10 stroke-[1.5] text-[#0284c7]/70 dark:text-sky-400/60 mb-1" />
                    <span className="text-xs font-medium">Foto Belum Tersedia</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {item.name}
                    </h3>
                    <Badge status={item.status} />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                    {item.code}
                  </div>
                  <div className="text-xs font-medium text-[#0284c7] dark:text-[#38bdf8] capitalize">
                    {item.category?.replace(/_/g, " ")}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Stok:{" "}
                  <strong className="text-slate-900 dark:text-slate-100 font-bold text-sm">
                    {item.available_stock}
                  </strong>{" "}
                  unit
                </span>
                <Button
                  size="sm"
                  onClick={() => openBorrow(item)}
                  disabled={item.available_stock < 1}
                >
                  Pinjam
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={borrowModal.open}
        onClose={() => setBorrowModal({ open: false, item: null })}
        title={`Pinjam: ${borrowModal.item?.name || ""}`}
        size="md"
      >
        <form onSubmit={handleBorrow} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="p-3 bg-sky-50 dark:bg-slate-700/50 rounded-lg text-sm border border-sky-100 dark:border-slate-600">
            <div className="text-slate-700 dark:text-slate-300">
              Stok siap pinjam:{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                {borrowModal.item?.available_stock} unit
              </strong>
            </div>
          </div>
          <Input
            label="Jumlah Unit"
            type="number"
            min="1"
            max={borrowModal.item?.available_stock}
            value={form.quantity || 1}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tanggal Pinjam"
              type="date"
              value={form.borrow_date || ""}
              onChange={(e) => setForm({ ...form, borrow_date: e.target.value })}
              required
            />
            <Input
              label="Tanggal Rencana Kembali"
              type="date"
              value={form.return_date || ""}
              onChange={(e) => setForm({ ...form, return_date: e.target.value })}
              required
            />
          </div>
          <Textarea
            label="Tujuan Peminjaman"
            value={form.purpose || ""}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            placeholder="Jelaskan keperluan dan kegiatan peminjaman barang ini..."
            required
            rows={3}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setBorrowModal({ open: false, item: null })}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Mengirim Pengajuan..." : "Ajukan Peminjaman"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
