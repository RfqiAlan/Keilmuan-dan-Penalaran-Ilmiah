import { useState, useEffect, useRef } from "react";
import { CreditCard, CheckCircle2, Trash2, Upload, User, Camera, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
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

// Helper to crop & downscale image to square for lightweight avatar storage
const compressAvatar = (file, size = 360, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Format file gambar tidak valid."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        // Center square crop
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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

  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      showToast("Format file harus berupa gambar (JPG, PNG, atau WEBP).", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 5MB.", "error");
      return;
    }

    setUploadingPhoto(true);
    try {
      // Compress and convert to clean square thumbnail
      const optimizedDataUrl = await compressAvatar(file, 360, 0.85);

      const res = await api.post("/users/profile/avatar", {
        avatar_url: optimizedDataUrl,
      });

      setUser(res.data.user);
      localStorage.setItem("simpar_user", JSON.stringify(res.data.user));
      showToast("Foto profil berhasil diperbarui!", "success");
    } catch (err) {
      console.error("Gagal update foto profil:", err);
      const msg = err.response?.data?.message || err.message || "Gagal mengunggah foto profil.";
      showToast(msg, "error");
    } finally {
      setUploadingPhoto(false);
      // Reset input value so same file can be reselected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm("Hapus foto profil akun Anda?")) return;

    setUploadingPhoto(true);
    try {
      const res = await api.delete("/users/profile/avatar");
      setUser(res.data.user);
      localStorage.setItem("simpar_user", JSON.stringify(res.data.user));
      showToast("Foto profil berhasil dihapus.", "info");
    } catch (err) {
      console.error("Gagal hapus foto profil:", err);
      const msg = err.response?.data?.message || "Gagal menghapus foto profil.";
      showToast(msg, "error");
    } finally {
      setUploadingPhoto(false);
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
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 sm:p-6 shadow-xs">
        {/* Avatar & Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700/60">
          <div className="relative group self-center sm:self-start shrink-0">
            <Avatar
              src={user?.avatar_url}
              name={user?.name}
              size="xl"
              className="border-2 border-sky-300 dark:border-sky-700 shadow-sm ring-4 ring-sky-50 dark:ring-sky-950/40"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              title="Ganti foto profil"
              aria-label="Ganti foto profil"
              className="absolute bottom-0 right-0 p-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full shadow-md transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {uploadingPhoto ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 justify-center sm:justify-start">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                {user?.name}
              </h2>
              <div className="self-center sm:self-auto">
                <Badge status={user?.status} label={roleLabels[user?.role]} />
              </div>
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm truncate mb-3">
              {user?.email}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelected}
              className="hidden"
            />

            {/* Photo Action Controls */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                {user?.avatar_url ? "Ganti Foto" : "Unggah Foto Profil"}
              </Button>
              {user?.avatar_url && (
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={handleDeletePhoto}
                  disabled={uploadingPhoto}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Hapus Foto
                </Button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Format: JPG, PNG, WEBP (maks. 5MB). Foto otomatis dioptimalkan.
            </p>
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
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
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
            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
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
