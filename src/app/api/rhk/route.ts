import { NextRequest, NextResponse } from "next/server";
import { getRhks, createRhk } from "@/lib/db/rhk";
import { RHKFormSchema } from "@/lib/validations/rhk";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodId = searchParams.get("periodId");
    const userId = searchParams.get("userId") || "user-default-1";

    if (!periodId) {
      return NextResponse.json(
        { success: false, message: "Parameter periodId wajib disertakan" },
        { status: 400 }
      );
    }

    const rhks = await getRhks(periodId, userId);
    return NextResponse.json({ success: true, data: rhks });
  } catch (error) {
    console.error("API GET /api/rhk error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengambil data RHK" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RHKFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data butir RHK tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const userId = body.userId || "user-default-1";
    const created = await createRhk(validation.data, userId);

    return NextResponse.json(
      { success: true, message: "Butir RHK berhasil disimpan", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("API POST /api/rhk error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat menyimpan butir RHK" },
      { status: 500 }
    );
  }
}

