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

### [ ] Tahap 3 — Jurnal Aktivitas & Bank Bukti Dukung (M:N Linking)
- [ ] Skema database & migrasi: `activities`, `evidence_files`, `activity_rhk_links`, `activity_evidence_links`, `rhk_evidence_links`.
- [ ] **Form Catat Aktivitas Cepat (Mobile-First):**
  - Minimal field: `tanggal` (default hari ini) & `deskripsi kegiatan`.
  - Opsional: Pemilihan RHK/indikator dan opsi lampiran bukti.
  - Dapat disimpan tanpa RHK (masuk kategori belum terhubung).
- [ ] **Modul Kotak Masuk Bukti (Evidence Inbox):**
  - Unggah multi-file (gambar/foto, PDF, dokumen).
  - Tampilan berkas yang belum dikategorikan.
  - Fitur kategorisasi per berkas dan batch linking.
- [ ] **Modul Bank Bukti:**
  - Grid & list view bukti dukung dengan pencarian dan filter tanggal/periode.
  - Fitur Many-to-Many: 1 berkas dapat ditautkan ke beberapa kegiatan dan beberapa RHK tanpa re-upload.
  - Pratinjau aman melalui short-lived signed URL.
  - Restriksi penghapusan berkas jika masih ditautkan ke aktivitas.
- [ ] Integration test pengunggahan file dan relasi M:N.

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
