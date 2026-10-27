import { PerformancePeriod } from "@/types";
import { PeriodFormValues } from "@/lib/validations/period";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const PERIODS_FILE = path.join(DATA_DIR, "periods.json");

// Pastikan direktori data lokal tersedia untuk persistent fallback
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Inisialisasi data awal jika belum ada
function getInitialPeriods(): PerformancePeriod[] {
  const currentYear = new Date().getFullYear();
  return [
    {
      id: "period-2025-aktif",
      userId: "user-default-1",
      name: `SKP Tahun ${currentYear}`,
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
      status: "active",
      notes: `Periode kinerja aktif tahun berjalan ${currentYear}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "period-2024-arsip",
      userId: "user-default-1",
      name: `SKP Tahun ${currentYear - 1}`,
      startDate: `${currentYear - 1}-01-01`,
      endDate: `${currentYear - 1}-12-31`,
      status: "archived",
      notes: `Arsip periode kinerja tahun ${currentYear - 1}`,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function readPeriods(): PerformancePeriod[] {
  ensureDataDir();
  if (!fs.existsSync(PERIODS_FILE)) {
    const initial = getInitialPeriods();
    fs.writeFileSync(PERIODS_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(PERIODS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Gagal membaca file data periods.json, memuat default:", error);
    return getInitialPeriods();
  }
}

function savePeriods(periods: PerformancePeriod[]) {
  ensureDataDir();
  fs.writeFileSync(PERIODS_FILE, JSON.stringify(periods, null, 2), "utf-8");
}

export async function getPeriods(userId: string = "user-default-1"): Promise<PerformancePeriod[]> {
  const periods = readPeriods();
  return periods.filter((p) => p.userId === userId).sort((a, b) => (a.startDate > b.startDate ? -1 : 1));
}

export async function getPeriodById(id: string, userId: string = "user-default-1"): Promise<PerformancePeriod | null> {
  const periods = readPeriods();
  const period = periods.find((p) => p.id === id && p.userId === userId);
  return period || null;
}

export async function getActivePeriod(userId: string = "user-default-1"): Promise<PerformancePeriod | null> {
  const periods = readPeriods();
  const active = periods.find((p) => p.userId === userId && p.status === "active");
  return active || periods[0] || null;
}

export async function createPeriod(
  values: PeriodFormValues,
  userId: string = "user-default-1"
): Promise<PerformancePeriod> {
  const periods = readPeriods();

  // Jika periode baru berstatus 'active', ubah periode aktif lain menjadi 'closed' bila diinginkan
  if (values.status === "active") {
    periods.forEach((p) => {
      if (p.userId === userId && p.status === "active") {
        p.status = "closed";
        p.updatedAt = new Date().toISOString();
      }
    });
  }

  const newPeriod: PerformancePeriod = {
    id: `period-${Date.now()}`,
    userId,
    name: values.name,
    startDate: values.startDate,
    endDate: values.endDate,
    status: values.status,
    notes: values.notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  periods.push(newPeriod);
  savePeriods(periods);
  return newPeriod;
}

export async function updatePeriod(
  id: string,
  values: Partial<PeriodFormValues>,
  userId: string = "user-default-1"
): Promise<PerformancePeriod | null> {
  const periods = readPeriods();
  const index = periods.findIndex((p) => p.id === id && p.userId === userId);
  if (index === -1) return null;

  if (values.status === "active") {
    periods.forEach((p) => {
      if (p.id !== id && p.userId === userId && p.status === "active") {
        p.status = "closed";
        p.updatedAt = new Date().toISOString();
      }
    });
  }

  const existing = periods[index];
  const updated: PerformancePeriod = {
    ...existing,
    ...(values.name !== undefined ? { name: values.name } : {}),
    ...(values.startDate !== undefined ? { startDate: values.startDate } : {}),
    ...(values.endDate !== undefined ? { endDate: values.endDate } : {}),
    ...(values.status !== undefined ? { status: values.status } : {}),
    ...(values.notes !== undefined ? { notes: values.notes || null } : {}),
    updatedAt: new Date().toISOString(),
  };

  periods[index] = updated;
  savePeriods(periods);
  return updated;
}

export async function deletePeriod(id: string, userId: string = "user-default-1"): Promise<boolean> {
  const periods = readPeriods();
  const filtered = periods.filter((p) => !(p.id === id && p.userId === userId));
  if (filtered.length === periods.length) return false;
  savePeriods(filtered);
  return true;
}
