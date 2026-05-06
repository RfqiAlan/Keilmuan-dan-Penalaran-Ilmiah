import { useEffect, useState } from "react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select, Textarea } from "../../components/ui/Input";

const CATEGORIES = ["arsip_divisi","arsip_karya","arsip_inovasi","lpj","arsip_kegiatan","proposal","surat_masuk","surat_keluar","notulen","sk","keuangan","sertifikat"];
const ACCESS_LEVELS = ["public","internal","restricted","private"];

export default function AdminArchives() {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "create", archive: null });
  const [previewModal, setPreviewModal] = useState({ open: false, archive: null });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchArchives = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterCat) params.set("category", filterCat);
    if (filterYear) params.set("year", filterYear);
    api.get(`/archives?${params}`).then((r) => setArchives(r.data.archives)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchArchives(); }, [search, filterCat, filterYear]);

  const openCreate = () => {
    setForm({ archive_number: "", title: "", year: new Date().getFullYear(), category: "lpj", division: "", description: "", drive_file_id: "", access_level: "internal" });
    setError("");
    setModal({ open: true, mode: "create", archive: null });
  };

  const openEdit = (archive) => { setForm({ ...archive }); setError(""); setModal({ open: true, mode: "edit", archive }); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (modal.mode === "create") await api.post("/archives", form);
      else await api.put(`/archives/${modal.archive.id}`, form);
      setModal({ open: false }); fetchArchives();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (archive) => {
    if (!confirm(`Hapus arsip "${archive.title}"?`)) return;
    try { await api.delete(`/archives/${archive.id}`); fetchArchives(); }
    catch (err) { alert(err.response?.data?.message || "Gagal menghapus."); }
  };

  const openPreview = (archive) => { setPreviewModal({ open: true, archive }); };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-100">Manajemen Arsip</h1><p className="text-slate-400 text-sm mt-1">Kelola dokumen arsip UKM</p></div>
        <Button onClick={openCreate}>+ Tambah Arsip</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Cari arsip..."
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-48 placeholder-slate-500" />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ").toUpperCase()}</option>)}
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
                {["No. Arsip","Judul","Kategori","Tahun","Akses","Diunggah","Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Memuat...</td></tr>
              ) : archives.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Tidak ada data arsip.</td></tr>
              ) : archives.map((a) => (
                <tr key={a.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.archive_number}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium max-w-48 truncate" title={a.title}>{a.title}</td>
                  <td className="px-4 py-3 text-slate-400 capitalize">{a.category?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-slate-300">{a.year}</td>
                  <td className="px-4 py-3"><Badge status={a.access_level} /></td>
                  <td className="px-4 py-3 text-slate-400">{a.uploaded_by_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openPreview(a)}>👁️</Button>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(a)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(a)}>Hapus</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === "create" ? "Tambah Arsip" : "Edit Arsip"} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nomor Arsip" value={form.archive_number || ""} onChange={(e) => setForm({ ...form, archive_number: e.target.value })} required />
            <Input label="Tahun" type="number" value={form.year || ""} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
          </div>
          <Input label="Judul Dokumen" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Kategori" value={form.category || "lpj"} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ").toUpperCase()}</option>)}
            </Select>
            <Select label="Tingkat Akses" value={form.access_level || "internal"} onChange={(e) => setForm({ ...form, access_level: e.target.value })}>
              {ACCESS_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
          <Input label="Divisi" value={form.division || ""} onChange={(e) => setForm({ ...form, division: e.target.value })} placeholder="Contoh: Pengurus, Divisi Media" />
          <Input label="Google Drive File ID" value={form.drive_file_id || ""} onChange={(e) => setForm({ ...form, drive_file_id: e.target.value })} required placeholder="ID dari URL Google Drive" />
          <Textarea label="Deskripsi" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal({ open: false })}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={previewModal.open} onClose={() => setPreviewModal({ open: false })} title={previewModal.archive?.title || "Preview Dokumen"} size="xl">
        {previewModal.archive && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><span className="text-slate-500">Kategori:</span> <span className="text-slate-200 capitalize">{previewModal.archive.category?.replace(/_/g," ")}</span></div>
              <div><span className="text-slate-500">Tahun:</span> <span className="text-slate-200">{previewModal.archive.year}</span></div>
              <div><span className="text-slate-500">Akses:</span> <Badge status={previewModal.archive.access_level} /></div>
            </div>
            <div className="rounded-lg overflow-hidden border border-slate-700 relative" style={{ height: "500px" }}>
              <iframe
                src={`https://drive.google.com/file/d/${previewModal.archive.drive_file_id}/preview`}
                className="w-full h-full"
                title="Document Preview"
                allow="autoplay"
              />
              <div className="absolute top-0 right-0 w-16 h-16 z-10 bg-transparent cursor-not-allowed" title="Pop-out dibatasi" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
