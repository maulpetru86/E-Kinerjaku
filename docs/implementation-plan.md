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

### [ ] Tahap 4 — Integrasi Asisten AI Terkontrol
- [ ] Skema database & migrasi: `ai_suggestions`.
- [ ] Lapisan Server Action Adapter untuk Google Gemini API (model hemat & cepat `gemini-2.0-flash`).
- [ ] Pipeline Saran AI:
  - Ringkasan isi berkas bukti & ekstraksi usulan tanggal kegiatan dari teks gambar/PDF.
  - Rekomendasi RHK/indikator relevan berdasarkan narasi aktivitas.
  - Penandaan informasi yang meragukan / tidak lengkap.
- [ ] **UX Konfirmasi AI:**
  - Status saran `pending` terpisah dari data final terverifikasi.
  - Pilihan aksi: Terima Saran, Edit, atau Tolak.
  - Fallback aman: Jika AI offline atau gagal, pencatatan manual tetap 100% berfungsi normal.
- [ ] Unit test fallback handler dan verifikasi bahwa tidak ada data yang berubah otomatis tanpa klik pengguna.

---

### [ ] Tahap 5 — Rekap Kinerja Triwulan, Pemetaan Antarperiode & Ekspor
- [ ] Halaman **Rekap Kinerja Triwulan / Tahunan**:
  - Matriks per RHK/indikator lengkap dengan daftar kegiatan dan berkas bukti terkait.
  - Status kesiapan: *Belum Ada Bukti*, *Ada Bukti*, *Perlu Ditinjau*, *Siap Direkap*.
  - Link langsung ke file sumber untuk verifikasi cepat.
- [ ] **Fitur Pemetaan RHK Antarperiode:**
  - Rekomendasi keselarasan RHK periode lama ke periode baru.
  - Tidak menyalin bukti/capaian lama ke periode baru (hanya referensi pemetaan).
- [ ] **Mesin Ekspor:**
  - Ekspor data rekap ke CSV.
  - Template cetak laporan rapi (*Print-ready HTML/PDF*) siap jadi acuan pengisian portal e-Kinerja BKN.

---

### [ ] Tahap 6 — Pengujian End-to-End, Hardening & Deployment
- [ ] Pengujian fungsional lintas platform (Android Chrome PWA dan Laptop Desktop Browser).
- [ ] Pengujian ketahanan koneksi (kondisi offline/putus saat upload, feedback error yang jelas).
- [ ] Uji isolasi periode (memastikan data periode lama tidak berubah sama sekali).
- [ ] Audit keamanan: Row Level Security, pencegahan kebocoran secret, sanitasi input.
- [ ] Dokumentasi panduan operasional pengguna di `README.md`.
