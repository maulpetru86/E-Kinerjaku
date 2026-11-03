"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useActivePeriod } from "@/contexts/active-period-context";
import { Printer, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import type { RekapMatriks } from "@/types";

function CetakRekapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activePeriod } = useActivePeriod();

  const periodId = searchParams.get("periodId") || activePeriod?.id;
  const [matriks, setMatriks] = useState<RekapMatriks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!periodId) return;
    setIsLoading(true);
    fetch(`/api/rekap?periodId=${periodId}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success || !res.data) {
          setError(res.message || "Gagal memuat dokumen rekap kinerja.");
          return;
        }
        setMatriks(res.data);
      })
      .catch(() => setError("Gagal terhubung ke server."))
      .finally(() => setIsLoading(false));
  }, [periodId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600 mb-2" />
        <p className="text-sm font-medium">Menyiapkan format cetak laporan...</p>
      </div>
    );
  }

  if (error || !matriks) {
    return (
      <div className="min-h-screen bg-white text-slate-900 p-8 flex flex-col items-center justify-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
        <p className="text-sm text-red-600 mb-4">{error || "Data rekap tidak ditemukan"}</p>
        <button
          onClick={() => router.push("/rekap")}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs"
        >
          Kembali ke Rekap Kinerja
        </button>
      </div>
    );
  }

  const period = matriks.period;

  return (
    <div className="min-h-screen bg-white text-slate-900 p-4 sm:p-10 font-sans print:p-0 print:m-0">
      {/* Action Bar (Hidden during Print) */}
      <div className="print:hidden max-w-5xl mx-auto mb-6 p-4 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-between shadow-sm">
        <button
          onClick={() => router.push("/rekap")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Aplikasi
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Siap cetak atau simpan PDF melalui printer sistem:
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen Sekarang (PDF)
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="max-w-5xl mx-auto space-y-6 text-slate-900 print:max-w-none print:w-full">
        {/* Header Dokumen Kedinasan */}
        <div className="text-center border-b-2 border-slate-900 pb-4">
          <h1 className="text-base font-bold uppercase tracking-wider">
            LAPORAN REKAPITULASI CAPAIAN RENCANA HASIL KERJA DAN BUKTI DUKUNG
          </h1>
          <p className="text-xs uppercase font-medium mt-1">
            ACUAN RESMI PENILAIAN EVALUASI KINERJA PEGAWAI APARATUR SIPIL NEGARA
          </p>
          <p className="text-xs font-semibold mt-1">
            Periode Penilaian: {period.name} ({new Date(period.startDate).toLocaleDateString("id-ID")} s.d.{" "}
            {new Date(period.endDate).toLocaleDateString("id-ID")})
          </p>
        </div>

        {/* Identitas Ringkas */}
        <div className="grid grid-cols-2 text-xs gap-y-1 gap-x-4 border border-slate-300 p-3 rounded-lg print:border-slate-800">
          <div>
            <span className="text-slate-600">Status Periode:</span>{" "}
            <strong className="uppercase">{period.status}</strong>
          </div>
          <div>
            <span className="text-slate-600">Tanggal Ekspor:</span>{" "}
            <strong>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong>
          </div>
          <div>
            <span className="text-slate-600">Total Butir RHK:</span>{" "}
            <strong>{matriks.summary.totalRhk} butir</strong>
          </div>
          <div>
            <span className="text-slate-600">Kelengkapan Bukti:</span>{" "}
            <strong>
              {matriks.summary.countSiapDirekap} Siap Direkap · {matriks.summary.countPerluDitinjau} Perlu Ditinjau
            </strong>
          </div>
        </div>

        {/* Tabel Matriks Rekapitulasi */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-800 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-800 text-center">
                <th className="border border-slate-800 p-2 w-8">No</th>
                <th className="border border-slate-800 p-2 w-28">Kategori</th>
                <th className="border border-slate-800 p-2">Rencana Hasil Kerja (RHK)</th>
                <th className="border border-slate-800 p-2 w-20">Aspek</th>
                <th className="border border-slate-800 p-2">Indikator Kinerja Individu</th>
                <th className="border border-slate-800 p-2 w-20">Target</th>
                <th className="border border-slate-800 p-2">Realisasi & Bukti Dukung Terlampir</th>
                <th className="border border-slate-800 p-2 w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {matriks.items.map((rhkItem, rhkIndex) => {
                const rhk = rhkItem.rhk;
                return rhkItem.indicators.map((indItem, indIndex) => {
                  const ind = indItem.indicator;
                  const isFirstInd = indIndex === 0;

                  const statusText = {
                    siap_direkap: "Siap Direkap",
                    perlu_ditinjau: "Perlu Ditinjau",
                    ada_bukti: "Ada Bukti",
                    belum_ada_bukti: "Belum Ada Bukti",
                  }[indItem.readinessStatus];

                  return (
                    <tr
                      key={`${rhk.id}-${ind.id}`}
                      className="border-b border-slate-800 align-top"
                    >
                      {isFirstInd ? (
                        <td
                          rowSpan={rhkItem.indicators.length}
                          className="border border-slate-800 p-2 text-center font-bold"
                        >
                          {rhkIndex + 1}
                        </td>
                      ) : null}

                      {isFirstInd ? (
                        <td
                          rowSpan={rhkItem.indicators.length}
                          className="border border-slate-800 p-2 text-center uppercase font-semibold text-[10px]"
                        >
                          {rhk.category}
                        </td>
                      ) : null}

                      {isFirstInd ? (
                        <td
                          rowSpan={rhkItem.indicators.length}
                          className="border border-slate-800 p-2"
                        >
                          {rhk.intervenedLeadRhk && (
                            <p className="text-[10px] text-slate-600 italic mb-0.5">
                              Intervensi: {rhk.intervenedLeadRhk}
                            </p>
                          )}
                          <p className="font-semibold text-slate-900">{rhk.individualRhk}</p>
                        </td>
                      ) : null}

                      <td className="border border-slate-800 p-2 text-center font-medium">
                        {ind.aspect || "Kuantitas"}
                      </td>

                      <td className="border border-slate-800 p-2">
                        {ind.indicatorText}
                      </td>

                      <td className="border border-slate-800 p-2 text-center">
                        <strong>{ind.targetValue || "-"}</strong> {ind.targetUnit || ""}
                      </td>

                      <td className="border border-slate-800 p-2 space-y-1.5">
                        {indItem.activities.length > 0 ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-[10px] text-slate-700 block">
                              Kegiatan ({indItem.activities.length}):
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                              {indItem.activities.map((a) => (
                                <li key={a.id} className="leading-tight">
                                  ({new Date(a.activityDate).toLocaleDateString("id-ID")}) {a.description}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[10px] block">
                            Belum ada catatan kegiatan
                          </span>
                        )}

                        {indItem.evidenceFiles.length > 0 && (
                          <div className="border-t border-slate-300 pt-1">
                            <span className="font-semibold text-[10px] text-slate-700 block">
                              Bukti Fisik ({indItem.evidenceFiles.length}):
                            </span>
                            <ul className="list-disc list-inside text-[10px] text-slate-800 space-y-0.5">
                              {indItem.evidenceFiles.map((f) => (
                                <li key={f.id} className="truncate">
                                  {f.originalFilename}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>

                      <td className="border border-slate-800 p-2 text-center font-semibold text-[10px]">
                        {statusText}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan Pengesahan Kedinasan */}
        <div className="grid grid-cols-2 pt-8 text-center text-xs break-inside-avoid">
          <div className="space-y-16">
            <p>Pejabat Penilai Kinerja,</p>
            <div>
              <p className="font-bold underline">(......................................................)</p>
              <p className="text-[10px] text-slate-600 mt-0.5">NIP. ...................................................</p>
            </div>
          </div>

          <div className="space-y-16">
            <p>
              {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              <br />
              Pegawai yang Dinilai,
            </p>
            <div>
              <p className="font-bold underline">(......................................................)</p>
              <p className="text-[10px] text-slate-600 mt-0.5">NIP. ...................................................</p>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-[9px] text-slate-500 border-t border-slate-300 pt-2 text-center print:pt-1">
          Dokumen dicetak dari Asisten Portofolio KinerjaKu. Digunakan sebagai acuan kelengkapan bukti dan matriks capaian sebelum pengisian resmi pada aplikasi e-Kinerja BKN.
        </div>
      </div>
    </div>
  );
}

export default function CetakRekapPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600 mb-2" />
          <p className="text-sm font-medium">Menyiapkan format cetak laporan...</p>
        </div>
      }
    >
      <CetakRekapContent />
    </React.Suspense>
  );
}
