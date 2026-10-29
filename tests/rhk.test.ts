import test from "node:test";
import assert from "node:assert/strict";
import { RHKFormSchema, RHKBatchConfirmSchema } from "../src/lib/validations/rhk.ts";
import { parseBknSkpText } from "../src/lib/pdf/extractor.ts";

test("Validasi RHK: Lolos jika data valid dan memiliki minimal 1 indikator", () => {
  const validData = {
    periodId: "period-2025-aktif",
    category: "utama" as const,
    intervenedLeadRhk: "Meningkatnya akuntabilitas kinerja instansi",
    individualRhk: "Terlaksananya pengelolaan berkas dan arsip digital secara berkala",
    indicators: [
      {
        aspect: "Kuantitas",
        indicatorText: "Jumlah berkas arsip yang diverifikasi",
        targetValue: "12",
        targetUnit: "Berkas",
      },
    ],
  };

  const result = RHKFormSchema.safeParse(validData);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.category, "utama");
    assert.equal(result.data.indicators.length, 1);
  }
});

test("Validasi RHK: Gagal jika RHK individu kosong atau kurang dari 3 karakter", () => {
  const invalidData = {
    periodId: "period-2025-aktif",
    category: "utama" as const,
    individualRhk: "AB",
    indicators: [
      {
        aspect: "Kuantitas",
        indicatorText: "Jumlah berkas",
        targetValue: "10",
      },
    ],
  };

  const result = RHKFormSchema.safeParse(invalidData);
  assert.equal(result.success, false);
  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message;
    assert.match(errorMsg, /Rencana Hasil Kerja.*minimal 3 karakter/i);
  }
});

test("Validasi RHK: Gagal jika tidak memiliki indikator", () => {
  const noIndicatorData = {
    periodId: "period-2025-aktif",
    category: "utama" as const,
    individualRhk: "Terlaksananya kegiatan rutin",
    indicators: [],
  };

  const result = RHKFormSchema.safeParse(noIndicatorData);
  assert.equal(result.success, false);
  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message;
    assert.match(errorMsg, /minimal 1 indikator/i);
  }
});

test("Validasi Batch RHK: Lolos untuk konfirmasi hasil ekstraksi PDF", () => {
  const batchData = {
    periodId: "period-2025-aktif",
    sourceDocumentId: "doc-123",
    rhks: [
      {
        intervenedLeadRhk: "Tata kelola baik",
        individualRhk: "Pelaksanaan evaluasi kinerja",
        category: "utama" as const,
        indicators: [
          {
            aspect: "Kuantitas",
            indicatorText: "Jumlah laporan",
            targetValue: "4",
            targetUnit: "Laporan",
          },
        ],
      },
    ],
  };

  const result = RHKBatchConfirmSchema.safeParse(batchData);
  assert.equal(result.success, true);
});

test("PDF Parser: Mengekstrak format SKP BKN secara akurat (Zero Hallucination)", () => {
  const dummyBknSkpText = `
    SASARAN KINERJA PEGAWAI
    PENDEKATAN HASIL KERJA KUANTITATIF
    PERIODE PENILAIAN: 1 JANUARI SD 31 DESEMBER 2024

    NO RENCANA HASIL KERJA PIMPINAN RENCANA HASIL KERJA ASPEK INDIKATOR KINERJA INDIVIDU TARGET
    A. UTAMA
    1. Tersusunnya dokumen perencanaan tahunan
    Kuantitas: Jumlah dokumen perencanaan yang disusun 1 Dokumen
    Kualitas: Tingkat kesesuaian dokumen dengan pedoman 100 %
    Waktu: Ketepatan waktu penyelesaian dokumen 12 Bulan

    2. Terlaksananya pembinaan kepegawaian
    Kuantitas: Jumlah sesi pembinaan pegawai 4 Sesi
  `;

  const parsed = parseBknSkpText(dummyBknSkpText);

  assert.equal(parsed.items.length >= 2, true);

  const firstRhk = parsed.items[0];
  assert.equal(firstRhk.category, "utama");
  assert.match(firstRhk.individualRhk, /dokumen perencanaan tahunan/i);
  assert.equal(firstRhk.indicators.length, 3);

  // Periksa aspek dan target indikator kuantitas
  const kuantitasInd = firstRhk.indicators.find((i) => i.aspect === "Kuantitas");
  assert.ok(kuantitasInd);
  assert.equal(kuantitasInd?.targetValue, "1");
  assert.equal(kuantitasInd?.targetUnit, "Dokumen");

  // Periksa aspek kualitas
  const kualitasInd = firstRhk.indicators.find((i) => i.aspect === "Kualitas");
  assert.ok(kualitasInd);
  assert.equal(kualitasInd?.targetValue, "100");
  assert.equal(kualitasInd?.targetUnit, "%");

  // Periksa butir RHK kedua
  const secondRhk = parsed.items[1];
  assert.match(secondRhk.individualRhk, /pembinaan kepegawaian/i);
  const ind2 = secondRhk.indicators[0];
  assert.equal(ind2.targetValue, "4");
  assert.equal(ind2.targetUnit, "Sesi");
});

test("PDF Parser: Tidak mengarang target jika teks tidak memuat angka target", () => {
  const textWithoutTarget = `
    A. UTAMA
    1. Tersusunnya laporan kajian tanpa angka target
    Kuantitas: Laporan kajian analisis data
  `;

  const parsed = parseBknSkpText(textWithoutTarget);
  assert.equal(parsed.items.length, 1);
  const ind = parsed.items[0].indicators[0];
  // Target value harus null (tidak boleh berhalusinasi atau mengarang angka)
  assert.equal(ind.targetValue, null);
});
