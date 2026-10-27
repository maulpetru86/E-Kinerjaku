"use client";

import Link from "next/link";
import { BookOpen, PlusCircle, Search, Filter } from "lucide-react";
import { useActivePeriod } from "@/contexts/active-period-context";

export default function JurnalAktivitasPage() {
  const { activePeriod } = useActivePeriod();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            Jurnal Aktivitas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Daftar seluruh catatan kegiatan pada periode {activePeriod?.name || "aktif"}.
          </p>
        </div>

        <Link
          href="/aktivitas/catat"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-sm transition-all"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Catat Aktivitas Baru</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari deskripsi kegiatan atau kata kunci..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-850">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter Status</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
        <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-200">Belum ada aktivitas yang dicatat</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Fitur jurnal aktivitas penuh dan penautan berkas akan diaktifkan secara komprehensif pada Tahap 3.
        </p>
        <Link
          href="/aktivitas/catat"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-slate-950 font-semibold text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Catat Aktivitas Sekarang
        </Link>
      </div>
    </div>
  );
}
