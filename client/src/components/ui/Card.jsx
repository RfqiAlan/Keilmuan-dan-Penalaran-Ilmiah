export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, color = "indigo", trend }) {
  const colors = {
    indigo: "bg-sky-50/80 dark:bg-sky-950/20 border-sky-200 dark:border-sky-500/30 text-[#0284c7] dark:text-[#38bdf8]",
    green:  "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300",
    yellow: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300",
    red:    "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300",
    blue:   "bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-500/30 text-sky-800 dark:text-sky-300",
    orange: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-500/30 text-orange-800 dark:text-orange-300",
  };
  const cls = colors[color] || colors.indigo;
  const isComponent = typeof Icon === "function" || (typeof Icon === "object" && Icon !== null && "$$typeof" in Icon);

  return (
    <div className={`${cls} border rounded-xl p-3.5 sm:p-5 transition-colors duration-150`}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/70 dark:bg-slate-800/70 flex items-center justify-center text-lg sm:text-xl shrink-0" aria-hidden="true">
          {isComponent ? <Icon className="w-4 h-4 sm:w-5 sm:h-5" /> : Icon}
        </div>
        {trend && <span className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium">{trend}</span>}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{value ?? "—"}</div>
      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 truncate" title={label}>{label}</div>
    </div>
  );
}
