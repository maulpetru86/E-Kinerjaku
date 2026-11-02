"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  PlusCircle,
  Search,
  Loader2,
  AlertCircle,
  Check,
  Edit3,
  Trash2,
  Calendar,
  FileText,
  Link2,
  ChevronDown,
  X,
  Save,
  Paperclip,
} from "lucide-react";
import { useActivePeriod } from "@/contexts/active-period-context";
import type { Activity } from "@/types";

// ── Tipe filter tab ──────────────────────────────────────────────────────────
type FilterStatus = "all" | "uncategorized" | "categorized" | "needs_review";

interface FilterTab {
  key: FilterStatus;
  label: string;
}

const FILTER_TABS: FilterTab[] = [
  { key: "all", label: "Semua" },
  { key: "uncategorized", label: "Belum Terkategori" },
  { key: "categorized", label: "Terhubung RHK" },
  { key: "needs_review", label: "Perlu Ditinjau" },
];

// ── Badge status kategori ────────────────────────────────────────────────────
function CategorizationBadge({ status }: { status: Activity["categorizationStatus"] }) {
  if (status === "categorized") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
        <Check className="w-3 h-3" /> Terhubung RHK
      </span>
    );
  }
  if (status === "needs_review") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-400 border border-amber-700/40">
        <AlertCircle className="w-3 h-3" /> Perlu Ditinjau
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
      Belum Terkategori
    </span>
  );
}

// ── Format tanggal ke bahasa Indonesia ───────────────────────────────────────
function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ── Modal Edit Aktivitas ──────────────────────────────────────────────────────
interface EditModalProps {
  activity: Activity;
  onClose: () => void;
  onSaved: (updated: Activity) => void;
}

function EditActivityModal({ activity, onClose, onSaved }: EditModalProps) {
  const [description, setDescription] = useState(activity.description);
  const [activityDate, setActivityDate] = useState(activity.activityDate);
  const [resultNotes, setResultNotes] = useState(activity.resultNotes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          activityDate,
          resultNotes: resultNotes.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Gagal menyimpan perubahan.");
        return;
      }
      onSaved(json.data);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-emerald-400" /> Ubah Aktivitas
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tanggal Kegiatan</label>
            <input
              type="date"
              required
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deskripsi Kegiatan</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan Hasil <span className="text-[11px] font-normal text-slate-500">(Opsional)</span>
            </label>
            <input
              type="text"
              value={resultNotes}
              onChange={(e) => setResultNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim() || !activityDate}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Kartu Aktivitas ───────────────────────────────────────────────────────────
interface ActivityCardProps {
  activity: Activity;
  onEdit: (a: Activity) => void;
  onDelete: (id: string) => void;
}

function ActivityCard({ activity, onEdit, onDelete }: ActivityCardProps) {
  const rhkCount = activity.rhkLinks?.length ?? 0;
  const evidenceCount = activity.evidenceLinks?.length ?? 0;

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group">
      <div className="flex items-start gap-3">
        {/* Date column */}
        <div className="flex-shrink-0 text-center min-w-[52px] pt-0.5">
          <p className="text-[11px] font-bold text-slate-400 leading-tight">
            {new Date(activity.activityDate + "T00:00:00").toLocaleDateString("id-ID", { month: "short" }).toUpperCase()}
          </p>
          <p className="text-xl font-black text-white leading-tight">
            {new Date(activity.activityDate + "T00:00:00").getDate()}
          </p>
          <p className="text-[11px] text-slate-500 leading-tight">
            {new Date(activity.activityDate + "T00:00:00").getFullYear()}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          {/* Status badge */}
          <div className="mb-1.5">
            <CategorizationBadge status={activity.categorizationStatus} />
          </div>

          {/* Description */}
          <p className="text-sm text-white leading-snug line-clamp-3">{activity.description}</p>

          {/* Notes */}
          {activity.resultNotes && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              <span className="text-slate-500">Hasil:</span> {activity.resultNotes}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            {activity.activityTime && (
              <span>{activity.activityTime}</span>
            )}
            {rhkCount > 0 && (
              <span className="flex items-center gap-1 text-sky-400">
                <Link2 className="w-3 h-3" />
                {rhkCount} RHK
              </span>
            )}
            {evidenceCount > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <Paperclip className="w-3 h-3" />
                {evidenceCount} Bukti
              </span>
            )}
            <span className="text-slate-600 ml-auto">
              {formatDate(activity.activityDate)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(activity)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Ubah aktivitas"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(activity.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            title="Hapus aktivitas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Halaman Utama Jurnal ──────────────────────────────────────────────────────
export default function JurnalAktivitasPage() {
  const { activePeriod } = useActivePeriod();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // ── Fetch activities ────────────────────────────────────────────────────────
  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (activePeriod?.id) params.set("periodId", activePeriod.id);
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (search) params.set("search", search);

      const res = await fetch(`/api/activities?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFetchError(json.message || "Gagal memuat jurnal aktivitas.");
        return;
      }
      setActivities(json.data ?? []);
    } catch {
      setFetchError("Gagal terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  }, [activePeriod?.id, filterStatus, search]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // ── Debounce search ─────────────────────────────────────────────────────────
  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 400);
  };

  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    setDeletingId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json.message || "Gagal menghapus aktivitas.");
        return;
      }
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setActionError("Gagal terhubung ke server.");
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  // ── Edit saved callback ─────────────────────────────────────────────────────
  const handleEditSaved = (updated: Activity) => {
    setActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setEditingActivity(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            Jurnal Aktivitas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Daftar seluruh catatan kegiatan{activePeriod ? ` pada periode ${activePeriod.name}` : ""}.
          </p>
        </div>

        <Link
          href="/aktivitas/catat"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-700/20"
        >
          <PlusCircle className="w-4 h-4" />
          Catat Aktivitas Baru
        </Link>
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {actionError}
          <button onClick={() => setActionError(null)} className="ml-auto text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Banner */}
      {deleteConfirmId && (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-700/40 text-sm text-white flex flex-wrap items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="flex-1">Yakin ingin menghapus aktivitas ini secara permanen?</span>
          <button
            onClick={() => handleDelete(deleteConfirmId)}
            disabled={!!deletingId}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            {deletingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Hapus Sekarang
          </button>
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
          >
            Batal
          </button>
        </div>
      )}

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari deskripsi kegiatan atau kata kunci..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {FILTER_TABS.map((tab) => (
              <option key={tab.key} value={tab.key}>
                {tab.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Filter tab pills (desktop) */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              filterStatus === tab.key
                ? "bg-emerald-600 text-slate-950"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-sm">Memuat jurnal aktivitas...</p>
        </div>
      ) : fetchError ? (
        <div className="py-12 text-center border border-red-500/20 rounded-2xl bg-red-500/5">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-300">{fetchError}</p>
          <button
            onClick={fetchActivities}
            className="mt-3 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
          >
            Coba Lagi
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            {search || filterStatus !== "all"
              ? "Tidak ada aktivitas yang sesuai filter"
              : "Belum ada aktivitas yang dicatat"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || filterStatus !== "all"
              ? "Coba ubah kata kunci atau filter status untuk melihat lebih banyak."
              : "Mulai catat kegiatan harian Anda. Penautan RHK dan bukti dapat dilengkapi kemudian."}
          </p>
          {!search && filterStatus === "all" && (
            <Link
              href="/aktivitas/catat"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-slate-950 font-semibold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Catat Aktivitas Sekarang
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Menampilkan <span className="text-white font-semibold">{activities.length}</span> catatan aktivitas
            {filterStatus !== "all" && ` · filter: ${FILTER_TABS.find((t) => t.key === filterStatus)?.label}`}
          </p>
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={setEditingActivity}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
