import { RHK, RHKIndicator, SourceDocument } from "@/types";
import { RHKFormValues, RHKBatchConfirmValues } from "@/lib/validations/rhk";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const RHKS_FILE = path.join(DATA_DIR, "rhks.json");
const SOURCE_DOCS_FILE = path.join(DATA_DIR, "source_documents.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Inisialisasi data contoh RHK untuk testing & demonstrasi (data mock tanpa data sensitif asli)
function getInitialRhks(): RHK[] {
  return [
    {
      id: "rhk-sample-1",
      userId: "user-default-1",
      periodId: "period-2025-aktif",
      intervenedLeadRhk: "Meningkatnya kualitas tata kelola layanan administrasi kepegawaian",
      individualRhk: "Terlaksananya pengelolaan berkas dan arsip kinerja pegawai secara tertib dan akuntabel",
      category: "utama",
      notes: "Contoh butir RHK utama awal",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      indicators: [
        {
          id: "ind-sample-1",
          rhkId: "rhk-sample-1",
          aspect: "Kuantitas",
          indicatorText: "Jumlah laporan rekapitulasi berkas kinerja yang disusun",
          targetValue: "4",
          targetUnit: "Laporan",
          targetPeriodText: "Triwulanan",
          sourceText: "Target SKP Tahunan",
          reviewStatus: "confirmed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ind-sample-2",
          rhkId: "rhk-sample-1",
          aspect: "Kualitas",
          indicatorText: "Tingkat kesesuaian berkas portofolio kinerja dengan regulasi yang berlaku",
          targetValue: "100",
          targetUnit: "%",
          targetPeriodText: "Tahunan",
          sourceText: "Standar mutu",
          reviewStatus: "confirmed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ind-sample-3",
          rhkId: "rhk-sample-1",
          aspect: "Waktu",
          indicatorText: "Ketepatan waktu penyelesaian laporan berkas kinerja",
          targetValue: "12",
          targetUnit: "Bulan",
          targetPeriodText: "Tahunan",
          sourceText: "Jadwal pelaporan",
          reviewStatus: "confirmed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: "rhk-sample-2",
      userId: "user-default-1",
      periodId: "period-2025-aktif",
      intervenedLeadRhk: "Meningkatnya kepatuhan pemenuhan dokumen akuntabilitas kinerja",
      individualRhk: "Tersusunnya dokumen bukti dukung capaian kinerja triwulanan secara tepat waktu",
      category: "utama",
      notes: null,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      indicators: [
        {
          id: "ind-sample-4",
          rhkId: "rhk-sample-2",
          aspect: "Kuantitas",
          indicatorText: "Jumlah berkas bukti dukung yang diverifikasi dan dihimpun",
          targetValue: "12",
          targetUnit: "Berkas",
          targetPeriodText: "Tahunan",
          sourceText: "Bukti fisik kegiatan",
          reviewStatus: "confirmed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  ];
}

function readRhks(): RHK[] {
  ensureDataDir();
  if (!fs.existsSync(RHKS_FILE)) {
    const initial = getInitialRhks();
    fs.writeFileSync(RHKS_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(RHKS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Gagal membaca file data rhks.json, memuat default:", error);
    return getInitialRhks();
  }
}

function saveRhks(rhks: RHK[]) {
  ensureDataDir();
  fs.writeFileSync(RHKS_FILE, JSON.stringify(rhks, null, 2), "utf-8");
}

function readSourceDocs(): SourceDocument[] {
  ensureDataDir();
  if (!fs.existsSync(SOURCE_DOCS_FILE)) {
    fs.writeFileSync(SOURCE_DOCS_FILE, JSON.stringify([], null, 2), "utf-8");
    return [];
  }
  try {
    const raw = fs.readFileSync(SOURCE_DOCS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Gagal membaca source_documents.json:", error);
    return [];
  }
}

function saveSourceDocs(docs: SourceDocument[]) {
  ensureDataDir();
  fs.writeFileSync(SOURCE_DOCS_FILE, JSON.stringify(docs, null, 2), "utf-8");
}

export async function getRhks(periodId: string, userId: string = "user-default-1"): Promise<RHK[]> {
  const all = readRhks();
  return all
    .filter((r) => r.userId === userId && r.periodId === periodId)
    .sort((a, b) => {
      // Utama di atas, Tambahan di bawah
      if (a.category !== b.category) {
        return a.category === "utama" ? -1 : 1;
      }
      return a.createdAt > b.createdAt ? 1 : -1;
    });
}

export async function getRhkById(id: string, userId: string = "user-default-1"): Promise<RHK | null> {
  const all = readRhks();
  const rhk = all.find((r) => r.id === id && r.userId === userId);
  return rhk || null;
}

export async function createRhk(values: RHKFormValues, userId: string = "user-default-1"): Promise<RHK> {
  const all = readRhks();
  const rhkId = `rhk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const indicators: RHKIndicator[] = values.indicators.map((ind, idx) => ({
    id: `ind-${rhkId}-${idx + 1}`,
    rhkId,
    aspect: ind.aspect || null,
    indicatorText: ind.indicatorText,
    targetValue: ind.targetValue || null,
    targetUnit: ind.targetUnit || null,
    targetPeriodText: ind.targetPeriodText || null,
    sourceText: null,
    reviewStatus: ind.reviewStatus || "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const newRhk: RHK = {
    id: rhkId,
    userId,
    periodId: values.periodId,
    sourceDocumentId: values.sourceDocumentId || null,
    intervenedLeadRhk: values.intervenedLeadRhk || null,
    individualRhk: values.individualRhk,
    category: values.category,
    notes: values.notes || null,
    status: values.status || "active",
    indicators,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.push(newRhk);
  saveRhks(all);
  return newRhk;
}

export async function createBatchRhks(
  items: RHKBatchConfirmValues["rhks"],
  periodId: string,
  sourceDocumentId?: string | null,
  userId: string = "user-default-1"
): Promise<RHK[]> {
  const all = readRhks();
  const createdList: RHK[] = [];

  items.forEach((item, rIdx) => {
    const rhkId = `rhk-${Date.now()}-${rIdx + 1}-${Math.random().toString(36).slice(2, 6)}`;
    const indicators: RHKIndicator[] = item.indicators.map((ind, iIdx) => ({
      id: `ind-${rhkId}-${iIdx + 1}`,
      rhkId,
      aspect: ind.aspect || null,
      indicatorText: ind.indicatorText,
      targetValue: ind.targetValue || null,
      targetUnit: ind.targetUnit || null,
      targetPeriodText: ind.targetPeriodText || null,
      sourceText: "Hasil Ekstraksi PDF",
      reviewStatus: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const newRhk: RHK = {
      id: rhkId,
      userId,
      periodId,
      sourceDocumentId: sourceDocumentId || null,
      intervenedLeadRhk: item.intervenedLeadRhk || null,
      individualRhk: item.individualRhk,
      category: item.category,
      notes: "Diimpor dari dokumen PDF",
      status: "active",
      indicators,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    all.push(newRhk);
    createdList.push(newRhk);
  });

  saveRhks(all);
  return createdList;
}

export async function updateRhk(
  id: string,
  values: Partial<RHKFormValues>,
  userId: string = "user-default-1"
): Promise<RHK | null> {
  const all = readRhks();
  const index = all.findIndex((r) => r.id === id && r.userId === userId);
  if (index === -1) return null;

  const existing = all[index];
  const updatedIndicators: RHKIndicator[] = values.indicators
    ? values.indicators.map((ind, idx) => ({
        id: ind.id || `ind-${id}-${idx + 1}`,
        rhkId: id,
        aspect: ind.aspect || null,
        indicatorText: ind.indicatorText,
        targetValue: ind.targetValue || null,
        targetUnit: ind.targetUnit || null,
        targetPeriodText: ind.targetPeriodText || null,
        sourceText: null,
        reviewStatus: "edited",
        createdAt: existing.indicators?.find((i) => i.id === ind.id)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    : existing.indicators || [];

  const updated: RHK = {
    ...existing,
    ...(values.intervenedLeadRhk !== undefined ? { intervenedLeadRhk: values.intervenedLeadRhk || null } : {}),
    ...(values.individualRhk !== undefined ? { individualRhk: values.individualRhk } : {}),
    ...(values.category !== undefined ? { category: values.category } : {}),
    ...(values.notes !== undefined ? { notes: values.notes || null } : {}),
    ...(values.status !== undefined ? { status: values.status } : {}),
    indicators: updatedIndicators,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  saveRhks(all);
  return updated;
}

export async function deleteRhk(id: string, userId: string = "user-default-1"): Promise<boolean> {
  const all = readRhks();
  const filtered = all.filter((r) => !(r.id === id && r.userId === userId));
  if (filtered.length === all.length) return false;
  saveRhks(filtered);
  return true;
}

export async function createSourceDocument(
  doc: Omit<SourceDocument, "id" | "importedAt">
): Promise<SourceDocument> {
  const all = readSourceDocs();
  const newDoc: SourceDocument = {
    ...doc,
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    importedAt: new Date().toISOString(),
  };
  all.push(newDoc);
  saveSourceDocs(all);
  return newDoc;
}

export async function getSourceDocuments(
  periodId?: string,
  userId: string = "user-default-1"
): Promise<SourceDocument[]> {
  const all = readSourceDocs();
  return all
    .filter((d) => d.userId === userId && (!periodId || d.periodId === periodId))
    .sort((a, b) => (a.importedAt > b.importedAt ? -1 : 1));
}

