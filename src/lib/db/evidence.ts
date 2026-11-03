import type {
  EvidenceFile,
  ActivityEvidenceLink,
  RhkEvidenceLink,
} from "../../types/index.ts";
import type { EvidenceUpdateValues } from "../validations/evidence.ts";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), ".data");
const EVIDENCE_FILE = path.join(DATA_DIR, "evidence_files.json");
const ACT_EV_LINKS_FILE = path.join(DATA_DIR, "activity_evidence_links.json");
const RHK_EV_LINKS_FILE = path.join(DATA_DIR, "rhk_evidence_links.json");
export const EVIDENCE_UPLOADS_DIR = path.join(DATA_DIR, "evidence_uploads");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(EVIDENCE_UPLOADS_DIR)) {
    fs.mkdirSync(EVIDENCE_UPLOADS_DIR, { recursive: true });
  }
}

// Inisialisasi data contoh non-sensitif jika belum ada berkas
function getInitialEvidence(): EvidenceFile[] {
  return [
    {
      id: "ev-sample-1",
      userId: "user-default-1",
      storageKey: "sample_sk_penugasan_2025.pdf",
      originalFilename: "SK_Penugasan_Pengelolaan_Arsip_2025.pdf",
      mimeType: "application/pdf",
      fileSize: 245000,
      checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      evidenceDate: "2025-01-05",
      sourceLocation: "local_upload",
      processingStatus: "completed",
      aiSummary: "Surat Keputusan tentang penugasan pengelolaan arsip kinerja instansi tahun 2025.",
      userDescription: "SK Resmi penugasan tim kerja",
      reviewStatus: "categorized",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ev-sample-2",
      userId: "user-default-1",
      storageKey: "sample_foto_rapat_asesmen.jpg",
      originalFilename: "Dokumentasi_Rapat_Koordinasi.jpg",
      mimeType: "image/jpeg",
      fileSize: 854000,
      checksum: "d41d8cd98f00b204e9800998ecf8427e",
      uploadedAt: new Date().toISOString(),
      evidenceDate: new Date().toISOString().split("T")[0],
      sourceLocation: "camera_upload",
      processingStatus: "completed",
      aiSummary: "Dokumentasi foto kegiatan rapat koordinasi tim kepegawaian.",
      userDescription: null,
      reviewStatus: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  ensureDirs();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw || !raw.trim()) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Gagal membaca ${filePath}:`, error);
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T) {
  ensureDirs();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function readEvidence(): EvidenceFile[] {
  return readJsonFile<EvidenceFile[]>(EVIDENCE_FILE, getInitialEvidence());
}

export function saveEvidence(data: EvidenceFile[]) {
  writeJsonFile(EVIDENCE_FILE, data);
}

export function readActEvLinks(): ActivityEvidenceLink[] {
  return readJsonFile<ActivityEvidenceLink[]>(ACT_EV_LINKS_FILE, [
    {
      id: "ael-1",
      activityId: "act-sample-1",
      evidenceFileId: "ev-sample-1",
      createdAt: new Date().toISOString(),
    },
  ]);
}

export function saveActEvLinks(data: ActivityEvidenceLink[]) {
  writeJsonFile(ACT_EV_LINKS_FILE, data);
}

export function readRhkEvLinks(): RhkEvidenceLink[] {
  return readJsonFile<RhkEvidenceLink[]>(RHK_EV_LINKS_FILE, [
    {
      id: "rel-1",
      rhkId: "rhk-sample-1",
      indicatorId: "ind-sample-1",
      evidenceFileId: "ev-sample-1",
      linkSource: "user",
      confirmedAt: new Date().toISOString(),
      notes: "Bukti pendukung SK tugas",
    },
  ]);
}

export function saveRhkEvLinks(data: RhkEvidenceLink[]) {
  writeJsonFile(RHK_EV_LINKS_FILE, data);
}

export function calculateFileChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function getEvidenceFiles(
  options: {
    userId?: string;
    reviewStatus?: "new" | "needs_review" | "categorized";
    search?: string;
  } = {}
): Promise<EvidenceFile[]> {
  const userId = options.userId || "user-default-1";
  const all = readEvidence();
  const actLinks = readActEvLinks();
  const rhkLinks = readRhkEvLinks();

  let filtered = all.filter((e) => e.userId === userId);

  if (options.reviewStatus) {
    filtered = filtered.filter((e) => e.reviewStatus === options.reviewStatus);
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.originalFilename.toLowerCase().includes(q) ||
        (e.userDescription && e.userDescription.toLowerCase().includes(q)) ||
        (e.aiSummary && e.aiSummary.toLowerCase().includes(q))
    );
  }

  // Lengkapi dengan hitungan relasi
  return filtered
    .map((item) => {
      const linkedActs = actLinks.filter((l) => l.evidenceFileId === item.id);
      const linkedRhks = rhkLinks.filter((l) => l.evidenceFileId === item.id);
      return {
        ...item,
        linkedActivitiesCount: linkedActs.length,
        linkedRhksCount: linkedRhks.length,
      };
    })
    .sort((a, b) => (a.uploadedAt > b.uploadedAt ? -1 : 1));
}

export async function getEvidenceById(
  id: string,
  userId: string = "user-default-1"
): Promise<EvidenceFile | null> {
  const all = readEvidence();
  const item = all.find((e) => e.id === id && e.userId === userId);
  if (!item) return null;

  const actLinks = readActEvLinks().filter((l) => l.evidenceFileId === id);
  const rhkLinks = readRhkEvLinks().filter((l) => l.evidenceFileId === id);

  return {
    ...item,
    linkedActivitiesCount: actLinks.length,
    linkedRhksCount: rhkLinks.length,
  };
}

export async function createEvidenceFile(
  fileData: {
    userId?: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    buffer: Buffer;
    evidenceDate?: string | null;
    userDescription?: string | null;
    reviewStatus?: "new" | "needs_review" | "categorized";
  }
): Promise<{ file: EvidenceFile; isDuplicate: boolean }> {
  ensureDirs();
  const userId = fileData.userId || "user-default-1";
  const checksum = calculateFileChecksum(fileData.buffer);

  const all = readEvidence();
  const existingWithSameHash = all.find(
    (e) => e.userId === userId && e.checksum === checksum
  );

  const ext = path.extname(fileData.originalFilename);
  const safeBase = path.basename(fileData.originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  const storageKey = `ev_${Date.now()}_${safeBase}${ext}`;
  const filePath = path.join(EVIDENCE_UPLOADS_DIR, storageKey);

  fs.writeFileSync(filePath, fileData.buffer);

  const id = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const newEvidence: EvidenceFile = {
    id,
    userId,
    storageKey,
    originalFilename: fileData.originalFilename,
    mimeType: fileData.mimeType,
    fileSize: fileData.fileSize,
    checksum,
    uploadedAt: new Date().toISOString(),
    evidenceDate: fileData.evidenceDate || new Date().toISOString().split("T")[0],
    sourceLocation: "upload",
    processingStatus: "completed",
    aiSummary: null,
    userDescription: fileData.userDescription || null,
    reviewStatus: fileData.reviewStatus || "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedActivitiesCount: 0,
    linkedRhksCount: 0,
  };

  all.push(newEvidence);
  saveEvidence(all);

  return {
    file: newEvidence,
    isDuplicate: !!existingWithSameHash,
  };
}

export async function updateEvidenceFile(
  id: string,
  values: EvidenceUpdateValues,
  userId: string = "user-default-1"
): Promise<EvidenceFile | null> {
  const all = readEvidence();
  const index = all.findIndex((e) => e.id === id && e.userId === userId);
  if (index === -1) return null;

  const existing = all[index];
  const updated: EvidenceFile = {
    ...existing,
    ...(values.userDescription !== undefined ? { userDescription: values.userDescription || null } : {}),
    ...(values.evidenceDate !== undefined ? { evidenceDate: values.evidenceDate || null } : {}),
    ...(values.reviewStatus !== undefined ? { reviewStatus: values.reviewStatus } : {}),
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  saveEvidence(all);
  return updated;
}

export async function deleteEvidenceFile(
  id: string,
  userId: string = "user-default-1"
): Promise<{ success: boolean; reason?: string }> {
  const all = readEvidence();
  const item = all.find((e) => e.id === id && e.userId === userId);
  if (!item) {
    return { success: false, reason: "Berkas tidak ditemukan." };
  }

  // RESTRIKSI KEAMANAN DoD & PRD:
  // Cek apakah berkas sedang ditautkan ke aktivitas atau RHK
  const actLinks = readActEvLinks().filter((l) => l.evidenceFileId === id);
  const rhkLinks = readRhkEvLinks().filter((l) => l.evidenceFileId === id);

  if (actLinks.length > 0 || rhkLinks.length > 0) {
    return {
      success: false,
      reason: `Berkas tidak dapat dihapus karena masih ditautkan ke ${actLinks.length} aktivitas dan ${rhkLinks.length} RHK. Lepaskan tautan terlebih dahulu.`,
    };
  }

  // Hapus berkas fisik jika ada
  const filePath = path.join(EVIDENCE_UPLOADS_DIR, item.storageKey);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn("Gagal menghapus file fisik:", err);
    }
  }

  const filtered = all.filter((e) => e.id !== id);
  saveEvidence(filtered);
  return { success: true };
}

// Relasi Many-to-Many Linking
export async function linkEvidenceToActivity(
  evidenceFileId: string,
  activityId: string
): Promise<boolean> {
  const links = readActEvLinks();
  const exists = links.some(
    (l) => l.evidenceFileId === evidenceFileId && l.activityId === activityId
  );
  if (exists) return true;

  links.push({
    id: `ael-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    activityId,
    evidenceFileId,
    createdAt: new Date().toISOString(),
  });
  saveActEvLinks(links);

  // Perbarui status review file menjadi categorized
  const allEv = readEvidence();
  const ev = allEv.find((e) => e.id === evidenceFileId);
  if (ev && ev.reviewStatus === "new") {
    ev.reviewStatus = "categorized";
    ev.updatedAt = new Date().toISOString();
    saveEvidence(allEv);
  }

  return true;
}

export async function unlinkEvidenceFromActivity(
  evidenceFileId: string,
  activityId: string
): Promise<boolean> {
  const links = readActEvLinks();
  const filtered = links.filter(
    (l) => !(l.evidenceFileId === evidenceFileId && l.activityId === activityId)
  );
  if (filtered.length === links.length) return false;
  saveActEvLinks(filtered);
  return true;
}

export async function linkEvidenceToRhk(
  evidenceFileId: string,
  rhkId: string,
  indicatorId?: string | null,
  notes?: string | null
): Promise<boolean> {
  const links = readRhkEvLinks();
  const exists = links.some(
    (l) =>
      l.evidenceFileId === evidenceFileId &&
      l.rhkId === rhkId &&
      (indicatorId ? l.indicatorId === indicatorId : true)
  );
  if (exists) return true;

  links.push({
    id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    rhkId,
    indicatorId: indicatorId || null,
    evidenceFileId,
    linkSource: "user",
    confirmedAt: new Date().toISOString(),
    notes: notes || null,
  });
  saveRhkEvLinks(links);

  // Perbarui status review file menjadi categorized
  const allEv = readEvidence();
  const ev = allEv.find((e) => e.id === evidenceFileId);
  if (ev && ev.reviewStatus === "new") {
    ev.reviewStatus = "categorized";
    ev.updatedAt = new Date().toISOString();
    saveEvidence(allEv);
  }

  return true;
}

export async function unlinkEvidenceFromRhk(
  evidenceFileId: string,
  rhkId: string,
  indicatorId?: string | null
): Promise<boolean> {
  const links = readRhkEvLinks();
  const filtered = links.filter(
    (l) =>
      !(
        l.evidenceFileId === evidenceFileId &&
        l.rhkId === rhkId &&
        (!indicatorId || l.indicatorId === indicatorId)
      )
  );
  if (filtered.length === links.length) return false;
  saveRhkEvLinks(filtered);
  return true;
}
