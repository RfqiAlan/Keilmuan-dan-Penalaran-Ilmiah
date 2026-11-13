import { Link } from "react-router-dom";
import { FolderArchive, Clock, ShieldCheck, CheckCircle2, Lock, ArrowLeft, RefreshCw } from "lucide-react";
import Button from "../../components/ui/Button";

export default function PendingVerificationPage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-[#0284c7] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#0369a1] to-[#0284c7] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#0284c7]/25 ring-1 ring-white/20">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
              SIMPAR UKM
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block tracking-wide uppercase">
              Sistem Informasi Peminjaman & Arsip
            </span>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-left">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Verifikasi Tertunda
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Pendaftaran Sedang Ditinjau
              </h1>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Terima kasih telah mendaftar di portal SIMPAR UKM. Berkas KTA dan Nomor Registrasi Anggota (NRA) Anda sedang dalam tahap verifikasi oleh pengurus UKM.
          </p>

          {/* Stepper Verification Progress */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/70 dark:border-slate-700/50 space-y-3.5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Alur Verifikasi Akun
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">Registrasi Form Selesai</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Data identitas & berkas KTA telah tersimpan di sistem.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-900 dark:text-slate-100">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Pemeriksaan KTA & NRA</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pengurus memeriksa kesesuaian data keanggotaan aktif.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-slate-400 dark:text-slate-600">
                <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Aktivasi Hak Akses</span>
                  <p className="text-xs text-slate-400 dark:text-slate-600">Akun dapat masuk dan meminjam barang serta mengakses arsip.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help box */}
          <div className="p-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-slate-200">Perlu akses mendesak?</span>{" "}
              Silakan konfirmasi ke sekretaris atau pengurus UKM melalui grup koordinasi untuk percepatan persetujuan akun.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2.5">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleReload}
            >
              <RefreshCw className="w-4 h-4" />
              Periksa Status Terbaru
            </Button>

            <Link to="/login" className="block w-full">
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Halaman Masuk
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs text-slate-500 dark:text-slate-500">
          SIMPAR UKM Keilmuan & Penalaran Ilmiah
        </p>
      </div>
    </div>
  );
}
