"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useActivePeriod } from "@/contexts/active-period-context";
import { RHK, ExtractedRHKItem } from "@/types";
import { RhkModal } from "@/components/rhk/rhk-modal";
import { ExtractionReviewModal } from "@/components/rhk/extraction-review-modal";
import {
  Target,
  FileUp,
  Plus,
  AlertCircle,
  Search,
  Layers,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle2,
  Sparkles,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BankRHKPage() {
  const { activePeriod } = useActivePeriod();
  const [rhks, setRhks] = useState<RHK[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "utama" | "tambahan">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingRhk, setEditingRhk] = useState<RHK | null>(null);

  // PDF Extraction & Review State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    items: ExtractedRHKItem[];
    sourceDocumentId?: string;
    documentTitle?: string;
    periodDetected?: string;
  }>({ items: [] });

  const fetchRhks = useCallback(async () => {
    if (!activePeriod?.id) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/rhk?periodId=${activePeriod.id}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRhks(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat daftar RHK:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activePeriod?.id]);

  useEffect(() => {
    fetchRhks();
  }, [fetchRhks]);

  // Handle PDF Upload & Parsing
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePeriod?.id) return;

    try {
      setIsParsingPdf(true);
      setPdfError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("periodId", activePeriod.id);

      const res = await fetch("/api/rhk/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setPdfError(json.message || "Gagal memproses berkas PDF.");
        return;
      }

      setExtractedData({
        items: json.data || [],
        sourceDocumentId: json.sourceDocumentId,
        documentTitle: json.documentTitle,
        periodDetected: json.periodDetected,
      });

      setIsReviewModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setPdfError("Terjadi kesalahan jaringan saat mengunggah berkas PDF.");
    } finally {
      setIsParsingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteRhk = async (rhk: RHK) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus butir RHK: "${rhk.individualRhk.slice(0, 50)}..."? Seluruh indikator terkait akan dihapus.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/rhk/${rhk.id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchRhks();
      }
    } catch (err) {
      console.error("Gagal menghapus butir RHK:", err);
    }
  };

  // Filtered RHKs
  const filteredRhks = rhks.filter((rhk) => {
    const matchesTab = activeTab === "all" || rhk.category === activeTab;
    const matchesSearch =
      searchQuery.trim() === "" ||
      rhk.individualRhk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rhk.intervenedLeadRhk &&
        rhk.intervenedLeadRhk.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rhk.indicators?.some((ind) =>
        ind.indicatorText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesTab && matchesSearch;
  });

  const countUtama = rhks.filter((r) => r.category === "utama").length;
  const countTambahan = rhks.filter((r) => r.category === "tambahan").length;

  return (
    <div className="space-y-6">
      {/* Hidden File Input for PDF */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePdfUpload}
        accept="application/pdf"
        className="hidden"
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" />
            Bank RHK (Rencana Hasil Kerja)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Daftar butir RHK individu dan RHK intervensi pimpinan untuk periode{" "}
            <span className="text-indigo-300 font-semibold">
              {activePeriod?.name || "Aktif"}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsingPdf || !activePeriod}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-700/20 disabled:opacity-50"
          >
            {isParsingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Membaca PDF...</span>
              </>
            ) : (
              <>
                <FileUp className="w-4 h-4" />
                <span>Impor dari Dokumen PDF</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setEditingRhk(null);
              setIsManualModalOpen(true);
            }}
            disabled={!activePeriod}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Alert Error jika PDF gagal diurai */}
      {pdfError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <span className="font-bold text-rose-200">Gagal Membaca Dokumen:</span>
            <p>{pdfError}</p>
          </div>
        </div>
      )}

      {/* Filter and Tab Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              activeTab === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Semua ({rhks.length})
          </button>
          <button
            onClick={() => setActiveTab("utama")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              activeTab === "utama"
                ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Utama ({countUtama})
          </button>
          <button
            onClick={() => setActiveTab("tambahan")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              activeTab === "tambahan"
                ? "bg-teal-600/30 text-teal-300 border border-teal-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Tambahan ({countTambahan})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari RHK atau indikator..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* RHK Cards List */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <span>Memuat butir RHK periode aktif...</span>
        </div>
      ) : filteredRhks.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 p-6">
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            {searchQuery
              ? "Tidak ada butir RHK yang sesuai kata kunci pencarian"
              : "Belum ada butir RHK pada periode ini"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "Coba gunakan kata kunci lain atau bersihkan kotak pencarian."
              : "Impor dokumen SKP BKN dalam format PDF atau tambahkan butir RHK pertama Anda secara manual."}
          </p>
          {!searchQuery && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                <FileUp className="w-4 h-4" />
                Impor Dokumen PDF
              </button>
              <button
                onClick={() => {
                  setEditingRhk(null);
                  setIsManualModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                Tambah Manual
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRhks.map((rhk, idx) => (
            <div
              key={rhk.id}
              className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm space-y-4"
            >
              {/* Header Kartu RHK */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-700 flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          rhk.category === "utama"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                        )}
                      >
                        RHK {rhk.category}
                      </span>
                    </div>

                    {rhk.intervenedLeadRhk && (
                      <p className="text-xs text-slate-400 italic">
                        <strong className="text-slate-300 not-italic">Intervensi Pimpinan:</strong>{" "}
                        {rhk.intervenedLeadRhk}
                      </p>
                    )}

                    <h2 className="text-sm font-bold text-white leading-relaxed pt-0.5">
                      {rhk.individualRhk}
                    </h2>
                  </div>
                </div>

                {/* Actions: Edit & Hapus */}
                <div className="flex items-center gap-1 self-end sm:self-start">
                  <button
                    onClick={() => {
                      setEditingRhk(rhk);
                      setIsManualModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors"
                    title="Ubah RHK"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRhk(rhk)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    title="Hapus RHK"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-Table Indikator Kinerja */}
              {rhk.indicators && rhk.indicators.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="py-2 px-3 w-28">Aspek</th>
                          <th className="py-2 px-3">Indikator Kinerja Individu</th>
                          <th className="py-2 px-3 w-36 text-right">Target Capaian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {rhk.indicators.map((ind) => (
                          <tr key={ind.id} className="text-slate-300 hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-medium text-slate-200">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px]">
                                {ind.aspect || "Kuantitas"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 leading-relaxed text-slate-300">
                              {ind.indicatorText}
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                              {ind.targetValue || "-"} {ind.targetUnit || ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <RhkModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setEditingRhk(null);
        }}
        periodId={activePeriod?.id || ""}
        initialData={editingRhk}
        onSuccess={fetchRhks}
      />

      <ExtractionReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        periodId={activePeriod?.id || ""}
        sourceDocumentId={extractedData.sourceDocumentId}
        documentTitle={extractedData.documentTitle}
        periodDetected={extractedData.periodDetected}
        initialItems={extractedData.items}
        onConfirmSuccess={fetchRhks}
      />
    </div>
  );
}
