import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";

export default function PendingVerificationPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#28517E]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4EA8DE]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 border-2 border-amber-500/20 rounded-3xl text-4xl mb-6 shadow-xl shadow-amber-500/10 animate-pulse">
            ⏳
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">Menunggu Verifikasi</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            Terima kasih telah mendaftar! Akun Anda sedang dalam proses peninjauan. 
            Anda akan dapat masuk setelah administrator memverifikasi KTA dan menyetujui pendaftaran Anda.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="p-4 bg-[#4EA8DE]/10 border border-[#4EA8DE]/30 rounded-xl flex items-start gap-3 text-left">
            <span className="text-xl">ℹ️</span>
            <div>
              <div className="text-sm font-semibold text-[#28517E] dark:text-[#4EA8DE] mb-1">Apa selanjutnya?</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Hubungi administrator atau pengurus UKM jika Anda memerlukan akses segera.
              </div>
            </div>
          </div>

          <Link to="/login" className="block w-full">
            <Button className="w-full" size="lg">Kembali ke Halaman Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
