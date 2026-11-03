"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Loader2,
  Calendar,
  FileText,
  Target,
  Info,
} from "lucide-react";
import type { AISuggestion } from "@/types";

interface SuggestionCardProps {
  suggestion: AISuggestion;
  onReviewed: (updatedSuggestion: AISuggestion, action: "accept" | "reject") => void;
}

export function SuggestionCard({ suggestion, onReviewed }: SuggestionCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload = suggestion.suggestionPayload || {};
  const isRhkLink = suggestion.suggestionType === "rhk_link";
  const isMetadata = suggestion.suggestionType === "metadata";

  const handleReview = async (action: "accept" | "reject") => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/suggestions/${suggestion.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Gagal memproses usulan AI.");
        return;
      }

      onReviewed(json.data, action);
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confidence badge config
  const confidence = suggestion.confidenceLabel || "uncertain";
  const confidenceBadge = {
    high: {
      bg: "bg-emerald-950/60 text-emerald-400 border-emerald-800/40",
      text: "Tingkat Keyakinan: Tinggi",
    },
    medium: {
      bg: "bg-amber-950/60 text-amber-400 border-amber-800/40",
      text: "Tingkat Keyakinan: Sedang",
    },
    low: {
      bg: "bg-rose-950/60 text-rose-400 border-rose-800/40",
      text: "Perlu Pemeriksaan",
    },
    uncertain: {
      bg: "bg-slate-800 text-slate-300 border-slate-700",
      text: "Perlu Verifikasi Manual",
    },
  }[confidence];

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 text-xs space-y-2.5 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>
            {isRhkLink ? "Saran Penautan RHK (AI)" : "Saran Metadata Berkas (AI)"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {Boolean(payload.isOfflineMode) && (
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              Offline Matcher
            </span>
          )}
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${confidenceBadge.bg}`}
          >
            {confidenceBadge.text}
          </span>
        </div>
      </div>

      {/* Content based on type */}
      {isRhkLink && (
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white leading-snug">
                {(payload.rhkName as string) || "RHK tidak teridentifikasi"}
              </p>
              {Boolean(payload.indicatorText) && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Indikator: {payload.indicatorText as string}
                </p>
              )}
            </div>
          </div>
          {Boolean(payload.confidenceReason) && (
            <p className="text-[11px] text-slate-400 italic mt-1 border-t border-slate-800/80 pt-1">
              "{(payload.confidenceReason as string)}"
            </p>
          )}
        </div>
      )}

      {isMetadata && (
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          {Boolean(payload.evidenceDate) && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Usulan Tanggal: <strong className="text-white">{payload.evidenceDate as string}</strong></span>
            </div>
          )}
          {Boolean(payload.suggestedEvidenceType) && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Jenis Bukti: <strong className="text-white">{payload.suggestedEvidenceType as string}</strong></span>
            </div>
          )}
          {Boolean(payload.userDescription) && (
            <p className="text-[11px] text-slate-300">
              Ringkasan: "{(payload.userDescription as string)}"
            </p>
          )}
          {Boolean(payload.confidenceReason) && (
            <p className="text-[10px] text-slate-400 italic pt-0.5">
              {(payload.confidenceReason as string)}
            </p>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[10px] text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Data tidak berubah tanpa persetujuan Anda
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleReview("reject")}
            className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 font-medium text-[11px] transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <X className="w-3 h-3" />
            Tolak
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleReview("accept")}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] transition-colors shadow-sm flex items-center gap-1 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            Terima Usulan
          </button>
        </div>
      </div>
    </div>
  );
}

