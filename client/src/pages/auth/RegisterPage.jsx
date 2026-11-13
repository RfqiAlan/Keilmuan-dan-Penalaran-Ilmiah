import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FolderArchive, Upload, UserPlus, ArrowLeft } from "lucide-react";
import api from "../../api/axios";
import { Input, Select } from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", nra: "", email: "", password: "", phone: "", role: "anggota" });
  const [ktaFile, setKtaFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nra.trim()) { setError("Nomor Registrasi Anggota (NRA) wajib diisi."); return; }
    if (form.password.length < 6) { setError("Password minimal 6 karakter."); return; }
    if (!ktaFile) { setError("Harap unggah Kartu Tanda Anggota (KTA)."); return; }
    
    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    formData.append("kta_file", ktaFile);

    try {
      await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/pending-verification");
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi akun baru gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 py-8 selection:bg-[#0284c7] selection:text-white">
      <div className="w-full max-w-lg">
        <div className="mb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#0284c7] dark:hover:text-[#38bdf8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0284c7] text-white shadow-md shadow-[#0284c7]/20 mb-3.5 border border-sky-400/30">
            <FolderArchive className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            SIMPAR UKM KPI
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pendaftaran Akun Anggota & Pengurus UKM
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="pb-5 mb-5 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
              Formulir Pendaftaran
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Lengkapi identitas resmi organisasi Anda untuk diverifikasi oleh pengurus
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              placeholder="Nama lengkap sesuai KTA"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="NRA (Nomor Registrasi Anggota)"
                placeholder="Contoh: NRA-2024-001"
                value={form.nra}
                onChange={(e) => setForm({ ...form, nra: e.target.value })}
                required
              />
              <Input
                label="Nomor WhatsApp / HP"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <Input
              label="Alamat Email Aktif"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Kata Sandi"
                type="password"
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
              />
              <Select
                label="Peran / Role di UKM"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="anggota">Anggota Biasa</option>
                <option value="anggota_bph">Pengurus / BPH</option>
                <option value="koordinator">Koordinator Divisi</option>
                <option value="alumni">Alumni</option>
              </Select>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Unggah Bukti KTA UKM <span className="text-rose-500">*</span>
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setKtaFile(e.target.files[0])}
                className="w-full text-xs text-slate-700 dark:text-slate-300
                  file:mr-3 file:py-1.5 file:px-3
                  file:rounded-lg file:border-0
                  file:text-xs file:font-semibold
                  file:bg-[#0284c7]/10 dark:file:bg-[#0284c7]/20
                  file:text-[#0284c7] dark:file:text-[#38bdf8]
                  hover:file:bg-[#0284c7]/20 dark:hover:file:bg-[#0284c7]/30
                  cursor-pointer transition-colors"
                required
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Format gambar JPG, PNG, atau WEBP (maks. 5MB). Digunakan untuk verifikasi keanggotaan.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full mt-2 font-medium"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Memproses Pendaftaran..."
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Daftarkan Akun
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Sudah memiliki akun terdaftar?{" "}
              <Link
                to="/login"
                className="cursor-pointer text-[#0284c7] dark:text-[#38bdf8] hover:text-[#f97316] dark:hover:text-[#f97316] font-semibold underline-offset-2 hover:underline transition-colors"
              >
                Masuk ke Portal
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-6">
          Unit Kegiatan Mahasiswa Keilmuan & Penalaran Ilmiah
        </p>
      </div>
    </div>
  );
}
