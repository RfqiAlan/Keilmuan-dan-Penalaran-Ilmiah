import React from "react";

export default function AdminReports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Laporan</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Halaman laporan sistem SIMPAR UKM</p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Sedang Dalam Pengembangan</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Fitur Laporan (Reports) saat ini sedang dalam tahap pengembangan. Nantinya Anda dapat melihat dan mengunduh berbagai laporan statistik peminjaman, inventaris barang, dan aktivitas sistem di sini.
        </p>
      </div>
    </div>
  );
}
