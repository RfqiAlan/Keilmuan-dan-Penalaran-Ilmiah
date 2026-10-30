export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const variants = {
    primary: "bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white shadow-sm shadow-[#0284c7]/20",
    secondary: "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600",
    danger: "bg-red-50 dark:bg-red-900/30 hover:bg-red-600 dark:hover:bg-red-600 text-red-700 dark:text-red-300 hover:text-white dark:hover:text-white border border-red-200 dark:border-red-700/50",
    success: "bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-emerald-800 dark:text-emerald-300 hover:text-white dark:hover:text-white border border-emerald-200 dark:border-emerald-700/50",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100",
  };
  const sizes = {
    sm: "min-h-[36px] px-3 py-1.5 text-xs rounded-lg",
    md: "min-h-[40px] px-4 py-2 text-sm rounded-lg",
    lg: "min-h-[44px] px-6 py-2.5 text-base rounded-xl",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
