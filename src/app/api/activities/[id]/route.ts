import { NextRequest, NextResponse } from "next/server";
import { getActivityById, updateActivity, deleteActivity } from "@/lib/db/activities";
import { ActivityFormSchema } from "@/lib/validations/activity";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user-default-1";

    const activity = await getActivityById(id, userId);
    if (!activity) {
      return NextResponse.json(
        { success: false, message: "Aktivitas tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: activity });
  } catch (error) {
    console.error("API GET /api/activities/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengambil detail aktivitas" },
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

    const partialSchema = ActivityFormSchema.partial();
    const validation = partialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pembaruan aktivitas tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const updated = await updateActivity(id, validation.data, userId);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Aktivitas tidak ditemukan untuk diperbarui" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Catatan aktivitas berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("API PATCH /api/activities/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat memperbarui aktivitas" },
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

    const success = await deleteActivity(id, userId);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Aktivitas tidak ditemukan untuk dihapus" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Aktivitas berhasil dihapus",
    });
  } catch (error) {
    console.error("API DELETE /api/activities/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat menghapus aktivitas" },
      { status: 500 }
    );
  }
}

