import { useEffect, useState } from "react";
import { Search, Folder, FileText, AlertTriangle, Archive, Eye, Lock } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Textarea } from "../../components/ui/Input";
import DriveFolderBrowser from "../../components/ui/DriveFolderBrowser";
import FilterChips from "../../components/ui/FilterChips";
import { SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../contexts/ToastContext";

const CATEGORIES = [
  "arsip_divisi",
  "arsip_karya",
  "arsip_inovasi",
  "lpj",
  "arsip_kegiatan",
  "proposal",
  "surat_masuk",
  "surat_keluar",
  "notulen",
  "sk",
  "keuangan",
  "sertifikat",
];

export default function ArchivesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [previewModal, setPreviewModal] = useState({ open: false, archive: null, previewUrl: null });
  const [requestModal, setRequestModal] = useState({ open: false, archive: null });
  const [reason, setReason] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [reqError, setReqError] = useState("");

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    fetchArchives();
  }, [search, filterCat, filterYear]);

  const fetchArchives = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterCat) params.set("category", filterCat);
    if (filterYear) params.set("year", filterYear);
    api.get(`/archives?${params}`)
      .then((r) => setArchives(r.data.archives || []))
      .catch(() => setArchives([]))
      .finally(() => setLoading(false));
  };

  const fetchAvailableYears = async () => {
    try {
      const res = await api.get("/archives/years");
      setAvailableYears(res.data.years || []);
    } catch (err) {
      console.error("Failed to fetch years:", err);
      setAvailableYears(Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i));
    }
  };

  const handleOpenDoc = async (archive) => {
    try {
      const accessRes = await api.get(`/archives/${archive.id}/access-check`);
      if (accessRes.data.hasAccess) {
        try {
          const previewRes = await api.get(`/archives/${archive.id}/preview`);
          setPreviewModal({ open: true, archive, previewUrl: previewRes.data.previewUrl });
        } catch (err) {
          const msg = err.response?.data?.message || "Gagal memuat preview dokumen.";
          showToast(msg, "error");
        }
      } else {
        setReason("");
        setReqError("");
        setRequestModal({ open: true, archive });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal memeriksa izin akses arsip.";
      showToast(msg, "error");
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setReqError("Alasan wajib diisi.");
      return;
    }
    setRequesting(true);
    setReqError("");
    try {
      await api.post("/access-requests", { archive_id: requestModal.archive.id, reason });
      setRequestModal({ open: false, archive: null });
      showToast("Permintaan akses berhasil dikirim! Tunggu persetujuan admin.", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal mengirim permintaan akses.";
      setReqError(msg);
      showToast(msg, "error");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Arsip Dokumen</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Cari dan akses dokumen arsip UKM secara terpusat
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul arsip atau nomor dokumen..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] placeholder-slate-400 shadow-xs"
            />
          </div>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs"
          >
            <option value="">Semua Periode</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                Periode {y}
              </option>
            ))}
          </select>
        </div>

        <FilterChips
          categories={CATEGORIES}
          selected={filterCat}
          onSelect={setFilterCat}
          multiple={true}
          allLabel="Semua Kategori"
        />
      </div>

      {/* Table Content */}
      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : archives.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="Dokumen Tidak Ditemukan"
          description={
            search || filterCat || filterYear
              ? "Tidak ada arsip dokumen yang cocok dengan filter atau kata kunci yang dipilih."
              : "Belum ada dokumen arsip yang diunggah ke dalam sistem."
          }
          actionLabel={search || filterCat || filterYear ? "Reset Filter" : undefined}
          onAction={
            search || filterCat || filterYear
              ? () => {
                  setSearch("");
                  setFilterCat("");
                  setFilterYear("");
                }
              : undefined
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60">
                <tr>
                  {["No. Arsip", "Judul", "Kategori", "Periode", "Tipe", "Divisi", "Akses", "Aksi"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {archives.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {a.archive_number}
                    </td>
                    <td className="px-4 py-3.5">
                      <div
                        className="text-slate-900 dark:text-slate-100 font-medium max-w-56 truncate"
                        title={a.title}
                      >
                        {a.title}
                      </div>
                      {a.description && (
                        <div
                          className="text-xs text-slate-500 dark:text-slate-400 max-w-56 truncate mt-0.5"
                          title={a.description}
                        >
                          {a.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 capitalize text-xs">
                      {a.category?.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] border border-sky-200 dark:border-sky-800 rounded text-xs font-medium">
                        {a.year}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                          a.drive_type === "folder"
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        {a.drive_type === "folder" ? (
                          <>
                            <Folder className="w-3.5 h-3.5" /> Folder
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5" /> File
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 text-xs">
                      {a.division || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 flex-wrap max-w-40" title={a.access_level}>
                        {a.access_level?.split(",").map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded text-[10px] capitalize font-medium"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Button size="sm" onClick={() => handleOpenDoc(a)}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> Buka
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal.open}
        onClose={() => setPreviewModal({ open: false, archive: null, previewUrl: null })}
        title={previewModal.archive?.title || "Preview Dokumen"}
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center flex-wrap gap-3 text-xs">
            <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] border border-sky-200 dark:border-sky-800 rounded font-medium">
              Periode {previewModal.archive?.year}
            </span>
            <span className="text-slate-600 dark:text-slate-400 capitalize font-medium">
              {previewModal.archive?.category?.replace(/_/g, " ")}
            </span>
            <div className="flex gap-1 flex-wrap">
              {previewModal.archive?.access_level?.split(",").map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded capitalize"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Dokumen ini hanya untuk ditinjau. Dilarang mendistribusikan konten ini keluar organisasi.</span>
          </div>

          {previewModal.archive?.drive_type === "folder" ? (
            <DriveFolderBrowser
              rootFolderId={previewModal.archive?.drive_file_id}
              rootFolderName={previewModal.archive?.title}
            />
          ) : (
            <div
              className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner bg-slate-900"
              style={{ height: "520px" }}
            >
              {previewModal.previewUrl && (
                <>
                  <iframe
                    src={previewModal.previewUrl}
                    className="w-full h-full"
                    title="Document Preview"
                    allow="autoplay"
                  />
                  <div
                    className="absolute top-0 right-0 w-16 h-16 z-10 bg-transparent cursor-not-allowed"
                    title="Pop-out dibatasi"
                  />
                </>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Request Access Modal */}
      <Modal
        isOpen={requestModal.open}
        onClose={() => setRequestModal({ open: false, archive: null })}
        title="Ajukan Permintaan Akses"
        size="md"
      >
        <form onSubmit={handleRequestAccess} className="space-y-4">
          <div className="p-3.5 bg-sky-50 dark:bg-slate-700/50 rounded-xl border border-sky-100 dark:border-slate-600">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
              {requestModal.archive?.title}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Dokumen ini bersifat terbatas dan memerlukan persetujuan admin UKM untuk dapat diakses.
            </div>
          </div>

          {reqError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {reqError}
            </div>
          )}

          <Textarea
            label="Alasan Permintaan Akses"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Jelaskan secara rinci mengapa Anda memerlukan akses ke dokumen arsip ini..."
            rows={4}
            required
          />

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Jika disetujui, akses akan diberikan secara otomatis selama masa aktif (default: 24 jam).
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRequestModal({ open: false, archive: null })}
            >
              Batal
            </Button>
            <Button type="submit" disabled={requesting}>
              {requesting ? "Mengirim Permintaan..." : "Kirim Permintaan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
