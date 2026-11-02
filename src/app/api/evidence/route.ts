import { NextRequest, NextResponse } from "next/server";
import { getEvidenceFiles, createEvidenceFile } from "@/lib/db/evidence";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user-default-1";
    const status = searchParams.get("status") as any || undefined;
    const search = searchParams.get("search") || undefined;

    const files = await getEvidenceFiles({
      userId,
      reviewStatus: status,
      search,
    });

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    console.error("API GET /api/evidence error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server saat mengambil data berkas bukti" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const userId = (formData.get("userId") as string) || "user-default-1";
    const userDescription = (formData.get("userDescription") as string) || null;
    const evidenceDate = (formData.get("evidenceDate") as string) || null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "Minimal 1 berkas wajib diunggah" },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
    const savedResults = [];
    const duplicates = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: `Berkas "${file.name}" melebihi batas ukuran maksimum 15MB`,
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await createEvidenceFile({
        userId,
        originalFilename: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        buffer,
        evidenceDate,
        userDescription,
        reviewStatus: "new",
      });

      savedResults.push(result.file);
      if (result.isDuplicate) {
        duplicates.push(file.name);
      }
    }

    let message = `${savedResults.length} berkas berhasil diunggah ke Kotak Masuk Bukti`;
    if (duplicates.length > 0) {
      message += `. Perhatian: Terdeteksi duplikasi konten pada berkas (${duplicates.join(", ")}), berkas tetap disimpan tanpa menghapus arsip lama.`;
    }

    return NextResponse.json(
      {
        success: true,
        message,
        data: savedResults,
        duplicates,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API POST /api/evidence error:", error);
    return NextResponse.json(
      { success: false, message: `Gagal mengunggah berkas: ${error.message || "Kesalahan server"}` },
      { status: 500 }
    );
  }
}

