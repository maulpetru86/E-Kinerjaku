import { NextRequest, NextResponse } from "next/server";
import {
  getRhkMappings,
  createRhkMapping,
  updateRhkMappingStatus,
  autoSuggestRhkMappings,
} from "@/lib/db/mapping";
import {
  RhkMappingFormSchema,
  RhkAutoMappingSchema,
} from "@/lib/validations/rekap";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "user-default-1";
    const oldPeriodId = searchParams.get("oldPeriodId") || undefined;
    const newPeriodId = searchParams.get("newPeriodId") || undefined;
    const status = (searchParams.get("status") as any) || undefined;

    const mappings = await getRhkMappings({
      userId,
      oldPeriodId,
      newPeriodId,
      status,
    });

    return NextResponse.json({ success: true, data: mappings });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("API GET /api/rhk/mappings error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengambil pemetaan RHK" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "user-default-1";

    // 1. Aksi Saran Otomatis
    if (body.action === "auto_suggest") {
      const val = RhkAutoMappingSchema.safeParse(body);
      if (!val.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Parameter saran pemetaan tidak valid",
            errors: val.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
          },
          { status: 400 }
        );
      }

      const results = await autoSuggestRhkMappings(
        val.data.oldPeriodId,
        val.data.newPeriodId,
        userId
      );

      return NextResponse.json({
        success: true,
        message: `${results.length} rekomendasi pemetaan berhasil disiapkan.`,
        data: results,
      });
    }

    // 2. Aksi Review / Konfirmasi Status
    if (body.action === "review") {
      if (!body.id || !body.status) {
        return NextResponse.json(
          { success: false, message: "ID pemetaan dan status wajib disertakan" },
          { status: 400 }
        );
      }

      const updated = await updateRhkMappingStatus(
        body.id,
        body.status,
        body.notes,
        userId
      );

      if (!updated) {
        return NextResponse.json(
          { success: false, message: "Pemetaan tidak ditemukan" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Pemetaan RHK berhasil di-${body.status === "confirmed" ? "konfirmasi" : "tolak"}.`,
        data: updated,
      });
    }

    // 3. Tambah Pemetaan Manual
    const validation = RhkMappingFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pemetaan RHK tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const created = await createRhkMapping(validation.data, userId);
    return NextResponse.json(
      { success: true, message: "Pemetaan RHK berhasil disimpan", data: created },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API POST /api/rhk/mappings error:", error);
    return NextResponse.json(
      { success: false, message: `Gagal memproses pemetaan: ${error.message || "Kesalahan server"}` },
      { status: 500 }
    );
  }
}
