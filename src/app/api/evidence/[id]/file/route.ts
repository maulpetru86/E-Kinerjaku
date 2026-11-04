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
    const isDownload =
      searchParams.get("download") === "true" ||
      searchParams.get("disposition") === "attachment";

    const evidence = await getEvidenceById(id, userId);
    if (!evidence) {
      return NextResponse.json(
        { success: false, message: "Berkas tidak ditemukan atau Anda tidak memiliki akses" },
        { status: 404 }
      );
    }

    const resolvedUploadDir = path.resolve(EVIDENCE_UPLOADS_DIR);
    const filePath = path.join(EVIDENCE_UPLOADS_DIR, evidence.storageKey);
    const resolvedFilePath = path.resolve(filePath);

    // Defense-in-depth: Cegah manipulasi Path Traversal
    if (!resolvedFilePath.startsWith(resolvedUploadDir)) {
      return NextResponse.json(
        { success: false, message: "Akses berkas ditolak (Path Traversal terdeteksi)" },
        { status: 403 }
      );
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "File fisik tidak ditemukan pada penyimpanan" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const disposition = isDownload ? "attachment" : "inline";

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
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("API GET /api/evidence/[id]/file error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat mengalirkan berkas" },
      { status: 500 }
    );
  }
}

