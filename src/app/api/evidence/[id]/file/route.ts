import { NextRequest, NextResponse } from "next/server";
import { getEvidenceById, EVIDENCE_UPLOADS_DIR } from "@/lib/db/evidence";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user-default-1";
    const download = searchParams.get("download") === "true";

    const evidence = await getEvidenceById(id, userId);
    if (!evidence) {
      return NextResponse.json(
        { success: false, message: "Berkas tidak ditemukan atau Anda tidak memiliki akses" },
        { status: 404 }
      );
    }

    const filePath = path.join(EVIDENCE_UPLOADS_DIR, evidence.storageKey);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "File fisik tidak ditemukan pada penyimpanan" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const disposition = download ? "attachment" : "inline";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": evidence.mimeType || "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(
          evidence.originalFilename
        )}"`,
      },
    });
  } catch (error) {
    console.error("API GET /api/evidence/[id]/file error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat mengalirkan berkas" },
      { status: 500 }
    );
  }
}

