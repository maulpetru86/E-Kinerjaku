import { NextRequest, NextResponse } from "next/server";
import { readPeriods, savePeriods } from "@/lib/db/periods";
import { readRhks, saveRhks } from "@/lib/db/rhk";
import {
  readActivities,
  saveActivities,
  readActRhkLinks,
  saveActRhkLinks,
} from "@/lib/db/activities";
import {
  readEvidence,
  saveEvidence,
  readActEvLinks,
  saveActEvLinks,
  readRhkEvLinks,
  saveRhkEvLinks,
  EVIDENCE_UPLOADS_DIR,
} from "@/lib/db/evidence";
import { readRhkMappings, saveRhkMappings } from "@/lib/db/mapping";
import { readAISuggestions, saveAISuggestions } from "@/lib/db/ai-suggestions";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "user-default-1";

    const periods = readPeriods().filter((p) => p.userId === userId);
    const rhks = readRhks().filter((r) => r.userId === userId);
    const activities = readActivities().filter((a) => a.userId === userId);
    const evidenceFiles = readEvidence().filter((e) => e.userId === userId);
    const rhkMappings = readRhkMappings().filter((m) => m.userId === userId);
    const aiSuggestions = readAISuggestions().filter((s) => s.userId === userId);

    const actIds = new Set(activities.map((a) => a.id));
    const rhkIds = new Set(rhks.map((r) => r.id));
    const evIds = new Set(evidenceFiles.map((e) => e.id));

    const actEvLinks = readActEvLinks().filter(
      (l) => actIds.has(l.activityId) || evIds.has(l.evidenceFileId)
    );
    const rhkEvLinks = readRhkEvLinks().filter(
      (l) => rhkIds.has(l.rhkId) || evIds.has(l.evidenceFileId)
    );
    const actRhkLinks = readActRhkLinks().filter(
      (l) => actIds.has(l.activityId) || rhkIds.has(l.rhkId)
    );

    const backupPayload = {
      app: "KinerjaKu",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      userId,
      data: {
        periods,
        rhks,
        activities,
        evidenceFiles,
        rhkMappings,
        aiSuggestions,
        activityEvidenceLinks: actEvLinks,
        rhkEvidenceLinks: rhkEvLinks,
        activityRhkLinks: actRhkLinks,
      },
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const filename = `kinerjaku_backup_${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("API GET /api/backup error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat berkas cadangan data." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "user-default-1";

    // 1. Bersihkan berkas fisik bukti pengguna
    const allEvidence = readEvidence();
    const userEvidence = allEvidence.filter((e) => e.userId === userId);

    for (const ev of userEvidence) {
      const filePath = path.join(EVIDENCE_UPLOADS_DIR, ev.storageKey);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn(`Gagal menghapus berkas fisik ${filePath}:`, err);
        }
      }
    }

    // 2. Bersihkan tabel-tabel data pengguna
    const remainingEvidence = allEvidence.filter((e) => e.userId !== userId);
    saveEvidence(remainingEvidence);

    const remainingActivities = readActivities().filter((a) => a.userId !== userId);
    saveActivities(remainingActivities);

    const remainingRhks = readRhks().filter((r) => r.userId !== userId);
    saveRhks(remainingRhks);

    const remainingPeriods = readPeriods().filter((p) => p.userId !== userId);
    savePeriods(remainingPeriods);

    const remainingMappings = readRhkMappings().filter((m) => m.userId !== userId);
    saveRhkMappings(remainingMappings);

    const remainingSuggestions = readAISuggestions().filter((s) => s.userId !== userId);
    saveAISuggestions(remainingSuggestions);

    return NextResponse.json({
      success: true,
      message: "Seluruh data pribadi dan berkas fisik berhasil dihapus secara permanen.",
    });
  } catch (error: any) {
    console.error("API DELETE /api/backup error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menghapus data pribadi." },
      { status: 500 }
    );
  }
}
