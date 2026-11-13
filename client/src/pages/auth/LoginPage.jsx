import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FolderArchive, ArrowRight, ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const isAdmin = ["admin", "ketua", "sekretaris"].includes(user.role);
      navigate(isAdmin ? "/admin/dashboard" : "/dashboard", { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Email atau kata sandi tidak sesuai.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setForm({ email: "admin@simpar.id", password: "admin" });
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-[#0284c7] selection:text-white">
      <div className="w-full max-w-md">
        <div className="mb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#0284c7] dark:hover:text-[#38bdf8] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Header / Brand Mark */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0284c7] text-white shadow-md shadow-[#0284c7]/20 mb-3.5 border border-sky-400/30">
            <FolderArchive className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            SIMPAR UKM KPI
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Sistem Informasi Manajemen Peminjaman & Pengarsipan Dokumen Ilmiah
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                Masuk ke Portal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gunakan kredensial akun UKM Anda
              </p>
            </div>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#0284c7] dark:text-[#38bdf8] bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
              title="Isi otomatis dengan akun administrator demo"
            >
              <KeyRound className="w-3 h-3" />
              Isi Akun Demo
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Alamat Email"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
            <Input
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full mt-2 font-medium"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Memverifikasi Kredensial..."
              ) : (
                <>
                  Masuk ke Akun
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Belum terdaftar sebagai anggota?{" "}
              <Link
                to="/register"
                className="cursor-pointer text-[#0284c7] dark:text-[#38bdf8] hover:text-[#f97316] dark:hover:text-[#f97316] font-semibold underline-offset-2 hover:underline transition-colors"
              >
                Daftar Akun Baru
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-6">
          Unit Kegiatan Mahasiswa Keilmuan & Penalaran Ilmiah
        </p>
      </div>
    </div>
  );
}
