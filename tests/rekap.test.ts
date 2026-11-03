import test from "node:test";
import assert from "node:assert/strict";
import {
  determineReadinessStatus,
  getRekapMatriks,
  generateRekapCsv,
} from "../src/lib/db/rekap.ts";
import {
  createRhkMapping,
  getRhkMappings,
  autoSuggestRhkMappings,
  deleteRhkMapping,
} from "../src/lib/db/mapping.ts";
import { createPeriod, deletePeriod } from "../src/lib/db/periods.ts";
import { createRhk, deleteRhk } from "../src/lib/db/rhk.ts";
import { createActivity, getActivities, deleteActivity } from "../src/lib/db/activities.ts";
import type { Activity, EvidenceFile } from "../src/types/index.ts";

test("Status Kesiapan Rekap: Menghitung status indikator secara akurat", () => {
  // 1. Belum ada aktivitas dan belum ada bukti
  const status1 = determineReadinessStatus([], []);
  assert.equal(status1, "belum_ada_bukti");

  // 2. Hanya ada aktivitas, bukti belum ada
  const dummyAct: Activity = {
    id: "act-test",
    userId: "user-test",
    activityDate: "2025-05-01",
    description: "Kegiatan pengujian",
    categorizationStatus: "categorized",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const status2 = determineReadinessStatus([dummyAct], []);
  assert.equal(status2, "ada_bukti");

  // 3. Ada aktivitas & ada bukti terlampir (keduanya siap)
  const dummyEv: EvidenceFile = {
    id: "ev-test",
    userId: "user-test",
    storageKey: "test.pdf",
    originalFilename: "test.pdf",
    mimeType: "application/pdf",
    fileSize: 1000,
    uploadedAt: new Date().toISOString(),
    processingStatus: "completed",
    reviewStatus: "categorized",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const status3 = determineReadinessStatus([dummyAct], [dummyEv]);
  assert.equal(status3, "siap_direkap");

  // 4. Ada aktivitas berstatus needs_review -> status harus perlu_ditinjau
  const dummyActReview: Activity = {
    ...dummyAct,
    categorizationStatus: "needs_review",
  };
  const status4 = determineReadinessStatus([dummyActReview], [dummyEv]);
  assert.equal(status4, "perlu_ditinjau");
});

test("Ekspor CSV Rekap: Membentuk format CSV dengan UTF-8 BOM dan kolom lengkap", async () => {
  const testUserId = `test-user-csv-${Date.now()}`;

  // Buat periode uji
  const period = await createPeriod(
    {
      name: "Periode Uji CSV 2025",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "active",
    },
    testUserId
  );

  // Buat RHK uji
  const rhk = await createRhk(
    {
      periodId: period.id,
      individualRhk: "Meningkatnya ketertiban administrasi kepegawaian",
      category: "utama",
      indicators: [
        {
          aspect: "Kuantitas",
          indicatorText: "Jumlah berkas portofolio yang dihimpun",
          targetValue: "12",
          targetUnit: "Berkas",
        },
      ],
    },
    testUserId
  );

  // Buat aktivitas uji
  const act = await createActivity(
    {
      periodId: period.id,
      activityDate: "2025-06-15",
      description: "Menghimpun berkas portofolio pegawai",
      categorizationStatus: "categorized",
      rhkLinks: [{ rhkId: rhk.id }],
    },
    testUserId
  );

  // Ambil matriks rekap
  const matriks = await getRekapMatriks(period.id, testUserId);
  assert.ok(matriks);
  assert.equal(matriks.summary.totalRhk, 1);
  assert.equal(matriks.items.length, 1);

  // Generate CSV
  const csv = generateRekapCsv(matriks);

  // Verifikasi BOM UTF-8 (\uFEFF)
  assert.ok(csv.startsWith("\uFEFF"));

  // Verifikasi Header Laporan & Kolom
  assert.ok(csv.includes("REKAPITULASI CAPAIAN KINERJA"));
  assert.ok(csv.includes("Periode Uji CSV 2025"));
  assert.ok(csv.includes("Rencana Hasil Kerja (RHK) Individu"));
  assert.ok(csv.includes("Meningkatnya ketertiban administrasi kepegawaian"));
  assert.ok(csv.includes("Jumlah berkas portofolio yang dihimpun"));

  // Cleanup
  await deleteActivity(act.id, testUserId);
  await deleteRhk(rhk.id, testUserId);
  await deletePeriod(period.id, testUserId);
});

test("Pemetaan RHK Antarperiode: Menyimpan relasi TANPA menduplikasi aktivitas atau bukti", async () => {
  const testUserId = `test-user-map-${Date.now()}`;

  // 1. Buat Periode Lama (2024) dan Periode Baru (2025)
  const oldPeriod = await createPeriod(
    {
      name: "Periode SKP 2024",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      status: "closed",
    },
    testUserId
  );

  const newPeriod = await createPeriod(
    {
      name: "Periode SKP 2025",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "active",
    },
    testUserId
  );

  // 2. Buat RHK di periode lama & periode baru
  const oldRhk = await createRhk(
    {
      periodId: oldPeriod.id,
      individualRhk: "Pengelolaan arsip kinerja pegawai tahun 2024",
      category: "utama",
      indicators: [
        {
          aspect: "Kuantitas",
          indicatorText: "Jumlah arsip terdata",
          targetValue: "10",
          targetUnit: "Laporan",
        },
      ],
    },
    testUserId
  );

  const newRhk = await createRhk(
    {
      periodId: newPeriod.id,
      individualRhk: "Pengelolaan dan pemeliharaan arsip kinerja pegawai",
      category: "utama",
      indicators: [
        {
          aspect: "Kuantitas",
          indicatorText: "Jumlah arsip terpelihara",
          targetValue: "12",
          targetUnit: "Laporan",
        },
      ],
    },
    testUserId
  );

  // 3. Catat aktivitas di periode LAMA
  const oldAct = await createActivity(
    {
      periodId: oldPeriod.id,
      activityDate: "2024-10-10",
      description: "Aktivitas arsip lama tahun 2024",
      categorizationStatus: "categorized",
      rhkLinks: [{ rhkId: oldRhk.id }],
    },
    testUserId
  );

  // Pastikan periode baru BELUM memiliki aktivitas
  const newActsBefore = await getActivities({ userId: testUserId, periodId: newPeriod.id });
  assert.equal(newActsBefore.length, 0);

  // 4. Jalankan saran pemetaan otomatis
  const suggestions = await autoSuggestRhkMappings(oldPeriod.id, newPeriod.id, testUserId);
  assert.ok(suggestions.length > 0);
  assert.equal(suggestions[0].oldRhkId, oldRhk.id);
  assert.equal(suggestions[0].newRhkId, newRhk.id);

  // 5. UJI ISOLASI DATA MUTLAK (AGENTS.md & PRD DoD):
  // Memetakan RHK lama ke RHK baru TIDAK BOLEH mencemari / menduplikasi aktivitas periode lama ke periode baru!
  const newActsAfter = await getActivities({ userId: testUserId, periodId: newPeriod.id });
  assert.equal(newActsAfter.length, 0); // Tetap 0 di periode baru!

  // Aktivitas lama tetap utuh di periode lama
  const oldActs = await getActivities({ userId: testUserId, periodId: oldPeriod.id });
  assert.equal(oldActs.length, 1);
  assert.equal(oldActs[0].description, "Aktivitas arsip lama tahun 2024");

  // Cleanup
  await deleteRhkMapping(suggestions[0].id, testUserId);
  await deleteActivity(oldAct.id, testUserId);
  await deleteRhk(oldRhk.id, testUserId);
  await deleteRhk(newRhk.id, testUserId);
  await deletePeriod(oldPeriod.id, testUserId);
  await deletePeriod(newPeriod.id, testUserId);
});
