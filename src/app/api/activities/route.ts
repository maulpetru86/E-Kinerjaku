import { NextRequest, NextResponse } from "next/server";
import { getActivities, createActivity } from "@/lib/db/activities";
import { ActivityFormSchema } from "@/lib/validations/activity";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");
    const userId = searchParams.get("userId") || "user-default-1";
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") as any || undefined;

    const activities = await getActivities({
      userId,
      periodId,
      search,
      categorizationStatus: status,
    });

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error("API GET /api/activities error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengambil jurnal aktivitas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ActivityFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data aktivitas tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const userId = body.userId || "user-default-1";
    const created = await createActivity(validation.data, userId);

    return NextResponse.json(
      { success: true, message: "Aktivitas berhasil dicatat", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("API POST /api/activities error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat menyimpan catatan aktivitas" },
      { status: 500 }
    );
  }
}

