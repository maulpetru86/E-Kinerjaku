import test from "node:test";
import assert from "node:assert/strict";
import { ActivityFormSchema } from "../src/lib/validations/activity.ts";
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
} from "../src/lib/db/activities.ts";

test("Validasi Aktivitas: Lolos jika field minimal (tanggal dan deskripsi) terpenuhi", () => {
  const minimalData = {
    activityDate: "2025-02-01",
    description: "Melakukan verifikasi berkas SKP awal tahun",
  };

  const result = ActivityFormSchema.safeParse(minimalData);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.activityDate, "2025-02-01");
    assert.equal(result.data.description, "Melakukan verifikasi berkas SKP awal tahun");
    assert.equal(result.data.categorizationStatus, "uncategorized");
  }
});

test("Validasi Aktivitas: Gagal jika deskripsi kurang dari 3 karakter", () => {
  const shortData = {
    activityDate: "2025-02-01",
    description: "OK",
  };

  const result = ActivityFormSchema.safeParse(shortData);
  assert.equal(result.success, false);
  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message;
    assert.match(errorMsg, /Deskripsi kegiatan minimal 3 karakter/i);
  }
});

test("Validasi Aktivitas: Gagal jika format tanggal bukan YYYY-MM-DD", () => {
  const invalidDate = {
    activityDate: "01-02-2025",
    description: "Deskripsi valid tetapi format tanggal salah",
  };

  const result = ActivityFormSchema.safeParse(invalidDate);
  assert.equal(result.success, false);
  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message;
    assert.match(errorMsg, /Format tanggal kegiatan tidak valid/i);
  }
});

test("CRUD Aktivitas: Berhasil membuat dan mengambil aktivitas tanpa RHK (uncategorized)", async () => {
  const testUserId = `test-user-${Date.now()}`;
  const created = await createActivity(
    {
      periodId: "period-test",
      activityDate: "2025-03-01",
      description: "Aktivitas pengujian otomatis tanpa RHK",
      resultNotes: "Catatan hasil pengujian",
      categorizationStatus: "uncategorized",
      rhkLinks: [],
      evidenceFileIds: [],
    },
    testUserId
  );

  assert.ok(created.id);
  assert.equal(created.categorizationStatus, "uncategorized");

  const fetched = await getActivityById(created.id, testUserId);
  assert.ok(fetched);
  assert.equal(fetched?.description, "Aktivitas pengujian otomatis tanpa RHK");

  // Cleanup
  await deleteActivity(created.id, testUserId);
});

test("CRUD Aktivitas: Menjadi categorized bila ditautkan ke RHK", async () => {
  const testUserId = `test-user-${Date.now()}`;
  const created = await createActivity(
    {
      periodId: "period-test",
      activityDate: "2025-03-02",
      description: "Aktivitas terhubung ke RHK",
      categorizationStatus: "uncategorized",
      rhkLinks: [
        {
          rhkId: "rhk-sample-1",
          indicatorId: "ind-sample-1",
        },
      ],
      evidenceFileIds: [],
    },
    testUserId
  );

  assert.equal(created.categorizationStatus, "categorized");
  assert.equal(created.rhkLinks?.length, 1);

  // Cleanup
  await deleteActivity(created.id, testUserId);
});

