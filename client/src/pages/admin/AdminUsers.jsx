import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Users } from "lucide-react";
import api from "../../api/axios";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../contexts/ToastContext";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState({ open: false, mode: "create", user: null });
  const [delModal, setDelModal] = useState({ open: false, user: null });
  const [form, setForm] = useState({});
  const [ktaFile, setKtaFile] = useState(null);
  const [ktaPreview, setKtaPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const fetchUsers = () => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    api.get(`/users${params}`)
      .then((r) => setUsers(r.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const openCreate = () => {
    setForm({ name: "", email: "", password: "", phone: "", role: "anggota", status: "active" });
    setKtaFile(null);
    setKtaPreview(null);
    setError("");
    setEditModal({ open: true, mode: "create", user: null });
  };

  const openEdit = (user) => {
    setForm({ name: user.name, phone: user.phone || "", role: user.role, status: user.status });
    setKtaFile(null);
    setKtaPreview(null);
    setError("");
    setEditModal({ open: true, mode: "edit", user });
  };

  const handleKtaChange = (file) => {
    if (!file) {
      setKtaFile(null);
      setKtaPreview(null);
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format file KTA harus berupa gambar (JPG, PNG, atau WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file KTA maksimal 5MB.");
      return;
    }
    setError("");
    setKtaFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setKtaPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editModal.mode === "create") {
        if (!form.password || form.password.length < 6) {
          setError("Password minimal 6 karakter.");
          setSaving(false);
          return;
        }
        if (!ktaFile) {
          setError("Kartu Tanda Anggota (KTA) wajib diunggah.");
          setSaving(false);
          return;
        }

        const formData = new FormData();
        Object.keys(form).forEach((key) => formData.append(key, form[key]));
        formData.append("kta_file", ktaFile);

        const res = await api.post("/auth/register", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Jika admin memilih status selain 'pending' (misal 'active'), update statusnya langsung
        if (form.status && form.status !== "pending" && res.data.user?.id) {
          await api.put(`/users/${res.data.user.id}`, { status: form.status });
        }

        showToast("Pengguna baru berhasil ditambahkan!", "success");
      } else {
        await api.put(`/users/${editModal.user.id}`, form);
        showToast("Data pengguna berhasil diperbarui!", "success");
      }
      setEditModal({ open: false, user: null });
      setKtaFile(null);
      setKtaPreview(null);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyimpan data pengguna.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${delModal.user.id}`);
      showToast("Akun pengguna berhasil dihapus!", "success");
      setDelModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menghapus pengguna.";
      showToast(msg, "error");
    }
  };

  const roles = ["admin", "ketua", "sekretaris", "bendahara", "koordinator", "anggota", "alumni"];
  const statuses = ["pending", "active", "inactive", "suspended"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Manajemen Pengguna
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Kelola akun, hak akses role, dan status keanggotaan sistem
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Pengguna
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama anggota atau email..."
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] placeholder-slate-400 shadow-xs"
        />
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Pengguna Tidak Ditemukan"
          description={
            search
              ? "Tidak ada akun pengguna yang cocok dengan pencarian kata kunci tersebut."
              : "Belum ada akun pengguna yang terdaftar di dalam sistem."
          }
          actionLabel={search ? "Hapus Pencarian" : "Tambah Pengguna Baru"}
          onAction={search ? () => setSearch("") : openCreate}
        />
      ) : (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/60">
                <tr>
                  {["Nama", "Email", "Role", "No. HP", "Status", "Bergabung", "Aksi"].map((h) => (
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
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 rounded-full flex items-center justify-center text-xs font-bold text-[#0284c7] dark:text-[#38bdf8] shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-900 dark:text-slate-100 font-medium">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {u.email}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded text-xs capitalize font-medium">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {u.phone || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={u.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEdit(u)}
                          title="Edit Pengguna"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDelModal({ open: true, user: u })}
                          title="Hapus Pengguna"
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

      {/* Edit/Create Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, user: null })}
        title={editModal.mode === "create" ? "Tambah Pengguna Baru" : "Edit Profil Pengguna"}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nama Lengkap"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                required
              />
            </div>

            {editModal.mode === "create" && (
              <>
                <Input
                  label="Alamat Email"
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="nama@email.com"
                  required
                />
                <Input
                  label="Kata Sandi"
                  type="password"
                  value={form.password || ""}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Minimal 6 karakter"
                />
              </>
            )}

            <Input
              label="Nomor WhatsApp / HP"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08123456789"
            />

            <Select
              label="Role Pengguna"
              value={form.role || "anggota"}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r.toUpperCase()}
                </option>
              ))}
            </Select>

            <div className="sm:col-span-2">
              <Select
                label="Status Akun"
                value={form.status || "active"}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.toUpperCase()}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {editModal.mode === "create" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kartu Tanda Anggota (KTA) <span className="text-rose-500">*</span>
              </label>
              <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-3.5 bg-slate-50/60 dark:bg-slate-700/20">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleKtaChange(e.target.files[0])}
                  className="w-full text-xs text-slate-700 dark:text-slate-300
                    file:mr-3 file:py-1.5 file:px-3
                    file:rounded-lg file:border-0
                    file:text-xs file:font-semibold
                    file:bg-sky-50 dark:file:bg-sky-950/60
                    file:text-[#0284c7] dark:file:text-[#38bdf8]
                    hover:file:bg-sky-100 dark:hover:file:bg-sky-900/60
                    cursor-pointer transition-colors"
                  required
                />
                <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Format: JPG, PNG, WEBP (Maksimal 5MB)</span>
                  <span className="text-rose-500 font-semibold">Wajib diunggah</span>
                </div>
                {ktaPreview && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600/50 flex items-center gap-3">
                    <img
                      src={ktaPreview}
                      alt="Pratinjau KTA"
                      className="h-16 w-24 object-cover rounded-lg border border-slate-200 dark:border-slate-600 shadow-xs"
                    />
                    <div className="text-xs">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        {ktaFile?.name}
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] mt-0.5">
                        ✓ File KTA siap diunggah
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditModal({ open: false, user: null })}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan Data..." : "Simpan Pengguna"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={delModal.open}
        onClose={() => setDelModal({ open: false, user: null })}
        title="Konfirmasi Hapus Pengguna"
        size="sm"
      >
        <p className="text-slate-700 dark:text-slate-300 mb-6 text-sm">
          Apakah Anda yakin ingin menghapus akun pengguna{" "}
          <strong className="text-slate-900 dark:text-slate-100 font-semibold">
            {delModal.user?.name}
          </strong>
          ? Seluruh data akses dan riwayat akun ini akan terpengaruh.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setDelModal({ open: false, user: null })}
          >
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Hapus Akun
          </Button>
        </div>
      </Modal>
    </div>
  );
}
