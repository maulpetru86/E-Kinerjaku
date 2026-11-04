"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useActivePeriod } from "@/contexts/active-period-context";
import {
  PlusCircle,
  Calendar,
  FileText,
  Sparkles,
  Check,
  ArrowLeft,
  Clock,
  AlertCircle,
  Loader2,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RHK } from "@/types";

interface RhkOption {
  id: string;
  individualRhk: string;
  category: "utama" | "tambahan";
}

export default function CatatAktivitasPage() {
  const router = useRouter();
  const { activePeriod } = useActivePeriod();

  // Form fields
  const [activityDate, setActivityDate] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [description, setDescription] = useState("");
  const [resultNotes, setResultNotes] = useState("");
  const [selectedRhkIds, setSelectedRhkIds] = useState<string[]>([]);

  // UI state
  const [rhkOptions, setRhkOptions] = useState<RhkOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Set default date to today (client-side only to avoid hydration mismatch)
  useEffect(() => {
    setActivityDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Fetch RHK options for active period
  useEffect(() => {
    if (!activePeriod?.id) return;
    fetch(`/api/rhk?periodId=${activePeriod.id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setRhkOptions(
            res.data.map((r: RHK) => ({
              id: r.id,
              individualRhk: r.individualRhk,
              category: r.category,
            }))
          );
        }
      })
      .catch(() => {
        // RHK load failure tidak memblokir pencatatan aktivitas
      });
  }, [activePeriod?.id]);

  const toggleRhk = useCallback((rhkId: string) => {
    setSelectedRhkIds((prev) =>
      prev.includes(rhkId) ? prev.filter((id) => id !== rhkId) : [...prev, rhkId]
    );
  }, []);

  const resetForm = useCallback(() => {
    setDescription("");
    setResultNotes("");
    setActivityTime("");
    setSelectedRhkIds([]);
    setActivityDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        activityDate,
        description: description.trim(),
        resultNotes: resultNotes.trim() || null,
        activityTime: activityTime || null,
        periodId: activePeriod?.id || null,
        rhkLinks: selectedRhkIds.map((rhkId) => ({ rhkId })),
      };

      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errMsg =
          json.errors?.map((e: { path: string; message: string }) => e.message).join(". ") ||
          json.message ||
          "Terjadi kesalahan saat menyimpan aktivitas.";
        setError(errMsg);
        return;
      }

      setSavedId(json.data?.id ?? null);
      setSavedSuccess(true);
      resetForm();

      // Auto-hide success after 5 seconds
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch {
      setError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/aktivitas"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            Catat Aktivitas Cepat
          </h1>
          <p className="text-xs text-slate-400">
            Cukup tulis tanggal dan kegiatan Anda. Penautan RHK dan bukti dapat dilengkapi kemudian.
          </p>
          {activePeriod && (
            <div className="mt-1">
              <span className="inline-block text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                Periode: {activePeriod.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-2.5 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Aktivitas berhasil dicatat!</p>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              Anda dapat langsung mencatat aktivitas berikutnya, atau{" "}
              <button
                onClick={() => router.push("/aktivitas")}
                className="underline hover:text-emerald-300"
              >
                lihat di Jurnal Aktivitas
              </button>
              .
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">

        {/* Tanggal */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Tanggal Kegiatan <span className="text-emerald-400">*</span>
          </label>
          <input
            type="date"
            required
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">Default hari ini, dapat diubah ke tanggal lampau.</p>
        </div>

        {/* Waktu (opsional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Waktu Kegiatan{" "}
            <span className="text-[11px] font-normal text-slate-500">(Opsional)</span>
          </label>
          <input
            type="time"
            value={activityTime}
            onChange={(e) => setActivityTime(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Deskripsi Kegiatan <span className="text-emerald-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Contoh: Mengikuti rapat koordinasi persiapan asesmen semester genap bersama kepala sekolah dan dewan guru..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            {description.length}/2000 karakter
          </p>
        </div>

        {/* Catatan Hasil */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Hasil / Catatan Tambahan{" "}
            <span className="text-[11px] font-normal text-slate-500">(Opsional)</span>
          </label>
          <input
            type="text"
            placeholder="Misal: Dihasilkan draft notula dan pembagian jadwal pengawas"
            value={resultNotes}
            onChange={(e) => setResultNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Tautkan ke RHK (opsional) */}
        {rhkOptions.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-sky-400" />
              Tautkan ke RHK{" "}
              <span className="text-[11px] font-normal text-slate-500">(Opsional, dapat diubah nanti)</span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {rhkOptions.map((rhk) => (
                <label
                  key={rhk.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedRhkIds.includes(rhk.id)
                      ? "border-sky-500/60 bg-sky-500/10"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRhkIds.includes(rhk.id)}
                    onChange={() => toggleRhk(rhk.id)}
                    className="mt-0.5 accent-sky-500 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-white leading-snug">{rhk.individualRhk}</p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        rhk.category === "utama"
                          ? "bg-emerald-900/50 text-emerald-400"
                          : "bg-amber-900/50 text-amber-400"
                      }`}
                    >
                      {rhk.category === "utama" ? "Utama" : "Tambahan"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {selectedRhkIds.length > 0 && (
              <p className="text-[11px] text-sky-400 mt-1.5">
                {selectedRhkIds.length} RHK dipilih — aktivitas akan otomatis berstatus "Terkategori"
              </p>
            )}
          </div>
        )}

        {/* AI Helper Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-400 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Asisten AI siap membantu menganalisis dan merekomendasikan indikator RHK yang pas setelah aktivitas disimpan.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/aktivitas"
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Batal
          </Link>
          <div className="flex items-center gap-3">
            {savedSuccess && savedId && (
              <button
                type="button"
                onClick={() => router.push("/aktivitas")}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Lihat Jurnal
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !description.trim() || !activityDate}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-700/20 active:scale-95 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Aktivitas"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
