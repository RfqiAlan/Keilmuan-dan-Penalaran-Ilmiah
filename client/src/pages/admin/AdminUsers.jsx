import { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    const params = search ? `?search=${search}` : "";
    api.get(`/users${params}`).then((r) => setUsers(r.data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const openEdit = (user) => { setForm({ name: user.name, phone: user.phone, role: user.role, status: user.status }); setEditModal({ open: true, user }); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/users/${editModal.user.id}`, form);
      setEditModal({ open: false }); fetchUsers();
    } catch (err) { alert(err.response?.data?.message || "Gagal menyimpan."); }
    finally { setSaving(false); }
  };

  const roles = ["admin","ketua","sekretaris","bendahara","koordinator","anggota","alumni"];
  const statuses = ["active","inactive","suspended"];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-100">Manajemen Pengguna</h1><p className="text-slate-400 text-sm mt-1">Kelola akun dan role pengguna sistem</p></div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Cari nama atau email..."
        className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-md placeholder-slate-500" />
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-700/50">
              <tr>
                {["Nama","Email","Role","No. HP","Status","Bergabung","Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Memuat...</td></tr>
              : users.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Tidak ada pengguna.</td></tr>
              : users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 bg-indigo-600/30 border border-indigo-500/30 rounded-full flex items-center justify-center text-xs font-bold text-indigo-400">{u.name?.charAt(0).toUpperCase()}</div><span className="text-slate-200 font-medium">{u.name}</span></div></td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3"><span className="text-slate-300 capitalize">{u.role}</span></td>
                  <td className="px-4 py-3 text-slate-400">{u.phone || "—"}</td>
                  <td className="px-4 py-3"><Badge status={u.status} /></td>
                  <td className="px-4 py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-3"><Button size="sm" variant="secondary" onClick={() => openEdit(u)}>Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false })} title="Edit Pengguna" size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nama" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="No. HP" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select label="Role" value={form.role || "anggota"} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Select label="Status" value={form.status || "active"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setEditModal({ open: false })}>Batal</Button>
            <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
