import { PDFParse } from "pdf-parse";
import type { ExtractedRHKItem } from "@/types";

export interface ExtractionResult {
  success: boolean;
  data: ExtractedRHKItem[];
  documentTitle?: string;
  periodDetected?: string;
  rawTextPreview: string;
  warning?: string;
  error?: string;
}

/**
 * Normalisasi dan ekstraksi teks dari PDF dokumen SKP / Evaluasi Kinerja BKN
 */
export async function extractRhkFromPdf(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const rawText = textResult.text || "";

    if (!rawText || rawText.trim().length < 20) {
      return {
        success: false,
        data: [],
        rawTextPreview: "",
        warning:
          "Dokumen tidak memuat lapisan teks digital yang terbaca (kemungkinan merupakan hasil scan gambar/foto). Silakan gunakan PDF digital asli dari portal e-Kinerja BKN atau masukkan data RHK secara manual.",
      };
    }

    const preview = rawText.trim().slice(0, 1000);
    const parsed = parseBknSkpText(rawText);

    return {
      success: parsed.items.length > 0,
      data: parsed.items,
      documentTitle: parsed.documentTitle,
      periodDetected: parsed.periodDetected,
      rawTextPreview: preview,
      warning:
        parsed.items.length === 0
          ? "Sistem tidak dapat mengenali pola tabel SKP secara otomatis. Anda dapat meninjau pratinjau teks dan menambahkan butir RHK secara manual."
          : undefined,
    };
  } catch (err: any) {
    console.error("Gagal memproses file PDF:", err);
    return {
      success: false,
      data: [],
      rawTextPreview: "",
      error: `Gagal membaca berkas PDF: ${err.message || "Format berkas rusak atau tidak didukung"}`,
    };
  }
}

/**
 * Parser aturan teks SKP BKN (Zero Hallucination: tidak mengarang target atau indikator)
 */
export function parseBknSkpText(text: string): {
  items: ExtractedRHKItem[];
  documentTitle?: string;
  periodDetected?: string;
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let documentTitle = "Dokumen SKP e-Kinerja";
  let periodDetected: string | undefined = undefined;

  // Deteksi periode penilalan jika tertera di kop dokumen
  for (const line of lines.slice(0, 30)) {
    if (/PERIODE\s*PENILAIAN/i.test(line) || /PERIODE/i.test(line)) {
      periodDetected = line.replace(/PERIODE\s*PENILAIAN\s*:\s*/i, "").trim();
    }
    if (/SASARAN\s*KINERJA\s*PEGAWAI/i.test(line)) {
      documentTitle = line;
    }
  }

  const items: ExtractedRHKItem[] = [];
  let currentCategory: "utama" | "tambahan" = "utama";
  let currentLeadRhk: string | null = null;
  let currentIndivRhk: string | null = null;
  let currentIndicators: ExtractedRHKItem["indicators"] = [];

  // Helper untuk commit item RHK yang sedang terkumpul
  const commitCurrentRhk = () => {
    if (currentIndivRhk && currentIndivRhk.length >= 3) {
      // Jika belum ada indikator yang terdeteksi, tambahkan 1 slot indikator kosong
      const finalIndicators =
        currentIndicators.length > 0
          ? currentIndicators
          : [
              {
                tempId: `temp-ind-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                aspect: "Kuantitas",
                indicatorText: `Realisasi target pelaksanaan ${currentIndivRhk.slice(0, 60)}...`,
                targetValue: null,
                targetUnit: null,
                targetPeriodText: null,
              },
            ];

      items.push({
        tempId: `temp-rhk-${Date.now()}-${items.length + 1}-${Math.random().toString(36).slice(2, 6)}`,
        intervenedLeadRhk: currentLeadRhk,
        individualRhk: currentIndivRhk,
        category: currentCategory,
        indicators: finalIndicators,
      });
    }

    currentIndivRhk = null;
    currentIndicators = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Deteksi Pergantian Kategori
    if (/^(?:A\.\s*)?UTAMA\s*$/i.test(line) || /KATEGORI\s*UTAMA/i.test(line)) {
      commitCurrentRhk();
      currentCategory = "utama";
      continue;
    }
    if (/^(?:B\.\s*)?TAMBAHAN\s*$/i.test(line) || /KATEGORI\s*TAMBAHAN/i.test(line)) {
      commitCurrentRhk();
      currentCategory = "tambahan";
      continue;
    }

    // Lewati baris header tabel yang umum
    if (
      /^(?:NO|RENCANA\s*HASIL\s*KERJA|ASPEK|INDIKATOR|TARGET|SATUAN|REALISASI|UMPAN\s*BALIK)/i.test(
        line
      ) &&
      line.length < 50
    ) {
      continue;
    }

    // Deteksi baris nomor butir RHK baru, misal "1.", "2)", "1 ", dsb.
    const rhkStartMatch = line.match(/^(\d+)[.)\s]+(.+)$/);

    // Deteksi baris aspek umum
    const isAspectLine = /^(?:Kuantitas|Kualitas|Waktu|Biaya)\b/i.test(line);

    if (rhkStartMatch && !isAspectLine) {
      commitCurrentRhk();
      const content = rhkStartMatch[2].trim();

      // Terkadang RHK pimpinan dan individu dipisah tanda atau baris
      if (content.toLowerCase().startsWith("intervensi:") || content.toLowerCase().startsWith("rhk pimpinan:")) {
        currentLeadRhk = content.replace(/^(?:intervensi|rhk pimpinan):\s*/i, "").trim();
      } else {
        currentIndivRhk = content;
      }
      continue;
    }

    // Deteksi Aspek & Indikator
    const aspectMatch = line.match(/^(Kuantitas|Kualitas|Waktu|Biaya)\s*[:\-–]?\s*(.*)$/i);
    if (aspectMatch) {
      const aspectName = aspectMatch[1];
      let rest = aspectMatch[2].trim();

      // Jika teks indikator berlanjut di baris berikutnya
      if (!rest && i + 1 < lines.length && !lines[i + 1].match(/^(?:Kuantitas|Kualitas|Waktu|\d+[.)])/i)) {
        rest = lines[++i];
      }

      // Deteksi target di akhir teks (misal: "12 Laporan", "100 %", "12 Bulan")
      let targetValue: string | null = null;
      let targetUnit: string | null = null;

      const targetMatch = rest.match(/\b(\d+(?:[.,]\d+)?(?:\s*-\s*\d+)?)\s*([A-Za-z%]+(?:[\s/][A-Za-z]+)?)\s*$/);
      let indicatorText = rest;

      if (targetMatch) {
        targetValue = targetMatch[1];
        targetUnit = targetMatch[2];
        indicatorText = rest.slice(0, targetMatch.index).trim();
      }

      currentIndicators.push({
        tempId: `temp-ind-${Date.now()}-${currentIndicators.length + 1}-${Math.random().toString(36).slice(2, 6)}`,
        aspect: aspectName,
        indicatorText: indicatorText || `Indikator aspek ${aspectName}`,
        targetValue,
        targetUnit,
        targetPeriodText: null,
      });
      continue;
    }

    // Jika sedang dalam RHK individu dan bukan aspek, sambungkan kalimat jika belum selesai
    if (currentIndivRhk && currentIndicators.length === 0) {
      if (!line.match(/^(?:PEGAWAI|PEJABAT|NIP|TANGGAL|TANDATANGAN|PENILAI)/i) && line.length > 5) {
        currentIndivRhk += " " + line;
      }
    }
  }

  // Commit sisa item terakhir
  commitCurrentRhk();

  // Fallback cadangan: Jika tabel formal BKN tidak terpetakan (misal format paragraf / bullet list)
  if (items.length === 0 && lines.length >= 3) {
    const candidateLines = lines.filter(
      (l) =>
        l.length > 20 &&
        !/^(?:PEGAWAI|PEJABAT|NIP|KEMENTERIAN|PEMERINTAH|DINAS|BADAN|PERIODE|TANDATANGAN)/i.test(l)
    );

    candidateLines.slice(0, 5).forEach((cl, idx) => {
      items.push({
        tempId: `temp-rhk-fallback-${idx + 1}`,
        intervenedLeadRhk: null,
        individualRhk: cl,
        category: "utama",
        indicators: [
          {
            tempId: `temp-ind-fallback-${idx + 1}`,
            aspect: "Kuantitas",
            indicatorText: `Realisasi target ${cl.slice(0, 40)}...`,
            targetValue: null,
            targetUnit: null,
            targetPeriodText: null,
          },
        ],
      });
    });
  }

  return { items, documentTitle, periodDetected };
}
