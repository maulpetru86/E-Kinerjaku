import { NextRequest, NextResponse } from "next/server";
import { extractRhkFromPdf } from "@/lib/pdf/extractor";
import { createSourceDocument } from "@/lib/db/rhk";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), ".data", "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const periodId = (formData.get("periodId") as string) || null;
    const userId = (formData.get("userId") as string) || "user-default-1";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File PDF wajib dilampirkan" },
        { status: 400 }
      );
    }

    // Validasi tipe berkas
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, message: "Format berkas tidak valid. Harap unggah berkas berekstensi .pdf" },
        { status: 400 }
      );
    }

    // Validasi ukuran berkas (maks 15MB)
    const MAX_SIZE_MB = 15;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: `Ukuran berkas melebihi batas maksimum (${MAX_SIZE_MB}MB)` },
        { status: 400 }
      );
    }

    ensureUploadsDir();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Simpan file sumber asli
    const storageKey = `pdf_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const destinationPath = path.join(UPLOADS_DIR, storageKey);
    fs.writeFileSync(destinationPath, buffer);

    // Ekstraksi teks & tabel dari PDF
    const extraction = await extractRhkFromPdf(buffer);

    // Catat ke daftar source_documents dengan status pending
    const sourceDoc = await createSourceDocument({
      userId,
      periodId,
      storageKey,
      documentType: "pdf_rhk",
      originalFilename: file.name,
      extractionStatus: extraction.success ? "completed" : "failed",
      extractionSummary: {
        totalItemsExtracted: extraction.data.length,
        documentTitle: extraction.documentTitle,
        periodDetected: extraction.periodDetected,
      },
      confirmedAt: null,
    });

    return NextResponse.json({
      success: true,
      message: extraction.success
        ? "Ekstraksi PDF berhasil. Silakan tinjau dan koreksi butir RHK sebelum disimpan."
        : "Berkas berhasil diunggah tetapi pembacaan otomatis memerlukan peninjauan manual.",
      sourceDocumentId: sourceDoc.id,
      documentTitle: extraction.documentTitle,
      periodDetected: extraction.periodDetected,
      rawTextPreview: extraction.rawTextPreview,
      warning: extraction.warning,
      data: extraction.data,
    });
  } catch (error: any) {
    console.error("API POST /api/rhk/parse-pdf error:", error);
    return NextResponse.json(
      { success: false, message: `Gagal memproses dokumen PDF: ${error.message || "Kesalahan server"}` },
      { status: 500 }
    );
  }
}

