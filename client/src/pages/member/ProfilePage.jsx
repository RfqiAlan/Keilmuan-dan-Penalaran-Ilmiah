import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import KtaUploadModal from "../../components/ui/KtaUploadModal";

const roleLabels = {
  admin: "Administrator", ketua: "Ketua UKM", sekretaris: "Sekretaris",
  bendahara: "Bendahara", koordinator: "Koordinator Divisi", anggota: "Anggota", alumni: "Alumni",
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // KTA state
  const [ktaInfo, setKtaInfo] = useState(null);
  const [ktaLoading, setKtaLoading] = useState(true);
  const [ktaModal, setKtaModal] = useState(false);
  const [ktaPreviewOpen, setKtaPreviewOpen] = useState(false);

  useEffect(() => {
    fetchKtaStatus();
  }, []);

  const fetchKtaStatus = async () => {
    setKtaLoading(true);
    try {
      const res = await api.get("/users/kta/check");
      setKtaInfo(res.data);
    } catch (err) {
      console.error("Failed to check KTA:", err);
    } finally {
      setKtaLoading(false);
    }
  };

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

  const handleKtaUploaded = (kta) => {
    setKtaInfo({ hasKta: true, kta });
  };

  const handleDeleteKta = async () => {
    if (!confirm("Hapus KTA? Anda harus mengunggah ulang untuk bisa meminjam barang atau melihat arsip.")) return;
    try {
      await api.delete("/users/kta");
      setKtaInfo({ hasKta: false, kta: null });
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus KTA.");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-slate-100">Profil Saya</h1><p className="text-slate-400 text-sm mt-1">Kelola informasi akun Anda</p></div>

      {/* Profile Info */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#28517E]/30 border-2 border-[#4EA8DE]/50 rounded-full flex items-center justify-center text-2xl font-bold text-[#4EA8DE]">
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

      {/* KTA Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              <span>🪪</span>
              Kartu Tanda Anggota (KTA)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Diperlukan untuk meminjam barang dan melihat arsip dokumen
            </p>
          </div>
          {ktaInfo?.hasKta && (
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
              ✓ Terverifikasi
            </span>
          )}
        </div>

        {ktaLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-[#4EA8DE] border-t-transparent rounded-full" />
          </div>
        ) : ktaInfo?.hasKta ? (
          <div className="space-y-4">
            {/* KTA Preview */}
            <div
              className="relative rounded-lg overflow-hidden border border-slate-600 cursor-pointer group"
              onClick={() => setKtaPreviewOpen(!ktaPreviewOpen)}
            >
              {ktaPreviewOpen ? (
                <iframe
                  src={ktaInfo.kta.preview_url}
                  className="w-full h-80"
                  title="KTA Preview"
                />
              ) : (
                <div className="relative">
                  <img
                    src={ktaInfo.kta.thumbnail_url}
                    alt="KTA Preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-48 items-center justify-center bg-slate-700/50 text-4xl" style={{ display: 'none' }}>
                    🪪
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-white text-sm font-medium px-4 py-2 bg-black/50 rounded-lg backdrop-blur-sm">
                      Klik untuk {ktaPreviewOpen ? "tutup" : "lihat"} preview
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* KTA Actions */}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setKtaModal(true)}>
                Ganti KTA
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeleteKta}>
                Hapus KTA
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">🪪</div>
            <div className="text-slate-400 text-sm">Anda belum mengunggah KTA.</div>
            <Button onClick={() => setKtaModal(true)}>
              Upload KTA Sekarang
            </Button>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-100 mb-4">Informasi Akun</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><div className="text-slate-500">Role</div><div className="text-slate-300 mt-0.5">{roleLabels[user?.role]}</div></div>
          <div><div className="text-slate-500">Status</div><div className="mt-0.5"><Badge status={user?.status} /></div></div>
        </div>
      </div>

      {/* KTA Upload Modal */}
      <KtaUploadModal
        isOpen={ktaModal}
        onClose={() => setKtaModal(false)}
        onSuccess={handleKtaUploaded}
      />
    </div>
  );
}
