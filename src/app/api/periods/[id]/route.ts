import { NextRequest, NextResponse } from "next/server";
import { getPeriodById, updatePeriod, deletePeriod } from "@/lib/db/periods";
import { PeriodFormSchema, PeriodUpdateSchema } from "@/lib/validations/period";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user-default-1";

    const period = await getPeriodById(id, userId);
    if (!period) {
      return NextResponse.json(
        { success: false, message: "Periode tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: period });
  } catch (error) {
    console.error("API GET /api/periods/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengambil detail periode" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = body.userId || "user-default-1";

    const validation = PeriodUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pembaruan tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const updated = await updatePeriod(id, validation.data, userId);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Periode tidak ditemukan untuk diperbarui" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Periode berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("API PATCH /api/periods/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat memperbarui periode" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user-default-1";

    const deleted = await deletePeriod(id, userId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Periode tidak ditemukan untuk dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Periode berhasil dihapus",
    });
  } catch (error) {
    console.error("API DELETE /api/periods/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat menghapus periode" },
      { status: 500 }
    );
  }
}
