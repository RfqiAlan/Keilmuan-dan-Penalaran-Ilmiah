import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Trash2, Upload, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import KtaUploadModal from "../../components/ui/KtaUploadModal";
import { useToast } from "../../contexts/ToastContext";

const roleLabels = {
  admin: "Administrator",
  ketua: "Ketua UKM",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  koordinator: "Koordinator Divisi",
  anggota: "Anggota",
  alumni: "Alumni",
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);
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
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.put("/users/profile", form);
      setUser(res.data.user);
      localStorage.setItem("simpar_user", JSON.stringify(res.data.user));
      showToast("Profil akun berhasil diperbarui!", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal memperbarui profil.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleKtaUploaded = (kta) => {
    setKtaInfo({ hasKta: true, kta });
    showToast("KTA berhasil diunggah!", "success");
  };

  const handleDeleteKta = async () => {
    if (!confirm("Hapus KTA? Anda harus mengunggah ulang untuk dapat meminjam barang atau melihat arsip dokumen.")) return;
    try {
      await api.delete("/users/kta");
      setKtaInfo({ hasKta: false, kta: null });
      showToast("KTA berhasil dihapus.", "info");
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menghapus KTA.";
      showToast(msg, "error");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Profil Saya
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Kelola informasi identitas pribadi dan verifikasi kartu anggota
        </p>
      </div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-950/60 border-2 border-sky-300 dark:border-sky-800 rounded-full flex items-center justify-center text-2xl font-bold text-[#0284c7] dark:text-[#38bdf8] shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {user?.name}
            </h2>
            <div className="text-slate-500 dark:text-slate-400 text-xs">
              {user?.email}
            </div>
            <div className="mt-1.5">
              <Badge status={user?.status} label={roleLabels[user?.role]} />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Nomor WhatsApp / HP"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="08xxxxxxxxxx"
          />
          <div className="bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600/60 rounded-xl p-3.5">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              Alamat Email (Akun)
            </div>
            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {user?.email}
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </div>

      {/* KTA Section */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#0284c7] dark:text-[#38bdf8]" />
              Kartu Tanda Anggota (KTA)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verifikasi keaktifan anggota untuk meminjam barang dan membuka arsip dokumen
            </p>
          </div>
          {ktaInfo?.hasKta && (
            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
            </span>
          )}
        </div>

        {ktaLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-[#0284c7] border-t-transparent rounded-full" />
          </div>
        ) : ktaInfo?.hasKta ? (
          <div className="space-y-4">
            {/* KTA Preview */}
            <div
              className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group bg-slate-900 shadow-inner"
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
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div
                    className="w-full h-48 items-center justify-center bg-slate-800 text-sky-400 flex flex-col gap-2"
                    style={{ display: "none" }}
                  >
                    <CreditCard className="w-12 h-12 stroke-[1.5]" />
                    <span className="text-xs text-slate-300">File KTA Tersimpan</span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-white text-xs font-semibold px-4 py-2 bg-black/60 rounded-lg backdrop-blur-sm">
                      Klik untuk {ktaPreviewOpen ? "menutup" : "membuka"} preview
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* KTA Actions */}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setKtaModal(true)}>
                <Upload className="w-3.5 h-3.5 mr-1" /> Ganti KTA
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeleteKta}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus KTA
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-3 bg-slate-50 dark:bg-slate-700/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center">
              <CreditCard className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">
              Anda belum mengunggah foto / scan Kartu Tanda Anggota (KTA).
            </div>
            <Button onClick={() => setKtaModal(true)}>
              <Upload className="w-4 h-4 mr-1.5" /> Unggah KTA Sekarang
            </Button>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 shadow-xs">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 text-sm uppercase tracking-wider">
          Informasi Status Keanggotaan
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">Role Akses</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
              {roleLabels[user?.role] || user?.role}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">Status Akun</div>
            <div className="mt-1">
              <Badge status={user?.status} />
            </div>
          </div>
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
