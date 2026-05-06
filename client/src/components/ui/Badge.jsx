// Status badge component
const statusColors = {
  // Borrowings
  pending:    "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  approved:   "bg-green-500/20 text-green-400 border border-green-500/30",
  rejected:   "bg-red-500/20 text-red-400 border border-red-500/30",
  borrowed:   "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  returned:   "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  late:       "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  cancelled:  "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  expired:    "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  // Items
  available:   "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  damaged:     "bg-red-500/20 text-red-400 border border-red-500/30",
  lost:        "bg-red-700/20 text-red-300 border border-red-700/30",
  maintenance: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  // Access levels
  public:     "bg-green-500/20 text-green-400 border border-green-500/30",
  internal:   "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  restricted: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  private:    "bg-red-500/20 text-red-400 border border-red-500/30",
  // User status
  active:     "bg-green-500/20 text-green-400 border border-green-500/30",
  inactive:   "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  suspended:  "bg-red-500/20 text-red-400 border border-red-500/30",
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
  const color = statusColors[status] || "bg-slate-500/20 text-slate-400 border border-slate-500/30";
  const text = label || statusLabels[status] || status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  );
}
