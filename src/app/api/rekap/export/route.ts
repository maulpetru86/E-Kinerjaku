import { NextRequest, NextResponse } from "next/server";
import { getRekapMatriks, generateRekapCsv } from "@/lib/db/rekap";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodId = searchParams.get("periodId");
    const userId = searchParams.get("userId") || "user-default-1";

    if (!periodId) {
      return NextResponse.json(
        { success: false, message: "Parameter periodId wajib disertakan" },
        { status: 400 }
      );
    }

    const matriks = await getRekapMatriks(periodId, userId);
    if (!matriks) {
      return NextResponse.json(
        { success: false, message: "Periode kinerja tidak ditemukan" },
        { status: 404 }
      );
    }

    const csvContent = generateRekapCsv(matriks);
    const safePeriodName = matriks.period.name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `rekap_kinerja_${safePeriodName}_${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("API GET /api/rekap/export error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengunduh CSV rekap" },
      { status: 500 }
    );
  }
}
