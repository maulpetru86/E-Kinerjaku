import test from "node:test";
import assert from "node:assert/strict";
import {
  AnalyzeActivitySchema,
  AnalyzeEvidenceSchema,
  ReviewSuggestionSchema,
} from "../src/lib/validations/ai.ts";
import {
  detectDateFromText,
  matchRhkLocally,
  analyzeActivityForRhk,
} from "../src/lib/ai/gemini.ts";
import {
  createAISuggestion,
  getAISuggestions,
  getAISuggestionById,
  reviewAISuggestion,
  deleteAISuggestion,
} from "../src/lib/db/ai-suggestions.ts";
import {
  createActivity,
  getActivityById,
  deleteActivity,
} from "../src/lib/db/activities.ts";
import type { RHK } from "../src/types/index.ts";

test("Validasi AI Schema: Validasi parameter input analisis dan konfirmasi", () => {
  // Valid Analyze Activity
  const validAct = AnalyzeActivitySchema.safeParse({ activityId: "act-123", periodId: "period-1" });
  assert.equal(validAct.success, true);

  // Invalid Analyze Activity (missing activityId)
  const invalidAct = AnalyzeActivitySchema.safeParse({});
  assert.equal(invalidAct.success, false);

  // Valid Review Action
  const validReview = ReviewSuggestionSchema.safeParse({ action: "accept" });
  assert.equal(validReview.success, true);

  // Invalid Review Action (unknown action)
  const invalidReview = ReviewSuggestionSchema.safeParse({ action: "invalid_action" });
  assert.equal(invalidReview.success, false);
});

test("Deteksi Tanggal Faktual: Mendeteksi berbagai format tanggal tanpa halusinasi", () => {
  // ISO date
  const date1 = detectDateFromText("Rapat dilaksanakan pada 2025-05-20 di ruang aula");
  assert.equal(date1, "2025-05-20");

  // Slash date (DD/MM/YYYY)
  const date2 = detectDateFromText("Sesuai surat tugas tanggal 14/08/2025 nomor 123");
  assert.equal(date2, "2025-08-14");

  // Indonesian month name
  const date3 = detectDateFromText("Pengesahan notula pada 25 Januari 2025 kemarin");
  assert.equal(date3, "2025-01-25");

  // Teks tanpa tanggal -> Harus return null (Zero Hallucination)
  const date4 = detectDateFromText("Melakukan koordinasi tim pengarsipan berkas kerja");
  assert.equal(date4, null);
});

test("AI Offline Fallback: Menghasilkan rekomendasi lokal saat API key tidak tersedia", async () => {
  const dummyRhks: RHK[] = [
    {
      id: "rhk-arsip-1",
      userId: "user-test",
      periodId: "period-1",
      individualRhk: "Meningkatnya ketertiban pengelolaan arsip dan dokumentasi kepegawaian",
      category: "utama",
      status: "active",
      indicators: [
        {
          id: "ind-arsip-1",
          rhkId: "rhk-arsip-1",
          aspect: "Kuantitas",
          indicatorText: "Jumlah berkas arsip yang dikelola",
          reviewStatus: "confirmed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Test pencocokan kata kunci
  const result = matchRhkLocally(
    "Melakukan penataan dan pengelolaan arsip berkas kepegawaian tahunan",
    dummyRhks
  );

  assert.equal(result.isOfflineMode, true);
  assert.equal(result.recommendedRhkId, "rhk-arsip-1");
  assert.equal(result.recommendedIndicatorId, "ind-arsip-1");
  assert.ok(result.confidenceReason.includes("Pencocokan kata kunci"));

  // Narasi yang sama sekali tidak berhubungan -> Tidak boleh mencocokkan secara paksa
  const noMatch = matchRhkLocally(
    "Memperbaiki kabel listrik stopkontak ruang kantor",
    dummyRhks
  );
  assert.equal(noMatch.recommendedRhkId, null);
  assert.equal(noMatch.confidenceLabel, "uncertain");
});

test("Human-in-the-Loop: Saran AI berstatus pending dan data TIDAK berubah sebelum persetujuan", async () => {
  const testUserId = `test-user-ai-${Date.now()}`;

  // 1. Buat aktivitas awal berstatus uncategorized
  const activity = await createActivity(
    {
      activityDate: "2025-04-10",
      description: "Menyusun rekap portofolio evaluasi triwulan pertama",
      categorizationStatus: "uncategorized",
    },
    testUserId
  );
  assert.equal(activity.categorizationStatus, "uncategorized");
  assert.equal(activity.rhkLinks?.length ?? 0, 0);

  // 2. Buat usulan AI (status harus pending)
  const suggestion = await createAISuggestion(
    {
      entityType: "activity",
      entityId: activity.id,
      suggestionType: "rhk_link",
      suggestionPayload: {
        rhkId: "rhk-sample-target-1",
        indicatorId: "ind-sample-target-1",
        rhkName: "Peningkatan kualitas tata kelola administrasi kinerja",
        confidenceReason: "Aktivitas relevan dengan administrasi kinerja.",
      },
      confidenceLabel: "high",
    },
    testUserId
  );

  assert.equal(suggestion.status, "pending");

  // Verifikasi data aktivitas masih belum berubah (Zero Unauthorized Modification)
  const actBeforeReview = await getActivityById(activity.id, testUserId);
  assert.equal(actBeforeReview?.categorizationStatus, "uncategorized");
  assert.equal(actBeforeReview?.rhkLinks?.length ?? 0, 0);

  // 3. Uji Penolakan Saran (Reject):
  // Menolak saran tidak boleh mengubah aktivitas dan tidak boleh menghapusnya
  const rejectReview = await reviewAISuggestion(suggestion.id, "reject", undefined, testUserId);
  assert.equal(rejectReview.success, true);
  assert.equal(rejectReview.suggestion?.status, "rejected");

  const actAfterReject = await getActivityById(activity.id, testUserId);
  assert.equal(actAfterReject?.categorizationStatus, "uncategorized");
  assert.equal(actAfterReject?.rhkLinks?.length ?? 0, 0);

  // 4. Uji Penerimaan Saran (Accept):
  // Buat usulan baru untuk di-accept
  const suggestion2 = await createAISuggestion(
    {
      entityType: "activity",
      entityId: activity.id,
      suggestionType: "rhk_link",
      suggestionPayload: {
        rhkId: "rhk-sample-target-2",
        indicatorId: "ind-sample-target-2",
        rhkName: "Peningkatan kualitas tata kelola administrasi kinerja",
      },
      confidenceLabel: "high",
    },
    testUserId
  );

  const acceptReview = await reviewAISuggestion(suggestion2.id, "accept", undefined, testUserId);
  assert.equal(acceptReview.success, true);
  assert.equal(acceptReview.suggestion?.status, "accepted");

  // Setelah di-accept oleh pengguna, aktivitas sekarang harus terhubung ke RHK & statusnya categorized!
  const actAfterAccept = await getActivityById(activity.id, testUserId);
  assert.equal(actAfterAccept?.categorizationStatus, "categorized");
  assert.equal(actAfterAccept?.rhkLinks?.length, 1);
  assert.equal(actAfterAccept?.rhkLinks?.[0]?.rhkId, "rhk-sample-target-2");

  // Cleanup
  await deleteActivity(activity.id, testUserId);
  await deleteAISuggestion(suggestion.id, testUserId);
  await deleteAISuggestion(suggestion2.id, testUserId);
});
