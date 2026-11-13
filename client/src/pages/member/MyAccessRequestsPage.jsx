import { useEffect, useState } from "react";
import { KeyRound, Eye, AlertTriangle, Folder, FileText } from "lucide-react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import DriveFolderBrowser from "../../components/ui/DriveFolderBrowser";
import { Skeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../contexts/ToastContext";

export default function MyAccessRequestsPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    archive: null,
    previewUrl: null,
  });

  useEffect(() => {
    api.get("/access-requests/my")
      .then((r) => setRequests(r.data.requests || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDoc = async (request) => {
    setOpeningId(request.id);
    try {
      const res = await api.get(`/archives/${request.archive_id}/preview`);
      setPreviewModal({
        open: true,
        archive: {
          id: request.archive_id,
          title: request.archive_title || res.data.title,
          category: request.archive_category || res.data.category,
          year: request.archive_year || res.data.year,
          drive_type: request.drive_type || res.data.drive_type || "file",
          drive_file_id: request.drive_file_id || res.data.drive_file_id,
          access_level: request.access_level || res.data.access_level,
        },
        previewUrl: res.data.previewUrl,
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal memuat dokumen arsip.";
      showToast(msg, "error");
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Permintaan Akses Saya
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Pantau status permohonan izin dan buka arsip dokumen yang telah disetujui
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-xs space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-1.5 w-1/2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="Belum Ada Permintaan Akses"
            description="Anda belum pernah mengajukan permohonan akses dokumen terbatas."
          />
        ) : (
          requests.map((r) => {
            const isApproved = r.status === "approved";
            const isExpired = isApproved && r.expired_at && new Date(r.expired_at) < new Date();
            const canOpen = isApproved && !isExpired;

            return (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 hover:border-[#0284c7]/40 hover:shadow-xs transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                      {r.drive_type === "folder" ? (
                        <Folder className="w-5 h-5 stroke-[1.75]" />
                      ) : (
                        <FileText className="w-5 h-5 stroke-[1.75]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-semibold text-slate-900 dark:text-slate-100 text-base truncate"
                        title={r.archive_title}
                      >
                        {r.archive_title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#0284c7] dark:text-[#38bdf8] font-medium capitalize">
                          {r.archive_category?.replace(/_/g, " ")}
                        </span>
                        {r.archive_year && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-mono">
                            Periode {r.archive_year}
                          </span>
                        )}
                        {r.archive_number && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                            #{r.archive_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                    <Badge status={isExpired ? "expired" : r.status} />
                    {canOpen && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenDoc(r)}
                        disabled={openingId === r.id}
                        className="cursor-pointer font-medium shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        {openingId === r.id ? "Membuka..." : "Buka Dokumen"}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Alasan Pengajuan</div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                      {r.reason}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Tgl Permintaan</div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                      {new Date(r.requested_at || r.created_at).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">Masa Berlaku</div>
                    <div
                      className={`font-medium mt-0.5 ${
                        isExpired
                          ? "text-rose-500 dark:text-rose-400"
                          : isApproved
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {r.expired_at
                        ? `${new Date(r.expired_at).toLocaleString("id-ID")}${isExpired ? " (Berakhir)" : ""}`
                        : isApproved
                        ? "Akses Tetap Aktif"
                        : "-"}
                    </div>
                  </div>
                  {r.admin_note && (
                    <div className="sm:col-span-3 pt-1">
                      <div className="text-slate-500 dark:text-slate-400">Catatan Admin:</div>
                      <div className="text-[#0284c7] dark:text-[#38bdf8] font-medium mt-0.5 italic">
                        "{r.admin_note}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal.open}
        onClose={() => setPreviewModal({ open: false, archive: null, previewUrl: null })}
        title={previewModal.archive?.title || "Preview Dokumen"}
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center flex-wrap gap-2.5 text-xs">
            {previewModal.archive?.year && (
              <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] border border-sky-200 dark:border-sky-800 rounded font-medium">
                Periode {previewModal.archive?.year}
              </span>
            )}
            {previewModal.archive?.category && (
              <span className="text-slate-600 dark:text-slate-400 capitalize font-medium">
                {previewModal.archive?.category?.replace(/_/g, " ")}
              </span>
            )}
            {previewModal.archive?.access_level && (
              <div className="flex gap-1 flex-wrap">
                {previewModal.archive?.access_level?.split(",").map((lvl) => (
                  <span
                    key={lvl}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded capitalize"
                  >
                    {lvl}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Dokumen ini hanya untuk ditinjau. Dilarang mendistribusikan konten ini keluar organisasi.</span>
          </div>

          {previewModal.archive?.drive_type === "folder" ? (
            <DriveFolderBrowser
              rootFolderId={previewModal.archive?.drive_file_id}
              rootFolderName={previewModal.archive?.title}
            />
          ) : (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner bg-slate-900 h-[60vh] sm:h-[520px]">
              {previewModal.previewUrl && (
                <>
                  <iframe
                    src={previewModal.previewUrl}
                    className="w-full h-full"
                    title="Document Preview"
                    allow="autoplay"
                  />
                  <div
                    className="absolute top-0 right-0 w-16 h-16 z-10 bg-transparent cursor-not-allowed"
                    title="Pop-out dibatasi"
                  />
                </>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
