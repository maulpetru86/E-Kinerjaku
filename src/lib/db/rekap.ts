import type {
  RekapMatriks,
  RekapRhkItem,
  RekapIndicatorItem,
  RekapReadinessStatus,
  RekapSummary,
  Activity,
  EvidenceFile,
  RHK,
  RHKIndicator,
} from "../../types/index.ts";
import { getPeriodById } from "./periods.ts";
import { getRhks } from "./rhk.ts";
import { getActivities } from "./activities.ts";
import { getEvidenceFiles, readRhkEvLinks } from "./evidence.ts";

/**
 * Menghitung status kesiapan indikator (FR-09)
 * - belum_ada_bukti: Belum ada aktivitas dan belum ada berkas bukti
 * - ada_bukti: Memiliki aktivitas atau bukti tetapi belum lengkap
 * - perlu_ditinjau: Memiliki aktivitas/bukti berstatus needs_review
 * - siap_direkap: Memiliki aktivitas terkonfirmasi dan berkas bukti fisik terlampir
 */
export function determineReadinessStatus(
  activities: Activity[],
  evidenceFiles: EvidenceFile[]
): RekapReadinessStatus {
  if (activities.length === 0 && evidenceFiles.length === 0) {
    return "belum_ada_bukti";
  }

  const hasNeedsReviewAct = activities.some(
    (a) => a.categorizationStatus === "needs_review"
  );
  const hasNeedsReviewEv = evidenceFiles.some(
    (e) => e.reviewStatus === "needs_review"
  );

  if (hasNeedsReviewAct || hasNeedsReviewEv) {
    return "perlu_ditinjau";
  }

  if (activities.length > 0 && evidenceFiles.length > 0) {
    return "siap_direkap";
  }

  return "ada_bukti";
}

/**
 * Menghasilkan Matriks Rekapitulasi Lengkap per Periode Kinerja (FR-09)
 */
export async function getRekapMatriks(
  periodId: string,
  userId: string = "user-default-1"
): Promise<RekapMatriks | null> {
  const period = await getPeriodById(periodId, userId);
  if (!period) return null;

  const [rhks, activities, allEvidence] = await Promise.all([
    getRhks(periodId, userId),
    getActivities({ userId, periodId }),
    getEvidenceFiles({ userId }),
  ]);

  const allRhkEvLinks = readRhkEvLinks();

  const items: RekapRhkItem[] = rhks.map((rhk) => {
    // Indikator default jika belum diinput
    const indicators: RHKIndicator[] =
      rhk.indicators && rhk.indicators.length > 0
        ? rhk.indicators
        : [
            {
              id: `ind-placeholder-${rhk.id}`,
              rhkId: rhk.id,
              aspect: "Kuantitas",
              indicatorText: "Dokumen capaian kegiatan",
              targetValue: "1",
              targetUnit: "Laporan",
              targetPeriodText: "Tahunan",
              reviewStatus: "confirmed",
              createdAt: rhk.createdAt,
              updatedAt: rhk.updatedAt,
            },
          ];

    const indicatorItems: RekapIndicatorItem[] = indicators.map((ind) => {
      // 1. Aktivitas yang tertaut ke RHK & indikator ini
      const linkedActs = activities.filter((act) =>
        act.rhkLinks?.some(
          (l) => l.rhkId === rhk.id && (!l.indicatorId || l.indicatorId === ind.id)
        )
      );

      // 2. Berkas bukti yang tertaut:
      // a. Tertaut langsung ke RHK melalui rhk_evidence_links
      const directEvIds = allRhkEvLinks
        .filter((l) => l.rhkId === rhk.id && (!l.indicatorId || l.indicatorId === ind.id))
        .map((l) => l.evidenceFileId);

      // b. Tertaut melalui aktivitas terkait
      const indirectEvIds = linkedActs.flatMap(
        (a) => a.evidenceLinks?.map((el) => el.evidenceFileId) || []
      );

      const uniqueEvIds = Array.from(new Set([...directEvIds, ...indirectEvIds]));
      const linkedFiles = allEvidence.filter((e) => uniqueEvIds.includes(e.id));

      const readinessStatus = determineReadinessStatus(linkedActs, linkedFiles);

      return {
        indicator: ind,
        readinessStatus,
        activities: linkedActs,
        evidenceFiles: linkedFiles,
      };
    });

    // Hitung akumulasi RHK
    const allRhkActs = Array.from(
      new Set(indicatorItems.flatMap((i) => i.activities.map((a) => a.id)))
    );
    const allRhkFiles = Array.from(
      new Set(indicatorItems.flatMap((i) => i.evidenceFiles.map((f) => f.id)))
    );

    // Status keseluruhan RHK: jika ada yang siap_direkap -> siap_direkap, dsb.
    const statuses = indicatorItems.map((i) => i.readinessStatus);
    let overallStatus: RekapReadinessStatus = "belum_ada_bukti";
    if (statuses.every((s) => s === "siap_direkap")) {
      overallStatus = "siap_direkap";
    } else if (statuses.some((s) => s === "perlu_ditinjau")) {
      overallStatus = "perlu_ditinjau";
    } else if (statuses.some((s) => s === "siap_direkap" || s === "ada_bukti")) {
      overallStatus = "ada_bukti";
    }

    return {
      rhk,
      indicators: indicatorItems,
      totalActivitiesCount: allRhkActs.length,
      totalEvidenceCount: allRhkFiles.length,
      overallStatus,
    };
  });

  // Hitung ringkasan matriks
  const allIndStatuses = items.flatMap((r) => r.indicators.map((i) => i.readinessStatus));
  const summary: RekapSummary = {
    totalRhk: items.length,
    totalActivities: activities.length,
    totalEvidence: allEvidence.length,
    countSiapDirekap: allIndStatuses.filter((s) => s === "siap_direkap").length,
    countPerluDitinjau: allIndStatuses.filter((s) => s === "perlu_ditinjau").length,
    countAdaBukti: allIndStatuses.filter((s) => s === "ada_bukti").length,
    countBelumAdaBukti: allIndStatuses.filter((s) => s === "belum_ada_bukti").length,
  };

  return {
    period,
    items,
    summary,
  };
}

/**
 * Escape cell string untuk format CSV RFC-4180
 */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Menghasilkan Dokumen CSV Rekapitulasi Kinerja (FR-11)
 * Dilengkapi UTF-8 BOM (\uFEFF) untuk kompatibilitas penuh dengan Microsoft Excel.
 */
export function generateRekapCsv(matriks: RekapMatriks): string {
  const rows: string[] = [];

  // Metadata Header Laporan
  rows.push(`# REKAPITULASI CAPAIAN KINERJA & BUKTI DUKUNG`);
  rows.push(`# Periode Penilaian : ${matriks.period.name} (${matriks.period.startDate} s.d. ${matriks.period.endDate})`);
  rows.push(`# Tanggal Ekspor     : ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`);
  rows.push(`# Total RHK          : ${matriks.summary.totalRhk}`);
  rows.push(`# Kesiapan Rekap     : ${matriks.summary.countSiapDirekap} Siap, ${matriks.summary.countPerluDitinjau} Perlu Ditinjau, ${matriks.summary.countAdaBukti} Ada Bukti, ${matriks.summary.countBelumAdaBukti} Belum Ada Bukti`);
  rows.push("");

  // Kolom Header Tabel CSV
  const headers = [
    "No",
    "Kategori",
    "RHK Pimpinan Yang Diintervensi",
    "Rencana Hasil Kerja (RHK) Individu",
    "Aspek",
    "Indikator Kinerja Individu",
    "Target",
    "Satuan",
    "Status Kesiapan",
    "Jumlah Kegiatan",
    "Daftar Kegiatan",
    "Jumlah Bukti",
    "Daftar Berkas Bukti",
  ];
  rows.push(headers.map(escapeCsvCell).join(","));

  let rowNumber = 1;
  for (const rhkItem of matriks.items) {
    const rhk = rhkItem.rhk;
    for (const indItem of rhkItem.indicators) {
      const ind = indItem.indicator;

      const actDescriptions = indItem.activities
        .map((a, i) => `[${i + 1}] (${a.activityDate}) ${a.description}`)
        .join(" | ");

      const evFilenames = indItem.evidenceFiles
        .map((f, i) => `[${i + 1}] ${f.originalFilename}`)
        .join(" | ");

      const statusLabel = {
        siap_direkap: "Siap Direkap",
        perlu_ditinjau: "Perlu Ditinjau",
        ada_bukti: "Ada Bukti",
        belum_ada_bukti: "Belum Ada Bukti",
      }[indItem.readinessStatus];

      const row = [
        rowNumber++,
        rhk.category === "utama" ? "Utama" : "Tambahan",
        rhk.intervenedLeadRhk || "-",
        rhk.individualRhk,
        ind.aspect || "Kuantitas",
        ind.indicatorText,
        ind.targetValue || "-",
        ind.targetUnit || "-",
        statusLabel,
        indItem.activities.length,
        actDescriptions || "-",
        indItem.evidenceFiles.length,
        evFilenames || "-",
      ];

      rows.push(row.map(escapeCsvCell).join(","));
    }
  }

  // Tambahkan UTF-8 Byte Order Mark (BOM)
  return "\uFEFF" + rows.join("\r\n");
}
