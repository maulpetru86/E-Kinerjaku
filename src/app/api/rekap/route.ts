import { NextRequest, NextResponse } from "next/server";
import { getRekapMatriks } from "@/lib/db/rekap";
import { RekapQuerySchema } from "@/lib/validations/rekap";

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

    const validation = RekapQuerySchema.safeParse({
      periodId,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Parameter kueri tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
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

    // Filter status jika diminta
    let filteredItems = matriks.items;
    const statusFilter = validation.data.status;
    if (statusFilter) {
      filteredItems = filteredItems.filter((rhk) =>
        rhk.indicators.some((ind) => ind.readinessStatus === statusFilter)
      );
    }

    // Filter teks pencarian jika diminta
    const searchQuery = validation.data.search?.toLowerCase();
    if (searchQuery) {
      filteredItems = filteredItems.filter(
        (rhk) =>
          rhk.rhk.individualRhk.toLowerCase().includes(searchQuery) ||
          (rhk.rhk.intervenedLeadRhk &&
            rhk.rhk.intervenedLeadRhk.toLowerCase().includes(searchQuery)) ||
          rhk.indicators.some(
            (ind) =>
              ind.indicator.indicatorText.toLowerCase().includes(searchQuery) ||
              ind.activities.some((a) => a.description.toLowerCase().includes(searchQuery)) ||
              ind.evidenceFiles.some((f) => f.originalFilename.toLowerCase().includes(searchQuery))
          )
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...matriks,
        items: filteredItems,
      },
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("API GET /api/rekap error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat menyusun rekap kinerja" },
      { status: 500 }
    );
  }
}
