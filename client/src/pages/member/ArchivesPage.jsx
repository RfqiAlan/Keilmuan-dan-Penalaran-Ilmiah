import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Textarea } from "../../components/ui/Input";
import KtaUploadModal from "../../components/ui/KtaUploadModal";
import DriveFolderBrowser from "../../components/ui/DriveFolderBrowser";

const CATEGORIES = ["arsip_divisi","arsip_karya","arsip_inovasi","lpj","arsip_kegiatan","proposal","surat_masuk","surat_keluar","notulen","sk","keuangan","sertifikat"];

export default function ArchivesPage() {
  const { user } = useAuth();
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

  // KTA state
  const [hasKta, setHasKta] = useState(null);
  const [ktaModal, setKtaModal] = useState(false);
  const [pendingArchive, setPendingArchive] = useState(null);

  useEffect(() => {
    fetchAvailableYears();
    checkKtaStatus();
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
    api.get(`/archives?${params}`).then((r) => setArchives(r.data.archives)).finally(() => setLoading(false));
  };

  const fetchAvailableYears = async () => {
    try {
      const res = await api.get("/archives/years");
      setAvailableYears(res.data.years || []);
    } catch (err) {
      console.error("Failed to fetch years:", err);
      // Fallback to generated years
      setAvailableYears(Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i));
    }
  };

  const checkKtaStatus = async () => {
    try {
      const res = await api.get("/users/kta/check");
      setHasKta(res.data.hasKta);
    } catch (err) {
      console.error("Failed to check KTA:", err);
      setHasKta(false);
    }
  };

  const handleOpenDoc = async (archive) => {
    // Check KTA first
    if (!hasKta) {
      setPendingArchive(archive);
      setKtaModal(true);
      return;
    }

    try {
      const accessRes = await api.get(`/archives/${archive.id}/access-check`);
      if (accessRes.data.hasAccess) {
        try {
          const previewRes = await api.get(`/archives/${archive.id}/preview`);
          setPreviewModal({ open: true, archive, previewUrl: previewRes.data.previewUrl });
        } catch (err) {
          // Handle KTA required from backend
          if (err.response?.data?.code === "KTA_REQUIRED") {
            setPendingArchive(archive);
            setKtaModal(true);
            return;
          }
          alert(err.response?.data?.message || "Gagal memuat preview.");
        }
      } else {
        setReason(""); setReqError("");
        setRequestModal({ open: true, archive });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memeriksa akses.");
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { setReqError("Alasan wajib diisi."); return; }
    setRequesting(true); setReqError("");
    try {
      await api.post("/access-requests", { archive_id: requestModal.archive.id, reason });
      setRequestModal({ open: false });
      alert("Permintaan akses berhasil dikirim! Tunggu persetujuan admin.");
    } catch (err) {
      setReqError(err.response?.data?.message || "Gagal mengirim permintaan.");
    } finally { setRequesting(false); }
  };

  const handleKtaSuccess = () => {
    setHasKta(true);
    if (pendingArchive) {
      setTimeout(() => {
        handleOpenDoc(pendingArchive);
        setPendingArchive(null);
      }, 300);
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Arsip Dokumen</h1><p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Cari dan akses dokumen arsip UKM</p></div>

      {/* KTA Warning Banner */}
      {hasKta === false && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
          <span className="text-2xl">🪪</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-amber-300">Kartu Tanda Anggota Belum Diunggah</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Anda harus mengunggah KTA terlebih dahulu untuk bisa melihat arsip dokumen.</div>
          </div>
          <Button size="sm" onClick={() => setKtaModal(true)}>Upload KTA</Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Cari arsip..."
          className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8DE] flex-1 min-w-48 placeholder-slate-500" />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8DE]">
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g," ").toUpperCase()}</option>)}
        </select>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8DE]">
          <option value="">Semua Periode</option>
          {availableYears.map((y) => <option key={y} value={y}>Periode {y}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/50">
              <tr>
                {["No. Arsip","Judul","Kategori","Periode","Tipe","Divisi","Akses","Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-slate-600 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-500">Memuat...</td></tr>
              : archives.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-500">Tidak ada arsip ditemukan.</td></tr>
              : archives.map((a) => (
                <tr key={a.id} className="hover:bg-white dark:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{a.archive_number}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800 dark:text-slate-200 font-medium max-w-52 truncate" title={a.title}>{a.title}</div>
                    {a.description && <div className="text-xs text-slate-500 dark:text-slate-500 max-w-52 truncate">{a.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize">{a.category?.replace(/_/g," ")}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded text-xs font-medium">
                      {a.year}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${a.drive_type === 'folder' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {a.drive_type === 'folder' ? '📁 Folder' : '📄 File'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{a.division || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap max-w-40" title={a.access_level}>
                      {a.access_level?.split(",").map(r => (
                        <span key={r} className="px-2 py-0.5 bg-[#4EA8DE]/10 text-[#4EA8DE] border border-[#4EA8DE]/20 rounded text-[10px] capitalize">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" onClick={() => handleOpenDoc(a)}>
                      Buka
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={previewModal.open} onClose={() => setPreviewModal({ open: false })} title={previewModal.archive?.title || "Preview Dokumen"} size="xl">
        <div className="space-y-3">
          <div className="flex items-center flex-wrap gap-4 text-sm">
            <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded text-xs font-medium">
              Periode {previewModal.archive?.year}
            </span>
            <span className="text-slate-500 dark:text-slate-500 capitalize">{previewModal.archive?.category?.replace(/_/g," ")}</span>
            <div className="flex gap-1 flex-wrap">
              {previewModal.archive?.access_level?.split(",").map(r => (
                <span key={r} className="px-2 py-0.5 bg-[#4EA8DE]/10 text-[#4EA8DE] border border-[#4EA8DE]/20 rounded text-[10px] capitalize">{r}</span>
              ))}
            </div>
          </div>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-400">
            ⚠️ Dokumen ini hanya untuk dilihat. Dilarang mendistribusikan konten ini.
          </div>
          {previewModal.archive?.drive_type === 'folder' ? (
            <DriveFolderBrowser
              rootFolderId={previewModal.archive?.drive_file_id}
              rootFolderName={previewModal.archive?.title}
            />
          ) : (
            <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative" style={{ height: "520px" }}>
              {previewModal.previewUrl && (
                <>
                  <iframe src={previewModal.previewUrl} className="w-full h-full" title="Document Preview" allow="autoplay" />
                  <div className="absolute top-0 right-0 w-16 h-16 z-10 bg-transparent cursor-not-allowed" title="Pop-out dibatasi" />
                </>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Request Access Modal */}
      <Modal isOpen={requestModal.open} onClose={() => setRequestModal({ open: false })} title="Ajukan Permintaan Akses" size="md">
        <form onSubmit={handleRequestAccess} className="space-y-4">
          <div className="p-3 bg-white dark:bg-slate-700/40 rounded-lg">
            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{requestModal.archive?.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Dokumen ini memerlukan persetujuan admin untuk dapat diakses.</div>
          </div>
          {reqError && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{reqError}</div>}
          <Textarea label="Alasan Permintaan Akses" value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Jelaskan mengapa Anda memerlukan akses ke dokumen ini..." rows={4} required />
          <div className="text-xs text-slate-500 dark:text-slate-500">Jika disetujui, akses akan diberikan selama 1 x 24 jam (default).</div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setRequestModal({ open: false })}>Batal</Button>
            <Button type="submit" disabled={requesting}>{requesting ? "Mengirim..." : "Kirim Permintaan"}</Button>
          </div>
        </form>
      </Modal>

      {/* KTA Upload Modal */}
      <KtaUploadModal
        isOpen={ktaModal}
        onClose={() => { setKtaModal(false); setPendingArchive(null); }}
        onSuccess={handleKtaSuccess}
      />
    </div>
  );
}
