import { Inbox } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Tidak ada data",
  description = "Belum ada item yang dapat ditampilkan saat ini.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 flex items-center justify-center text-[#0284c7] dark:text-[#38bdf8] mb-4">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

