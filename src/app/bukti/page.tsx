"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Search,
  Upload,
  Loader2,
  AlertCircle,
  File,
  FileImage,
  FileText,
  Archive,
  Eye,
  Download,
  Trash2,
  Link2,
  X,
  CheckCircle2,
  Clock,
  ChevronDown,
  Filter,
} from "lucide-react";
import { useActivePeriod } from "@/contexts/active-period-context";
import type { EvidenceFile } from "@/types";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <FileImage className="w-6 h-6 text-sky-400" />;
  if (mimeType === "application/pdf") return <FileText className="w-6 h-6 text-red-400" />;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("archive"))
    return <Archive className="w-6 h-6 text-amber-400" />;
  return <File className="w-6 h-6 text-slate-400" />;
}

function ReviewBadge({ status }: { status: EvidenceFile["reviewStatus"] }) {
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

// ── Filter options ────────────────────────────────────────────────────────────
const REVIEW_FILTERS = [
  { key: "", label: "Semua Status" },
  { key: "new", label: "Baru Diunggah" },
  { key: "needs_review", label: "Perlu Ditinjau" },
  { key: "categorized", label: "Sudah Dikategorikan" },
];

// ── EvidenceFile card ─────────────────────────────────────────────────────────
interface EvidenceCardProps {
  file: EvidenceFile;
  onDelete: (id: string) => void;
}

function EvidenceCard({ file, onDelete }: EvidenceCardProps) {
  const rhkCount = file.linkedRhksCount ?? file.linkedRhks?.length ?? 0;
  const actCount = file.linkedActivitiesCount ?? file.linkedActivities?.length ?? 0;
  const hasLinks = rhkCount > 0 || actCount > 0;

  const handleView = () =>
    window.open(`/api/evidence/${file.id}/file?disposition=inline`, "_blank");

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/evidence/${file.id}/file?disposition=attachment`;
    link.download = file.originalFilename;
    link.click();
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group">
      <div className="flex items-start gap-3">
        {/* File icon */}
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center flex-shrink-0">
          <FileTypeIcon mimeType={file.mimeType} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate" title={file.originalFilename}>
            {file.originalFilename}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <ReviewBadge status={file.reviewStatus} />
            <span className="text-[11px] text-slate-500">{formatBytes(file.fileSize)}</span>
            {file.mimeType && (
              <span className="text-[11px] text-slate-600 uppercase font-mono">
                {file.mimeType.split("/")[1]?.replace("vnd.openxmlformats-officedocument.wordprocessingml.document", "docx").replace("vnd.ms-excel", "xls") || file.mimeType.split("/")[0]}
              </span>
            )}
          </div>

          {file.userDescription && (
            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{file.userDescription}</p>
          )}

          {/* Link counts */}
          <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
            {actCount > 0 && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Link2 className="w-3 h-3" /> {actCount} aktivitas
              </span>
            )}
            {rhkCount > 0 && (
              <span className="flex items-center gap-1 text-sky-400">
                <Link2 className="w-3 h-3" /> {rhkCount} RHK
              </span>
            )}
            {!hasLinks && (
              <span className="text-slate-600">Belum ditautkan ke aktivitas atau RHK</span>
            )}
            <span className="text-slate-600 ml-auto">
              {new Date(file.uploadedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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
          <button
            onClick={() => onDelete(file.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            title={hasLinks ? "Tidak dapat dihapus — masih ditautkan" : "Hapus berkas"}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Halaman Utama Bank Bukti ──────────────────────────────────────────────────
export default function BankBuktiPage() {
  const { activePeriod } = useActivePeriod();

  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [reviewFilter, setReviewFilter] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (reviewFilter) params.set("status", reviewFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/evidence?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFetchError(json.message || "Gagal memuat berkas.");
        return;
      }
      const sorted = [...(json.data ?? [])].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      setFiles(sorted);
    } catch {
      setFetchError("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  }, [search, reviewFilter]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // ── Debounce search ───────────────────────────────────────────────────────
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 400);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      setDeleteError(null);
      return;
    }
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/evidence/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setDeleteError(json.message || "Gagal menghapus berkas.");
        setDeleteConfirmId(null);
        return;
      }
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setActionSuccess("Berkas berhasil dihapus.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch {
      setDeleteError("Gagal terhubung ke server.");
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-400" />
            Bank Bukti Dukung
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gudang berkas digital (SK, sertifikat, laporan, foto) yang siap ditautkan ke satu atau beberapa aktivitas dan RHK.
            {activePeriod && <span className="text-emerald-400"> Periode: {activePeriod.name}</span>}
          </p>
        </div>

        <Link
          href="/bukti/inbox"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-colors"
        >
          <Upload className="w-4 h-4 text-emerald-400" />
          Buka Kotak Masuk Bukti
        </Link>
      </div>

      {/* Success / Error messages */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {actionSuccess}
        </div>
      )}
      {deleteError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-auto text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-700/40 text-sm text-white flex flex-wrap items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="flex-1">
            Yakin ingin menghapus berkas ini secara permanen? Berkas yang masih ditautkan ke aktivitas atau RHK tidak dapat dihapus.
          </span>
          <button
            onClick={() => handleDelete(deleteConfirmId)}
            disabled={!!deletingId}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            {deletingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Hapus
          </button>
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
          >
            Batal
          </button>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari nama berkas, deskripsi, atau kata kunci..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="relative">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value)}
            className="appearance-none pl-8 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {REVIEW_FILTERS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-sm">Memuat berkas bukti...</p>
        </div>
      ) : fetchError ? (
        <div className="py-12 text-center border border-red-500/20 rounded-2xl bg-red-500/5">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-300">{fetchError}</p>
          <button
            onClick={fetchFiles}
            className="mt-3 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
          >
            Coba Lagi
          </button>
        </div>
      ) : files.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            {search || reviewFilter ? "Tidak ada berkas sesuai filter" : "Belum ada berkas di Bank Bukti"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || reviewFilter
              ? "Coba ubah kata kunci atau filter status."
              : "Unggah berkas bukti dukung melalui Kotak Masuk Bukti."}
          </p>
          {!search && !reviewFilter && (
            <Link
              href="/bukti/inbox"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-slate-950 font-semibold text-xs"
            >
              <Upload className="w-4 h-4" />
              Unggah Sekarang
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              <span className="text-white font-semibold">{files.length}</span> berkas bukti tersimpan
              {reviewFilter && ` · filter: ${REVIEW_FILTERS.find((f) => f.key === reviewFilter)?.label}`}
            </p>
            <Link href="/bukti/inbox" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> Unggah Berkas Baru
            </Link>
          </div>

          {files.map((file) => (
            <EvidenceCard key={file.id} file={file} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
