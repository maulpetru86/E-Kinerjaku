import { NextRequest, NextResponse } from "next/server";
import { deleteRhkMapping } from "@/lib/db/mapping";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "user-default-1";

    const success = await deleteRhkMapping(id, userId);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Pemetaan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pemetaan RHK berhasil dihapus",
    });
  } catch (error) {
    console.error("API DELETE /api/rhk/mappings/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat menghapus pemetaan" },
      { status: 500 }
    );
  }
}
