import test from "node:test";
import assert from "node:assert/strict";
import { PeriodFormSchema, PeriodUpdateSchema } from "../src/lib/validations/period.ts";

test("Validasi Periode: Lolos jika data valid dan rentang tanggal benar", () => {
  const validData = {
    name: "SKP Tahun 2025",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "active" as const,
    notes: "Periode tahunan",
  };

  const result = PeriodFormSchema.safeParse(validData);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, "SKP Tahun 2025");
  }
});

test("Validasi Periode: Gagal jika tanggal akhir mendahului tanggal mulai", () => {
  const invalidDateData = {
    name: "SKP Tahun 2025",
    startDate: "2025-12-31",
    endDate: "2025-01-01", // Lebih awal dari start date
    status: "active" as const,
  };

  const result = PeriodFormSchema.safeParse(invalidDateData);
  assert.equal(result.success, false);
  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message;
    assert.match(errorMsg, /Tanggal selesai tidak boleh mendahului tanggal mulai/i);
  }
});

test("Validasi Periode: Gagal jika nama periode kurang dari 3 karakter", () => {
  const shortNameData = {
    name: "AB",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "active" as const,
  };

  const result = PeriodFormSchema.safeParse(shortNameData);
  assert.equal(result.success, false);
  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message;
    assert.match(errorMsg, /Nama periode minimal 3 karakter/i);
  }
});

test("Validasi Periode: Gagal jika status bukan active, closed, atau archived", () => {
  const invalidStatusData = {
    name: "SKP 2025",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "invalid_status",
  };

  const result = PeriodFormSchema.safeParse(invalidStatusData);
  assert.equal(result.success, false);
});

test("Validasi Pembaruan Periode (PATCH): Lolos untuk pembaruan parsial status saja", () => {
  const partialData = {
    status: "active" as const,
  };

  const result = PeriodUpdateSchema.safeParse(partialData);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.status, "active");
  }
});
