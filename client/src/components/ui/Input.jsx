export function Input({ label, error, className = "", id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/gi, "-") : undefined);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        className={`w-full bg-slate-50 dark:bg-slate-800/80 border ${error ? "border-red-500" : "border-slate-300 dark:border-slate-600"} text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = "", id, children, ...props }) {
  const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/gi, "-") : undefined);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        className={`w-full cursor-pointer bg-slate-50 dark:bg-slate-800/80 border ${error ? "border-red-500" : "border-slate-300 dark:border-slate-600"} text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = "", id, ...props }) {
  const textareaId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/gi, "-") : undefined);
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={textareaId} className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        className={`w-full bg-slate-50 dark:bg-slate-800/80 border ${error ? "border-red-500" : "border-slate-300 dark:border-slate-600"} text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent transition-all resize-none ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}
    </div>
  );
}
