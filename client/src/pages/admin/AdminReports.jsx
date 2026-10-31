import { useEffect, useState, useMemo } from "react";
import {
  Download,
  TrendingUp,
  Package,
  Archive,
  CheckCircle2,
  Calendar,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import api from "../../api/axios";
import Button from "../../components/ui/Button";
import { StatCard } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../contexts/ToastContext";

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [items, setItems] = useState([]);
  const [archives, setArchives] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [sumRes, borRes, itmRes, arcRes] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/borrowings"),
        api.get("/items"),
        api.get("/archives"),
      ]);

      setSummary(sumRes.data);
      setBorrowings(borRes.data.borrowings || []);
      setItems(itmRes.data.items || []);
      setArchives(arcRes.data.archives || []);
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);
      showToast("Gagal memuat beberapa data laporan.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 1. Calculate Monthly Borrowing Trends for current year
  const monthlyTrends = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];
    const counts = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    borrowings.forEach((b) => {
      if (!b.borrow_date) return;
      const date = new Date(b.borrow_date);
      if (date.getFullYear() === currentYear) {
        counts[date.getMonth()] += Number(b.quantity) || 1;
      }
    });

    const maxVal = Math.max(...counts, 1);
    return months.map((month, idx) => ({
      month,
      count: counts[idx],
      heightPct: Math.round((counts[idx] / maxVal) * 100),
    }));
  }, [borrowings]);

  // 2. Calculate Top Borrowed Items
  const topItems = useMemo(() => {
    const itemMap = {};
    borrowings.forEach((b) => {
      const name = b.item_name || "Tanpa Nama";
      const qty = Number(b.quantity) || 1;
      itemMap[name] = (itemMap[name] || 0) + qty;
    });

    const sorted = Object.entries(itemMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const maxBorrow = sorted[0]?.count || 1;
    return sorted.map((item) => ({
      ...item,
      percentage: Math.round((item.count / maxBorrow) * 100),
    }));
  }, [borrowings]);

  // 3. Calculate Archive Category Distribution
  const archiveDistribution = useMemo(() => {
    const catMap = {};
    archives.forEach((a) => {
      const cat = a.category || "lainnya";
      catMap[cat] = (catMap[cat] || 0) + 1;
    });

    const total = archives.length || 1;
    return Object.entries(catMap)
      .map(([cat, count]) => ({
        category: cat.replace(/_/g, " "),
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [archives]);

  // 4. Calculate Key Metrics
  const metrics = useMemo(() => {
    const totalBor = borrowings.length;
    const returned = borrowings.filter((b) => b.status === "returned").length;
    const late = borrowings.filter((b) => b.status === "late").length;
    const active = borrowings.filter((b) => b.status === "borrowed" || b.status === "approved").length;
    const onTimeRate = totalBor > 0 ? Math.round(((totalBor - late) / totalBor) * 100) : 100;

    return {
      totalBor,
      returned,
      active,
      onTimeRate,
      totalArchives: archives.length,
      totalItems: items.length,
    };
  }, [borrowings, archives, items]);

  // 5. CSV Export Handler
  const handleExportCSV = () => {
    try {
      if (borrowings.length === 0) {
        showToast("Tidak ada data peminjaman untuk diekspor.", "info");
        return;
      }

      const headers = ["No", "Nama Peminjam", "Email", "Nama Barang", "Kode Barang", "Jumlah", "Tanggal Pinjam", "Tanggal Kembali", "Status"];
      const rows = borrowings.map((b, idx) => [
        idx + 1,
        `"${b.user_name?.replace(/"/g, '""') || "-"}"`,
        `"${b.user_email?.replace(/"/g, '""') || "-"}"`,
        `"${b.item_name?.replace(/"/g, '""') || "-"}"`,
        `"${b.item_code?.replace(/"/g, '""') || "-"}"`,
        b.quantity || 1,
        b.borrow_date ? new Date(b.borrow_date).toISOString().split("T")[0] : "-",
        b.return_date ? new Date(b.return_date).toISOString().split("T")[0] : "-",
        `"${b.status || "-"}"`,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `laporan-simpar-ukm-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Laporan CSV berhasil diunduh!", "success");
    } catch (err) {
      console.error("Export error:", err);
      showToast("Gagal mengekspor laporan CSV.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Laporan & Analitik
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Rekap statistik peminjaman barang, sirkulasi aset, dan dokumen arsip UKM
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchReportData}
            disabled={loading}
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>
          <Button size="sm" onClick={handleExportCSV} disabled={loading || borrowings.length === 0}>
            <Download className="w-4 h-4 mr-1.5" />
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* Overview StatCards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-36" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Peminjaman"
            value={metrics.totalBor}
            sub={`${metrics.returned} telah dikembalikan`}
            icon={TrendingUp}
            variant="default"
          />
          <StatCard
            label="Sedang Dipinjam"
            value={metrics.active}
            sub="Peminjaman aktif berjalan"
            icon={Package}
            variant={metrics.active > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Ketepatan Waktu"
            value={`${metrics.onTimeRate}%`}
            sub="Rasio pengembalian tepat"
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            label="Dokumen Terarsip"
            value={metrics.totalArchives}
            sub="Dokumen resmi UKM tersimpan"
            icon={Archive}
            variant="default"
          />
        </div>
      )}

      {/* Main Bar Chart: Monthly Borrowing Volume */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
              Tren Peminjaman Bulanan ({new Date().getFullYear()})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Volume total unit barang yang dipinjam setiap bulannya
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] border border-sky-200 dark:border-sky-800 rounded-full w-fit">
            Tahun Berjalan
          </span>
        </div>

        {loading ? (
          <div className="h-56 flex items-end justify-between gap-2 pt-8 px-4 overflow-x-auto">
            <div className="min-w-[500px] flex items-end justify-between gap-2 w-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <Skeleton className="w-full h-32 rounded-t-md" />
                  <Skeleton className="w-6 h-3" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-4 overflow-x-auto">
            <div className="h-52 min-w-[500px] flex items-end gap-2 sm:gap-4 px-2">
              {monthlyTrends.map((col) => (
                <div key={col.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 opacity-80 group-hover:opacity-100 transition-opacity">
                    {col.count > 0 ? col.count : ""}
                  </span>
                  <div
                    className="w-full bg-sky-100 dark:bg-slate-700/50 hover:bg-[#0284c7]/30 dark:hover:bg-[#38bdf8]/30 rounded-t-md transition-all duration-300 relative flex items-end"
                    style={{ height: "100%" }}
                  >
                    <div
                      className="w-full bg-[#0284c7] dark:bg-[#38bdf8] rounded-t-md transition-all duration-500 group-hover:brightness-110 shadow-xs"
                      style={{ height: `${Math.max(col.heightPct, col.count > 0 ? 8 : 2)}%` }}
                      title={`${col.month}: ${col.count} peminjaman`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {col.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two Column Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Borrowed Items */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
              Barang Paling Sering Dipinjam
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              5 barang dengan frekuensi peminjaman tertinggi
            </p>
          </div>

          {loading ? (
            <div className="space-y-4 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : topItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Belum ada data peminjaman barang tercatat.
            </div>
          ) : (
            <div className="space-y-4 py-1">
              {topItems.map((item, idx) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                      <span className="text-slate-400 mr-2 font-mono">#{idx + 1}</span>
                      {item.name}
                    </span>
                    <span className="font-semibold text-[#0284c7] dark:text-[#38bdf8] shrink-0">
                      {item.count} unit
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0284c7] dark:bg-[#38bdf8] h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Archives Breakdown */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
              Distribusi Kategori Dokumen Arsip
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Komposisi jenis dokumen yang tersimpan dalam sistem
            </p>
          </div>

          {loading ? (
            <div className="space-y-4 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : archiveDistribution.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Belum ada dokumen arsip tersimpan.
            </div>
          ) : (
            <div className="space-y-4 py-1">
              {archiveDistribution.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 capitalize truncate pr-2">
                      {cat.category}
                    </span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                      {cat.count} dok ({cat.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 dark:bg-sky-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}