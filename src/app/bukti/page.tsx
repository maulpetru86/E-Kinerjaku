"use client";

import { FileCheck2, Search, Filter, Upload, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useActivePeriod } from "@/contexts/active-period-context";

export default function BankBuktiPage() {
  const { activePeriod } = useActivePeriod();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-400" />
            Bank Bukti Dukung
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gudang berkas digital (SK, sertifikat, laporan, foto) yang siap ditautkan ke satu atau beberapa aktivitas.
          </p>
        </div>

        <Link
          href="/bukti/inbox"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-colors"
        >
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Buka Kotak Masuk Bukti</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama berkas, nomor SK, atau kata kunci bukti..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-850">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Semua Tipe Berkas</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
        <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-200">Belum ada berkas di Bank Bukti</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Unggah berkas bukti dukung Anda melalui Kotak Masuk Bukti.
        </p>
      </div>
    </div>
  );
}
