export default function FilterChips({
  categories = [],
  selected = "",
  onSelect,
  allLabel = "Semua Kategori",
  formatLabel = (cat) => cat.replace(/_/g, " "),
  multiple = false,
}) {
  // Parsing selected list: bisa berupa array atau string comma-separated
  const selectedList = Array.isArray(selected)
    ? selected
    : typeof selected === "string" && selected
    ? selected.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const handleToggle = (cat) => {
    if (!multiple) {
      onSelect(selected === cat ? "" : cat);
      return;
    }

    if (!cat) {
      // Tombol "Semua" ditekan -> bersihkan filter
      onSelect(Array.isArray(selected) ? [] : "");
      return;
    }

    let nextList;
    if (selectedList.includes(cat)) {
      nextList = selectedList.filter((c) => c !== cat);
    } else {
      nextList = [...selectedList, cat];
    }

    onSelect(Array.isArray(selected) ? nextList : nextList.join(","));
  };

  const isAllSelected = selectedList.length === 0;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
      <button
        type="button"
        onClick={() => handleToggle("")}
        className={`cursor-pointer shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7] ${
          isAllSelected
            ? "bg-[#0284c7] text-white shadow-xs font-semibold"
            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60"
        }`}
      >
        {allLabel}
      </button>

      {categories.map((cat) => {
        const isSelected = selectedList.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => handleToggle(cat)}
            className={`cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7] ${
              isSelected
                ? "bg-[#0284c7] text-white shadow-xs font-semibold"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60"
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] transition-colors ${
                isSelected
                  ? "border-white bg-white text-[#0284c7] font-bold"
                  : "border-slate-400 dark:border-slate-500"
              }`}
            >
              {isSelected ? "✓" : ""}
            </span>
            <span>{formatLabel(cat)}</span>
          </button>
        );
      })}
    </div>
  );
}

