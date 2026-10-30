import { useState, useRef } from "react";
import { CreditCard, UploadCloud } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import api from "../../api/axios";

export default function KtaUploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan.");
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB.");
      return;
    }

    setFile(selectedFile);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Pilih file KTA terlebih dahulu.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("kta_file", file);

      const res = await api.post("/users/kta", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onSuccess) onSuccess(res.data.kta);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengunggah KTA.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError("");
    setDragOver(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Kartu Tanda Anggota (KTA)" size="md">
      <div className="space-y-4">
        {/* Info banner */}
        <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 rounded-xl text-sm">
          <div className="flex items-center gap-2 font-semibold text-[#0284c7] dark:text-[#38bdf8] mb-1">
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Kartu Tanda Anggota Diperlukan</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Anda harus mengunggah foto KTA untuk dapat meminjam barang atau melihat arsip dokumen.
            File yang diunggah akan disimpan dengan aman di Google Drive UKM.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Drop zone */}
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
            transition-all duration-200
            ${dragOver
              ? "border-[#0284c7] bg-sky-50 dark:bg-sky-950/20"
              : "border-slate-300 dark:border-slate-600 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }
          `}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />

          {preview ? (
            <div className="space-y-3">
              <img
                src={preview}
                alt="Preview KTA"
                className="max-h-52 mx-auto rounded-lg border border-slate-300 dark:border-slate-600 shadow-md"
              />
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{file?.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {(file?.size / 1024 / 1024).toFixed(2)} MB • Klik untuk mengganti
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 py-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-sky-50 dark:bg-sky-950/40 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center">
                <UploadCloud className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div className="text-slate-800 dark:text-slate-200 font-medium text-sm">
                Tarik & letakkan foto KTA di sini
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                atau klik untuk memilih berkas • JPG, PNG, WEBP • Maksimal 5MB
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Batal
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Mengunggah...
              </span>
            ) : (
              "Unggah KTA"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
