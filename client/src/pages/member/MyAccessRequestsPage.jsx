import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import api from "../../api/axios";
import Badge from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

export default function MyAccessRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/access-requests/my")
      .then((r) => setRequests(r.data.requests || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Permintaan Akses Saya
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Pantau status permohonan izin pembukaan arsip dokumen terbatas
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
          requests.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 hover:border-[#0284c7]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                    <KeyRound className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                      {r.archive_title}
                    </h3>
                    <div className="text-xs text-[#0284c7] dark:text-[#38bdf8] font-medium capitalize mt-0.5">
                      {r.archive_category?.replace(/_/g, " ")}
                    </div>
                  </div>
                </div>
                <Badge status={r.status} />
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
                    {new Date(r.requested_at).toLocaleDateString("id-ID")}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 dark:text-slate-400">Masa Berlaku</div>
                  <div
                    className={`font-medium mt-0.5 ${
                      r.expired_at && new Date(r.expired_at) < new Date()
                        ? "text-rose-500 dark:text-rose-400"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {r.expired_at ? new Date(r.expired_at).toLocaleString("id-ID") : "—"}
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
          ))
        )}
      </div>
    </div>
  );
}
