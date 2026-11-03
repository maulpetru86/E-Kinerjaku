import { NextRequest, NextResponse } from "next/server";
import { getEvidenceById } from "@/lib/db/evidence";
import { analyzeEvidenceMetadata } from "@/lib/ai/gemini";
import { createAISuggestion } from "@/lib/db/ai-suggestions";
import { AnalyzeEvidenceSchema } from "@/lib/validations/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "user-default-1";

    const validation = AnalyzeEvidenceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Parameter analisis bukti tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const { evidenceFileId } = validation.data;
    const file = await getEvidenceById(evidenceFileId, userId);

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Berkas bukti tidak ditemukan" },
        { status: 404 }
      );
    }

    // Jalankan analisis metadata & ringkasan
    const analysis = await analyzeEvidenceMetadata(
      file.originalFilename,
      file.userDescription,
      file.mimeType
    );

    // Buat saran AI berstatus 'pending' (Human-in-the-loop)
    const suggestion = await createAISuggestion(
      {
        entityType: "evidence_file",
        entityId: file.id,
        suggestionType: "metadata",
        suggestionPayload: {
          userDescription: analysis.summary || file.userDescription,
          evidenceDate: analysis.detectedDate || file.evidenceDate,
          suggestedEvidenceType: analysis.suggestedEvidenceType,
          confidenceReason: analysis.confidenceReason,
          isOfflineMode: analysis.isOfflineMode,
        },
        confidenceLabel: analysis.confidenceLabel,
      },
      userId
    );

    return NextResponse.json({
      success: true,
      message: analysis.isOfflineMode
        ? "Analisis berkas selesai (Mode Offline/Lokal)."
        : "Analisis berkas selesai oleh asisten AI.",
      data: suggestion,
    });
  } catch (error: any) {
    console.error("API POST /api/ai/analyze-evidence error:", error);
    return NextResponse.json(
      { success: false, message: `Gagal menganalisis berkas: ${error.message || "Kesalahan server"}` },
      { status: 500 }
    );
  }
}
