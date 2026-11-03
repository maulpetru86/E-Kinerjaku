import { NextRequest, NextResponse } from "next/server";
import { getActivityById } from "@/lib/db/activities";
import { getRhks } from "@/lib/db/rhk";
import { analyzeActivityForRhk } from "@/lib/ai/gemini";
import { createAISuggestion } from "@/lib/db/ai-suggestions";
import { AnalyzeActivitySchema } from "@/lib/validations/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "user-default-1";

    const validation = AnalyzeActivitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Parameter analisis aktivitas tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const { activityId, periodId } = validation.data;
    const activity = await getActivityById(activityId, userId);

    if (!activity) {
      return NextResponse.json(
        { success: false, message: "Catatan aktivitas tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ambil daftar RHK dari periode aktif
    const activePeriodId = periodId || activity.periodId || undefined;
    const rhks = await getRhks(activePeriodId, userId);

    if (rhks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Belum ada butir RHK pada periode ini. Silakan impor atau tambahkan RHK terlebih dahulu di Bank RHK.",
        },
        { status: 400 }
      );
    }

    // Analisis via Gemini / Fallback Engine
    const analysis = await analyzeActivityForRhk(
      activity.description,
      activity.resultNotes,
      rhks
    );

    if (!analysis.recommendedRhkId) {
      return NextResponse.json({
        success: true,
        message: "AI belum menemukan butir RHK yang cukup spesifik dengan narasi kegiatan ini.",
        data: null,
        analysis,
      });
    }

    // Buat saran AI dengan status 'pending' (Human-in-the-loop)
    const suggestion = await createAISuggestion(
      {
        entityType: "activity",
        entityId: activity.id,
        suggestionType: "rhk_link",
        suggestionPayload: {
          rhkId: analysis.recommendedRhkId,
          indicatorId: analysis.recommendedIndicatorId,
          rhkName: analysis.rhkName,
          indicatorText: analysis.indicatorText,
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
        ? "Rekomendasi RHK berhasil dianalisis (Mode Offline/Lokal)."
        : "Rekomendasi RHK berhasil dianalisis oleh AI.",
      data: suggestion,
    });
  } catch (error: any) {
    console.error("API POST /api/ai/analyze-activity error:", error);
    return NextResponse.json(
      { success: false, message: `Gagal menganalisis aktivitas: ${error.message || "Kesalahan server"}` },
      { status: 500 }
    );
  }
}
