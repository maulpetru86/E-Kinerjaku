"use client";

import React, { useState, useEffect } from "react";
import { Settings, Shield, Database, Sparkles, Download, Trash2, Check, Key, HelpCircle, AlertCircle } from "lucide-react";

export default function PengaturanPage() {
  const [enableAI, setEnableAI] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kinerjaku_enable_ai");
    if (saved !== null) {
      setEnableAI(saved === "true");
    }
  }, []);

  const handleToggleAI = (val: boolean) => {
    setEnableAI(val);
    localStorage.setItem("kinerjaku_enable_ai", String(val));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          Pengaturan Aplikasi
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Kelola preferensi privasi, akun pribadi, dan integrasi kecerdasan buatan.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Pengaturan berhasil disimpan.</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Akun Pribadi & Keamanan */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Keamanan & Akun Pribadi
          </h2>
          <p className="text-xs text-slate-400">
            KinerjaKu berjalan sebagai aplikasi asisten pribadi. Semua data terenkripsi dan disimpan secara terproteksi.
          </p>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <div className="font-semibold text-white">Prinsip Zero-Credential BKN:</div>
            <p className="mt-0.5 text-slate-400">
              Aplikasi ini tidak pernah meminta atau menyimpan username, kata sandi, NIP, atau OTP portal e-Kinerja BKN Anda.
            </p>
          </div>
        </div>

        {/* Konfigurasi AI Asisten */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Asisten AI Terkontrol (Google Gemini)
              </h2>
              <p className="text-xs text-slate-400">
                Membantu merangkum berkas bukti dan merekomendasikan indikator RHK yang pas dengan catatan harian Anda.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableAI}
                onChange={(e) => handleToggleAI(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Konfigurasi API Key (Gemini 2.0 Flash):</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Kunci API dapat dikonfigurasi secara aman melalui variabel lingkungan <code className="text-amber-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">.env.local</code> dengan nama <code className="text-amber-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">GEMINI_API_KEY</code>.
              </p>
              <p className="text-slate-500 text-[11px]">
                Jika API key tidak disetel, sistem secara otomatis beralih ke <strong>Mode Asisten Offline/Lokal</strong> menggunakan pencocokan kata kunci dan deteksi tanggal faktual tanpa koneksi internet.
              </p>
            </div>

            <div className="text-xs text-slate-400 bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30 flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Prinsip Human-in-the-Loop:</strong> Semua usulan AI berstatus <strong className="text-amber-400">Pending</strong>. Tidak ada data yang berubah otomatis tanpa persetujuan manual (Terima/Tolak) dari Anda.
              </span>
            </div>
          </div>
        </div>

        {/* Kedaulatan Data & Ekspor */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400" />
            Kedaulatan Data (Data Sovereignty)
          </h2>
          <p className="text-xs text-slate-400">
            Anda memiliki kontrol penuh atas data Anda. Unduh seluruh cadangan arsip atau bersihkan data kapan pun dibutuhkan.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Unduh Arsip Cadangan (JSON/CSV)</span>
            </button>

            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors">
              <Trash2 className="w-4 h-4" />
              <span>Hapus Data Pribadi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
