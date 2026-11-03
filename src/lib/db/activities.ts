import type {
  Activity,
  ActivityRhkLink,
} from "../../types/index.ts";
import type { ActivityFormValues } from "../validations/activity.ts";
import {
  readActEvLinks,
  saveActEvLinks,
  readEvidence,
} from "./evidence.ts";
import { getRhks } from "./rhk.ts";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const ACTIVITIES_FILE = path.join(DATA_DIR, "activities.json");
const ACT_RHK_LINKS_FILE = path.join(DATA_DIR, "activity_rhk_links.json");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialActivities(): Activity[] {
  const currentYear = new Date().getFullYear();
  return [
    {
      id: "act-sample-1",
      userId: "user-default-1",
      periodId: "period-2025-aktif",
      activityDate: `${currentYear}-01-10`,
      activityTime: "09:00",
      description: "Melakukan verifikasi dan pengarsipan berkas portofolio kinerja pegawai triwulan IV tahun sebelumnya.",
      resultNotes: "Sebanyak 15 berkas portofolio berhasil diverifikasi dan diarsipkan sesuai ketentuan.",
      privateNotes: "Perlu konfirmasi ulang nomor SK satu pegawai.",
      categorizationStatus: "categorized",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "act-sample-2",
      userId: "user-default-1",
      periodId: "period-2025-aktif",
      activityDate: `${currentYear}-01-15`,
      activityTime: "13:30",
      description: "Menghadiri rapat teknis penyusunan target dan indikator SKP tahunan bersama tim penilai kinerja.",
      resultNotes: "Draft rancangan indikator dan pembagian target kuantitas selesai dibahas.",
      privateNotes: null,
      categorizationStatus: "uncategorized",
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

export function readActivities(): Activity[] {
  return readJsonFile<Activity[]>(ACTIVITIES_FILE, getInitialActivities());
}

export function saveActivities(data: Activity[]) {
  writeJsonFile(ACTIVITIES_FILE, data);
}

export function readActRhkLinks(): ActivityRhkLink[] {
  return readJsonFile<ActivityRhkLink[]>(ACT_RHK_LINKS_FILE, [
    {
      id: "arl-sample-1",
      activityId: "act-sample-1",
      rhkId: "rhk-sample-1",
      indicatorId: "ind-sample-1",
      linkSource: "user",
      confirmedAt: new Date().toISOString(),
      notes: "Terkait pengelolaan arsip",
    },
  ]);
}

export function saveActRhkLinks(data: ActivityRhkLink[]) {
  writeJsonFile(ACT_RHK_LINKS_FILE, data);
}

export async function getActivities(
  options: {
    userId?: string;
    periodId?: string | null;
    search?: string;
    categorizationStatus?: "uncategorized" | "categorized" | "needs_review";
  } = {}
): Promise<Activity[]> {
  const userId = options.userId || "user-default-1";
  const all = readActivities();
  const allActRhkLinks = readActRhkLinks();
  const allActEvLinks = readActEvLinks();
  const allEvidence = readEvidence();

  let filtered = all.filter((a) => a.userId === userId);

  if (options.periodId) {
    filtered = filtered.filter((a) => !a.periodId || a.periodId === options.periodId);
  }

  if (options.categorizationStatus) {
    filtered = filtered.filter((a) => a.categorizationStatus === options.categorizationStatus);
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.description.toLowerCase().includes(q) ||
        (a.resultNotes && a.resultNotes.toLowerCase().includes(q))
    );
  }

  // Populate relasi rhkLinks dan evidenceLinks
  return filtered
    .map((act) => {
      const rhkLinks = allActRhkLinks.filter((l) => l.activityId === act.id);
      const evLinks = allActEvLinks.filter((l) => l.activityId === act.id);

      const hydratedEvLinks = evLinks.map((l) => ({
        evidenceFileId: l.evidenceFileId,
        file: allEvidence.find((e) => e.id === l.evidenceFileId),
      }));

      return {
        ...act,
        rhkLinks: rhkLinks.map((l) => ({
          rhkId: l.rhkId,
          indicatorId: l.indicatorId,
        })),
        evidenceLinks: hydratedEvLinks,
      };
    })
    .sort((a, b) => (a.activityDate > b.activityDate ? -1 : 1));
}

export async function getActivityById(
  id: string,
  userId: string = "user-default-1"
): Promise<Activity | null> {
  const all = readActivities();
  const act = all.find((a) => a.id === id && a.userId === userId);
  if (!act) return null;

  const rhkLinks = readActRhkLinks().filter((l) => l.activityId === id);
  const evLinks = readActEvLinks().filter((l) => l.activityId === id);
  const allEvidence = readEvidence();

  return {
    ...act,
    rhkLinks: rhkLinks.map((l) => ({
      rhkId: l.rhkId,
      indicatorId: l.indicatorId,
    })),
    evidenceLinks: evLinks.map((l) => ({
      evidenceFileId: l.evidenceFileId,
      file: allEvidence.find((e) => e.id === l.evidenceFileId),
    })),
  };
}

export async function createActivity(
  values: ActivityFormValues,
  userId: string = "user-default-1"
): Promise<Activity> {
  const all = readActivities();
  const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const hasRhk = values.rhkLinks && values.rhkLinks.length > 0;
  let status = values.categorizationStatus;
  if (!status || status === "uncategorized") {
    status = hasRhk ? "categorized" : "uncategorized";
  }

  const newActivity: Activity = {
    id,
    userId,
    periodId: values.periodId || null,
    activityDate: values.activityDate,
    activityTime: values.activityTime || null,
    description: values.description,
    resultNotes: values.resultNotes || null,
    privateNotes: values.privateNotes || null,
    categorizationStatus: status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.push(newActivity);
  saveActivities(all);

  // Simpan relasi RHK jika ada
  if (hasRhk && values.rhkLinks) {
    const rhkLinks = readActRhkLinks();
    values.rhkLinks.forEach((rl) => {
      rhkLinks.push({
        id: `arl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        activityId: id,
        rhkId: rl.rhkId,
        indicatorId: rl.indicatorId || null,
        linkSource: "user",
        confirmedAt: new Date().toISOString(),
      });
    });
    saveActRhkLinks(rhkLinks);
  }

  // Simpan relasi berkas bukti jika ada
  if (values.evidenceFileIds && values.evidenceFileIds.length > 0) {
    const evLinks = readActEvLinks();
    values.evidenceFileIds.forEach((evId) => {
      evLinks.push({
        id: `ael-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        activityId: id,
        evidenceFileId: evId,
        createdAt: new Date().toISOString(),
      });
    });
    saveActEvLinks(evLinks);
  }

  return (await getActivityById(id, userId)) || newActivity;
}

export async function updateActivity(
  id: string,
  values: Partial<ActivityFormValues>,
  userId: string = "user-default-1"
): Promise<Activity | null> {
  const all = readActivities();
  const index = all.findIndex((a) => a.id === id && a.userId === userId);
  if (index === -1) return null;

  const existing = all[index];

  let status = existing.categorizationStatus;
  if (values.categorizationStatus !== undefined) {
    status = values.categorizationStatus;
  } else if (values.rhkLinks !== undefined) {
    status = values.rhkLinks.length > 0 ? "categorized" : "uncategorized";
  }

  const updated: Activity = {
    ...existing,
    ...(values.periodId !== undefined ? { periodId: values.periodId || null } : {}),
    ...(values.activityDate !== undefined ? { activityDate: values.activityDate } : {}),
    ...(values.activityTime !== undefined ? { activityTime: values.activityTime || null } : {}),
    ...(values.description !== undefined ? { description: values.description } : {}),
    ...(values.resultNotes !== undefined ? { resultNotes: values.resultNotes || null } : {}),
    ...(values.privateNotes !== undefined ? { privateNotes: values.privateNotes || null } : {}),
    categorizationStatus: status,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updated;
  saveActivities(all);

  // Perbarui relasi RHK jika disertakan
  if (values.rhkLinks !== undefined) {
    const allRhkLinks = readActRhkLinks();
    const withoutCurrent = allRhkLinks.filter((l) => l.activityId !== id);
    values.rhkLinks.forEach((rl) => {
      withoutCurrent.push({
        id: `arl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        activityId: id,
        rhkId: rl.rhkId,
        indicatorId: rl.indicatorId || null,
        linkSource: "user",
        confirmedAt: new Date().toISOString(),
      });
    });
    saveActRhkLinks(withoutCurrent);
  }

  // Perbarui relasi bukti jika disertakan
  if (values.evidenceFileIds !== undefined) {
    const allEvLinks = readActEvLinks();
    const withoutCurrent = allEvLinks.filter((l) => l.activityId !== id);
    values.evidenceFileIds.forEach((evId) => {
      withoutCurrent.push({
        id: `ael-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        activityId: id,
        evidenceFileId: evId,
        createdAt: new Date().toISOString(),
      });
    });
    saveActEvLinks(withoutCurrent);
  }

  return await getActivityById(id, userId);
}

export async function deleteActivity(
  id: string,
  userId: string = "user-default-1"
): Promise<boolean> {
  const all = readActivities();
  const filtered = all.filter((a) => !(a.id === id && a.userId === userId));
  if (filtered.length === all.length) return false;

  saveActivities(filtered);

  // Lepaskan tautan RHK dan Evidence (TIDAK menghapus file bukti fisik)
  const rhkLinks = readActRhkLinks().filter((l) => l.activityId !== id);
  saveActRhkLinks(rhkLinks);

  const evLinks = readActEvLinks().filter((l) => l.activityId !== id);
  saveActEvLinks(evLinks);

  return true;
}
