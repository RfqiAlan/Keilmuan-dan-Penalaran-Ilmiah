import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Input, Select } from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "anggota" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password minimal 6 karakter."); return; }
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      navigate("/login", { state: { message: "Registrasi berhasil! Silakan login." } });
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-3xl mb-4 shadow-lg shadow-indigo-500/30">📁</div>
          <h1 className="text-2xl font-bold text-slate-100">SIMPAR UKM</h1>
          <p className="text-slate-400 text-sm mt-1">Buat akun baru</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">Daftar Akun</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nama Lengkap" placeholder="Nama Anda" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" placeholder="email@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" placeholder="Min. 6 karakter" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Input label="No. HP" type="tel" placeholder="08xxxxxxxxxx" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="anggota">Anggota</option>
              <option value="koordinator">Koordinator Divisi</option>
              <option value="alumni">Alumni</option>
            </Select>
            <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
              {loading ? "Memuat..." : "Daftar"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
