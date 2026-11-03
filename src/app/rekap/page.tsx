"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  FileText,
  Paperclip,
  Target,
  GitCompare,
  Eye,
  Calendar,
  Layers,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useActivePeriod } from "@/contexts/active-period-context";
import { RhkMappingModal } from "@/components/rekap/rhk-mapping-modal";
import type {
  RekapMatriks,
  RekapRhkItem,
  RekapIndicatorItem,
  RekapReadinessStatus,
} from "@/types";

// ── Badge status kesiapan rekap ───────────────────────────────────────────────
function ReadinessBadge({ status }: { status: RekapReadinessStatus }) {
  if (status === "siap_direkap") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
        <CheckCircle2 className="w-3.5 h-3.5" /> Siap Direkap
      </span>
    );
  }
  if (status === "perlu_ditinjau") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-400 border border-amber-800/50">
        <AlertCircle className="w-3.5 h-3.5" /> Perlu Ditinjau
      </span>
    );
  }
  if (status === "ada_bukti") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-950/70 text-sky-400 border border-sky-800/50">
        <Clock className="w-3.5 h-3.5" /> Ada Bukti
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
      Belum Ada Bukti
    </span>
  );
}

// ── Kartu RHK dalam Matriks Rekap ─────────────────────────────────────────────
function RekapRhkCard({
  item,
  isExpandedDefault = false,
}: {
  item: RekapRhkItem;
  isExpandedDefault?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);
  const rhk = item.rhk;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors overflow-hidden">
      {/* Header RHK */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 cursor-pointer flex items-start gap-4 select-none hover:bg-slate-850/50 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-400">
          <Target className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                rhk.category === "utama"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                  : "bg-amber-950 text-amber-400 border border-amber-800/40"
              }`}
            >
              {rhk.category === "utama" ? "Kinerja Utama" : "Kinerja Tambahan"}
            </span>

            <ReadinessBadge status={item.overallStatus} />

            <span className="text-[11px] text-slate-500 ml-auto hidden sm:inline">
              {item.totalActivitiesCount} Kegiatan · {item.totalEvidenceCount} Bukti Terlampir
            </span>
          </div>

          {rhk.intervenedLeadRhk && (
            <p className="text-xs text-slate-500 italic mb-1 line-clamp-1">
              Intervensi: {rhk.intervenedLeadRhk}
            </p>
          )}

          <h3 className="text-sm font-semibold text-white leading-snug">
            {rhk.individualRhk}
          </h3>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 sm:hidden">
            <span>{item.totalActivitiesCount} Kegiatan</span>
            <span>·</span>
            <span>{item.totalEvidenceCount} Berkas Bukti</span>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded-lg text-slate-400 hover:text-white flex-shrink-0"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Accordion Detail: Daftar Indikator Kinerja */}
      {isExpanded && (
        <div className="border-t border-slate-800/80 bg-slate-950/40 p-4 sm:p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Daftar Indikator Kinerja & Bukti Capaian ({item.indicators.length})
          </p>

          <div className="space-y-3">
            {item.indicators.map((indItem) => {
              const ind = indItem.indicator;
              return (
                <div
                  key={ind.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800/90 space-y-3"
                >
                  {/* Indikator info */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {ind.aspect || "Kuantitas"}
                        </span>
                        <span className="text-xs text-slate-300 font-medium">
                          Target: <strong className="text-white">{ind.targetValue || "-"} {ind.targetUnit || ""}</strong>
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white leading-relaxed">
                        {ind.indicatorText}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <ReadinessBadge status={indItem.readinessStatus} />
                    </div>
                  </div>

                  {/* List of Activities */}
                  <div className="border-t border-slate-800/60 pt-2.5">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      Kegiatan yang Berhubungan ({indItem.activities.length}):
                    </span>
                    {indItem.activities.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic pl-5">
                        Belum ada kegiatan yang terhubung ke indikator ini.
                      </p>
                    ) : (
                      <ul className="space-y-1 pl-5 list-disc text-xs text-slate-300">
                        {indItem.activities.map((act) => (
                          <li key={act.id}>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {act.activityDate}
                            </span>{" "}
                            — {act.description}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* List of Evidence Files */}
                  <div className="border-t border-slate-800/60 pt-2.5">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                      Berkas Bukti Fisik Terlampir ({indItem.evidenceFiles.length}):
                    </span>
                    {indItem.evidenceFiles.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic pl-5">
                        Belum ada berkas bukti dukung terlampir.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pl-2">
                        {indItem.evidenceFiles.map((f) => (
                          <a
                            key={f.id}
                            href={`/api/evidence/${f.id}/file?disposition=inline`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-slate-200 border border-slate-700 transition-colors"
                          >
                            <Paperclip className="w-3 h-3 text-amber-400" />
                            <span className="max-w-[200px] truncate">{f.originalFilename}</span>
                            <Eye className="w-3 h-3 text-slate-400 hover:text-white" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Halaman Utama Rekap Kinerja ───────────────────────────────────────────────
export default function RekapKinerjaPage() {
  const { activePeriod } = useActivePeriod();

  const [matriks, setMatriks] = useState<RekapMatriks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);

  // Fetch rekap matriks
  const fetchRekap = useCallback(async () => {
    if (!activePeriod?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("periodId", activePeriod.id);
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/rekap?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Gagal memuat rekap kinerja.");
        return;
      }

      setMatriks(json.data);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  }, [activePeriod?.id, statusFilter, search]);

  useEffect(() => {
    fetchRekap();
  }, [fetchRekap]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 400);
  };

  const summary = matriks?.summary;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-400" />
            Rekap Kinerja & Bukti Dukung
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Matriks ketercapaian per RHK dan indikator sebagai acuan resmi pengisian di portal e-Kinerja BKN.
            {activePeriod && <span className="text-teal-400"> (Periode: {activePeriod.name})</span>}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMappingModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
          >
            <GitCompare className="w-4 h-4 text-indigo-400" />
            <span>Pemetaan Antarperiode</span>
          </button>

          <Link
            href={`/rekap/cetak${activePeriod ? `?periodId=${activePeriod.id}` : ""}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Cetak Laporan</span>
          </Link>

          <a
            href={`/api/rekap/export?periodId=${activePeriod?.id || ""}`}
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-700/20 active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Ekspor CSV</span>
          </a>
        </div>
      </div>

      {/* Summary Readiness Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">Siap Direkap</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {summary.countSiapDirekap}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Indikator lengkap kegiatan & bukti</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400">Perlu Ditinjau</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {summary.countPerluDitinjau}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ada kegiatan/bukti pending review</div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400">Ada Bukti</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {summary.countAdaBukti}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Sudah tercatat namun belum berpasangan</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Belum Ada Bukti</span>
              <FileCheck2 className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {summary.countBelumAdaBukti}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Indikator belum memiliki catatan</div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari RHK, indikator, catatan kegiatan, atau nama bukti..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Status Filter Pill Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "", label: "Semua Status" },
            { key: "siap_direkap", label: "Siap Direkap" },
            { key: "perlu_ditinjau", label: "Perlu Ditinjau" },
            { key: "ada_bukti", label: "Ada Bukti" },
            { key: "belum_ada_bukti", label: "Belum Ada Bukti" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                statusFilter === tab.key
                  ? "bg-teal-600 text-slate-950"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          <p className="text-sm">Menyusun matriks rekap kinerja...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center border border-red-500/20 rounded-2xl bg-red-500/5">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={fetchRekap}
            className="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-medium"
          >
            Coba Lagi
          </button>
        </div>
      ) : !matriks || matriks.items.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            {search || statusFilter ? "Tidak ada butir RHK sesuai filter" : "Belum Ada RHK di Periode Ini"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || statusFilter
              ? "Coba sesuaikan kata kunci pencarian atau ubah filter status kesiapan."
              : "Impor butir RHK SKP Anda dari berkas PDF untuk mulai menyusun matriks rekap capaian."}
          </p>
          {!search && !statusFilter && (
            <Link
              href="/rhk"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-slate-950 font-semibold text-xs"
            >
              <Target className="w-4 h-4" />
              Buka Bank RHK
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Menampilkan <strong className="text-white">{matriks.items.length}</strong> butir RHK
            </span>
            <span className="text-[11px] text-slate-500">
              Klik kartu untuk melihat rincian kegiatan dan bukti
            </span>
          </div>

          <div className="space-y-3">
            {matriks.items.map((item, index) => (
              <RekapRhkCard
                key={item.rhk.id}
                item={item}
                isExpandedDefault={index === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal Pemetaan RHK Antarperiode */}
      {isMappingModalOpen && (
        <RhkMappingModal
          activePeriodId={activePeriod?.id}
          onClose={() => setIsMappingModalOpen(false)}
        />
      )}
    </div>
  );
}
