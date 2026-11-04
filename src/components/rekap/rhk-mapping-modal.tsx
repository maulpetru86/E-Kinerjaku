"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GitCompare,
  X,
  Sparkles,
  Check,
  Trash2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Info,
} from "lucide-react";
import type { PerformancePeriod, RhkMapping, RHK } from "@/types";

interface RhkMappingModalProps {
  activePeriodId?: string;
  onClose: () => void;
}

export function RhkMappingModal({ activePeriodId, onClose }: RhkMappingModalProps) {
  const [periods, setPeriods] = useState<PerformancePeriod[]>([]);
  const [oldPeriodId, setOldPeriodId] = useState<string>("");
  const [newPeriodId, setNewPeriodId] = useState<string>(activePeriodId || "");

  const [mappings, setMappings] = useState<RhkMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load periods
  useEffect(() => {
    fetch("/api/periods")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setPeriods(res.data);
          // Default old period = period other than active
          const others = res.data.filter((p: PerformancePeriod) => p.id !== activePeriodId);
          if (others.length > 0) {
            setOldPeriodId(others[0].id);
          }
        }
      })
      .catch(() => setError("Gagal memuat daftar periode"));
  }, [activePeriodId]);

  // Load existing mappings
  const fetchMappings = useCallback(async () => {
    if (!oldPeriodId || !newPeriodId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/rhk/mappings?oldPeriodId=${oldPeriodId}&newPeriodId=${newPeriodId}`
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMappings(json.data);
      }
    } catch {
      setError("Gagal memuat data pemetaan RHK.");
    } finally {
      setIsLoading(false);
    }
  }, [oldPeriodId, newPeriodId]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  // Trigger Auto-suggest
  const handleAutoSuggest = async () => {
    if (!oldPeriodId || !newPeriodId) return;
    setIsSuggesting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/rhk/mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_suggest",
          oldPeriodId,
          newPeriodId,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Gagal menyusun usulan pemetaan.");
        return;
      }

      setMappings(json.data || []);
      setSuccess("Usulan pemetaan RHK berhasil disiapkan berdasarkan keselarasan kata.");
      setTimeout(() => setSuccess(null), 3500);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsSuggesting(false);
    }
  };

  // Review status: confirm or reject
  const handleReview = async (id: string, status: "confirmed" | "rejected") => {
    setActionLoadingId(id);
    setError(null);
    try {
      const res = await fetch("/api/rhk/mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          id,
          status,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Gagal memperbarui status pemetaan.");
        return;
      }

      setMappings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, mappingStatus: status } : m))
      );
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete mapping
  const handleDelete = async (id: string) => {
    setActionLoadingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/rhk/mappings/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Gagal menghapus pemetaan.");
        return;
      }

      setMappings((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-400" />
              Pemetaan RHK Antarperiode (FR-10)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hubungkan butir RHK dari periode lama ke periode baru sebagai referensi keselarasan kinerja.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Isolation Guarantee Banner */}
        <div className="p-4 bg-indigo-950/30 border-b border-indigo-900/40 text-xs text-indigo-300 flex items-start gap-2.5 flex-shrink-0">
          <ShieldAlert className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Prinsip Mutlak Isolasi Periode:</strong> Pemetaan ini hanya berfungsi sebagai acuan referensi keselarasan program kerja. Aktivitas, capaian target, dan berkas bukti dari periode lama <strong>TIDAK AKAN disalin</strong> atau dihitung ulang pada periode baru.
          </span>
        </div>

        {/* Period Selector & Trigger */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Periode Sumber (Lama):</span>
              <select
                value={oldPeriodId}
                onChange={(e) => setOldPeriodId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.status})
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500 mt-4 hidden sm:block" />

            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Periode Target (Baru):</span>
              <select
                value={newPeriodId}
                onChange={(e) => setNewPeriodId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.id === activePeriodId ? "(Aktif)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={isSuggesting || oldPeriodId === newPeriodId || !oldPeriodId || !newPeriodId}
            onClick={handleAutoSuggest}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-700/20"
          >
            {isSuggesting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Mencocokkan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Saran Otomatis Keselarasan</span>
              </>
            )}
          </button>
        </div>

        {/* Message banners */}
        {error && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 flex-shrink-0">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Content Body: Mapping List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-xs">Memuat daftar pemetaan RHK...</p>
            </div>
          ) : oldPeriodId === newPeriodId ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Pilih dua periode yang berbeda untuk memetakan keselarasan RHK.</p>
            </div>
          ) : mappings.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
              <GitCompare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold text-slate-300">Belum ada pemetaan RHK untuk kedua periode ini</p>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                Klik tombol "Saran Otomatis Keselarasan" di atas untuk mencari butir RHK yang bersesuaian secara otomatis.
              </p>
            </div>
          ) : (
            mappings.map((m) => {
              const isConfirmed = m.mappingStatus === "confirmed";
              const isRejected = m.mappingStatus === "rejected";

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-colors space-y-3 ${
                    isConfirmed
                      ? "bg-slate-900 border-emerald-800/40"
                      : isRejected
                      ? "bg-slate-900/40 border-slate-800 opacity-60"
                      : "bg-slate-900 border-indigo-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isConfirmed
                            ? "bg-emerald-950 text-emerald-400 border-emerald-800/40"
                            : isRejected
                            ? "bg-slate-800 text-slate-400 border-slate-700"
                            : "bg-indigo-950 text-indigo-400 border-indigo-800/40"
                        }`}
                      >
                        {isConfirmed ? "Terkonfirmasi" : isRejected ? "Ditolak" : "Usulan"}
                      </span>
                      {m.similarityScore !== null && m.similarityScore !== undefined && (
                        <span className="text-[10px] text-slate-400">
                          Kemiripan: {Math.round(m.similarityScore * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      {!isConfirmed && (
                        <button
                          type="button"
                          disabled={actionLoadingId === m.id}
                          onClick={() => handleReview(m.id, "confirmed")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Konfirmasi
                        </button>
                      )}
                      {!isRejected && (
                        <button
                          type="button"
                          disabled={actionLoadingId === m.id}
                          onClick={() => handleReview(m.id, "rejected")}
                          className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-[11px]"
                        >
                          <X className="w-3 h-3" /> Tolak
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={actionLoadingId === m.id}
                        onClick={() => handleDelete(m.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400"
                        title="Hapus pemetaan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mapping side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        RHK Lama ({periods.find((p) => p.id === m.oldPeriodId)?.name || "Lama"}):
                      </span>
                      <p className="text-white leading-relaxed">
                        {m.oldRhk?.individualRhk || `RHK ID: ${m.oldRhkId}`}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">
                        RHK Baru ({periods.find((p) => p.id === m.newPeriodId)?.name || "Baru"}):
                      </span>
                      <p className="text-white leading-relaxed">
                        {m.newRhk?.individualRhk || `RHK ID: ${m.newRhkId}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end flex-shrink-0 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

