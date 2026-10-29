"use client";

import Link from "next/link";
import { useActivePeriod } from "@/contexts/active-period-context";
import { formatDateIndo } from "@/lib/utils";
import {
  PlusCircle,
  Upload,
  Calendar,
  Inbox,
  BookOpen,
  Target,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const { activePeriod } = useActivePeriod();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Asisten Bank Bukti & Rekap Kinerja</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              KinerjaKu
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Catat aktivitas dan simpan bukti setiap selesai kegiatan. Jangan biarkan berkas tercecer saat masa evaluasi e-Kinerja tiba.
            </p>

            {/* Periode Aktif Card */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/70 text-xs text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Periode Aktif:</span>
                <span className="font-semibold text-white">{activePeriod?.name || "Belum dipilih"}</span>
              </div>
              {activePeriod && (
                <span className="text-xs text-slate-400">
                  ({formatDateIndo(activePeriod.startDate)} — {formatDateIndo(activePeriod.endDate)})
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions CTA */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto">
            <Link
              href="/aktivitas/catat"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-700/25 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Catat Aktivitas Cepat</span>
            </Link>

            <Link
              href="/bukti/inbox"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Unggah ke Kotak Masuk</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Kotak Masuk Bukti */}
        <Link
          href="/bukti/inbox"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Perlu Ditinjau
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-slate-400 mt-0.5">Bukti Belum Dikategorikan</div>
          </div>
        </Link>

        {/* Jurnal Aktivitas */}
        <Link
          href="/aktivitas"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              Periode Aktif
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-slate-400 mt-0.5">Aktivitas Tercatat</div>
          </div>
        </Link>

        {/* Bank RHK */}
        <Link
          href="/rhk"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              SKP Aktif
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-slate-400 mt-0.5">RHK Terdaftar</div>
          </div>
        </Link>

        {/* Status Bank Bukti */}
        <Link
          href="/bukti"
          className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Aman & Privat
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-slate-400 mt-0.5">Total Berkas Tersimpan</div>
          </div>
        </Link>
      </div>

      {/* Alur Kerja Cepat: 3 Langkah */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Alur Sederhana: Dari Kegiatan Menjadi Rekap e-Kinerja
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-xs mb-3">
                1
              </div>
              <h3 className="font-semibold text-white text-sm">Catat & Simpan Bukti</h3>
              <p className="text-xs text-slate-400 mt-1">
                Catat ringkas apa yang Anda kerjakan atau langsung unggah foto/surat tugas ke Kotak Masuk. Tanpa repot mengisi metadata di awal.
              </p>
            </div>
            <Link
              href="/aktivitas/catat"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              <span>Mulai Catat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs mb-3">
                2
              </div>
              <h3 className="font-semibold text-white text-sm">Petakan ke RHK</h3>
              <p className="text-xs text-slate-400 mt-1">
                Impor dokumen PDF RHK Anda. Gunakan asisten AI untuk merekomendasikan indikator yang cocok. Anda pemegang keputusan final.
              </p>
            </div>
            <Link
              href="/rhk"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <span>Impor RHK</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 font-bold flex items-center justify-center text-xs mb-3">
                3
              </div>
              <h3 className="font-semibold text-white text-sm">Rekap & Siap Lapor</h3>
              <p className="text-xs text-slate-400 mt-1">
                Jelang masa penilaian e-Kinerja BKN, buka rekap triwulan untuk melihat matriks capaian dan tautan bukti lengkap. Tinggal salin tanpa panik.
              </p>
            </div>
            <Link
              href="/rekap"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
            >
              <span>Lihat Rekap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Privasi Terjamin: Berkas tersimpan privat. Aplikasi tidak meminta akun atau kata sandi e-Kinerja BKN.
          </span>
        </div>
        <Link href="/pengaturan" className="text-xs text-slate-400 hover:text-slate-200 underline">
          Kelola Pengaturan
        </Link>
      </div>
    </div>
  );
}
