import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, Clock, Calendar } from "lucide-react";
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
  const [durationMode, setDurationMode] = useState("hours"); // 'hours' | 'days'
  const [borrowDate, setBorrowDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [selectedHourChip, setSelectedHourChip] = useState(3);
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

    const now = new Date();
    const curHour = now.getHours();
    const startH = String(Math.min(curHour + 1, 21)).padStart(2, "0") + ":00";
    const endH = String(Math.min(curHour + 4, 23)).padStart(2, "0") + ":00";

    setDurationMode("hours");
    setSelectedHourChip(3);
    setBorrowDate(today);
    setStartTime(startH);
    setEndTime(endH);

    setForm({ item_id: item.id, quantity: 1, borrow_date: today, return_date: tomorrow, purpose: "" });
    setError("");
    setBorrowModal({ open: true, item });
  };

  const applyHourPreset = (hours) => {
    setSelectedHourChip(hours);
    if (!startTime) return;
    const [h, m] = startTime.split(":").map(Number);
    const endH = h + hours;
    if (endH < 24) {
      setEndTime(`${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    } else {
      setEndTime("23:59");
    }
  };

  const handleStartTimeChange = (val) => {
    setStartTime(val);
    if (selectedHourChip && val) {
      const [h, m] = val.split(":").map(Number);
      const endH = h + selectedHourChip;
      if (endH < 24) {
        setEndTime(`${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      } else {
        setEndTime("23:59");
      }
    }
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    let payloadBorrowDate = form.borrow_date;
    let payloadReturnDate = form.return_date;

    if (durationMode === "hours") {
      if (!borrowDate || !startTime || !endTime) {
        setError("Tanggal dan jam pinjam/kembali wajib diisi.");
        setSaving(false);
        return;
      }
      payloadBorrowDate = `${borrowDate}T${startTime}:00`;
      payloadReturnDate = `${borrowDate}T${endTime}:00`;

      if (new Date(payloadReturnDate) <= new Date(payloadBorrowDate)) {
        setError("Jam selesai/kembali harus lebih besar dari jam mulai pinjam.");
        setSaving(false);
        return;
      }
    }

    try {
      await api.post("/borrowings", {
        ...form,
        borrow_date: payloadBorrowDate,
        return_date: payloadReturnDate,
      });
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
                  <div className="relative w-full h-44 mb-4 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div
                      style={{ display: "none" }}
                      className="w-full h-full bg-sky-50/60 dark:bg-slate-700/40 flex-col items-center justify-center text-slate-400 dark:text-slate-500 border border-dashed border-sky-200 dark:border-slate-600"
                    >
                      <Package className="w-10 h-10 stroke-[1.5] text-[#0284c7]/70 dark:text-sky-400/60 mb-1" />
                      <span className="text-xs font-medium">Foto Belum Tersedia</span>
                    </div>
                  </div>
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
          <div className="flex items-center gap-3.5 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-sm border border-slate-200 dark:border-slate-600">
            {borrowModal.item?.image_url ? (
              <img
                src={borrowModal.item.image_url}
                alt={borrowModal.item.name}
                className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-600 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 bg-sky-50 dark:bg-slate-700 rounded-lg flex items-center justify-center text-[#0284c7] dark:text-[#38bdf8] border border-sky-200 dark:border-slate-600 shrink-0">
                <Package className="w-6 h-6 stroke-[1.5]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {borrowModal.item?.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {borrowModal.item?.code} · <span className="capitalize">{borrowModal.item?.category?.replace(/_/g, " ")}</span>
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Stok siap pinjam: <strong>{borrowModal.item?.available_stock} unit</strong>
              </div>
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

          {/* Opsi Durasi: Jam vs Hari */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Opsi Durasi Peminjaman
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDurationMode("hours")}
                className={`cursor-pointer py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  durationMode === "hours"
                    ? "bg-white dark:bg-slate-800 text-[#0284c7] dark:text-[#38bdf8] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Hitungan Jam (Hari yang Sama)
              </button>
              <button
                type="button"
                onClick={() => setDurationMode("days")}
                className={`cursor-pointer py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  durationMode === "days"
                    ? "bg-white dark:bg-slate-800 text-[#0284c7] dark:text-[#38bdf8] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Hitungan Hari (Rentang Tanggal)
              </button>
            </div>
          </div>

          {durationMode === "hours" ? (
            <div className="space-y-3 p-3.5 bg-sky-50/50 dark:bg-slate-800/60 rounded-xl border border-sky-100 dark:border-slate-700">
              <Input
                label="Tanggal Kegiatan"
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilihan Cepat Durasi:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4, 6, 8, 12].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => applyHourPreset(hrs)}
                      className={`cursor-pointer px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                        selectedHourChip === hrs
                          ? "bg-[#0284c7] text-white border-[#0284c7]"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0284c7]/40"
                      }`}
                    >
                      {hrs} Jam
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Input
                  label="Jam Mulai"
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required
                />
                <Input
                  label="Jam Selesai (Kembali)"
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setSelectedHourChip(null);
                  }}
                  required
                />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8] shrink-0" />
                <span>
                  Barang dipinjam dari pukul <strong className="text-slate-800 dark:text-slate-200">{startTime}</strong> sampai <strong className="text-slate-800 dark:text-slate-200">{endTime}</strong>
                </span>
              </div>
            </div>
          ) : (
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
          )}
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
