export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ icon, label, value, color = "indigo", trend }) {
  const colors = {
    indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400",
    green:  "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
    yellow: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400",
    red:    "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
    blue:   "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400",
  };
  const cls = colors[color] || colors.indigo;
  return (
    <div className={`bg-gradient-to-br ${cls} border rounded-xl p-5 transition-transform hover:-translate-y-1 duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && <span className="text-xs text-slate-400">{trend}</span>}
      </div>
      <div className="text-3xl font-bold text-slate-100">{value ?? "—"}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}
