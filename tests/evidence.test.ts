import test from "node:test";
import assert from "node:assert/strict";
import {
  createEvidenceFile,
  getEvidenceById,
  deleteEvidenceFile,
  linkEvidenceToActivity,
  unlinkEvidenceFromActivity,
  linkEvidenceToRhk,
  unlinkEvidenceFromRhk,
} from "../src/lib/db/evidence.ts";
import {
  createActivity,
  deleteActivity,
} from "../src/lib/db/activities.ts";

test("Evidence & Checksum: Berhasil mengunggah berkas dan menghitung checksum SHA-256", async () => {
  const testUserId = `test-user-ev-${Date.now()}`;
  const dummyBuffer = Buffer.from("Konten berkas bukti pengujian unit test");

  const { file, isDuplicate } = await createEvidenceFile({
    userId: testUserId,
    originalFilename: "surat_tugas_test.pdf",
    mimeType: "application/pdf",
    fileSize: dummyBuffer.length,
    buffer: dummyBuffer,
    evidenceDate: "2025-02-10",
    userDescription: "Surat tugas pengujian",
  });

  assert.ok(file.id);
  assert.equal(file.originalFilename, "surat_tugas_test.pdf");
  assert.ok(file.checksum);
  assert.equal(isDuplicate, false);

  // Bersihkan berkas
  const del = await deleteEvidenceFile(file.id, testUserId);
  assert.equal(del.success, true);
});

test("M:N Linking: Satu berkas bukti dapat ditautkan ke banyak aktivitas sekaligus", async () => {
  const testUserId = `test-user-mn-${Date.now()}`;
  const dummyBuffer = Buffer.from("Bukti bersama untuk dua kegiatan berbeda");

  const { file } = await createEvidenceFile({
    userId: testUserId,
    originalFilename: "bukti_bersama.pdf",
    mimeType: "application/pdf",
    fileSize: dummyBuffer.length,
    buffer: dummyBuffer,
  });

  const act1 = await createActivity(
    {
      activityDate: "2025-02-15",
      description: "Kegiatan Pertama yang memakai bukti bersama",
      evidenceFileIds: [],
    },
    testUserId
  );

  const act2 = await createActivity(
    {
      activityDate: "2025-02-16",
      description: "Kegiatan Kedua yang juga memakai bukti bersama",
      evidenceFileIds: [],
    },
    testUserId
  );

  // Tautkan berkas ke kedua kegiatan
  await linkEvidenceToActivity(file.id, act1.id);
  await linkEvidenceToActivity(file.id, act2.id);

  // Ambil detail berkas bukti dan verifikasi hitungan tautan
  const fetched = await getEvidenceById(file.id, testUserId);
  assert.equal(fetched?.linkedActivitiesCount, 2);

  // DoD SAFE DELETE TEST:
  // Upaya menghapus berkas bukti saat masih ditautkan harus ditolak!
  const deleteAttempt = await deleteEvidenceFile(file.id, testUserId);
  assert.equal(deleteAttempt.success, false);
  assert.match(deleteAttempt.reason || "", /masih ditautkan/i);

  // Lepaskan tautan dari kedua kegiatan
  await unlinkEvidenceFromActivity(file.id, act1.id);
  await unlinkEvidenceFromActivity(file.id, act2.id);

  // Sekarang berkas boleh dihapus secara aman
  const safeDelete = await deleteEvidenceFile(file.id, testUserId);
  assert.equal(safeDelete.success, true);

  // Cleanup aktivitas
  await deleteActivity(act1.id, testUserId);
  await deleteActivity(act2.id, testUserId);
});

