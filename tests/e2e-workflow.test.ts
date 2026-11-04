import test from "node:test";
import assert from "node:assert/strict";
import { createPeriod, getPeriodById, deletePeriod } from "../src/lib/db/periods.ts";
import { createRhk, getRhks, deleteRhk } from "../src/lib/db/rhk.ts";
import {
  createEvidenceFile,
  getEvidenceFiles,
  getEvidenceById,
  linkEvidenceToActivity,
  deleteEvidenceFile,
} from "../src/lib/db/evidence.ts";
import {
  createActivity,
  getActivities,
  getActivityById,
  deleteActivity,
} from "../src/lib/db/activities.ts";
import {
  createAISuggestion,
  reviewAISuggestion,
  deleteAISuggestion,
} from "../src/lib/db/ai-suggestions.ts";
import { matchRhkLocally } from "../src/lib/ai/gemini.ts";
import {
  getRekapMatriks,
  generateRekapCsv,
  determineReadinessStatus,
} from "../src/lib/db/rekap.ts";
import {
  autoSuggestRhkMappings,
  getRhkMappings,
  deleteRhkMapping,
} from "../src/lib/db/mapping.ts";

test("E2E Lifecycle: Alur penuh dari Periode, RHK, Bukti, Aktivitas, AI konfirmasi, hingga Rekap & Ekspor CSV", async () => {
  const userId = `e2e-user-${Date.now()}`;

  // 1. Buat Periode Kinerja Baru (FR-02)
  const period = await createPeriod(
    {
      name: "Periode Evaluasi Terpadu 2026",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "active",
      notes: "Pengujian siklus hidup lengkap E2E",
    },
    userId
  );
  assert.ok(period.id);
  assert.equal(period.status, "active");

  // 2. Buat RHK SKP dengan Indikator Kuantitas & Kualitas (FR-03 & FR-04)
  const rhk = await createRhk(
    {
      periodId: period.id,
      intervenedLeadRhk: "Meningkatnya akuntabilitas pengelolaan kinerja organisasi",
      individualRhk: "Terlaksananya pengelolaan dan verifikasi portofolio bukti kinerja pegawai",
      category: "utama",
      indicators: [
        {
          aspect: "Kuantitas",
          indicatorText: "Jumlah berkas portofolio yang diverifikasi",
          targetValue: "10",
          targetUnit: "Berkas",
          targetPeriodText: "Tahunan",
        },
      ],
    },
    userId
  );
  assert.ok(rhk.id);
  assert.equal(rhk.indicators?.length, 1);
  const indicatorId = rhk.indicators![0].id;

  // 3. Unggah Berkas Bukti Digital ke Kotak Masuk (FR-06 & FR-07)
  const fileContent = Buffer.from("Dokumen SK Penugasan dan Berita Acara Verifikasi Portofolio");
  const uploadResult = await createEvidenceFile({
    userId,
    originalFilename: "SK_Penugasan_Verifikasi_2026.pdf",
    mimeType: "application/pdf",
    fileSize: fileContent.length,
    buffer: fileContent,
    userDescription: "SK Resmi penugasan verifikator kinerja",
  });
  assert.equal(uploadResult.isDuplicate, false);
  const evidenceFile = uploadResult.file;
  assert.ok(evidenceFile.id);
  assert.ok(evidenceFile.checksum);

  // Uji pencegahan duplikasi (Zero Duplicate Upload)
  const duplicateAttempt = await createEvidenceFile({
    userId,
    originalFilename: "Salinan_SK_Penugasan.pdf",
    mimeType: "application/pdf",
    fileSize: fileContent.length,
    buffer: fileContent,
  });
  assert.equal(duplicateAttempt.isDuplicate, true);

  // 4. Catat Aktivitas Harian Cepat (FR-05: "Catat Dahulu, Rapikan Kemudian")
  // Awalnya disimpan tanpa RHK (uncategorized)
  const initialAct = await createActivity(
    {
      periodId: period.id,
      activityDate: "2026-03-15",
      activityTime: "10:00",
      description: "Melakukan verifikasi dan pengarsipan berkas portofolio kinerja bersama tim penilai",
      resultNotes: "Sebanyak 10 berkas selesai diverifikasi dan diberi nomor register",
    },
    userId
  );
  assert.equal(initialAct.categorizationStatus, "uncategorized");

  // 5. Tautkan Berkas Bukti ke Aktivitas (M:N Relation)
  const linkSuccess = await linkEvidenceToActivity(evidenceFile.id, initialAct.id);
  assert.equal(linkSuccess, true);

  // 6. Jalankan Asisten AI (FR-08: Mode Asisten Offline & Human-in-the-Loop)
  const userRhks = await getRhks(period.id, userId);
  const aiMatch = matchRhkLocally(initialAct.description, userRhks);
  assert.equal(aiMatch.isOfflineMode, true);
  assert.equal(aiMatch.recommendedRhkId, rhk.id);

  const sug = await createAISuggestion(
    {
      entityType: "activity",
      entityId: initialAct.id,
      suggestionType: "rhk_link",
      suggestionPayload: {
        rhkId: aiMatch.recommendedRhkId,
        indicatorId: aiMatch.recommendedIndicatorId || indicatorId,
        rhkName: aiMatch.rhkName,
        confidenceReason: aiMatch.confidenceReason,
      },
      confidenceLabel: aiMatch.confidenceLabel,
    },
    userId
  );
  // Status usulan AI WAJIB 'pending' (tidak boleh berubah otomatis tanpa persetujuan)
  assert.equal(sug.status, "pending");

  // Konfirmasi usulan AI oleh pengguna (Terima/Accept)
  const reviewRes = await reviewAISuggestion(sug.id, "accept", undefined, userId);
  assert.equal(reviewRes.success, true);
  assert.equal(reviewRes.suggestion?.status, "accepted");

  // Verifikasi aktivitas sekarang berstatus 'categorized' dan memiliki relasi RHK
  const updatedAct = await getActivityById(initialAct.id, userId);
  assert.ok(updatedAct);
  assert.equal(updatedAct.categorizationStatus, "categorized");
  assert.ok(updatedAct.rhkLinks?.length! > 0);
  assert.ok(updatedAct.evidenceLinks?.length! > 0);

  // 7. Agregasi Matriks Rekap Kinerja Triwulanan (FR-09)
  const matriks = await getRekapMatriks(period.id, userId);
  assert.ok(matriks);
  assert.equal(matriks.items.length, 1);

  const rhkItem = matriks.items[0];
  assert.equal(rhkItem.indicators.length, 1);
  const indItem = rhkItem.indicators[0];

  // Buktikan status kesiapan otomatis bertransisi menjadi 'siap_direkap'
  assert.equal(indItem.readinessStatus, "siap_direkap");
  assert.equal(indItem.activities.length, 1);
  assert.equal(indItem.evidenceFiles.length, 1);

  // 8. Ekspor Matriks ke Dokumen CSV RFC-4180 ber-BOM (FR-11)
  const csv = generateRekapCsv(matriks);
  // Verifikasi Byte Order Mark (BOM) UTF-8
  assert.ok(csv.startsWith("\uFEFF"));
  // Verifikasi ketercakupan data dalam CSV
  assert.ok(csv.includes("Periode Evaluasi Terpadu 2026"));
  assert.ok(csv.includes("Siap Direkap"));
  assert.ok(csv.includes("SK_Penugasan_Verifikasi_2026.pdf"));
  assert.ok(csv.includes("Melakukan verifikasi dan pengarsipan berkas"));

  // Cleanup data uji E2E
  await deleteActivity(initialAct.id, userId);
  await deleteEvidenceFile(evidenceFile.id, userId);
  await deleteRhk(rhk.id, userId);
  await deletePeriod(period.id, userId);
  await deleteAISuggestion(sug.id, userId);
});

test("E2E Isolasi Periode: Menjamin data periode lampau tidak terkontaminasi periode baru", async () => {
  const userId = `e2e-isolation-${Date.now()}`;

  // 1. Buat Periode 2025 dan Periode 2026
  const period2025 = await createPeriod(
    {
      name: "Periode Kinerja 2025",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "closed",
    },
    userId
  );

  const period2026 = await createPeriod(
    {
      name: "Periode Kinerja 2026",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "active",
    },
    userId
  );

  // 2. Buat RHK di masing-masing periode
  const rhk2025 = await createRhk(
    {
      periodId: period2025.id,
      individualRhk: "Pengelolaan arsip berkas kepegawaian tahun 2025",
      category: "utama",
      indicators: [
        { aspect: "Kuantitas", indicatorText: "Laporan arsip", targetValue: "4", targetUnit: "Lap" },
      ],
    },
    userId
  );

  const rhk2026 = await createRhk(
    {
      periodId: period2026.id,
      individualRhk: "Pengelolaan arsip digital kepegawaian tahun 2026",
      category: "utama",
      indicators: [
        { aspect: "Kuantitas", indicatorText: "Laporan digital", targetValue: "6", targetUnit: "Lap" },
      ],
    },
    userId
  );

  // 3. Catat aktivitas di Periode 2025
  const act2025 = await createActivity(
    {
      periodId: period2025.id,
      activityDate: "2025-08-20",
      description: "Pemeriksaan arsip fisik 2025",
      rhkLinks: [{ rhkId: rhk2025.id }],
    },
    userId
  );

  // 4. Verifikasi isolasi matriks rekapitulasi (FR-02 & FR-09)
  const matriks2026 = await getRekapMatriks(period2026.id, userId);
  assert.ok(matriks2026);
  // Matriks periode 2026 TIDAK BOLEH memuat aktivitas dari periode 2025
  const activitiesIn2026 = matriks2026.items.flatMap((item) =>
    item.indicators.flatMap((ind) => ind.activities)
  );
  assert.equal(activitiesIn2026.length, 0);

  // 5. Uji Pemetaan RHK Antarperiode (FR-10)
  const suggestedMappings = await autoSuggestRhkMappings(period2025.id, period2026.id, userId);
  assert.ok(suggestedMappings.length > 0);
  const mapping = suggestedMappings[0];
  assert.equal(mapping.oldRhkId, rhk2025.id);
  assert.equal(mapping.newRhkId, rhk2026.id);
  assert.equal(mapping.mappingStatus, "suggested");

  // Pastikan setelah pemetaan dibuat, aktivitas periode lama tetap TIDAK disalin ke 2026
  const recheck2026 = await getRekapMatriks(period2026.id, userId);
  const recheckActs = recheck2026?.items.flatMap((item) =>
    item.indicators.flatMap((ind) => ind.activities)
  );
  assert.equal(recheckActs?.length, 0);

  // Cleanup
  await deleteActivity(act2025.id, userId);
  await deleteRhk(rhk2025.id, userId);
  await deleteRhk(rhk2026.id, userId);
  await deletePeriod(period2025.id, userId);
  await deletePeriod(period2026.id, userId);
  await deleteRhkMapping(mapping.id, userId);
});

test("E2E Keamanan & Isolasi Multi-User: Verifikasi akses data terproteksi antar pengguna", async () => {
  const userA = `user-a-${Date.now()}`;
  const userB = `user-b-${Date.now()}`;

  // User A membuat periode dan aktivitas
  const periodA = await createPeriod(
    {
      name: "SKP Rahasia User A",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "active",
    },
    userA
  );

  const actA = await createActivity(
    {
      periodId: periodA.id,
      activityDate: "2026-04-10",
      description: "Catatan internal kinerja User A",
    },
    userA
  );

  // User B mencoba membaca aktivitas User A
  const userBActivities = await getActivities({ userId: userB });
  const leakFound = userBActivities.some((a) => a.id === actA.id || a.userId === userA);
  assert.equal(leakFound, false);

  // User B mencoba mengambil aktivitas User A melalui ID langsung
  const unauthorizedRead = await getActivityById(actA.id, userB);
  assert.equal(unauthorizedRead, null);

  // User B mencoba membaca periode User A
  const unauthorizedPeriod = await getPeriodById(periodA.id, userB);
  assert.equal(unauthorizedPeriod, null);

  // Cleanup
  await deleteActivity(actA.id, userA);
  await deletePeriod(periodA.id, userA);
});
