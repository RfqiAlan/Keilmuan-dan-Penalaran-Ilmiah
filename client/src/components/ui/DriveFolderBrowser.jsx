import { useState, useEffect } from "react";
import api from "../../api/axios";

// Icons
const FolderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M4 10C4 8.89543 4.89543 8 6 8H16L20 12H34C35.1046 12 36 12.8954 36 14V30C36 31.1046 35.1046 32 34 32H6C4.89543 32 4 31.1046 4 30V10Z" fill="#4EA8DE" fillOpacity="0.2" stroke="#4EA8DE" strokeWidth="1.5"/>
  </svg>
);

const FileIcon = ({ mimeType }) => {
  const getEmoji = () => {
    if (!mimeType) return "📄";
    if (mimeType.includes("pdf")) return "📕";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("video")) return "🎬";
    if (mimeType.includes("audio")) return "🎵";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📽️";
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
  };

  const handleBreadcrumbClick = (index) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setPreviewFile(null);
  };

  const handleOpenFile = (file) => {
    setPreviewFile(file);
  };

  const handleBackToFolder = () => {
    setPreviewFile(null);
  };

  // If previewing a file
  if (previewFile) {
    return (
      <div className="space-y-3">
        {/* Back button + file name */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Kembali
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-200 font-medium truncate">
            <FileIcon mimeType={previewFile.mimeType} />
            <span className="truncate">{previewFile.name}</span>
          </div>
        </div>

        {/* File preview iframe */}
        <div className="rounded-lg overflow-hidden border border-slate-700 relative" style={{ height: "520px" }}>
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
      <div className="flex items-center gap-1 flex-wrap px-1 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50">
        {breadcrumbs.map((crumb, i) => (
          <div key={`${crumb.id}-${i}`} className="flex items-center gap-1">
            {i > 0 && <span className="text-slate-600 text-xs">/</span>}
            <button
              onClick={() => handleBreadcrumbClick(i)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                i === breadcrumbs.length - 1
                  ? "bg-[#4EA8DE]/10 text-[#4EA8DE] font-medium border border-[#4EA8DE]/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              {i === 0 ? "📁" : ""} {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-3">
            <div className="animate-spin w-8 h-8 border-2 border-[#4EA8DE] border-t-transparent rounded-full mx-auto" />
            <div className="text-sm text-slate-500">Memuat isi folder...</div>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-2">
            <div className="text-4xl">📂</div>
            <div className="text-slate-400 text-sm">Folder ini kosong</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => item.isFolder ? handleOpenFolder(item) : handleOpenFile(item)}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-700/50 bg-slate-800/40
                hover:bg-slate-700/50 hover:border-[#4EA8DE]/30 transition-all duration-200
                text-left group"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {item.isFolder ? <FolderIcon /> : <FileIcon mimeType={item.mimeType} />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-200 font-medium truncate group-hover:text-[#4EA8DE] transition-colors">
                  {item.name}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.isFolder ? (
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Folder</span>
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-500">{formatFileSize(item.size)}</span>
                      <span className="text-[10px] text-slate-600">•</span>
                      <span className="text-[10px] text-slate-500 truncate">{item.mimeType?.split("/").pop()?.split(".").pop()}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.isFolder ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="#4EA8DE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <span className="text-[10px] text-[#4EA8DE] font-medium">Preview</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Item count */}
      {!loading && items.length > 0 && (
        <div className="text-xs text-slate-600 text-right px-1">
          {items.filter((i) => i.isFolder).length} folder, {items.filter((i) => !i.isFolder).length} file
        </div>
      )}
    </div>
  );
}
