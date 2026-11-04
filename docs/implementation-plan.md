# Rencana Pelaksanaan & Pelacak Progres — KinerjaKu

Dokumen ini memuat status, tahapan eksekusi terperinci, dan verifikasi fitur untuk proyek **KinerjaKu** sesuai dengan spesifikasi `PRD.md` dan `AGENTS.md`.

---

## Ringkasan Progres

| Tahap | Deskripsi | Status | Tanggal Target/Selesai |
| :--- | :--- | :---: | :---: |
| **Tahap 0** | Fondasi Dokumentasi & Repository Setup | **SELESAI** | 2026-10-27 |
| **Tahap 1** | Inisialisasi Proyek, Autentikasi & Manajemen Periode | **SELESAI** | 2026-10-27 |
| **Tahap 2** | Bank RHK & Ekstraksi Dokumen (PDF Parser + Editor) | **SELESAI** | 2026-10-29 |
| **Tahap 3** | Jurnal Aktivitas Cepat & Bank Bukti (Kotak Masuk + M:N) | *BERIKUTNYA* | - |
| **Tahap 4** | Integrasi Asisten AI Terkontrol (Saran Metadata & RHK) | *TERENCANA* | - |
| **Tahap 5** | Rekap Kinerja Triwulan, Pemetaan Antarperiode & Ekspor | *TERENCANA* | - |
| **Tahap 6** | Pengujian End-to-End, Hardening Keamanan & Rilis Pribadi | *TERENCANA* | - |

---

## Rincian Checklist Per Tahapan

### [x] Tahap 0 — Fondasi Dokumentasi & Standar Proyek
- [x] Sinkronisasi `PRD.md` dari `PRD-1.md`.
- [x] Pembuatan panduan kerja agen `AGENTS.md`.
- [x] Dokumen arsitektur sistem `docs/architecture.md`.
- [x] Dokumen skema database relasional `docs/data-model.md`.
- [x] Dokumen kebijakan keamanan & privasi `docs/security.md`.
- [x] Template environment variables `.env.example`.
- [x] Inisialisasi git repository lokal.

---

### [x] Tahap 1 — Inisialisasi Next.js, Autentikasi & Manajemen Periode
- [x] Inisialisasi framework: Next.js 16 (App Router, TypeScript, Tailwind CSS, Lucide Icons).
- [x] Pengaturan layout dasar responsif:
  - Mobile layout: Bottom navigation bar (tombol aksi cepat: Catat Aktivitas & Unggah).
  - Desktop layout: Sidebar navigasi lengkap dan header dengan pemilih periode aktif.
- [x] Konfigurasi Database Client & Repositori Periode (`src/lib/db/periods.ts`).
- [x] API Routes untuk CRUD Periode: `GET /api/periods`, `POST /api/periods`, `PATCH/DELETE /api/periods/[id]`.
- [x] Halaman Manajemen Periode Kinerja (`src/app/periode/page.tsx`):
  - Form buat periode baru (Nama, Tanggal Mulai, Tanggal Selesai, Status, Catatan).
  - Indikator dan switcher periode aktif di header aplikasi.
  - Pengubahan status periode (Aktif, Ditutup, Diarsipkan) dan proteksi isolasi data.
- [x] Unit test validasi Zod rentang tanggal dan status periode dengan Node.js test runner (4 unit tests passed).
- [x] Halaman antarmuka lengkap (Dashboard, Catat Cepat, Jurnal, Kotak Masuk Bukti, Bank Bukti, Bank RHK, Rekap, Pengaturan).

---

### [x] Tahap 2 — Bank RHK & Ekstraksi Dokumen
- [x] Skema database & repositori data: tabel `source_documents`, `rhks`, `rhk_indicators` (`src/lib/db/rhk.ts` & `src/types/index.ts`).
- [x] Validasi server-side Zod form RHK dan konfirmasi batch (`src/lib/validations/rhk.ts`).
- [x] Mesin Ekstraksi Dokumen PDF SKP / Evaluasi BKN (`src/lib/pdf/extractor.ts`):
  - Parser teks dokumen dengan deteksi kategori Utama vs Tambahan, RHK intervensi pimpinan, RHK individu pegawai, aspek (kuantitas, kualitas, waktu), indikator, target, dan satuan.
  - Penegakan prinsip *Zero Hallucination*: Target yang tidak tercantum tidak dikarang (dibiarkan null untuk diisi pengguna).
- [x] **Komponen Editor Koreksi & Pratinjau Interaktif (`ExtractionReviewModal`):**
  - Menampilkan hasil parse dalam tabel interaktif yang dapat diedit langsung sebelum dikonfirmasi ke database.
  - Pengguna dapat menambah, mengoreksi teks, mengubah aspek/target, atau membatalkan sebelum konfirmasi.
- [x] Form penambahan dan pengeditan manual RHK/indikator (`RhkModal`).
- [x] API Routes RHK:
  - `GET /api/rhk`: Ambil daftar butir RHK terikat `periodId`.
  - `POST /api/rhk`: Buat butir RHK manual.
  - `PATCH/DELETE /api/rhk/[id]`: Ubah dan hapus butir RHK serta indikator terkait.
  - `POST /api/rhk/parse-pdf`: Unggah PDF, simpan dokumen sumber asli, ekstrak struktur untuk pratinjau.
  - `POST /api/rhk/confirm`: Konfirmasi penyimpanan batch hasil koreksi pengguna.
- [x] Halaman Bank RHK (`src/app/rhk/page.tsx`):
  - Daftar butir RHK terikat periode aktif, tab kategori Utama & Tambahan, pencarian cepat, tombol aksi ubah dan hapus.
- [x] Pengujian unit test validasi dan ekstraksi PDF (`tests/rhk.test.ts`): 6 pengujian baru lolos (Total 10/10 test cases passed).
- [x] Kualitas build produksi Next.js: 16 rute berhasil dikompilasi tanpa error.

---

### [x] Tahap 3 — Jurnal Aktivitas & Bank Bukti Dukung (M:N Linking)
- [x] Skema database & models: `activities`, `evidence_files`, `activity_rhk_links`, `activity_evidence_links`, `rhk_evidence_links` di `src/types/index.ts`.
- [x] Validasi Zod Server-Side: `src/lib/validations/activity.ts` dan `src/lib/validations/evidence.ts`.
- [x] Repositori Database & Penyimpanan Berkas:
  - `src/lib/db/activities.ts`: CRUD aktivitas, relasi ke RHK & berkas, otomatisasi status kategorisasi.
  - `src/lib/db/evidence.ts`: CRUD berkas bukti, checksum SHA-256 untuk deteksi duplikasi, penyimpanan fisik ke `.data/evidence_uploads/`, relasi M:N, dan proteksi hapus jika masih ditautkan.
- [x] API Routes Lengkap:
  - `GET /api/activities`, `POST /api/activities`
  - `GET /api/activities/[id]`, `PATCH /api/activities/[id]`, `DELETE /api/activities/[id]`
  - `GET /api/evidence`, `POST /api/evidence` (multi-file upload)
  - `GET /api/evidence/[id]`, `PATCH /api/evidence/[id]`, `DELETE /api/evidence/[id]`
  - `GET /api/evidence/[id]/file` (streaming berkas privat inline / download attachment)
  - `POST /api/evidence/link` (single & batch linking M:N)
- [x] **Form Catat Aktivitas Cepat (`src/app/aktivitas/catat/page.tsx`):**
  - Minimal field: `tanggal` (default hari ini via client hydration-safe) & `deskripsi kegiatan`.
  - Opsional: Pemilihan RHK periode aktif, waktu, dan catatan hasil.
  - Simpan tanpa RHK otomatis berstatus *Belum Terkategori* (`uncategorized`); simpan dengan RHK otomatis berstatus *Terhubung RHK* (`categorized`).
- [x] **Halaman Jurnal Aktivitas (`src/app/aktivitas/page.tsx`):**
  - Kartu kronologis aktivitas dengan badge status kategorisasi, jumlah RHK dan bukti terlampir.
  - Filter tab (Semua, Belum Terkategori, Terhubung RHK, Perlu Ditinjau) & pencarian teks debounced.
  - Modal ubah aktivitas dan dialog konfirmasi hapus aman.
- [x] **Modul Kotak Masuk Bukti (`src/app/bukti/inbox/page.tsx`):**
  - Unggah multi-file (drag & drop dropzone + file browser) hingga 15MB/berkas.
  - Monitoring progres upload per berkas.
  - Pratinjau langsung di tab baru dan opsi unduh aman via API file streaming.
- [x] **Modul Bank Bukti Dukung (`src/app/bukti/page.tsx`):**
  - Grid & list view bukti dukung dengan pencarian dan filter status review.
  - Fitur Many-to-Many: 1 berkas dapat ditautkan ke banyak kegiatan & RHK tanpa re-upload.
  - Badge counter penautan ("N aktivitas, M RHK").
  - Restriksi penghapusan berkas jika masih ditautkan ke aktivitas atau RHK.
- [x] Unit & Integration Tests: 7 tes baru (`tests/activity.test.ts` & `tests/evidence.test.ts`), total 17/17 PASS.
- [x] Kualitas build produksi Next.js: 22 rute berhasil dikompilasi tanpa error.

---

### [x] Tahap 4 — Integrasi Asisten AI Terkontrol
- [x] Skema database & repository: `src/lib/db/ai-suggestions.ts` (`.data/ai_suggestions.json`).
- [x] Adapter Asisten AI Terkontrol: `src/lib/ai/gemini.ts` dengan model `gemini-2.0-flash` dan mode Fallback Heuristik Lokal otomatis (Zero Crash).
- [x] Validasi Zod Server-Side: `src/lib/validations/ai.ts` (`AnalyzeActivitySchema`, `AnalyzeEvidenceSchema`, `ReviewSuggestionSchema`).
- [x] API Endpoints Asisten AI:
  - `GET /api/ai/suggestions`: Menampilkan daftar usulan AI berstatus `pending`.
  - `POST /api/ai/analyze-activity`: Menganalisis narasi kegiatan dan merekomendasikan butir RHK + indikator yang paling relevan.
  - `POST /api/ai/analyze-evidence`: Menganalisis berkas bukti fisik, mengekstrak tanggal kegiatan dan menyusun draf ringkasan isi bukti.
  - `POST /api/ai/suggestions/[id]/review`: Menangani konfirmasi pengguna (Terima / Edit / Tolak).
- [x] **UX Konfirmasi AI (Human-in-the-Loop):**
  - Komponen antarmuka `SuggestionCard` (`src/components/ai/suggestion-card.tsx`) dengan badge tingkat keyakinan (*Tinggi*, *Sedang*, *Perlu Verifikasi Manual*).
  - Integrasi tombol "Minta Saran RHK AI" pada Jurnal Aktivitas (`src/app/aktivitas/page.tsx`).
  - Integrasi tombol "Analisis dengan AI" pada Kotak Masuk Bukti (`src/app/bukti/inbox/page.tsx`).
  - Panel konfigurasi privasi, API Key, dan edukasi di Pengaturan (`src/app/pengaturan/page.tsx`).
  - Template konfigurasi aman `.env.example` untuk `GEMINI_API_KEY` dan `GEMINI_MODEL`.
- [x] **Zero Hallucination & Graceful Fallback:**
  - Status saran selalu `pending`; tidak ada data penting atau relasi yang berubah tanpa klik persetujuan pengguna.
  - Penolakan saran (*Reject*) tidak menghapus dan tidak mengubah catatan atau berkas pengguna (Zero Data Loss).
  - Mode Asisten Lokal otomatis aktif jika API Key belum disetel atau koneksi eksternal terputus.
- [x] Unit test Asisten AI (`tests/ai.test.ts`): 4 tes baru mencakup validasi skema, deteksi tanggal faktual, fallback offline, dan garansi Human-in-the-Loop (Total 21/21 tests PASS).
- [x] Kualitas build produksi Next.js: 22 rute berhasil dikompilasi tanpa error.

---

### [x] Tahap 5 — Rekap Kinerja Triwulan, Pemetaan Antarperiode & Ekspor
- [x] **Halaman Rekap Kinerja Triwulan / Tahunan (`/rekap`):**
  - Matriks per RHK/indikator lengkap dengan daftar kegiatan dan berkas bukti terkait (`src/lib/db/rekap.ts`, `src/app/rekap/page.tsx`).
  - Evaluasi status kesiapan otomatis: *Belum Ada Bukti*, *Ada Bukti*, *Perlu Ditinjau*, *Siap Direkap* (`determineReadinessStatus`).
  - Ringkasan statistik (KPI cards) kesiapan rekapitulasi, tab filter status kesiapan, pencarian kata kunci, dan accordion rincian kegiatan/bukti.
  - Link langsung ke file sumber (`/api/evidence/[id]/file`) untuk verifikasi cepat.
- [x] **Fitur Pemetaan RHK Antarperiode (`/api/rhk/mappings`):**
  - Mesin keselarasan kata kunci antarperiode (`src/lib/db/mapping.ts`).
  - Modal interaktif pemetaan antarperiode (`src/components/rekap/rhk-mapping-modal.tsx`) dengan alur konfirmasi transparan (*suggested*, *confirmed*, *rejected*).
  - Garansi isolasi periode: Tidak menyalin bukti/capaian lama ke periode baru, hanya mencatat referensi pemetaan ID.
- [x] **Mesin Ekspor & Siap Cetak:**
  - Ekspor data rekap ke CSV RFC-4180 dengan UTF-8 BOM agar rapi langsung dibuka di Microsoft Excel (`src/app/api/rekap/export/route.ts`).
  - Template cetak laporan resmi kedinasan (`src/app/rekap/cetak/page.tsx`) dengan format `@media print`, kop kedinasan, tabel capaian, dan blok tanda tangan pengesahan ASN/Pejabat Penilai.
- [x] Unit test Rekapitulasi (`tests/rekap.test.ts`): 3 unit test komprehensif mencakup evaluasi status kesiapan, validasi ekspor CSV ber-BOM, dan pembuktian isolasi data pemetaan antarperiode (Total 24/24 tests PASS).
- [x] Kualitas build produksi Next.js 16.4.3: 26 rute berhasil dikompilasi tanpa error.

---

### [x] Tahap 6 — Pengujian End-to-End, Hardening & Deployment
- [x] **Suite Pengujian Integrasi End-to-End (`tests/e2e-workflow.test.ts`):**
  - Uji siklus hidup data lengkap: Buat Periode 2026 -> Impor/Buat RHK & Indikator -> Unggah Bukti Fisik (SHA-256) -> Catat Aktivitas Cepat -> Tautkan Relasi M:N -> Analisis AI & Review Konfirmasi -> Agregasi Matriks Rekap Triwulanan (Status: *Siap Direkap*) -> Ekspor CSV ber-BOM.
  - Uji isolasi periode (Cross-Period Isolation): Membuktikan data kegiatan, bukti, dan matriks periode lama tidak terkontaminasi periode baru.
  - Uji isolasi multi-pengguna: Memastikan pengguna lain tidak dapat mengakses, membaca, atau mengubah data privat pengguna lain.
  - Seluruh pengujian otomatis lulus: **27/27 PASS (100%)** via `npm test`.
- [x] **Hardening Keamanan & Stream Berkas:**
  - *Canonical Path Traversal Defense* pada `src/app/api/evidence/[id]/file/route.ts` menggunakan verifikasi `path.resolve`.
  - Penanganan parameter unduhan fleksibel (`download=true` dan `disposition=attachment`).
- [x] **Kesiapan PWA (Progressive Web App) Mobile Android:**
  - Konfigurasi Web App Manifest Next.js (`src/app/manifest.ts`) dengan mode *standalone*.
  - Konfigurasi `viewport` dan warna tema status bar Android `#020617` pada `src/app/layout.tsx`.
- [x] **Kedaulatan Data (Data Sovereignty - FR-01 & FR-11):**
  - Endpoint API `/api/backup` untuk unduhan paket cadangan data utuh (JSON) dan pembersihan data mandiri (*data erasure*).
  - Integrasi aksi unduh arsip dan pembersihan data pribadi dengan dialog konfirmasi aman pada `src/app/pengaturan/page.tsx`.
- [x] **Dokumentasi Komprehensif:**
  - Pembaruan menyeluruh `README.md` mencakup latar belakang masalah, filosofi produk, arsitektur Next.js 16, panduan workflow harian ASN, panduan instalasi PWA di Android Chrome, panduan konfigurasi lingkungan, arsitektur keamanan, dan struktur repositori.
- [x] **Build Produksi Final:** Kompilasi sukses tanpa error pada 27 rute aplikasi.
