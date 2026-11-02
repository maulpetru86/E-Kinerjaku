import { NextRequest, NextResponse } from "next/server";
import { getEvidenceById, updateEvidenceFile, deleteEvidenceFile } from "@/lib/db/evidence";
import { EvidenceUpdateSchema } from "@/lib/validations/evidence";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user-default-1";

    const file = await getEvidenceById(id, userId);
    if (!file) {
      return NextResponse.json(
        { success: false, message: "Berkas bukti tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: file });
  } catch (error) {
    console.error("API GET /api/evidence/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengambil detail berkas" },
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

    const validation = EvidenceUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pembaruan berkas tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const updated = await updateEvidenceFile(id, validation.data, userId);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Berkas bukti tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Metadata berkas bukti berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("API PATCH /api/evidence/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat memperbarui metadata berkas" },
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

    const result = await deleteEvidenceFile(id, userId);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.reason || "Gagal menghapus berkas bukti",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Berkas bukti berhasil dihapus",
    });
  } catch (error) {
    console.error("API DELETE /api/evidence/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat menghapus berkas bukti" },
      { status: 500 }
    );
  }
}

