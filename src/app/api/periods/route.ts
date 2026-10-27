import { NextRequest, NextResponse } from "next/server";
import { getPeriods, createPeriod } from "@/lib/db/periods";
import { PeriodFormSchema } from "@/lib/validations/period";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user-default-1";
    const periods = await getPeriods(userId);
    return NextResponse.json({ success: true, data: periods });
  } catch (error) {
    console.error("API GET /api/periods error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengambil data periode" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = PeriodFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data periode tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const userId = body.userId || "user-default-1";
    const created = await createPeriod(validation.data, userId);

    return NextResponse.json(
      { success: true, message: "Periode kinerja berhasil dibuat", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("API POST /api/periods error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat menyimpan periode" },
      { status: 500 }
    );
  }
}
