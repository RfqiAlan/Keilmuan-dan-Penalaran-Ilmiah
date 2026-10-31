import { useEffect, useCallback } from "react";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div
        className={`relative w-full ${sizes[size]} max-h-[92dvh] sm:max-h-[90vh] flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Tutup dialog"
            className="cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center -mr-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-2xl leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7]"
          >
            &times;
          </button>
        </div>
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
