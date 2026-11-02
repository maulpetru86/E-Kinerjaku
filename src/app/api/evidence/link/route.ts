import { NextRequest, NextResponse } from "next/server";
import {
  linkEvidenceToActivity,
  unlinkEvidenceFromActivity,
  linkEvidenceToRhk,
  unlinkEvidenceFromRhk,
} from "@/lib/db/evidence";
import { EvidenceLinkSchema, BatchLinkEvidenceSchema } from "@/lib/validations/evidence";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Cek apakah request berupa batch linking
    if (Array.isArray(body.evidenceFileIds)) {
      const batchValidation = BatchLinkEvidenceSchema.safeParse(body);
      if (!batchValidation.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Data penautan massal tidak valid",
            errors: batchValidation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
          },
          { status: 400 }
        );
      }

      const { evidenceFileIds, activityId, rhkId, indicatorId } = batchValidation.data;

      for (const evId of evidenceFileIds) {
        if (activityId) {
          await linkEvidenceToActivity(evId, activityId);
        }
        if (rhkId) {
          await linkEvidenceToRhk(evId, rhkId, indicatorId);
        }
      }

      return NextResponse.json({
        success: true,
        message: `${evidenceFileIds.length} berkas berhasil ditautkan`,
      });
    }

    // Single link/unlink
    const validation = EvidenceLinkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data penautan tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const { evidenceFileId, activityId, rhkId, indicatorId, action, notes } = validation.data;

    if (action === "link") {
      if (activityId) {
        await linkEvidenceToActivity(evidenceFileId, activityId);
      }
      if (rhkId) {
        await linkEvidenceToRhk(evidenceFileId, rhkId, indicatorId, notes);
      }
      return NextResponse.json({
        success: true,
        message: "Berkas berhasil ditautkan",
      });
    } else {
      if (activityId) {
        await unlinkEvidenceFromActivity(evidenceFileId, activityId);
      }
      if (rhkId) {
        await unlinkEvidenceFromRhk(evidenceFileId, rhkId, indicatorId);
      }
      return NextResponse.json({
        success: true,
        message: "Tautan berkas berhasil dilepaskan",
      });
    }
  } catch (error: any) {
    console.error("API POST /api/evidence/link error:", error);
    return NextResponse.json(
      { success: false, message: `Gagal memproses penautan berkas: ${error.message || "Kesalahan server"}` },
      { status: 500 }
    );
  }
}

