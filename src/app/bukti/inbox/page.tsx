"use client";

import { Inbox, Upload, AlertCircle, FileCheck, Filter } from "lucide-react";
import Link from "next/link";

export default function KotakMasukBuktiPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Inbox className="w-6 h-6 text-amber-400" />
            Kotak Masuk Bukti Dukung
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Unggah berkas bukti kapan saja. Berkas akan ditampung di sini sebelum Anda kategorikan atau hubungkan ke RHK.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-700/20">
          <Upload className="w-4 h-4 text-slate-950" />
          <span>Unggah Berkas Baru</span>
        </button>
      </div>

      {/* Info Guideline */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold text-white">Filosofi Kotak Masuk:</span> Anda tidak perlu langsung menentukan RHK atau kegiatan saat mengunggah. Berkas disimpan aman di cloud storage privat dan dapat dirapikan atau ditautkan ke beberapa kegiatan sekaligus kapan saja.
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="p-8 rounded-2xl border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-900/40 text-center transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Upload className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-sm font-bold text-white">Tarik & Lepaskan Berkas ke Sini</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Mendukung berkas JPG, PNG, PDF, atau dokumen hingga 15MB. Unggah satu berkas atau banyak sekaligus.
        </p>
        <button className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors">
          Pilih Berkas dari Perangkat
        </button>
      </div>

      {/* Empty State */}
      <div className="py-12 text-center border border-slate-800/80 rounded-2xl bg-slate-900/20">
        <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-300">Kotak Masuk Kosong</h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Seluruh berkas bukti Anda telah terorganisir dengan rapi di Bank Bukti Dukung.
        </p>
      </div>
    </div>
  );
}
