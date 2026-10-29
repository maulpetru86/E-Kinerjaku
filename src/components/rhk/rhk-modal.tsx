"use client";

import React, { useState, useEffect } from "react";
import { RHK, RHKIndicator } from "@/types";
import { X, Check, Plus, Trash2, Layers, AlertCircle } from "lucide-react";

interface RhkModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodId: string;
  initialData?: RHK | null;
  onSuccess: () => Promise<void>;
}

export function RhkModal({
  isOpen,
  onClose,
  periodId,
  initialData,
  onSuccess,
}: RhkModalProps) {
  const [category, setCategory] = useState<"utama" | "tambahan">("utama");
  const [intervenedLeadRhk, setIntervenedLeadRhk] = useState("");
  const [individualRhk, setIndividualRhk] = useState("");
  const [notes, setNotes] = useState("");
  const [indicators, setIndicators] = useState<
    Array<{
      id?: string;
      aspect: string;
      indicatorText: string;
      targetValue: string;
      targetUnit: string;
    }>
  >([
    {
      aspect: "Kuantitas",
      indicatorText: "",
      targetValue: "",
      targetUnit: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setIntervenedLeadRhk(initialData.intervenedLeadRhk || "");
      setIndividualRhk(initialData.individualRhk);
      setNotes(initialData.notes || "");
      if (initialData.indicators && initialData.indicators.length > 0) {
        setIndicators(
          initialData.indicators.map((ind) => ({
            id: ind.id,
            aspect: ind.aspect || "Kuantitas",
            indicatorText: ind.indicatorText,
            targetValue: ind.targetValue || "",
            targetUnit: ind.targetUnit || "",
          }))
        );
      } else {
        setIndicators([
          {
            aspect: "Kuantitas",
            indicatorText: "",
            targetValue: "",
            targetUnit: "",
          },
        ]);
      }
    } else {
      setCategory("utama");
      setIntervenedLeadRhk("");
      setIndividualRhk("");
      setNotes("");
      setIndicators([
        {
          aspect: "Kuantitas",
          indicatorText: "",
          targetValue: "",
          targetUnit: "",
        },
      ]);
    }
    setErrorMessage(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddIndicator = () => {
    setIndicators([
      ...indicators,
      {
        aspect: "Kuantitas",
        indicatorText: "",
        targetValue: "",
        targetUnit: "",
      },
    ]);
  };

  const handleUpdateIndicator = (index: number, field: string, value: string) => {
    const updated = [...indicators];
    updated[index] = { ...updated[index], [field]: value };
    setIndicators(updated);
  };

  const handleDeleteIndicator = (index: number) => {
    if (indicators.length <= 1) {
      alert("Minimal 1 indikator kinerja harus tersedia.");
      return;
    }
    setIndicators(indicators.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!individualRhk.trim()) {
      setErrorMessage("Rencana Hasil Kerja (RHK) individu wajib diisi.");
      return;
    }

    for (let i = 0; i < indicators.length; i++) {
      if (!indicators[i].indicatorText.trim()) {
        setErrorMessage(`Teks indikator #${i + 1} belum diisi.`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const isEditing = !!initialData?.id;
      const url = isEditing ? `/api/rhk/${initialData.id}` : "/api/rhk";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        periodId,
        category,
        intervenedLeadRhk: intervenedLeadRhk.trim() || null,
        individualRhk: individualRhk.trim(),
        notes: notes.trim() || null,
        indicators: indicators.map((ind) => ({
          ...(ind.id ? { id: ind.id } : {}),
          aspect: ind.aspect,
          indicatorText: ind.indicatorText.trim(),
          targetValue: ind.targetValue.trim() || null,
          targetUnit: ind.targetUnit.trim() || null,
        })),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.message || "Gagal menyimpan butir RHK.");
        return;
      }

      await onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-white">
              {initialData ? "Ubah Butir RHK" : "Tambah Butir RHK Manual"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Isi rencana hasil kerja individu dan aspek indikator kinerjanya.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Kategori */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Kategori RHK <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory("utama")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  category === "utama"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                RHK Utama
              </button>
              <button
                type="button"
                onClick={() => setCategory("tambahan")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  category === "tambahan"
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                RHK Tambahan
              </button>
            </div>
          </div>

          {/* RHK Pimpinan yang diintervensi */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              RHK Pimpinan Yang Diintervensi (Opsional)
            </label>
            <textarea
              rows={2}
              value={intervenedLeadRhk}
              onChange={(e) => setIntervenedLeadRhk(e.target.value)}
              placeholder="Contoh: Meningkatnya kualitas akuntabilitas layanan kepegawaian..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* RHK Individu */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Rencana Hasil Kerja (RHK) Individu Pegawai <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={individualRhk}
              onChange={(e) => setIndividualRhk(e.target.value)}
              placeholder="Contoh: Terlaksananya verifikasi dan pengelolaan berkas portofolio kinerja..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Indikator Sub-Section */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                Aspek & Indikator Kinerja Individu
              </span>
              <button
                type="button"
                onClick={handleAddIndicator}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Indikator
              </button>
            </div>

            <div className="space-y-3">
              {indicators.map((ind, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Indikator #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteIndicator(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Hapus Indikator"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Aspek:
                      </label>
                      <select
                        value={ind.aspect}
                        onChange={(e) =>
                          handleUpdateIndicator(idx, "aspect", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Kuantitas">Kuantitas</option>
                        <option value="Kualitas">Kualitas</option>
                        <option value="Waktu">Waktu</option>
                        <option value="Biaya">Biaya</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Target Capaian:
                      </label>
                      <input
                        type="text"
                        value={ind.targetValue}
                        onChange={(e) =>
                          handleUpdateIndicator(idx, "targetValue", e.target.value)
                        }
                        placeholder="Contoh: 4, 100"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Satuan Target:
                      </label>
                      <input
                        type="text"
                        value={ind.targetUnit}
                        onChange={(e) =>
                          handleUpdateIndicator(idx, "targetUnit", e.target.value)
                        }
                        placeholder="Contoh: Laporan, %, Bulan"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Uraian Indikator Kinerja Individu <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={ind.indicatorText}
                      onChange={(e) =>
                        handleUpdateIndicator(idx, "indicatorText", e.target.value)
                      }
                      placeholder="Contoh: Jumlah laporan berkas kinerja yang disusun..."
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Catatan / Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan untuk butir RHK ini..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{initialData ? "Simpan Perubahan" : "Simpan Butir RHK"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

