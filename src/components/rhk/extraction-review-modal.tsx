"use client";

import React, { useState } from "react";
import { ExtractedRHKItem } from "@/types";
import {
  X,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";

interface ExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodId: string;
  sourceDocumentId?: string;
  documentTitle?: string;
  periodDetected?: string;
  initialItems: ExtractedRHKItem[];
  onConfirmSuccess: () => Promise<void>;
}

export function ExtractionReviewModal({
  isOpen,
  onClose,
  periodId,
  sourceDocumentId,
  documentTitle,
  periodDetected,
  initialItems,
  onConfirmSuccess,
}: ExtractionReviewModalProps) {
  const [items, setItems] = useState<ExtractedRHKItem[]>(initialItems);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdateRhk = (
    index: number,
    field: keyof ExtractedRHKItem,
    value: any
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleDeleteRhk = (index: number) => {
    if (items.length <= 1) {
      alert("Minimal 1 butir RHK harus tersedia.");
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleAddRhk = () => {
    const newItem: ExtractedRHKItem = {
      tempId: `manual-rhk-${Date.now()}`,
      intervenedLeadRhk: "",
      individualRhk: "",
      category: "utama",
      indicators: [
        {
          tempId: `manual-ind-${Date.now()}`,
          aspect: "Kuantitas",
          indicatorText: "",
          targetValue: "",
          targetUnit: "",
          targetPeriodText: null,
        },
      ],
    };
    setItems([...items, newItem]);
  };

  const handleUpdateIndicator = (
    rhkIndex: number,
    indIndex: number,
    field: string,
    value: any
  ) => {
    const updated = [...items];
    const indicators = [...updated[rhkIndex].indicators];
    indicators[indIndex] = { ...indicators[indIndex], [field]: value };
    updated[rhkIndex] = { ...updated[rhkIndex], indicators };
    setItems(updated);
  };

  const handleAddIndicator = (rhkIndex: number) => {
    const updated = [...items];
    updated[rhkIndex].indicators.push({
      tempId: `ind-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      aspect: "Kuantitas",
      indicatorText: "",
      targetValue: "",
      targetUnit: "",
      targetPeriodText: null,
    });
    setItems(updated);
  };

  const handleDeleteIndicator = (rhkIndex: number, indIndex: number) => {
    const updated = [...items];
    if (updated[rhkIndex].indicators.length <= 1) {
      alert("Setiap RHK harus memiliki minimal 1 indikator kinerja.");
      return;
    }
    updated[rhkIndex].indicators = updated[rhkIndex].indicators.filter(
      (_, i) => i !== indIndex
    );
    setItems(updated);
  };

  const handleConfirm = async () => {
    setErrorMessage(null);

    // Validasi kelengkapan teks RHK
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.individualRhk.trim() || item.individualRhk.trim().length < 3) {
        setErrorMessage(
          `Butir RHK #${i + 1} belum diisi atau terlalu pendek (minimal 3 karakter).`
        );
        return;
      }
      for (let j = 0; j < item.indicators.length; j++) {
        const ind = item.indicators[j];
        if (!ind.indicatorText.trim() || ind.indicatorText.trim().length < 3) {
          setErrorMessage(
            `Indikator #${j + 1} pada RHK #${i + 1} belum diisi secara lengkap.`
          );
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/rhk/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId,
          sourceDocumentId,
          rhks: items.map((it) => ({
            intervenedLeadRhk: it.intervenedLeadRhk || null,
            individualRhk: it.individualRhk,
            category: it.category,
            indicators: it.indicators.map((ind) => ({
              aspect: ind.aspect || null,
              indicatorText: ind.indicatorText,
              targetValue: ind.targetValue || null,
              targetUnit: ind.targetUnit || null,
              targetPeriodText: ind.targetPeriodText || null,
            })),
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.message || "Gagal menyimpan hasil konfirmasi RHK.");
        return;
      }

      await onConfirmSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan jaringan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Editor Koreksi Hasil Ekstraksi PDF
              </h2>
              <p className="text-xs text-slate-400">
                {documentTitle || "Dokumen Sasaran Kinerja Pegawai"}{" "}
                {periodDetected && `• ${periodDetected}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Prinsip Zero Hallucination */}
        <div className="p-4 bg-indigo-950/40 border-b border-indigo-900/40 text-xs text-indigo-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Prinsip Verifikasi:</strong> Hasil ekstraksi otomatis dari berkas PDF belum menjadi data resmi. Periksa teks RHK, aspek, dan target capaian di bawah ini sebelum mengonfirmasi penyimpanan.
          </div>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body: List of Extracted RHK Items */}
        <div className="flex-1 p-5 sm:p-6 space-y-6 overflow-y-auto">
          {items.map((rhk, rIdx) => (
            <div
              key={rhk.tempId}
              className="p-5 rounded-2xl bg-slate-850 bg-slate-900/80 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-sm"
            >
              {/* Baris Atas: Nomor, Kategori & Aksi Hapus */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-700">
                    {rIdx + 1}
                  </span>
                  <label className="text-xs font-semibold text-slate-300">
                    Kategori RHK:
                  </label>
                  <select
                    value={rhk.category}
                    onChange={(e) =>
                      handleUpdateRhk(rIdx, "category", e.target.value)
                    }
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="utama">Utama</option>
                    <option value="tambahan">Tambahan</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteRhk(rIdx)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Butir</span>
                </button>
              </div>

              {/* RHK Pimpinan yang diintervensi */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">
                  RHK Pimpinan Yang Diintervensi (Opsional):
                </label>
                <input
                  type="text"
                  value={rhk.intervenedLeadRhk || ""}
                  onChange={(e) =>
                    handleUpdateRhk(rIdx, "intervenedLeadRhk", e.target.value)
                  }
                  placeholder="Contoh: Meningkatnya kualitas tata kelola layanan..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* RHK Individu Pegawai */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 font-semibold">
                  Rencana Hasil Kerja (RHK) Individu Pegawai <span className="text-rose-400">*</span>:
                </label>
                <textarea
                  rows={2}
                  value={rhk.individualRhk}
                  onChange={(e) =>
                    handleUpdateRhk(rIdx, "individualRhk", e.target.value)
                  }
                  placeholder="Contoh: Terlaksananya pengelolaan berkas dan arsip..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Aspek & Indikator Kinerja Sub-Tabel */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Aspek & Indikator Kinerja Individu (IKI)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddIndicator(rIdx)}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    Tambah Aspek/Indikator
                  </button>
                </div>

                <div className="space-y-2">
                  {rhk.indicators.map((ind, iIdx) => (
                    <div
                      key={ind.tempId}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"
                    >
                      {/* Aspek */}
                      <div className="w-full sm:w-32">
                        <select
                          value={ind.aspect || "Kuantitas"}
                          onChange={(e) =>
                            handleUpdateIndicator(rIdx, iIdx, "aspect", e.target.value)
                          }
                          className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                        >
                          <option value="Kuantitas">Kuantitas</option>
                          <option value="Kualitas">Kualitas</option>
                          <option value="Waktu">Waktu</option>
                          <option value="Biaya">Biaya</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      {/* Teks Indikator */}
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          value={ind.indicatorText}
                          onChange={(e) =>
                            handleUpdateIndicator(rIdx, iIdx, "indicatorText", e.target.value)
                          }
                          placeholder="Uraian indikator kinerja individu..."
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Target & Satuan */}
                      <div className="flex items-center gap-2 w-full sm:w-48">
                        <input
                          type="text"
                          value={ind.targetValue || ""}
                          onChange={(e) =>
                            handleUpdateIndicator(rIdx, iIdx, "targetValue", e.target.value)
                          }
                          placeholder="Target"
                          className="w-20 px-2 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-center"
                        />
                        <input
                          type="text"
                          value={ind.targetUnit || ""}
                          onChange={(e) =>
                            handleUpdateIndicator(rIdx, iIdx, "targetUnit", e.target.value)
                          }
                          placeholder="Satuan"
                          className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteIndicator(rIdx, iIdx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                          title="Hapus Indikator"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Tombol Tambah Butir RHK Baru */}
          <button
            type="button"
            onClick={handleAddRhk}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/60 hover:bg-indigo-500/5 text-xs font-semibold text-slate-400 hover:text-indigo-400 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Butir RHK Lainnya</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 sticky bottom-0 z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Total <strong className="text-white">{items.length}</strong> butir RHK siap dikonfirmasi.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Konfirmasi & Simpan ke Bank RHK</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

