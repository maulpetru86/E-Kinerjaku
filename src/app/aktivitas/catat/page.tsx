"use client";

import React, { useState, useEffect } from "react";
import { useActivePeriod } from "@/contexts/active-period-context";
import { PlusCircle, Calendar, FileText, Upload, Sparkles, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CatatAktivitasPage() {
  const { activePeriod } = useActivePeriod();
  const [activityDate, setActivityDate] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setActivityDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Untuk Tahap 1, kita simulasikan penyimpanan cepat
    setSavedSuccess(true);
    setTimeout(() => {
      setDescription("");
      setNotes("");
      setSavedSuccess(false);
    }, 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
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

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Aktivitas berhasil dicatat! Anda dapat melanjutkan mencatat aktivitas lainnya.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
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
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Hasil / Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            placeholder="Misal: Dihasilkan draft notula dan pembagian jadwal pengawas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Upload Bukti Cepat Opsional */}
        <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-center">
          <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-slate-300">Lampirkan Bukti Fisik / Foto / Dokumen (Opsional)</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Format JPG, PNG, PDF hingga 15MB. Bukti juga bisa diunggah belakangan ke Kotak Masuk.
          </p>
        </div>

        {/* AI Helper Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-400 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Asisten AI akan siap di Tahap 4 untuk merekomendasikan indikator RHK yang pas dengan catatan Anda.
          </span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-emerald-700/20 active:scale-95"
          >
            Simpan Aktivitas
          </button>
        </div>
      </form>
    </div>
  );
}
