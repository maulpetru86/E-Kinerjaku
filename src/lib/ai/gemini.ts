import type { RHK } from "@/types";

export interface AIAnalysisResult {
  isOfflineMode: boolean;
  summary?: string | null;
  detectedDate?: string | null;
  suggestedEvidenceType?: string | null;
  recommendedRhkId?: string | null;
  recommendedIndicatorId?: string | null;
  rhkName?: string | null;
  indicatorText?: string | null;
  confidenceLabel: "high" | "medium" | "low" | "uncertain";
  confidenceReason: string;
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

/**
 * Deteksi tanggal lokal dari teks bahasa Indonesia (Fallback Rule-based)
 */
export function detectDateFromText(text: string): string | null {
  // 1. Format ISO YYYY-MM-DD
  const isoMatch = text.match(/\b(202\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) return isoMatch[0];

  // 2. Format DD/MM/YYYY atau DD-MM-YYYY
  const slashMatch = text.match(/\b(0[1-9]|[12]\d|3[01])[\/\-](0[1-9]|1[0-2])[\/\-](202\d)\b/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month}-${day}`;
  }

  // 3. Format Bahasa Indonesia: "15 Januari 2025"
  const MONTHS: Record<string, string> = {
    januari: "01",
    februari: "02",
    maret: "03",
    april: "04",
    mei: "05",
    juni: "06",
    juli: "07",
    agustus: "08",
    september: "09",
    oktober: "10",
    november: "11",
    desember: "12",
  };

  const indoMatch = text.match(
    /\b(0?[1-9]|[12]\d|3[01])\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(202\d)\b/i
  );
  if (indoMatch) {
    const day = indoMatch[1].padStart(2, "0");
    const month = MONTHS[indoMatch[2].toLowerCase()];
    const year = indoMatch[3];
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Pencocokan kata kunci lokal antara narasi aktivitas dan butir RHK (Fallback Rule-based)
 */
export function matchRhkLocally(narrative: string, rhks: RHK[]): AIAnalysisResult {
  const detectedDate = detectDateFromText(narrative);
  const narrativeWords = new Set(
    narrative
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4)
  );

  let bestRhk: RHK | null = null;
  let bestScore = 0;
  let matchedKeywords: string[] = [];

  for (const rhk of rhks) {
    const rhkText = `${rhk.individualRhk} ${rhk.intervenedLeadRhk || ""} ${(rhk.indicators || []).map((i) => i.indicatorText).join(" ")}`.toLowerCase();
    let score = 0;
    const currentMatches: string[] = [];

    narrativeWords.forEach((word) => {
      if (rhkText.includes(word)) {
        score++;
        currentMatches.push(word);
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestRhk = rhk;
      matchedKeywords = currentMatches;
    }
  }

  if (bestRhk && bestScore >= 2) {
    const firstInd = bestRhk.indicators?.[0];
    return {
      isOfflineMode: true,
      detectedDate,
      recommendedRhkId: bestRhk.id,
      recommendedIndicatorId: firstInd?.id || null,
      rhkName: bestRhk.individualRhk,
      indicatorText: firstInd?.indicatorText || null,
      confidenceLabel: bestScore >= 4 ? "medium" : "uncertain",
      confidenceReason: `Pencocokan kata kunci lokal: ditemukan kemiripan kata (${matchedKeywords.slice(0, 3).join(", ")}). Periksa kesesuaian sebelum konfirmasi. (Mode Asisten Lokal)`,
    };
  }

  return {
    isOfflineMode: true,
    detectedDate,
    recommendedRhkId: null,
    confidenceLabel: "uncertain",
    confidenceReason: "Informasi narasi belum spesifik untuk mencocokkan RHK secara otomatis. Silakan pilih RHK secara manual. (Mode Asisten Lokal)",
  };
}

/**
 * Analisis narasi kegiatan untuk rekomendasi RHK (Gemini 2.0 Flash / Fallback)
 */
export async function analyzeActivityForRhk(
  description: string,
  resultNotes: string | null | undefined,
  rhks: RHK[]
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Jika API key tidak ada, gunakan Fallback Rule-based (Graceful Fallback)
  if (!apiKey || apiKey.trim() === "") {
    return matchRhkLocally(`${description} ${resultNotes || ""}`, rhks);
  }

  const rhkContext = rhks.map((r, idx) => ({
    no: idx + 1,
    id: r.id,
    individualRhk: r.individualRhk,
    category: r.category,
    indicators: (r.indicators || []).map((ind) => ({
      id: ind.id,
      text: ind.indicatorText,
      aspect: ind.aspect,
    })),
  }));

  const systemInstruction = `Anda adalah asisten cerdas penyusunan e-Kinerja BKN untuk Aparatur Sipil Negara (ASN/PNS).
ATURAN UTAMA: ZERO HALLUCINATION.
Dilarang keras mengarang aktivitas, tanggal, atau capaian yang tidak ada dalam teks narasi.
Tugas Anda:
1. Membaca narasi kegiatan dan catatan hasil.
2. Memilih 1 butir RHK dan indikator yang paling relevan dari daftar RHK yang tersedia.
3. Menentukan confidenceLabel:
   - "high" jika narasi secara eksplisit cocok dengan RHK.
   - "medium" jika ada korelasi kuat namun sebagian konteks tersirat.
   - "low" atau "uncertain" jika narasi samar, tidak cukup info, atau tidak ada RHK yang relevan.
4. Memberikan penjelasan singkat alasan pemilihan pada confidenceReason.
Format respon HANYA berupa JSON valid.`;

  const prompt = `Narasi Kegiatan:
"${description}"
${resultNotes ? `Catatan Hasil: "${resultNotes}"` : ""}

Daftar RHK Tersedia:
${JSON.stringify(rhkContext, null, 2)}

Keluarkan JSON dengan struktur:
{
  "recommendedRhkId": "id_rhk atau null jika tidak ada yang cocok",
  "recommendedIndicatorId": "id_indikator atau null",
  "confidenceLabel": "high" | "medium" | "low" | "uncertain",
  "confidenceReason": "penjelasan singkat dan faktual"
}`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15000), // Timeout 15 detik
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1, // Suhu rendah untuk konsistensi & Zero Hallucination
        },
      }),
    });

    if (!res.ok) {
      console.warn(`Gemini API merespon status ${res.status}. Menggunakan fallback lokal.`);
      return matchRhkLocally(`${description} ${resultNotes || ""}`, rhks);
    }

    const data = await res.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return matchRhkLocally(`${description} ${resultNotes || ""}`, rhks);
    }

    const parsed = JSON.parse(rawContent);
    const matchedRhk = rhks.find((r) => r.id === parsed.recommendedRhkId);
    const matchedInd = matchedRhk?.indicators?.find((i) => i.id === parsed.recommendedIndicatorId);

    return {
      isOfflineMode: false,
      recommendedRhkId: matchedRhk?.id || null,
      recommendedIndicatorId: matchedInd?.id || null,
      rhkName: matchedRhk?.individualRhk || null,
      indicatorText: matchedInd?.indicatorText || null,
      confidenceLabel: parsed.confidenceLabel || "uncertain",
      confidenceReason: parsed.confidenceReason || "Dianalisis oleh asisten AI.",
    };
  } catch (error: any) {
    console.warn("Koneksi Gemini API gagal atau batas waktu terlampaui. Menggunakan fallback lokal.", error.message);
    return matchRhkLocally(`${description} ${resultNotes || ""}`, rhks);
  }
}

/**
 * Analisis berkas bukti (Ringkasan, Usulan Tanggal, dan Jenis Bukti)
 */
export async function analyzeEvidenceMetadata(
  filename: string,
  userDescription: string | null | undefined,
  mimeType: string,
  buffer?: Buffer | null,
  availableRhks: RHK[] = []
): Promise<AIAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const detectedDate = detectDateFromText(`${filename} ${userDescription || ""}`);

  // Fallback Rule-based jika tanpa API key
  if (!apiKey || apiKey.trim() === "") {
    const baseSummary = userDescription || filename.replace(/_/g, " ").replace(/\.[^/.]+$/, "");
    return {
      isOfflineMode: true,
      summary: `Berkas bukti: ${baseSummary}`,
      detectedDate,
      suggestedEvidenceType: mimeType.includes("pdf") ? "Dokumen Resmi / Laporan" : "Dokumentasi Foto / Kegiatan",
      confidenceLabel: detectedDate ? "medium" : "uncertain",
      confidenceReason: "Dianalisis menggunakan ekstraksi metadata lokal. (Mode Asisten Lokal)",
    };
  }

  const systemInstruction = `Anda adalah asisten cerdas e-Kinerja BKN untuk verifikasi bukti fisik.
ATURAN UTAMA: ZERO HALLUCINATION.
1. Ringkas isi/tujuan berkas bukti secara singkat dan faktual (maksimal 2 kalimat).
2. Jika ada tanggal tertera pada nama atau teks, usulkan sebagai detectedDate (format YYYY-MM-DD). Jangan mengarang jika tidak ada.
3. Usulkan jenis bukti (misal: "Surat Keputusan / Surat Tugas", "Daftar Hadir", "Laporan Notula", "Dokumentasi Foto", dsb).
Format respon HANYA berupa JSON valid.`;

  const prompt = `Nama Berkas: "${filename}"
Mime Type: "${mimeType}"
${userDescription ? `Keterangan Pengguna: "${userDescription}"` : ""}

Keluarkan JSON dengan struktur:
{
  "summary": "ringkasan singkat isi/tujuan berkas",
  "detectedDate": "YYYY-MM-DD atau null jika tidak ditemukan",
  "suggestedEvidenceType": "jenis bukti yang sesuai",
  "confidenceLabel": "high" | "medium" | "low" | "uncertain",
  "confidenceReason": "alasan singkat"
}`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) {
      return {
        isOfflineMode: true,
        summary: userDescription || filename,
        detectedDate,
        suggestedEvidenceType: "Dokumen Bukti",
        confidenceLabel: "uncertain",
        confidenceReason: "Analisis API gagal. Menggunakan ekstraksi lokal.",
      };
    }

    const data = await res.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      return {
        isOfflineMode: true,
        summary: userDescription || filename,
        detectedDate,
        confidenceLabel: "uncertain",
        confidenceReason: "Respon kosong dari provider AI. Menggunakan ekstraksi lokal.",
      };
    }

    const parsed = JSON.parse(rawContent);
    return {
      isOfflineMode: false,
      summary: parsed.summary,
      detectedDate: parsed.detectedDate || detectedDate,
      suggestedEvidenceType: parsed.suggestedEvidenceType,
      confidenceLabel: parsed.confidenceLabel || "medium",
      confidenceReason: parsed.confidenceReason || "Dianalisis oleh asisten AI.",
    };
  } catch (err: any) {
    return {
      isOfflineMode: true,
      summary: userDescription || filename,
      detectedDate,
      confidenceLabel: "uncertain",
      confidenceReason: `Koneksi AI gagal (${err.message}). Menggunakan ekstraksi lokal.`,
    };
  }
}
