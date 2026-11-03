import type { AISuggestion } from "@/types";
import { getActivityById, updateActivity } from "./activities.ts";
import { getEvidenceById, updateEvidenceFile, linkEvidenceToRhk } from "./evidence.ts";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const SUGGESTIONS_FILE = path.join(DATA_DIR, "ai_suggestions.json");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialSuggestions(): AISuggestion[] {
  return [
    {
      id: "sug-sample-1",
      userId: "user-default-1",
      entityType: "activity",
      entityId: "act-sample-2",
      suggestionType: "rhk_link",
      suggestionPayload: {
        rhkId: "rhk-sample-1",
        indicatorId: "ind-sample-1",
        rhkName: "Terlaksananya pengelolaan dan penataan arsip kinerja pegawai",
        confidenceReason: "Aktivitas membahas penyusunan target dan indikator SKP yang selaras dengan penataan arsip kinerja.",
      },
      confidenceLabel: "high",
      status: "pending",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
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

export function readAISuggestions(): AISuggestion[] {
  return readJsonFile<AISuggestion[]>(SUGGESTIONS_FILE, getInitialSuggestions());
}

export function saveAISuggestions(data: AISuggestion[]) {
  writeJsonFile(SUGGESTIONS_FILE, data);
}

export async function getAISuggestions(
  options: {
    userId?: string;
    entityType?: "evidence_file" | "activity" | "rhk_mapping";
    entityId?: string;
    status?: "pending" | "accepted" | "modified" | "rejected";
  } = {}
): Promise<AISuggestion[]> {
  const userId = options.userId || "user-default-1";
  const all = readAISuggestions();

  let filtered = all.filter((s) => s.userId === userId);

  if (options.entityType) {
    filtered = filtered.filter((s) => s.entityType === options.entityType);
  }
  if (options.entityId) {
    filtered = filtered.filter((s) => s.entityId === options.entityId);
  }
  if (options.status) {
    filtered = filtered.filter((s) => s.status === options.status);
  }

  return filtered.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

export async function getAISuggestionById(
  id: string,
  userId: string = "user-default-1"
): Promise<AISuggestion | null> {
  const all = readAISuggestions();
  return all.find((s) => s.id === id && s.userId === userId) || null;
}

export async function createAISuggestion(
  data: {
    entityType: "evidence_file" | "activity" | "rhk_mapping";
    entityId: string;
    suggestionType: "metadata" | "rhk_link" | "summary";
    suggestionPayload: Record<string, unknown>;
    confidenceLabel?: "high" | "medium" | "low" | "uncertain" | null;
  },
  userId: string = "user-default-1"
): Promise<AISuggestion> {
  const all = readAISuggestions();
  const id = `sug-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const newSuggestion: AISuggestion = {
    id,
    userId,
    entityType: data.entityType,
    entityId: data.entityId,
    suggestionType: data.suggestionType,
    suggestionPayload: data.suggestionPayload,
    confidenceLabel: data.confidenceLabel || "uncertain",
    status: "pending", // PRD: Selalu pending sampai dikonfirmasi pengguna
    createdAt: new Date().toISOString(),
    reviewedAt: null,
  };

  all.push(newSuggestion);
  saveAISuggestions(all);
  return newSuggestion;
}

/**
 * Konfirmasi / Penolakan Saran AI (Human-in-the-loop)
 * Prinsip Produk: AI Menyarankan, Pengguna Memutuskan.
 * Tidak ada data penting yang berubah otomatis tanpa persetujuan.
 */
export async function reviewAISuggestion(
  id: string,
  action: "accept" | "modify" | "reject",
  modifiedPayload?: Record<string, unknown>,
  userId: string = "user-default-1"
): Promise<{ success: boolean; suggestion?: AISuggestion; message: string }> {
  const all = readAISuggestions();
  const index = all.findIndex((s) => s.id === id && s.userId === userId);

  if (index === -1) {
    return { success: false, message: "Saran AI tidak ditemukan." };
  }

  const suggestion = all[index];
  const payload = modifiedPayload || suggestion.suggestionPayload;

  // 1. Jika aksi TOLAK: entitas asli tidak diubah sama sekali (Zero Data Loss)
  if (action === "reject") {
    suggestion.status = "rejected";
    suggestion.reviewedAt = new Date().toISOString();
    all[index] = suggestion;
    saveAISuggestions(all);
    return {
      success: true,
      suggestion,
      message: "Saran AI berhasil ditolak. Data catatan/berkas Anda tetap utuh.",
    };
  }

  // 2. Jika aksi TERIMA atau UBAH: Terapkan rekomendasi ke entitas yang dituju
  try {
    if (suggestion.entityType === "activity" && suggestion.suggestionType === "rhk_link") {
      const activity = await getActivityById(suggestion.entityId, userId);
      if (activity) {
        const rhkId = (payload.rhkId as string) || "";
        const indicatorId = (payload.indicatorId as string) || null;

        if (rhkId) {
          const currentLinks = activity.rhkLinks || [];
          const exists = currentLinks.some((l) => l.rhkId === rhkId);
          if (!exists) {
            const updatedLinks = [
              ...currentLinks.map((l) => ({ rhkId: l.rhkId, indicatorId: l.indicatorId })),
              { rhkId, indicatorId },
            ];
            await updateActivity(
              activity.id,
              {
                rhkLinks: updatedLinks,
                categorizationStatus: "categorized",
              },
              userId
            );
          }
        }
      }
    } else if (suggestion.entityType === "evidence_file" && suggestion.suggestionType === "metadata") {
      const evidence = await getEvidenceById(suggestion.entityId, userId);
      if (evidence) {
        await updateEvidenceFile(
          evidence.id,
          {
            userDescription: (payload.userDescription as string) ?? evidence.userDescription,
            evidenceDate: (payload.evidenceDate as string) ?? evidence.evidenceDate,
            reviewStatus: "needs_review",
          },
          userId
        );
      }
    } else if (suggestion.entityType === "evidence_file" && suggestion.suggestionType === "rhk_link") {
      const rhkId = (payload.rhkId as string) || "";
      const indicatorId = (payload.indicatorId as string) || null;
      if (rhkId) {
        await linkEvidenceToRhk(suggestion.entityId, rhkId, indicatorId, "Disarankan oleh AI dan disetujui pengguna");
      }
    }

    suggestion.status = action === "modify" ? "modified" : "accepted";
    if (modifiedPayload) {
      suggestion.suggestionPayload = modifiedPayload;
    }
    suggestion.reviewedAt = new Date().toISOString();
    all[index] = suggestion;
    saveAISuggestions(all);

    return {
      success: true,
      suggestion,
      message: `Saran AI berhasil ${action === "modify" ? "disesuaikan dan diterapkan" : "diterapkan"}.`,
    };
  } catch (err: any) {
    console.error("Gagal menerapkan saran AI:", err);
    return {
      success: false,
      message: `Gagal menerapkan saran AI: ${err.message || "Kesalahan internal"}`,
    };
  }
}

export async function deleteAISuggestion(
  id: string,
  userId: string = "user-default-1"
): Promise<boolean> {
  const all = readAISuggestions();
  const filtered = all.filter((s) => !(s.id === id && s.userId === userId));
  if (filtered.length === all.length) return false;

  saveAISuggestions(filtered);
  return true;
}
