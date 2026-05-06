import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      setError(err.response?.data?.message || "Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-3xl mb-4 shadow-lg shadow-indigo-500/30">
            📁
          </div>
          <h1 className="text-2xl font-bold text-slate-100">SIMPAR UKM</h1>
          <p className="text-slate-400 text-sm mt-1">Kelola peminjaman dan arsip UKM secara digital</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">Masuk ke Akun</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@simpar.id"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
              {loading ? "Memuat..." : "Masuk"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Belum punya akun?{" "}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Daftar sekarang
            </Link>
          </p>

          <div className="mt-6 p-3 bg-slate-700/40 rounded-lg">
            <p className="text-xs text-slate-500 text-center">Demo: admin@simpar.id / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
