"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Inbox,
  Upload,
  AlertCircle,
  FileCheck,
  Loader2,
  X,
  File,
  FileImage,
  FileText,
  Archive,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { SuggestionCard } from "@/components/ai/suggestion-card";
import type { EvidenceFile, AISuggestion } from "@/types";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <FileImage className="w-5 h-5 text-sky-400" />;
  if (mimeType === "application/pdf") return <FileText className="w-5 h-5 text-red-400" />;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("archive"))
    return <Archive className="w-5 h-5 text-amber-400" />;
  return <File className="w-5 h-5 text-slate-400" />;
}

function ReviewStatusBadge({ status }: { status: EvidenceFile["reviewStatus"] }) {
  if (status === "categorized")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
        <CheckCircle2 className="w-3 h-3" /> Sudah Dikategorikan
      </span>
    );
  if (status === "needs_review")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-400 border border-amber-700/40">
        <AlertCircle className="w-3 h-3" /> Perlu Ditinjau
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-400 border border-sky-700/40">
      <Clock className="w-3 h-3" /> Baru Diunggah
    </span>
  );
}

// ── Upload area ───────────────────────────────────────────────────────────────
interface UploadProgress {
  name: string;
  status: "uploading" | "done" | "error";
  message?: string;
}

// ── Kartu berkas inbox ────────────────────────────────────────────────────────
interface InboxCardProps {
  file: EvidenceFile;
  suggestions: AISuggestion[];
  isAnalyzing: boolean;
  onTriggerAI: (fileId: string) => void;
  onSuggestionReviewed: (suggestion: AISuggestion, action: "accept" | "reject") => void;
  onRemoved: (id: string) => void;
}

function InboxFileCard({
  file,
  suggestions,
  isAnalyzing,
  onTriggerAI,
  onSuggestionReviewed,
  onRemoved,
}: InboxCardProps) {
  const pendingSuggestions = suggestions.filter(
    (s) => s.entityId === file.id && s.status === "pending"
  );

  const handleView = () => {
    window.open(`/api/evidence/${file.id}/file?disposition=inline`, "_blank");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/evidence/${file.id}/file?disposition=attachment`;
    link.download = file.originalFilename;
    link.click();
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
          <FileIcon mimeType={file.mimeType} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{file.originalFilename}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <ReviewStatusBadge status={file.reviewStatus} />
            <span className="text-[11px] text-slate-500">{formatBytes(file.fileSize)}</span>
            {file.evidenceDate && (
              <span className="text-[11px] text-slate-500">
                Tgl bukti: {new Date(file.evidenceDate).toLocaleDateString("id-ID")}
              </span>
            )}
            {pendingSuggestions.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/70 text-indigo-400 border border-indigo-700/40 animate-pulse">
                <Sparkles className="w-3 h-3" /> Usulan AI Siap
              </span>
            )}
          </div>
          {file.userDescription && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{file.userDescription}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-600">
            <span>Diunggah {new Date(file.uploadedAt).toLocaleString("id-ID")}</span>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => onTriggerAI(file.id)}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors ml-auto disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Analisis dengan AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onTriggerAI(file.id)}
            disabled={isAnalyzing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 disabled:opacity-50"
            title="Analisis metadata dengan AI"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleView}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Pratinjau berkas"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Unduh berkas"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pending AI Suggestions for this evidence file */}
      {pendingSuggestions.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          {pendingSuggestions.map((sug) => (
            <SuggestionCard
              key={sug.id}
              suggestion={sug}
              onReviewed={onSuggestionReviewed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Halaman Utama ─────────────────────────────────────────────────────────────
export default function KotakMasukBuktiPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadBatch, setUploadBatch] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Fetch inbox files & suggestions ───────────────────────────────────────
  const fetchInboxAndSuggestions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [resFiles, resSug] = await Promise.all([
        fetch("/api/evidence").then((r) => r.json()),
        fetch("/api/ai/suggestions?entityType=evidence_file&status=pending").then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (!resFiles.ok && !resFiles.success) {
        setFetchError(resFiles.message || "Gagal memuat berkas.");
        return;
      }

      const sorted = [...(resFiles.data ?? [])].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      setFiles(sorted);

      if (resSug.success && Array.isArray(resSug.data)) {
        setSuggestions(resSug.data);
      }
    } catch {
      setFetchError("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInboxAndSuggestions();
  }, [fetchInboxAndSuggestions]);

  // ── Trigger AI Analysis for Evidence File ──────────────────────────────────
  const handleTriggerAIEvidence = async (evidenceFileId: string) => {
    if (analyzingIds.includes(evidenceFileId)) return;
    setAnalyzingIds((prev) => [...prev, evidenceFileId]);
    setUploadError(null);

    try {
      const res = await fetch("/api/ai/analyze-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidenceFileId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setUploadError(json.message || "Gagal menganalisis berkas dengan AI.");
        return;
      }

      if (json.data) {
        setSuggestions((prev) => [
          json.data,
          ...prev.filter((s) => s.id !== json.data.id),
        ]);
        setUploadSuccess(json.message || "Usulan metadata dari AI siap ditinjau.");
        setTimeout(() => setUploadSuccess(null), 4000);
      }
    } catch {
      setUploadError("Gagal terhubung ke server saat menganalisis berkas.");
    } finally {
      setAnalyzingIds((prev) => prev.filter((id) => id !== evidenceFileId));
    }
  };

  // ── Handle Reviewed Suggestion ─────────────────────────────────────────────
  const handleSuggestionReviewed = async (
    updatedSuggestion: AISuggestion,
    action: "accept" | "reject"
  ) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== updatedSuggestion.id));

    if (action === "accept") {
      setUploadSuccess("Usulan AI diterima! Metadata berkas bukti telah diperbarui.");
      await fetchInboxAndSuggestions();
    } else {
      setUploadSuccess("Usulan AI ditolak. Berkas bukti Anda tetap utuh.");
    }
    setTimeout(() => setUploadSuccess(null), 3500);
  };

  // ── Upload handler ────────────────────────────────────────────────────────
  const uploadFiles = useCallback(
    async (selected: FileList | File[]) => {
      const fileArray = Array.from(selected);
      if (fileArray.length === 0) return;

      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);
      setUploadBatch(fileArray.map((f) => ({ name: f.name, status: "uploading" })));

      try {
        const formData = new FormData();
        fileArray.forEach((f) => formData.append("files", f));

        const res = await fetch("/api/evidence", { method: "POST", body: formData });
        const json = await res.json();

        if (!res.ok || !json.success) {
          setUploadError(json.message || "Gagal mengunggah berkas.");
          setUploadBatch((prev) => prev.map((p) => ({ ...p, status: "error" as const })));
          return;
        }

        setUploadBatch((prev) => prev.map((p) => ({ ...p, status: "done" as const })));
        setUploadSuccess(json.message || `${fileArray.length} berkas berhasil diunggah.`);

        await fetchInboxAndSuggestions();
        setTimeout(() => {
          setUploadBatch([]);
          setUploadSuccess(null);
        }, 4000);
      } catch {
        setUploadError("Gagal terhubung ke server. Berkas belum tersimpan.");
        setUploadBatch((prev) => prev.map((p) => ({ ...p, status: "error" as const })));
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [fetchInboxAndSuggestions]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
  };

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Inbox className="w-6 h-6 text-amber-400" />
            Kotak Masuk Bukti Dukung
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Unggah berkas bukti kapan saja. Tidak perlu langsung menentukan RHK atau kegiatan — berkas aman tersimpan dan bisa dirapikan kapan pun.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-700/20"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Unggah Berkas Baru
        </button>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInput} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar" />
      </div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold text-white">Filosofi Kotak Masuk:</span> Unggah dahulu, rapikan kemudian. Satu berkas dapat ditautkan ke banyak aktivitas dan RHK tanpa perlu diunggah ulang. Anda juga dapat menggunakan asisten AI untuk mengekstrak tanggal dan ringkasan usulan secara otomatis.
        </div>
      </div>

      {/* Upload Success */}
      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>{uploadSuccess}</p>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p>{uploadError}</p>
          <button onClick={() => setUploadError(null)} className="ml-auto text-slate-500 hover:text-white flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadBatch.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-300 mb-2">Progres Unggah</p>
          {uploadBatch.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {b.status === "uploading" && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400 flex-shrink-0" />}
              {b.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
              {b.status === "error" && <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
              <span className={`flex-1 truncate ${b.status === "error" ? "text-red-300" : "text-slate-300"}`}>
                {b.name}
              </span>
              <span className={`text-[11px] ${b.status === "uploading" ? "text-amber-400" : b.status === "done" ? "text-emerald-400" : "text-red-400"}`}>
                {b.status === "uploading" ? "Mengunggah..." : b.status === "done" ? "Selesai" : "Gagal"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <div
        ref={dropzoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
          isDragOver
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-slate-800 hover:border-emerald-500/50 bg-slate-900/40"
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-emerald-400" />
          )}
        </div>
        <h3 className="text-sm font-bold text-white">
          {isDragOver ? "Lepaskan untuk Mengunggah" : "Tarik & Lepaskan Berkas ke Sini"}
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Mendukung JPG, PNG, PDF, dokumen Office, dan arsip ZIP hingga <strong className="text-slate-300">15MB</strong> per berkas. Bisa unggah banyak sekaligus.
        </p>
        <button
          type="button"
          className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors pointer-events-none"
        >
          Pilih Berkas dari Perangkat
        </button>
      </div>

      {/* File list */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm">Memuat berkas...</p>
        </div>
      ) : fetchError ? (
        <div className="py-10 text-center border border-red-500/20 rounded-2xl bg-red-500/5">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-300">{fetchError}</p>
          <button
            onClick={fetchInboxAndSuggestions}
            className="mt-3 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
          >
            Coba Lagi
          </button>
        </div>
      ) : files.length === 0 ? (
        <div className="py-12 text-center border border-slate-800/80 rounded-2xl bg-slate-900/20">
          <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
          <h4 className="text-sm font-semibold text-slate-300">Belum Ada Berkas di Kotak Masuk</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah berkas bukti dukung Anda menggunakan tombol di atas atau tarik berkas ke area unggah.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              <span className="text-white font-semibold">{files.length}</span> berkas tersimpan
            </p>
            <a href="/bukti" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Lihat Bank Bukti <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
          {files.map((file) => (
            <InboxFileCard
              key={file.id}
              file={file}
              suggestions={suggestions}
              isAnalyzing={analyzingIds.includes(file.id)}
              onTriggerAI={handleTriggerAIEvidence}
              onSuggestionReviewed={handleSuggestionReviewed}
              onRemoved={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
