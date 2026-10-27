"use client";

import { Target, FileUp, Plus, Calendar, AlertCircle } from "lucide-react";
import { useActivePeriod } from "@/contexts/active-period-context";

export default function BankRHKPage() {
  const { activePeriod } = useActivePeriod();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" />
            Bank RHK (Rencana Hasil Kerja)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Daftar butir RHK individu dan RHK intervensi pimpinan untuk periode {activePeriod?.name || "aktif"}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-700/20">
            <FileUp className="w-4 h-4" />
            <span>Impor dari Dokumen PDF</span>
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-colors">
            <Plus className="w-4 h-4" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold text-white">Tahap 2 Segera Aktif:</span> Mesin parsing PDF dengan editor pratinjau dan koreksi hasil ekstraksi akan diimplementasikan pada Tahap 2. Anda dapat mengoreksi target dan aspek sebelum disimpan resmi ke Bank RHK.
        </div>
      </div>

      {/* Empty State */}
      <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
        <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-200">Belum ada butir RHK pada periode ini</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Impor dokumen SKP BKN atau tambahkan butir RHK pertama Anda secara manual.
        </p>
      </div>
    </div>
  );
}
