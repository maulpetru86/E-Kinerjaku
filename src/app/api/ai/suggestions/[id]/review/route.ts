import { NextRequest, NextResponse } from "next/server";
import { reviewAISuggestion } from "@/lib/db/ai-suggestions";
import { ReviewSuggestionSchema } from "@/lib/validations/ai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = body.userId || "user-default-1";

    const validation = ReviewSuggestionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data konfirmasi saran tidak valid",
          errors: validation.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const { action, modifiedPayload } = validation.data;
    const result = await reviewAISuggestion(id, action, modifiedPayload, userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.suggestion,
    });
  } catch (error) {
    console.error("API POST /api/ai/suggestions/[id]/review error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat memproses konfirmasi saran AI" },
      { status: 500 }
    );
  }
}
