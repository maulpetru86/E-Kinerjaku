import { NextRequest, NextResponse } from "next/server";
import { getRhkById, updateRhk, deleteRhk } from "@/lib/db/rhk";
import { RHKFormSchema } from "@/lib/validations/rhk";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user-default-1";

    const rhk = await getRhkById(id, userId);
    if (!rhk) {
      return NextResponse.json(
        { success: false, message: "Butir RHK tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rhk });
  } catch (error) {
    console.error("API GET /api/rhk/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengambil detail RHK" },
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

    const partialSchema = RHKFormSchema.partial();
    const validation = partialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pembaruan RHK tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const updated = await updateRhk(id, validation.data, userId);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Butir RHK tidak ditemukan untuk diperbarui" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Butir RHK berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("API PATCH /api/rhk/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat memperbarui RHK" },
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

    const success = await deleteRhk(id, userId);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Butir RHK tidak ditemukan untuk dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Butir RHK dan indikator terkait berhasil dihapus",
    });
  } catch (error) {
    console.error("API DELETE /api/rhk/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat menghapus RHK" },
      { status: 500 }
    );
  }
}

