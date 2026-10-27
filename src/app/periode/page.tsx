"use client";

import React, { useState } from "react";
import { useActivePeriod } from "@/contexts/active-period-context";
import { PerformancePeriod, PeriodStatus } from "@/types";
import { formatDateIndo, cn } from "@/lib/utils";
import {
  Calendar,
  Plus,
  Archive,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Trash2,
  Check,
  Tag,
} from "lucide-react";

export default function PeriodePage() {
  const { periods, activePeriod, setActivePeriodId, refreshPeriods, isLoading } = useActivePeriod();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<PeriodStatus>("active");
  const [notes, setNotes] = useState("");

  const handleOpenModal = () => {
    const currentYear = new Date().getFullYear();
    setName(`SKP Tahun ${currentYear}`);
    setStartDate(`${currentYear}-01-01`);
    setEndDate(`${currentYear}-12-31`);
    setStatus("active");
    setNotes("");
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMessage("Tanggal selesai tidak boleh mendahului tanggal mulai.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          startDate,
          endDate,
          status,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.message || "Gagal menyimpan periode.");
        return;
      }

      await refreshPeriods();
      if (status === "active" && json.data?.id) {
        setActivePeriodId(json.data.id);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi gangguan jaringan saat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (periodId: string, newStatus: PeriodStatus) => {
    try {
      const res = await fetch(`/api/periods/${periodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await refreshPeriods();
        if (newStatus === "active") {
          setActivePeriodId(periodId);
        }
      }
    } catch (err) {
      console.error("Gagal mengubah status periode:", err);
    }
  };

  const handleDelete = async (periodId: string, periodName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus periode "${periodName}"? Data RHK dan aktivitas yang terhubung akan dipengaruhi.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/periods/${periodId}`, { method: "DELETE" });
      if (res.ok) {
        await refreshPeriods();
      }
    } catch (err) {
      console.error("Gagal menghapus periode:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Archive className="w-6 h-6 text-emerald-400" />
            Manajemen Periode Kinerja
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola periode SKP (tahunan atau triwulanan). Periode lama akan tetap aman dan terisolasi sebagai arsip.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-700/20 active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Tambah Periode Baru</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold text-white">Prinsip Isolasi Periode:</span> Saat Anda beralih ke periode baru, bukti dan RHK pada periode terdahulu tidak akan terhapus atau tercampur. Anda dapat kembali ke arsip periode kapan saja untuk melihat rekap pelaporan masa lalu.
        </div>
      </div>

      {/* Period Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Memuat daftar periode...</div>
      ) : periods.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-800 rounded-2xl p-6">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">Belum ada periode kinerja</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Mulai dengan membuat periode kinerja pertama Anda, misalnya SKP Tahun Berjalan.
          </p>
          <button
            onClick={handleOpenModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-slate-950 font-semibold text-xs"
          >
            <Plus className="w-4 h-4" />
            Buat Periode Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {periods.map((p) => {
            const isSelected = activePeriod?.id === p.id;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex flex-col justify-between p-5 rounded-2xl border transition-all",
                  isSelected
                    ? "bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider",
                        p.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : p.status === "archived"
                          ? "bg-slate-800 text-slate-400 border border-slate-700"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      )}
                    >
                      {p.status === "active" && <CheckCircle2 className="w-3 h-3" />}
                      {p.status === "archived" && <Archive className="w-3 h-3" />}
                      {p.status === "closed" && <Clock className="w-3 h-3" />}
                      {p.status === "active" ? "Aktif" : p.status === "archived" ? "Arsip" : "Ditutup"}
                    </span>

                    {isSelected && (
                      <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Sedang Dipilih
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {p.name}
                  </h3>

                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {formatDateIndo(p.startDate)} — {formatDateIndo(p.endDate)}
                    </span>
                  </div>

                  {p.notes && (
                    <p className="mt-3 text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                      {p.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {!isSelected ? (
                    <button
                      onClick={() => setActivePeriodId(p.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 transition-colors"
                    >
                      Gunakan Periode Ini
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">Periode Saat Ini</span>
                  )}

                  <div className="flex items-center gap-1">
                    {p.status !== "active" ? (
                      <button
                        onClick={() => handleStatusChange(p.id, "active")}
                        title="Jadikan Status Aktif"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(p.id, "closed")}
                        title="Tutup Periode"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}

                    {p.status !== "archived" && (
                      <button
                        onClick={() => handleStatusChange(p.id, "archived")}
                        title="Arsipkan Periode"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      title="Hapus Periode"
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Periode */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Buat Periode Kinerja Baru
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tentukan rentang masa penilaian untuk mengumpulkan aktivitas dan bukti.
            </p>

            {errorMessage && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Periode <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: SKP Tahun 2025 atau Triwulan I 2025"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Mulai <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Selesai <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status Periode</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PeriodStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="active">Aktif (Sedang Berjalan)</option>
                  <option value="closed">Ditutup (Menunggu Penilaian)</option>
                  <option value="archived">Arsip (Selesai Evaluasi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Catatan mengenai target khusus, instansi, atau jabatan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Periode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
