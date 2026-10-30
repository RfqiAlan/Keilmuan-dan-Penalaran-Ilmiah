const statusColors = {
  pending:     "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
  approved:    "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
  rejected:    "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30",
  borrowed:    "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30",
  returned:    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30",
  late:        "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30",
  cancelled:   "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30",
  expired:     "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30",
  available:   "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
  damaged:     "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30",
  lost:        "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-700/20 dark:text-rose-200 dark:border-rose-700/30",
  maintenance: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30",
  public:      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
  internal:    "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30",
  restricted:  "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
  private:     "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30",
  active:      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
  inactive:    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30",
  suspended:   "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30",
};

const statusLabels = {
  pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak",
  borrowed: "Dipinjam", returned: "Dikembalikan", late: "Terlambat",
  cancelled: "Dibatalkan", expired: "Kadaluarsa",
  available: "Tersedia", damaged: "Rusak", lost: "Hilang", maintenance: "Perawatan",
  public: "Publik", internal: "Internal", restricted: "Terbatas", private: "Privat",
  active: "Aktif", inactive: "Tidak Aktif", suspended: "Ditangguhkan",
};

export default function Badge({ status, label }) {
  const color = statusColors[status] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30";
  const text = label || statusLabels[status] || status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {text}
    </span>
  );
}
