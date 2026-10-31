import { useState, useEffect } from "react";
import { Search, X, Folder, FileText, ArrowLeft } from "lucide-react";
import api from "../../api/axios";

// Icons
const FolderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M4 10C4 8.89543 4.89543 8 6 8H16L20 12H34C35.1046 12 36 12.8954 36 14V30C36 31.1046 35.1046 32 34 32H6C4.89543 32 4 31.1046 4 30V10Z" fill="#0284c7" fillOpacity="0.15" stroke="#0284c7" strokeWidth="1.5"/>
  </svg>
);

const FileIcon = ({ mimeType }) => {
  const getEmoji = () => {
    if (!mimeType) return "📄";
    if (mimeType.includes("pdf")) return "📕";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("video")) return "🎬";
    if (mimeType.includes("audio")) return "🎵";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("sheet")) return "📊";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint") || mimeType.includes("slide")) return "📽️";
    if (mimeType.includes("document") || mimeType.includes("word")) return "📝";
    if (mimeType.includes("zip") || mimeType.includes("archive") || mimeType.includes("compressed")) return "📦";
    return "📄";
  };
  return <span className="text-3xl">{getEmoji()}</span>;
};

const formatFileSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export default function DriveFolderBrowser({ rootFolderId, rootFolderName }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: rootFolderId, name: rootFolderName || "Root" }]);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'folder' | 'file'

  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;

  useEffect(() => {
    fetchFolder(currentFolderId);
  }, [currentFolderId]);

  const fetchFolder = async (folderId) => {
    setLoading(true);
    setError("");
    setPreviewFile(null);
    try {
      const res = await api.get(`/archives/drive/folder/${folderId}`);
      setItems(res.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat isi folder.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFolder = (folder) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSearchQuery("");
    setTypeFilter("all");
  };

  const handleBreadcrumbClick = (index) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setPreviewFile(null);
    setSearchQuery("");
    setTypeFilter("all");
  };

  const handleOpenFile = (file) => {
    setPreviewFile(file);
  };

  const handleBackToFolder = () => {
    setPreviewFile(null);
  };

  const folderCount = items.filter((i) => i.isFolder).length;
  const fileCount = items.filter((i) => !i.isFolder).length;

  const filteredItems = items.filter((item) => {
    if (typeFilter === "folder" && !item.isFolder) return false;
    if (typeFilter === "file" && item.isFolder) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchMime = item.mimeType ? item.mimeType.toLowerCase().includes(q) : false;
      return matchName || matchMime;
    }
    return true;
  });

  // If previewing a file
  if (previewFile) {
    return (
      <div className="space-y-3">
        {/* Back button + file name */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToFolder}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Kembali
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
            <FileIcon mimeType={previewFile.mimeType} />
            <span className="truncate">{previewFile.name}</span>
          </div>
        </div>

        {/* File preview iframe */}
        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative h-[55vh] sm:h-[520px]">
          <iframe
            src={previewFile.previewUrl}
            className="w-full h-full"
            title={previewFile.name}
            allow="autoplay"
          />
          <div className="absolute top-0 right-0 w-16 h-16 z-10 bg-transparent cursor-not-allowed" title="Pop-out dibatasi" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 flex-wrap px-1 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/50">
        {breadcrumbs.map((crumb, i) => (
          <div key={`${crumb.id}-${i}`} className="flex items-center gap-1">
            {i > 0 && <span className="text-slate-600 text-xs">/</span>}
            <button
              onClick={() => handleBreadcrumbClick(i)}
              className={`cursor-pointer px-2.5 py-1.5 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7] ${
                i === breadcrumbs.length - 1
                  ? "bg-[#0284c7]/10 dark:bg-[#0284c7]/20 text-[#0284c7] dark:text-[#38bdf8] font-semibold border border-[#0284c7]/20 dark:border-[#38bdf8]/30"
                  : "text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              }`}
            >
              {i === 0 ? "📁" : ""} {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berkas atau folder di dalam folder ini..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0284c7] placeholder-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700/60 shrink-0 text-xs overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`cursor-pointer px-2.5 py-1 rounded-md font-medium transition-colors ${
                typeFilter === "all"
                  ? "bg-white dark:bg-slate-700 text-[#0284c7] dark:text-[#38bdf8] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("folder")}
              className={`cursor-pointer px-2.5 py-1 rounded-md font-medium transition-colors ${
                typeFilter === "folder"
                  ? "bg-white dark:bg-slate-700 text-[#0284c7] dark:text-[#38bdf8] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              📁 Folder ({folderCount})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("file")}
              className={`cursor-pointer px-2.5 py-1 rounded-md font-medium transition-colors ${
                typeFilter === "file"
                  ? "bg-white dark:bg-slate-700 text-[#0284c7] dark:text-[#38bdf8] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              📄 File ({fileCount})
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-3">
            <div className="animate-spin w-8 h-8 border-2 border-[#0284c7] border-t-transparent rounded-full mx-auto" />
            <div className="text-sm text-slate-500 dark:text-slate-500">Memuat isi folder...</div>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm text-center font-medium">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-2">
            <div className="text-4xl" aria-hidden="true">📂</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">Folder ini kosong</div>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Tidak ada berkas atau folder ditemukan
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            {searchQuery.trim()
              ? `Tidak ditemukan berkas atau folder yang cocok dengan kata kunci "${searchQuery}".`
              : "Tidak ada item pada filter tipe yang dipilih."}
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(""); setTypeFilter("all"); }}
            className="cursor-pointer text-xs text-[#0284c7] dark:text-[#38bdf8] hover:underline font-semibold mt-1"
          >
            Reset Pencarian & Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.isFolder ? handleOpenFolder(item) : handleOpenFile(item)}
              className="cursor-pointer flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80
                hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-[#0284c7]/40 transition-all duration-150
                text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7]"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {item.isFolder ? <FolderIcon /> : <FileIcon mimeType={item.mimeType} />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate group-hover:text-[#0284c7] transition-colors">
                  {item.name}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.isFolder ? (
                    <span className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-medium">
                      Folder {item.isShortcut ? "• Pintasan" : ""}
                    </span>
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500">{formatFileSize(item.size)}</span>
                      <span className="text-[10px] text-slate-400" aria-hidden="true">•</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 truncate">
                        {item.isShortcut ? "Pintasan • " : ""}{item.mimeType?.split("/").pop()?.split(".").pop()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 opacity-70 sm:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                {item.isFolder ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4L10 8L6 12" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <span className="text-[10px] text-[#0284c7] dark:text-[#38bdf8] font-semibold">Preview</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Item count & Footer */}
      {!loading && items.length > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between px-1 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>
            {searchQuery.trim() || typeFilter !== "all"
              ? `Menampilkan ${filteredItems.length} dari total ${items.length} item`
              : `${folderCount} folder, ${fileCount} file`}
          </span>
          {(searchQuery.trim() || typeFilter !== "all") && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setTypeFilter("all"); }}
              className="cursor-pointer text-xs text-[#0284c7] dark:text-[#38bdf8] hover:underline font-medium"
            >
              Tampilkan Semua ({items.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
