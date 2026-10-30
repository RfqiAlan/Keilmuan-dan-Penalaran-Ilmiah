export default function FilterChips({
  categories = [],
  selected = "",
  onSelect,
  allLabel = "Semua Kategori",
  formatLabel = (cat) => cat.replace(/_/g, " "),
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
      <button
        type="button"
        onClick={() => onSelect("")}
        className={`cursor-pointer shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7] ${
          selected === ""
            ? "bg-[#0284c7] text-white shadow-sm"
            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60"
        }`}
      >
        {allLabel}
      </button>

      {categories.map((cat) => {
        const isSelected = selected === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={`cursor-pointer shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7] ${
              isSelected
                ? "bg-[#0284c7] text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60"
            }`}
          >
            {formatLabel(cat)}
          </button>
        );
      })}
    </div>
  );
}

