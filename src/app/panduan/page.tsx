"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Printer,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  Camera,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function PanduanIndexPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Khusus Pendidik & Tenaga Kependidikan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Panduan Penggunaan KinerjaKu
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Alur praktis mencatat kegiatan mengajar, mengumpulkan foto bukti tugas, dan menyusun rekap triwulan tanpa stres menjelang pelaporan e-Kinerja BKN.
          </p>
        </div>

        <Link
          href="/panduan/cetak"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-700/25 transition-all active:scale-95 flex-shrink-0"
        >
          <Printer className="w-4 h-4 text-slate-950" />
          <span>Buka & Cetak PDF (A4)</span>
        </Link>
      </div>

      {/* Ringkasan 5 Langkah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-sm">
            1
          </div>
          <h2 className="font-bold text-white text-base">Awal Tahun: Impor Dokumen SKP</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cukup unduh berkas PDF SKP Anda dari portal e-Kinerja BKN, lalu unggah ke menu Bank RHK. Sistem akan mengekstrak butir target Kinerja Utama dan Tambahan Anda secara otomatis.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 font-bold flex items-center justify-center text-sm">
            2
          </div>
          <h2 className="font-bold text-white text-base">Harian: Catat Cepat 15 Detik di HP</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Selesai mengajar di kelas atau rapat di ruang guru, buka KinerjaKu di HP dan ketuk tombol hijau Catat. Tuliskan 1 kalimat kegiatan Anda tanpa perlu pusing memilih butir RHK saat itu juga.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-sm">
            3
          </div>
          <h2 className="font-bold text-white text-base">Kapan Saja: Kotak Masuk Bukti</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Foto hasil asesmen siswa, daftar hadir, atau surat tugas langsung diunggah ke Kotak Masuk. Satu foto kegiatan dapat ditautkan ke beberapa RHK sekaligus tanpa perlu diunggah berulang.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-sm">
            4
          </div>
          <h2 className="font-bold text-white text-base">Waktu Luang: Bantuan Asisten AI</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Saat santai di ruang guru, klik tombol "Analisis dengan AI". Asisten pintar akan menyarankan butir RHK yang cocok. Anda cukup menekan tombol "Terima" untuk menghubungkan secara instan.
          </p>
        </div>
      </div>

      {/* Akhir Triwulan Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Akhir Triwulan: Buka Rekap Kinerja & Salin ke BKN</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Semua butir SKP Anda sudah berstatus "Siap Direkap" lengkap dengan berkas bukti fisik terlampir. Tinggal buka e-Kinerja BKN dan salin dengan tenang!
            </p>
          </div>
        </div>

        <Link
          href="/panduan/cetak"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline flex-shrink-0"
        >
          <span>Lihat Panduan Lengkap PDF</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
