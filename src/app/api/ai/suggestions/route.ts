import { NextRequest, NextResponse } from "next/server";
import { getAISuggestions } from "@/lib/db/ai-suggestions";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "user-default-1";
    const entityType = (searchParams.get("entityType") as any) || undefined;
    const entityId = searchParams.get("entityId") || undefined;
    const status = (searchParams.get("status") as any) || undefined;

    const suggestions = await getAISuggestions({
      userId,
      entityType,
      entityId,
      status,
    });

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("API GET /api/ai/suggestions error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengambil data saran AI" },
      { status: 500 }
    );
  }
}
