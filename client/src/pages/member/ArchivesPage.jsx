import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Textarea } from "../../components/ui/Input";

const CATEGORIES = ["arsip_divisi","arsip_karya","arsip_inovasi","lpj","arsip_kegiatan","proposal","surat_masuk","surat_keluar","notulen","sk","keuangan","sertifikat"];

export default function ArchivesPage() {
  const { user } = useAuth();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [previewModal, setPreviewModal] = useState({ open: false, archive: null, previewUrl: null });
  const [requestModal, setRequestModal] = useState({ open: false, archive: null });
  const [reason, setReason] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [reqError, setReqError] = useState("");

  const fetchArchives = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterCat) params.set("category", filterCat);
    if (filterYear) params.set("year", filterYear);
    api.get(`/archives?${params}`).then((r) => setArchives(r.data.archives)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchArchives(); }, [search, filterCat, filterYear]);

  const handleOpenDoc = async (archive) => {
    try {
      const accessRes = await api.get(`/archives/${archive.id}/access-check`);
      if (accessRes.data.hasAccess) {
        const previewRes = await api.get(`/archives/${archive.id}/preview`);
        setPreviewModal({ open: true, archive, previewUrl: previewRes.data.previewUrl });
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

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const accessIcon = { public: "🌐", internal: "🔒", restricted: "🔐", private: "🚫" };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-100">Arsip Dokumen</h1><p className="text-slate-400 text-sm mt-1">Cari dan akses dokumen arsip UKM</p></div>

      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Cari arsip..."
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-48 placeholder-slate-500" />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g," ").toUpperCase()}</option>)}
        </select>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Semua Tahun</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-700/50">
              <tr>
                {["No. Arsip","Judul","Kategori","Tahun","Divisi","Akses","Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Memuat...</td></tr>
              : archives.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Tidak ada arsip ditemukan.</td></tr>
              : archives.map((a) => (
                <tr key={a.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.archive_number}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-200 font-medium max-w-52 truncate" title={a.title}>{a.title}</div>
                    {a.description && <div className="text-xs text-slate-500 max-w-52 truncate">{a.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 capitalize">{a.category?.replace(/_/g," ")}</td>
                  <td className="px-4 py-3 text-slate-300">{a.year}</td>
                  <td className="px-4 py-3 text-slate-400">{a.division || "—"}</td>
                  <td className="px-4 py-3"><span className="mr-1">{accessIcon[a.access_level]}</span><Badge status={a.access_level} /></td>
                  <td className="px-4 py-3">
                    <Button size="sm" onClick={() => handleOpenDoc(a)}>
                      {a.access_level === "restricted" ? "🔐 Buka" : "👁️ Lihat"}
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
          <div className="flex items-center gap-4 text-sm">
            <Badge status={previewModal.archive?.access_level} />
            <span className="text-slate-500">{previewModal.archive?.year}</span>
            <span className="text-slate-500 capitalize">{previewModal.archive?.category?.replace(/_/g," ")}</span>
          </div>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-400">
            ⚠️ Dokumen ini hanya untuk dilihat. Dilarang mendistribusikan konten ini.
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-700" style={{ height: "520px" }}>
            {previewModal.previewUrl && (
              <iframe src={previewModal.previewUrl} className="w-full h-full" title="Document Preview" allow="autoplay" />
            )}
          </div>
        </div>
      </Modal>

      {/* Request Access Modal */}
      <Modal isOpen={requestModal.open} onClose={() => setRequestModal({ open: false })} title="Ajukan Permintaan Akses" size="md">
        <form onSubmit={handleRequestAccess} className="space-y-4">
          <div className="p-3 bg-slate-700/40 rounded-lg">
            <div className="text-sm font-medium text-slate-200">{requestModal.archive?.title}</div>
            <div className="text-xs text-slate-500 mt-1">Dokumen ini memerlukan persetujuan admin untuk dapat diakses.</div>
          </div>
          {reqError && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{reqError}</div>}
          <Textarea label="Alasan Permintaan Akses" value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="Jelaskan mengapa Anda memerlukan akses ke dokumen ini..." rows={4} required />
          <div className="text-xs text-slate-500">Jika disetujui, akses akan diberikan selama 1 x 24 jam (default).</div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setRequestModal({ open: false })}>Batal</Button>
            <Button type="submit" disabled={requesting}>{requesting ? "Mengirim..." : "Kirim Permintaan"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
