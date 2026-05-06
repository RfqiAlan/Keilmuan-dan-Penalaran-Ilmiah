import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const roleLabels = {
  admin: "Administrator", ketua: "Ketua UKM", sekretaris: "Sekretaris",
  bendahara: "Bendahara", koordinator: "Koordinator Divisi", anggota: "Anggota", alumni: "Alumni",
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(""); setError("");
    try {
      const res = await api.put("/users/profile", form);
      setUser(res.data.user);
      localStorage.setItem("simpar_user", JSON.stringify(res.data.user));
      setMsg("Profil berhasil diperbarui.");
    } catch (err) { setError(err.response?.data?.message || "Gagal menyimpan."); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-slate-100">Profil Saya</h1><p className="text-slate-400 text-sm mt-1">Kelola informasi akun Anda</p></div>

      {/* Profile Info */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-600/30 border-2 border-indigo-500/50 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-400">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{user?.name}</h2>
            <div className="text-slate-400 text-sm">{user?.email}</div>
            <div className="mt-1"><Badge status={user?.status} label={roleLabels[user?.role]} /></div>
          </div>
        </div>

        {msg && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">{msg}</div>}
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input label="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="No. HP" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" />
          <div className="bg-slate-700/40 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Email</div>
            <div className="text-sm text-slate-300">{user?.email}</div>
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</Button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-100 mb-4">Informasi Akun</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><div className="text-slate-500">Role</div><div className="text-slate-300 mt-0.5">{roleLabels[user?.role]}</div></div>
          <div><div className="text-slate-500">Status</div><div className="mt-0.5"><Badge status={user?.status} /></div></div>
        </div>
      </div>
    </div>
  );
}
