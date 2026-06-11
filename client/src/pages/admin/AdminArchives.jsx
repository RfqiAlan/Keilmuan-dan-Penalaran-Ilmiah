import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select, Textarea } from "../../components/ui/Input";
import DriveFolderBrowser from "../../components/ui/DriveFolderBrowser";

const CATEGORIES = ["arsip_divisi","arsip_karya","arsip_inovasi","lpj","arsip_kegiatan","proposal","surat_masuk","surat_keluar","notulen","sk","keuangan","sertifikat"];
const ROLES = ["admin", "ketua", "sekretaris", "bendahara", "koordinator", "anggota", "alumni"];
const DUAL_APPROVAL_CATEGORIES = ["sk", "lpj", "arsip_karya"];

const APPROVAL_LABELS = {
  draft: { label: "Draft", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  approved_admin: { label: "Menunggu Sekretaris", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  approved_sekum: { label: "Menunggu Admin", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  approved: { label: "Disetujui", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

export default function AdminArchives() {
  const { user } = useAuth();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterApproval, setFilterApproval] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "create", archive: null });
  const [previewModal, setPreviewModal] = useState({ open: false, archive: null });
  const [approveModal, setApproveModal] = useState({ open: false, archive: null });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchArchives = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterCat) params.set("category", filterCat);
    if (filterYear) params.set("year", filterYear);
    if (filterApproval) params.set("approval_status", filterApproval);
    api.get(`/archives?${params}`).then((r) => setArchives(r.data.archives)).finally(() => setLoading(false));
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

  useEffect(() => { fetchAvailableYears(); }, []);
  useEffect(() => { fetchArchives(); }, [search, filterCat, filterYear, filterApproval]);

  const openCreate = () => {
    setForm({ archive_number: "", title: "", year: new Date().getFullYear(), category: "lpj", division: "", description: "", drive_file_id: "", access_level: "admin" });
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
      setModal({ open: false }); fetchArchives(); fetchAvailableYears();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (archive) => {
    if (!confirm(`Hapus arsip "${archive.title}"?`)) return;
    try { await api.delete(`/archives/${archive.id}`); fetchArchives(); }
    catch (err) { alert(err.response?.data?.message || "Gagal menghapus."); }
  };

  const handleRoleToggle = (role) => {
    let roles = form.access_level ? form.access_level.split(",") : ["admin"];
    if (roles.includes(role)) {
      if (role !== "admin") roles = roles.filter((r) => r !== role);
    } else {
      roles.push(role);
    }
    setForm({ ...form, access_level: roles.join(",") });
  };

  const openPreview = (archive) => { setPreviewModal({ open: true, archive }); };

  const handleApprove = async (archive) => {
    try {
      await api.put(`/archives/${archive.id}/approve`);
      fetchArchives();
      setApproveModal({ open: false });
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyetujui arsip.");
    }
  };

  // Check if current user can approve this archive
  const canApprove = (archive) => {
    if (archive.approval_status === "approved") return false;
    if (!DUAL_APPROVAL_CATEGORIES.includes(archive.category)) return false;
    if (user.role === "admin" && !archive.approved_by_admin) return true;
    if (user.role === "sekretaris" && !archive.approved_by_sekum) return true;
    return false;
  };

  const years = availableYears.length > 0 ? availableYears : Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-100">Manajemen Arsip</h1><p className="text-slate-400 text-sm mt-1">Kelola dokumen arsip UKM</p></div>
        <Button onClick={openCreate}>+ Tambah Arsip</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Cari arsip..."
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8DE] flex-1 min-w-48 placeholder-slate-500" />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8DE]">
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ").toUpperCase()}</option>)}
        </select>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8DE]">
          <option value="">Semua Periode</option>
          {years.map((y) => <option key={y} value={y}>Periode {y}</option>)}
        </select>
        <select value={filterApproval} onChange={(e) => setFilterApproval(e.target.value)}
          className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA8DE]">
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="approved_admin">Menunggu Sekretaris</option>
          <option value="approved_sekum">Menunggu Admin</option>
          <option value="approved">Disetujui</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-700/50">
              <tr>
                {["No. Arsip","Judul","Kategori","Periode","Tipe","Status","Akses","Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Memuat...</td></tr>
              ) : archives.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Tidak ada data arsip.</td></tr>
              ) : archives.map((a) => {
                const approvalInfo = APPROVAL_LABELS[a.approval_status] || APPROVAL_LABELS.approved;
                const needsDual = DUAL_APPROVAL_CATEGORIES.includes(a.category);

                return (
                  <tr key={a.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.archive_number}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium max-w-48 truncate" title={a.title}>{a.title}</td>
                    <td className="px-4 py-3 text-slate-400 capitalize">{a.category?.replace(/_/g, " ")}</td>
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
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${approvalInfo.color}`}>
                          {approvalInfo.label}
                        </span>
                        {needsDual && a.approval_status !== "approved" && (
                          <div className="flex gap-1 flex-wrap">
                            {a.approved_by_admin && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px]" title={`Admin: ${a.admin_approver_name}`}>
                                ✓ Admin
                              </span>
                            )}
                            {a.approved_by_sekum && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px]" title={`Sekretaris: ${a.sekum_approver_name}`}>
                                ✓ Sekum
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap max-w-40" title={a.access_level}>
                        {a.access_level?.split(",").map(r => (
                          <span key={r} className="px-2 py-0.5 bg-[#4EA8DE]/10 text-[#4EA8DE] border border-[#4EA8DE]/20 rounded text-[10px] capitalize">{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openPreview(a)}>👁️</Button>
                        {canApprove(a) && (
                          <Button size="sm" variant="ghost" onClick={() => setApproveModal({ open: true, archive: a })}
                            className="!text-emerald-400 hover:!bg-emerald-500/10">
                            ✓
                          </Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => openEdit(a)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(a)}>Hapus</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === "create" ? "Tambah Arsip" : "Edit Arsip"} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

          {/* Dual approval info */}
          {modal.mode === "create" && DUAL_APPROVAL_CATEGORIES.includes(form.category) && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400">
              ⚠️ Kategori <strong>{form.category?.replace(/_/g, " ").toUpperCase()}</strong> memerlukan persetujuan dari <strong>Admin</strong> dan <strong>Sekretaris</strong> sebelum bisa diakses oleh anggota.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input label="Nomor Arsip" value={form.archive_number || ""} onChange={(e) => setForm({ ...form, archive_number: e.target.value })} required />
            <Input label="Periode (Tahun)" type="number" value={form.year || ""} onChange={(e) => setForm({ ...form, year: e.target.value })} required placeholder="Contoh: 2024" />
          </div>
          <Input label="Judul Dokumen" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Kategori" value={form.category || "lpj"} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ").toUpperCase()}</option>)}
            </Select>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Akses Role</label>
              <div className="bg-slate-800/80 border border-slate-600 rounded-lg p-3 grid grid-cols-2 gap-2 h-32 overflow-y-auto">
                {ROLES.map((role) => {
                  const isChecked = (form.access_level || "").split(",").includes(role);
                  const isDisabled = role === "admin";
                  return (
                    <label key={role} className={`flex items-center gap-2 text-sm ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => handleRoleToggle(role)}
                        className="rounded border-slate-600 bg-slate-700 text-[#4EA8DE] focus:ring-[#4EA8DE]"
                      />
                      <span className="text-slate-200 capitalize">{role}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <Input label="Divisi" value={form.division || ""} onChange={(e) => setForm({ ...form, division: e.target.value })} placeholder="Contoh: Pengurus, Divisi Media" />
          <Input label="Link Google Drive" value={form.drive_file_id || ""} onChange={(e) => setForm({ ...form, drive_file_id: e.target.value })} required placeholder="Paste link Google Drive atau File ID" />
          <Textarea label="Deskripsi" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal({ open: false })}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>

      {/* Approve Modal */}
      <Modal isOpen={approveModal.open} onClose={() => setApproveModal({ open: false })} title="Konfirmasi Persetujuan Arsip" size="md">
        {approveModal.archive && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-700/40 rounded-lg space-y-2">
              <div className="text-sm font-medium text-slate-200">{approveModal.archive.title}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-slate-500">Kategori: <span className="text-slate-300 capitalize">{approveModal.archive.category?.replace(/_/g, " ")}</span></span>
                <span className="text-slate-500">Periode: <span className="text-slate-300">{approveModal.archive.year}</span></span>
              </div>
              <div className="text-xs text-slate-500">Diunggah oleh: <span className="text-slate-300">{approveModal.archive.uploaded_by_name}</span></div>
            </div>

            {/* Approval progress */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-300">Status Persetujuan:</div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border ${approveModal.archive.approved_by_admin ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800 border-slate-600'}`}>
                  <div className="text-xs text-slate-500 mb-1">Admin</div>
                  {approveModal.archive.approved_by_admin ? (
                    <div className="text-sm text-emerald-400 font-medium">✓ {approveModal.archive.admin_approver_name}</div>
                  ) : (
                    <div className="text-sm text-slate-400">Belum disetujui</div>
                  )}
                </div>
                <div className={`p-3 rounded-lg border ${approveModal.archive.approved_by_sekum ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800 border-slate-600'}`}>
                  <div className="text-xs text-slate-500 mb-1">Sekretaris</div>
                  {approveModal.archive.approved_by_sekum ? (
                    <div className="text-sm text-emerald-400 font-medium">✓ {approveModal.archive.sekum_approver_name}</div>
                  ) : (
                    <div className="text-sm text-slate-400">Belum disetujui</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#4EA8DE]/10 border border-[#4EA8DE]/30 rounded-lg text-xs text-[#4EA8DE]">
              Anda akan menyetujui arsip ini sebagai <strong>{user.role === "admin" ? "Admin" : "Sekretaris"}</strong>.
              {(!approveModal.archive.approved_by_admin && !approveModal.archive.approved_by_sekum)
                ? " Arsip masih memerlukan persetujuan dari pihak lainnya setelah ini."
                : " Setelah ini arsip akan disetujui sepenuhnya dan dapat diakses oleh anggota."}
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setApproveModal({ open: false })}>Batal</Button>
              <Button onClick={() => handleApprove(approveModal.archive)}>
                Setujui Arsip
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={previewModal.open} onClose={() => setPreviewModal({ open: false })} title={previewModal.archive?.title || "Preview Dokumen"} size="xl">
        {previewModal.archive && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><span className="text-slate-500">Kategori:</span> <span className="text-slate-200 capitalize">{previewModal.archive.category?.replace(/_/g," ")}</span></div>
              <div>
                <span className="text-slate-500">Periode:</span>{" "}
                <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded text-xs font-medium">
                  {previewModal.archive.year}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>{" "}
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${(APPROVAL_LABELS[previewModal.archive.approval_status] || APPROVAL_LABELS.approved).color}`}>
                  {(APPROVAL_LABELS[previewModal.archive.approval_status] || APPROVAL_LABELS.approved).label}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-slate-500 mr-2">Akses:</span>
                <div className="inline-flex gap-1 flex-wrap">
                  {previewModal.archive.access_level?.split(",").map(r => (
                    <span key={r} className="px-2 py-0.5 bg-[#4EA8DE]/10 text-[#4EA8DE] border border-[#4EA8DE]/20 rounded text-[10px] capitalize">{r}</span>
                  ))}
                </div>
              </div>
            </div>
            {previewModal.archive.drive_type === 'folder' ? (
              <DriveFolderBrowser
                rootFolderId={previewModal.archive.drive_file_id}
                rootFolderName={previewModal.archive.title}
              />
            ) : (
              <div className="rounded-lg overflow-hidden border border-slate-700 relative" style={{ height: "500px" }}>
                <iframe
                  src={`https://drive.google.com/file/d/${previewModal.archive.drive_file_id}/preview`}
                  className="w-full h-full"
                  title="Document Preview"
                  allow="autoplay"
                />
                <div className="absolute top-0 right-0 w-16 h-16 z-10 bg-transparent cursor-not-allowed" title="Pop-out dibatasi" />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
