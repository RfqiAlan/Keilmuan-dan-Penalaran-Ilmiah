import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Check,
  Edit,
  Trash2,
  Archive,
  Folder,
  FileText,
  AlertTriangle,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select, Textarea } from "../../components/ui/Input";
import DriveFolderBrowser from "../../components/ui/DriveFolderBrowser";
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
const ROLES = ["admin", "ketua", "sekretaris", "bendahara", "koordinator", "anggota", "alumni"];
const DUAL_APPROVAL_CATEGORIES = ["sk", "lpj", "arsip_karya"];

const APPROVAL_LABELS = {
  draft: { label: "Draft", color: "bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600" },
  approved_admin: { label: "Menunggu Sekretaris", color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  approved_sekum: { label: "Menunggu Admin", color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  approved: { label: "Disetujui", color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
};

export default function AdminArchives() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterApproval, setFilterApproval] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "create", archive: null });
  const [delModal, setDelModal] = useState({ open: false, archive: null });
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

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    fetchArchives();
  }, [search, filterCat, filterYear, filterApproval]);

  const openCreate = () => {
    setForm({
      archive_number: "",
      title: "",
      year: new Date().getFullYear(),
      category: "lpj",
      division: "",
      description: "",
      drive_file_id: "",
      access_level: "admin",
    });
    setError("");
    setModal({ open: true, mode: "create", archive: null });
  };

  const openEdit = (archive) => {
    setForm({ ...archive });
    setError("");
    setModal({ open: true, mode: "edit", archive });
  };

  const handleCategoryToggle = (cat) => {
    let cats = form.category ? form.category.split(",").map((c) => c.trim()).filter(Boolean) : [];
    if (cats.includes(cat)) {
      cats = cats.filter((c) => c !== cat);
    } else {
      cats.push(cat);
    }
    setForm({ ...form, category: cats.join(",") });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.category || !form.category.trim()) {
      setError("Pilih minimal satu kategori dokumen.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (modal.mode === "create") {
        await api.post("/archives", form);
        showToast("Dokumen arsip baru berhasil ditambahkan!", "success");
      } else {
        await api.put(`/archives/${modal.archive.id}`, form);
        showToast("Data arsip berhasil diperbarui!", "success");
      }
      setModal({ open: false, archive: null });
      fetchArchives();
      fetchAvailableYears();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyimpan arsip.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!delModal.archive) return;
    try {
      await api.delete(`/archives/${delModal.archive.id}`);
      showToast("Arsip dokumen berhasil dihapus!", "success");
      setDelModal({ open: false, archive: null });
      fetchArchives();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menghapus arsip.";
      showToast(msg, "error");
    }
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

  const openPreview = (archive) => {
    setPreviewModal({ open: true, archive });
  };

  const handleApprove = async (archive) => {
    try {
      await api.put(`/archives/${archive.id}/approve`);
      showToast("Persetujuan arsip berhasil dicatat!", "success");
      fetchArchives();
      setApproveModal({ open: false, archive: null });
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyetujui arsip.";
      showToast(msg, "error");
    }
  };

  // Check if current user can approve this archive
  const canApprove = (archive) => {
    if (archive.approval_status === "approved") return false;
    if (!DUAL_APPROVAL_CATEGORIES.includes(archive.category)) return false;
    if (user?.role === "admin" && !archive.approved_by_admin) return true;
    if (user?.role === "sekretaris" && !archive.approved_by_sekum) return true;
    return false;
  };

  const years =
    availableYears.length > 0
      ? availableYears
      : Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Manajemen Arsip
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Kelola berkas resmi, dokumen digital, dan persetujuan arsip UKM
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Arsip
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul arsip atau nomor dokumen..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] placeholder-slate-400 shadow-xs"
          />
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs"
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ").toUpperCase()}
            </option>
          ))}
        </select>

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs"
        >
          <option value="">Semua Periode</option>
          {years.map((y) => (
            <option key={y} value={y}>
              Periode {y}
            </option>
          ))}
        </select>

        <select
          value={filterApproval}
          onChange={(e) => setFilterApproval(e.target.value)}
          className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] shadow-xs"
        >
          <option value="">Semua Status Persetujuan</option>
          <option value="draft">Draft</option>
          <option value="approved_admin">Menunggu Sekretaris</option>
          <option value="approved_sekum">Menunggu Admin</option>
          <option value="approved">Disetujui Penuh</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={6} cols={8} />
      ) : archives.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="Tidak Ada Data Arsip"
          description={
            search || filterCat || filterYear || filterApproval
              ? "Tidak ada arsip dokumen yang cocok dengan filter yang dipilih."
              : "Belum ada dokumen arsip yang diunggah ke sistem."
          }
          actionLabel={
            search || filterCat || filterYear || filterApproval ? "Reset Filter" : "Unggah Arsip Baru"
          }
          onAction={
            search || filterCat || filterYear || filterApproval
              ? () => {
                  setSearch("");
                  setFilterCat("");
                  setFilterYear("");
                  setFilterApproval("");
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
                  {["No. Arsip", "Judul", "Kategori", "Periode", "Tipe", "Status", "Akses", "Aksi"].map(
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
                {archives.map((a) => {
                  const approvalInfo = APPROVAL_LABELS[a.approval_status] || APPROVAL_LABELS.approved;
                  const needsDual = DUAL_APPROVAL_CATEGORIES.includes(a.category);

                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {a.archive_number}
                      </td>
                      <td className="px-4 py-3.5">
                        <div
                          className="text-slate-900 dark:text-slate-100 font-medium max-w-48 truncate"
                          title={a.title}
                        >
                          {a.title}
                        </div>
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
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${approvalInfo.color}`}
                          >
                            {approvalInfo.label}
                          </span>
                          {needsDual && a.approval_status !== "approved" && (
                            <div className="flex gap-1 flex-wrap">
                              {a.approved_by_admin && (
                                <span
                                  className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded text-[9px] font-medium"
                                  title={`Admin: ${a.admin_approver_name}`}
                                >
                                  ✓ Admin
                                </span>
                              )}
                              {a.approved_by_sekum && (
                                <span
                                  className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded text-[9px] font-medium"
                                  title={`Sekretaris: ${a.sekum_approver_name}`}
                                >
                                  ✓ Sekum
                                </span>
                              )}
                            </div>
                          )}
                        </div>
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
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openPreview(a)}
                            title="Pratinjau Dokumen"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {canApprove(a) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setApproveModal({ open: true, archive: a })}
                              className="!text-emerald-600 dark:!text-emerald-400 hover:!bg-emerald-50 dark:hover:!bg-emerald-950/30"
                              title="Setujui Arsip"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openEdit(a)}
                            title="Edit Data Arsip"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDelModal({ open: true, archive: a })}
                            title="Hapus Arsip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, archive: null })}
        title={modal.mode === "create" ? "Tambah Arsip Dokumen" : "Edit Arsip Dokumen"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {modal.mode === "create" &&
            (form.category || "")
              .split(",")
              .map((c) => c.trim())
              .some((c) => DUAL_APPROVAL_CATEGORIES.includes(c)) && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  Kategori arsip yang dipilih mencakup kategori dokumen sensitif (<strong>SK / LPJ / Karya</strong>) yang memerlukan persetujuan ganda dari <strong>Admin</strong> dan <strong>Sekretaris</strong> sebelum bisa diakses oleh anggota biasa.
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nomor Arsip"
              value={form.archive_number || ""}
              onChange={(e) => setForm({ ...form, archive_number: e.target.value })}
              placeholder="Contoh: ARS-2024-001"
              required
            />
            <Input
              label="Periode (Tahun)"
              type="number"
              value={form.year || ""}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              required
              placeholder="Contoh: 2024"
            />
          </div>
          <Input
            label="Judul Dokumen"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Contoh: Laporan Pertanggungjawaban Musker 2024"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Kategori Dokumen <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  (Bisa pilih lebih dari 1)
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600 rounded-xl p-3 flex flex-wrap gap-1.5 h-36 overflow-y-auto">
                {CATEGORIES.map((c) => {
                  const isChecked = (form.category || "")
                    .split(",")
                    .map((item) => item.trim())
                    .includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCategoryToggle(c)}
                      className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7] ${
                        isChecked
                          ? "bg-[#0284c7] text-white shadow-xs font-semibold"
                          : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600/60"
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] transition-colors ${
                          isChecked
                            ? "border-white bg-white text-[#0284c7] font-bold"
                            : "border-slate-400 dark:border-slate-500"
                        }`}
                      >
                        {isChecked ? "✓" : ""}
                      </span>
                      <span className="capitalize">{c.replace(/_/g, " ")}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Hak Akses Role
              </label>
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600 rounded-xl p-3 grid grid-cols-2 gap-2 h-36 overflow-y-auto">
                {ROLES.map((role) => {
                  const isChecked = (form.access_level || "").split(",").includes(role);
                  const isDisabled = role === "admin";
                  return (
                    <label
                      key={role}
                      className={`flex items-center gap-2 text-xs font-medium ${
                        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => handleRoleToggle(role)}
                        className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-[#0284c7] focus:ring-[#0284c7]"
                      />
                      <span className="text-slate-800 dark:text-slate-200 capitalize">{role}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <Input
            label="Divisi Terkait"
            value={form.division || ""}
            onChange={(e) => setForm({ ...form, division: e.target.value })}
            placeholder="Contoh: BPH, Divisi Humas, Divisi Riset"
          />
          <div>
            <Input
              label="Link Google Drive / File ID"
              value={form.drive_file_id || ""}
              onChange={(e) => setForm({ ...form, drive_file_id: e.target.value })}
              required
              placeholder="https://drive.google.com/file/d/... atau https://drive.google.com/drive/folders/..."
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              💡 <strong>Link File:</strong> langsung membuka pratinjau dokumen (PDF/Doc). <br />
              📂 <strong>Link Folder:</strong> menampilkan penjelajah berkas interaktif untuk membuka seluruh isi folder.
            </p>
          </div>
          <Textarea
            label="Deskripsi & Ringkasan"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ringkasan isi dokumen arsip..."
            rows={3}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModal({ open: false, archive: null })}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan Dokumen..." : "Simpan Arsip"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={delModal.open}
        onClose={() => setDelModal({ open: false, archive: null })}
        title="Konfirmasi Hapus Arsip"
        size="sm"
      >
        <p className="text-slate-700 dark:text-slate-300 mb-6 text-sm">
          Apakah Anda yakin ingin menghapus arsip dokumen{" "}
          <strong className="text-slate-900 dark:text-slate-100">
            {delModal.archive?.title}
          </strong>
          ? File di Google Drive tidak akan terhapus, namun catatan di sistem akan dihapus permanen.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setDelModal({ open: false, archive: null })}
          >
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal.open}
        onClose={() => setApproveModal({ open: false, archive: null })}
        title="Konfirmasi Persetujuan Arsip"
        size="md"
      >
        {approveModal.archive && (
          <div className="space-y-4">
            <div className="p-4 bg-sky-50 dark:bg-slate-700/40 rounded-xl space-y-2 border border-sky-100 dark:border-slate-600">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {approveModal.archive.title}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Kategori:{" "}
                  <span className="text-slate-800 dark:text-slate-200 capitalize font-medium">
                    {approveModal.archive.category?.replace(/_/g, " ")}
                  </span>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Periode:{" "}
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {approveModal.archive.year}
                  </span>
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Diunggah oleh:{" "}
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {approveModal.archive.uploaded_by_name}
                </span>
              </div>
            </div>

            {/* Approval progress */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Status Persetujuan:
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-3 rounded-xl border ${
                    approveModal.archive.approved_by_admin
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Admin</div>
                  {approveModal.archive.approved_by_admin ? (
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {approveModal.archive.admin_approver_name}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400">Belum disetujui</div>
                  )}
                </div>
                <div
                  className={`p-3 rounded-xl border ${
                    approveModal.archive.approved_by_sekum
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Sekretaris</div>
                  {approveModal.archive.approved_by_sekum ? (
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {approveModal.archive.sekum_approver_name}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400">Belum disetujui</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl text-xs text-sky-800 dark:text-sky-300">
              Anda akan menyetujui arsip ini sebagai{" "}
              <strong>{user?.role === "admin" ? "Admin" : "Sekretaris"}</strong>.
              {!approveModal.archive.approved_by_admin && !approveModal.archive.approved_by_sekum
                ? " Dokumen masih memerlukan persetujuan dari pihak satu lagi sebelum dapat diakses anggota."
                : " Setelah ini dokumen akan disetujui penuh dan dapat diakses anggota berhak."}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => setApproveModal({ open: false, archive: null })}
              >
                Batal
              </Button>
              <Button onClick={() => handleApprove(approveModal.archive)}>
                <Check className="w-4 h-4 mr-1.5" />
                Setujui Dokumen
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal.open}
        onClose={() => setPreviewModal({ open: false, archive: null })}
        title={previewModal.archive?.title || "Preview Dokumen"}
        size="xl"
      >
        {previewModal.archive && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Kategori:</span>{" "}
                <span className="text-slate-800 dark:text-slate-200 capitalize font-medium">
                  {previewModal.archive.category?.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Periode:</span>{" "}
                <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] border border-sky-200 dark:border-sky-800 rounded font-medium">
                  {previewModal.archive.year}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Status:</span>{" "}
                <span
                  className={`px-2 py-0.5 rounded font-medium border ${
                    (APPROVAL_LABELS[previewModal.archive.approval_status] || APPROVAL_LABELS.approved)
                      .color
                  }`}
                >
                  {
                    (APPROVAL_LABELS[previewModal.archive.approval_status] || APPROVAL_LABELS.approved)
                      .label
                  }
                </span>
              </div>
              <div className="sm:col-span-3">
                <span className="text-slate-500 dark:text-slate-400 mr-2">Hak Akses:</span>
                <div className="inline-flex gap-1 flex-wrap">
                  {previewModal.archive.access_level?.split(",").map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded capitalize font-medium"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {previewModal.archive.drive_type === "folder" ? (
              <DriveFolderBrowser
                rootFolderId={previewModal.archive.drive_file_id}
                rootFolderName={previewModal.archive.title}
              />
            ) : (
              <div
                className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner bg-slate-900"
                style={{ height: "520px" }}
              >
                <iframe
                  src={`https://drive.google.com/file/d/${previewModal.archive.drive_file_id}/preview`}
                  className="w-full h-full"
                  title="Document Preview"
                  allow="autoplay"
                />
                <div
                  className="absolute top-0 right-0 w-16 h-16 z-10 bg-transparent cursor-not-allowed"
                  title="Pop-out dibatasi"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
