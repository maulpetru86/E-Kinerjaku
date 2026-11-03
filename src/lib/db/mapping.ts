import type { RhkMapping, RHK } from "../../types/index.ts";
import type { RhkMappingFormValues } from "../validations/rekap.ts";
import { getRhks, getRhkById } from "./rhk.ts";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const MAPPINGS_FILE = path.join(DATA_DIR, "rhk_mappings.json");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialMappings(): RhkMapping[] {
  return [];
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

export function readRhkMappings(): RhkMapping[] {
  return readJsonFile<RhkMapping[]>(MAPPINGS_FILE, getInitialMappings());
}

export function saveRhkMappings(data: RhkMapping[]) {
  writeJsonFile(MAPPINGS_FILE, data);
}

/**
 * Mengambil daftar pemetaan antarperiode yang telah tersimpan
 */
export async function getRhkMappings(
  options: {
    userId?: string;
    oldPeriodId?: string;
    newPeriodId?: string;
    status?: "suggested" | "confirmed" | "rejected";
  } = {}
): Promise<RhkMapping[]> {
  const userId = options.userId || "user-default-1";
  const all = readRhkMappings();

  let filtered = all.filter((m) => m.userId === userId);

  if (options.oldPeriodId) {
    filtered = filtered.filter((m) => m.oldPeriodId === options.oldPeriodId);
  }
  if (options.newPeriodId) {
    filtered = filtered.filter((m) => m.newPeriodId === options.newPeriodId);
  }
  if (options.status) {
    filtered = filtered.filter((m) => m.mappingStatus === options.status);
  }

  // Hydrate RHK details
  const hydrated = await Promise.all(
    filtered.map(async (m) => {
      const [oldRhk, newRhk] = await Promise.all([
        getRhkById(m.oldRhkId, userId),
        getRhkById(m.newRhkId, userId),
      ]);
      return {
        ...m,
        oldRhk: oldRhk || undefined,
        newRhk: newRhk || undefined,
      };
    })
  );

  return hydrated.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

export async function createRhkMapping(
  values: RhkMappingFormValues,
  userId: string = "user-default-1"
): Promise<RhkMapping> {
  const all = readRhkMappings();
  const id = `map-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Cek jika pemetaan pasangan RHK ini sudah ada
  const existingIndex = all.findIndex(
    (m) =>
      m.userId === userId &&
      m.oldRhkId === values.oldRhkId &&
      m.newRhkId === values.newRhkId
  );

  const now = new Date().toISOString();
  if (existingIndex !== -1) {
    all[existingIndex] = {
      ...all[existingIndex],
      mappingStatus: values.mappingStatus,
      similarityScore: values.similarityScore ?? all[existingIndex].similarityScore,
      notes: values.notes ?? all[existingIndex].notes,
      confirmedAt: values.mappingStatus === "confirmed" ? now : all[existingIndex].confirmedAt,
      updatedAt: now,
    };
    saveRhkMappings(all);
    return all[existingIndex];
  }

  const newMapping: RhkMapping = {
    id,
    userId,
    oldPeriodId: values.oldPeriodId,
    newPeriodId: values.newPeriodId,
    oldRhkId: values.oldRhkId,
    newRhkId: values.newRhkId,
    similarityScore: values.similarityScore || null,
    mappingStatus: values.mappingStatus,
    confirmedAt: values.mappingStatus === "confirmed" ? now : null,
    notes: values.notes || null,
    createdAt: now,
    updatedAt: now,
  };

  all.push(newMapping);
  saveRhkMappings(all);
  return newMapping;
}

export async function updateRhkMappingStatus(
  id: string,
  status: "confirmed" | "rejected",
  notes?: string | null,
  userId: string = "user-default-1"
): Promise<RhkMapping | null> {
  const all = readRhkMappings();
  const index = all.findIndex((m) => m.id === id && m.userId === userId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  all[index] = {
    ...all[index],
    mappingStatus: status,
    notes: notes !== undefined ? notes : all[index].notes,
    confirmedAt: status === "confirmed" ? now : null,
    updatedAt: now,
  };

  saveRhkMappings(all);
  return all[index];
}

export async function deleteRhkMapping(
  id: string,
  userId: string = "user-default-1"
): Promise<boolean> {
  const all = readRhkMappings();
  const filtered = all.filter((m) => !(m.id === id && m.userId === userId));
  if (filtered.length === all.length) return false;

  saveRhkMappings(filtered);
  return true;
}

/**
 * Menghitung kemiripan kata antar dua teks RHK (Jaccard token similarity)
 */
function calculateTextSimilarity(textA: string, textB: string): number {
  const tokenize = (t: string) =>
    new Set(
      t
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3)
    );

  const setA = tokenize(textA);
  const setB = tokenize(textB);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  setA.forEach((w) => {
    if (setB.has(w)) intersection++;
  });

  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : Number((intersection / union).toFixed(2));
}

/**
 * Rekomendasi Otomatis Pemetaan RHK Antarperiode (FR-10)
 * Sesuai AGENTS.md & PRD:
 * - Menyarankan pasangan RHK berdasarkan teks/metadata.
 * - Berstatus 'suggested'.
 * - TIDAK menyalin aktivitas, target, realisasi, atau bukti dari periode lama ke periode baru.
 */
export async function autoSuggestRhkMappings(
  oldPeriodId: string,
  newPeriodId: string,
  userId: string = "user-default-1"
): Promise<RhkMapping[]> {
  const [oldRhks, newRhks] = await Promise.all([
    getRhks(oldPeriodId, userId),
    getRhks(newPeriodId, userId),
  ]);

  if (oldRhks.length === 0 || newRhks.length === 0) {
    return [];
  }

  const existingMappings = readRhkMappings().filter(
    (m) => m.userId === userId && m.oldPeriodId === oldPeriodId && m.newPeriodId === newPeriodId
  );

  const createdSuggestions: RhkMapping[] = [];

  for (const oldRhk of oldRhks) {
    // Cari RHK baru yang memiliki kemiripan tertinggi
    let bestMatch: RHK | null = null;
    let highestScore = 0;

    for (const newRhk of newRhks) {
      const score = calculateTextSimilarity(oldRhk.individualRhk, newRhk.individualRhk);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = newRhk;
      }
    }

    if (bestMatch && highestScore >= 0.2) {
      const alreadyExists = existingMappings.some(
        (m) => m.oldRhkId === oldRhk.id && m.newRhkId === bestMatch!.id
      );

      if (!alreadyExists) {
        const mapping = await createRhkMapping(
          {
            oldPeriodId,
            newPeriodId,
            oldRhkId: oldRhk.id,
            newRhkId: bestMatch.id,
            similarityScore: highestScore,
            mappingStatus: "suggested",
            notes: `Kemiripan kata ${Math.round(highestScore * 100)}% (Disarankan otomatis)`,
          },
          userId
        );
        createdSuggestions.push(mapping);
      }
    }
  }

  return getRhkMappings({ userId, oldPeriodId, newPeriodId });
}
