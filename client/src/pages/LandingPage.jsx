import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderArchive,
  Package,
  Archive,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  IdCard,
  FileText,
  MapPin,
  Calendar,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function LandingPage() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardPath = ["admin", "ketua", "sekretaris"].includes(user?.role)
    ? "/admin/dashboard"
    : "/dashboard";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors selection:bg-[#0284c7] selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0369a1] to-[#0284c7] text-white flex items-center justify-center shadow-sm shadow-[#0284c7]/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight block">
                SIMPAR UKM
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block tracking-tight">
                Keilmuan & Penalaran Ilmiah
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#layanan" className="hover:text-[#0284c7] dark:hover:text-[#38bdf8] transition-colors">
              Peminjaman Barang
            </a>
            <a href="#arsip" className="hover:text-[#0284c7] dark:hover:text-[#38bdf8] transition-colors">
              Repositori Arsip
            </a>
            <a href="#prosedur" className="hover:text-[#0284c7] dark:hover:text-[#38bdf8] transition-colors">
              Alur Prosedur
            </a>
            <a href="#sekretariat" className="hover:text-[#0284c7] dark:hover:text-[#38bdf8] transition-colors">
              Sekretariat & Kontak
            </a>
          </nav>

          {/* Action Buttons & Theme Toggle */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label={`Ganti ke tema ${isDarkMode ? "terang" : "gelap"}`}
              className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isDarkMode ? <Moon className="w-5 h-5 text-sky-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </button>

            {user ? (
              <Link
                to={dashboardPath}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-colors shadow-xs"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-xl text-sm font-semibold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-colors shadow-xs"
                >
                  Daftar Anggota
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label={`Ganti ke tema ${isDarkMode ? "terang" : "gelap"}`}
              className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 dark:text-slate-400"
            >
              {isDarkMode ? <Moon className="w-5 h-5 text-sky-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Buka menu navigasi"
              className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 dark:text-slate-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
            <a
              href="#layanan"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Peminjaman Barang
            </a>
            <a
              href="#arsip"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Repositori Arsip
            </a>
            <a
              href="#prosedur"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Alur Prosedur
            </a>
            <a
              href="#sekretariat"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Sekretariat & Kontak
            </a>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {user ? (
                <Link
                  to={dashboardPath}
                  className="w-full py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-xl text-sm font-semibold bg-[#0284c7] text-white"
                >
                  Buka Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    Masuk Portal
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-xl text-sm font-semibold bg-[#0284c7] text-white"
                  >
                    Daftar Anggota Baru
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Purpose */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-100/80 dark:bg-sky-950/70 text-[#0284c7] dark:text-[#38bdf8] border border-sky-200 dark:border-sky-800/60">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
                Portal Resmi Pengelolaan Sarana & Dokumen UKM KPI
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.15]">
                Peminjaman Sarana Kegiatan & Tata Kelola Arsip Ilmiah Terpadu.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Ajukan permohonan peminjaman inventaris organisasi dengan opsi per jam atau harian, serta akses repositori dokumen, modul pelatihan, dan laporan pertanggungjawaban dalam sistem terproteksi.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {user ? (
                  <Link
                    to={dashboardPath}
                    className="px-6 py-3.5 min-h-[44px] rounded-xl font-semibold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all flex items-center gap-2 shadow-sm shadow-[#0284c7]/30 text-sm sm:text-base"
                  >
                    Buka Dashboard Saya
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-6 py-3.5 min-h-[44px] rounded-xl font-semibold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all flex items-center gap-2 shadow-sm shadow-[#0284c7]/30 text-sm sm:text-base"
                    >
                      Masuk ke Sistem
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/register"
                      className="px-5 py-3.5 min-h-[44px] rounded-xl font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm sm:text-base"
                    >
                      Registrasi Anggota (NRA)
                    </Link>
                  </>
                )}
                <a
                  href="#prosedur"
                  className="px-4 py-3 min-h-[44px] inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Pelajari Prosedur
                </a>
              </div>

              {/* Key System Specs */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    Opsi Per Jam & Hari
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fleksibel untuk durasi kegiatan
                  </div>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    Folder Drive Terproteksi
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Izin akses bertingkat & terdata
                  </div>
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                    Validasi KTA & NRA
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Khusus anggota terverifikasi
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive UI Showcase Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                {/* Mock Browser Header */}
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                    simpar.ukm-kpi.ac.id
                  </div>
                  <div className="w-6" />
                </div>

                {/* Mock Content Showcase */}
                <div className="p-5 space-y-4">
                  {/* Sample Item Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950/50 text-[#0284c7] flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Proyektor Epson EB-X400
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Durasi: 4 Jam (13:00 - 17:00)
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                      Disetujui
                    </span>
                  </div>

                  {/* Sample Archive Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                        <Archive className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Modul Karya Tulis Ilmiah 2026.pdf
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Izin Akses: Berlaku hingga 20 Nov 2026
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-[#0284c7] dark:text-[#38bdf8] shrink-0 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Buka
                    </span>
                  </div>

                  {/* Sample Member Profile Snippet */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-[#0284c7]" />
                      <span className="text-slate-600 dark:text-slate-400">Identitas Anggota:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        NRA 2024.KPI.088
                      </span>
                    </div>
                    <span className="text-slate-400">Status Aktif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Dua Pilar Utama Layanan */}
      <section id="layanan" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0284c7] dark:text-[#38bdf8] mb-2">
            Layanan Terpadu Organisasi
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Dua Fasilitas Utama untuk Kelancaran Aktivitas UKM
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            Dirancang secara terstruktur untuk memudahkan koordinasi inventaris sarana dan dokumentasi administratif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pilar 1: Peminjaman Inventaris */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Peminjaman Sarana & Alat Kegiatan
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Peminjaman proyektor, pointer, kabel roll, papan tulis, serta sarana penunjang riset dan forum diskusi.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Opsi Jam dan Hari:</strong> Pinjam singkat untuk presentasi (1 sampai 12 jam) atau pinjam harian untuk kegiatan seminar.</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Sistem Keranjang:</strong> Masukkan beberapa peralatan sekaligus dalam satu pengajuan izin peminjaman.</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Monitoring Status:</strong> Pantau persetujuan pengurus dan tanggal jatuh tempo pengembalian.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/items"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0284c7] dark:text-[#38bdf8] hover:text-[#0369a1] group"
              >
                Lihat Katalog Barang
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Pilar 2: Repositori Arsip Dokumen */}
          <div id="arsip" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Archive className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Repositori Arsip & Dokumen Organisasi
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Penyimpanan dan perizinan dokumen berbasis Google Drive resmi organisasi untuk menunjang akuntabilitas keilmuan.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Izin Akses Berjenjang:</strong> Pengurus memverifikasi permohonan akses berkas sesuai kebutuhan kepengurusan.</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Pratinjau Langsung di Portal:</strong> Baca berkas PDF dan telusuri folder Google Drive tanpa keluar dari aplikasi.</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Masa Berlaku Izin:</strong> Proteksi dokumen dengan durasi kedaluwarsa otomatis (1 hari hingga permanen).</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/archives"
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 group"
              >
                Jelajahi Repositori Dokumen
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Alur Prosedur Kerja */}
      <section id="prosedur" className="py-16 sm:py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0284c7] dark:text-[#38bdf8] mb-2">
              Tata Cara Penggunaan
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Alur Pengajuan dalam 4 Langkah Sederhana
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Prosedur operasional baku bagi seluruh anggota UKM Keilmuan dan Penalaran Ilmiah.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
              <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1.5">
                Daftar & Verifikasi
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Buat akun dengan menyertakan Nomor Registrasi Anggota (NRA) dan foto KTA aktif untuk diverifikasi oleh pengurus.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
              <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1.5">
                Pilih Sarana / Berkas
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tentukan barang yang dibutuhkan beserta durasi (jam atau hari), atau ajukan permohonan akses berkas arsip.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
              <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1.5">
                Persetujuan Pengurus
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Sekretariat memeriksa ketersediaan dan kesesuaian jadwal kegiatan sebelum menyetujui permohonan.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative">
              <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white font-bold flex items-center justify-center text-sm mb-4">
                4
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1.5">
                Pengambilan & Akses
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Ambil peralatan di sekretariat sesuai jadwal, atau buka dokumen arsip digital langsung dari portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Sekretariat & Informasi Kontak */}
      <section id="sekretariat" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white to-sky-50/50 dark:from-slate-900 dark:to-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/70 text-[#0284c7] dark:text-[#38bdf8]">
                <MapPin className="w-3.5 h-3.5" />
                Pusat Operasional
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Sekretariat UKM Keilmuan & Penalaran Ilmiah
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Pengambilan fisik barang inventaris dan konfirmasi mendesak dapat dilayani langsung di ruang sekretariat pada jam operasional piket pengurus.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5 text-[#0284c7]" /> Jam Layanan Piket
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Senin - Jumat, 09:00 - 17:00 WITA
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Khusus hari libur nasional layanan ditutup
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" /> Lokasi Ruang
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Gedung PKM / UKM Lantai 2
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Ruang Sekretariat UKM KPI Kampus
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Siap Melakukan Peminjaman?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Masuk ke akun Anda sekarang untuk memeriksa ketersediaan barang inventaris terkini atau mengakses berkas arsip kegiatan.
              </p>

              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  to="/login"
                  className="w-full py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-colors shadow-xs"
                >
                  Masuk ke Akun Saya
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="w-full py-3 min-h-[44px] inline-flex items-center justify-center rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Belum punya akun? Daftar di sini
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#0284c7] text-white rounded-lg flex items-center justify-center">
              <FolderArchive className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              SIMPAR UKM KPI
            </span>
            <span className="text-xs text-slate-400">
              v1.0.0
            </span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right">
            Sistem Informasi Manajemen Peminjaman Sarana & Arsip Dokumen.
          </div>
        </div>
      </footer>
    </div>
  );
}
