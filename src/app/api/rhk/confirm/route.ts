import { NextRequest, NextResponse } from "next/server";
import { createBatchRhks } from "@/lib/db/rhk";
import { RHKBatchConfirmSchema } from "@/lib/validations/rhk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RHKBatchConfirmSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data konfirmasi butir RHK tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const { periodId, sourceDocumentId, rhks } = validation.data;
    const userId = body.userId || "user-default-1";

    const savedRhks = await createBatchRhks(rhks, periodId, sourceDocumentId, userId);

    return NextResponse.json(
      {
        success: true,
        message: `${savedRhks.length} butir RHK berhasil disimpan ke Bank RHK periode aktif`,
        data: savedRhks,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API POST /api/rhk/confirm error:", error);
    return NextResponse.json(
      { success: false, message: `Gagal menyimpan hasil ekstraksi RHK: ${error.message || "Kesalahan server"}` },
      { status: 500 }
    );
  }
}

