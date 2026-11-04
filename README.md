# KinerjaKu 🚀
> **Tagline:** *Catat sekali, siapkan bukti sepanjang waktu.*

Asisten pribadi pencatatan aktivitas kerja harian ASN/PNS, penyimpanan berkas bukti fisik terproteksi, penautan ke butir RHK/indikator SKP, serta penyusun rekapitulasi capaian triwulanan/tahunan siap cetak dan ekspor sebagai acuan pengisian portal **e-Kinerja BKN**.

---

## 📌 Masalah yang Diselesaikan

Menjelang masa evaluasi triwulan pada aplikasi e-Kinerja BKN, pegawai ASN kerap kali menghadapi kendala klasik:
- **Bukti fisik/digital tercecer:** Surat tugas, notula, foto dokumentasi, dan sertifikat tersebar di galeri ponsel, percakapan WhatsApp, unduhan laptop, atau lemari arsip.
- **Kepanikan saat pelaporan:** Repot mencocokkan kembali kegiatan yang telah lewat berbulan-bulan ke butir Rencana Hasil Kerja (RHK) dan indikator pimpinan.
- **Dinamika RHK tahunan:** Butir RHK dan indikator berubah setiap periode mengikuti penugasan dan dinamika organisasi.
- **Beban kelengkapan metadata di awal:** Form pencatatan yang terlalu rumit membuat pegawai menunda mencatat kegiatan.

**KinerjaKu** hadir dengan prinsip utama:
1. **Catat Dahulu, Rapikan Kemudian:** Pegawai dapat mencatat kegiatan hanya dengan 2 kolom (tanggal dan uraian kegiatan) dalam hitungan detik dari ponsel. Metadata RHK dan berkas bukti fisik dapat dilengkapi kapan saja di kemudian hari.
2. **AI Menyarankan, Pengguna Memutuskan:** Seluruh rekomendasi kecerdasan buatan berstatus `pending`. Pengguna memegang hak veto penuh untuk menyetujui, mengedit, atau menolak saran.
3. **Zero Hallucination:** Sistem dilarang mengarang fakta, tanggal, angka target, atau capaian. Informasi yang tidak ditemukan dibiarkan kosong (`null`) atau ditandai *perlu diperiksa*.
4. **Isolasi Periode Kinerja:** Data periode lama terkunci secara permanen dan tidak terpengaruh saat periode baru dibuat.
5. **Unggah Sekali, Tautkan Berkali-kali:** Satu berkas bukti fisik dapat ditautkan ke banyak aktivitas dan indikator RHK tanpa perlu diunggah berulang.
6. **Zero Credential BKN & Kedaulatan Data:** Aplikasi tidak pernah meminta username, kata sandi, NIP, atau OTP portal e-Kinerja BKN. Berkas bersifat privat dan pengguna memiliki opsi unduh arsip cadangan (JSON/CSV) atau pembersihan data mandiri.

> **Pernyataan Batasan Ruang Lingkup:** KinerjaKu adalah **asisten pencatatan mandiri**, bukan pengganti dan tidak melakukan pengisian otomatis (*auto-submit / scraping*) ke portal e-Kinerja BKN.

---

## 🛠️ Tech Stack & Arsitektur

- **Framework:** Next.js 16 (App Router dengan Turbopack).
- **Bahasa & Tipemuka:** TypeScript (strict mode) dengan definisi tipe domain komprehensif.
- **Styling:** Tailwind CSS, Lucide Icons, Mobile-first Responsive Design, cetak kedinasan (`@media print`).
- **PWA (Progressive Web App):** Web App Manifest (`src/app/manifest.ts`), tema status bar Android `#020617`, dan viewport mobile teroptimasi.
- **Validasi Server-Side:** Zod schema validation untuk semua operasi API.
- **Penyimpanan Data & Berkas:**
  - Database JSON lokal terisolasi (`/.data/`) dengan garansi konkurensi aman.
  - Relasi Many-to-Many (M:N) terpisah untuk aktivitas, bukti dukung, dan RHK.
  - Deduplikasi berkas otomatis menggunakan algoritma kriptografi SHA-256 checksum.
  - Proteksi stream berkas dengan *Canonical Path Traversal Defense*.
- **Mesin AI Terkontrol:**
  - Google Gemini 2.0 Flash (`gemini-2.0-flash`) via REST API server-side.
  - *Deterministic Rule-Based Offline Engine* otomatis aktif jika tidak ada internet atau API key belum disetel.
- **Mesin Ekspor:**
  - CSV RFC-4180 lengkap dengan UTF-8 Byte Order Mark (BOM) untuk kompatibilitas langsung di Microsoft Excel.
  - Dokumen cetak laporan matriks kinerja kedinasan resmi dengan kop dinas dan blok tanda tangan pengesahan.

---

## 📱 Panduan Alur Kerja ASN (Workflow Harian)

```
[ Kegiatan Selesai ]
        │
        ▼
[ Catat Cepat di HP ] ─── Simpan hanya tanggal & deskripsi singkat
        │
        ▼
[ Kotak Masuk Bukti ] ─── Foto surat tugas/kegiatan diunggah (bisa banyak berkas sekaligus)
        │
        ▼
[ Bank RHK ] ──────────── Unggah PDF SKP BKN ➔ Ekstrak otomatis ➔ Tinjau & Konfirmasi
        │
        ▼
[ Asisten AI ] ────────── Analisis kegiatan/bukti ➔ Rekomendasikan RHK yang pas (Status: Pending)
        │
        ▼
[ Review Pengguna ] ───── Setujui usulan AI ➔ Aktivitas otomatis berstatus "Terkategori"
        │
        ▼
[ Rekap Triwulan ] ────── Matriks capaian otomatis tersusun (Status: Siap Direkap)
        │
        ▼
[ Lapor ke e-Kinerja ] ── Buka Cetak Laporan / CSV sebagai acuan saat mengisi form BKN
```

---

## 📲 Panduan Instalasi PWA di Ponsel Android

KinerjaKu dirancang dengan pendekatan *mobile-first* agar nyaman digunakan dari ponsel Android:
1. Buka browser **Google Chrome** di ponsel Android Anda.
2. Akses alamat web KinerjaKu (misal: `http://localhost:3000` atau URL hosting produksi Anda).
3. Ketuk ikon **tiga titik (menu)** di pojok kanan atas browser Chrome.
4. Pilih **"Tambahkan ke Layar Utama"** (*Add to Home screen*) atau ketuk tombol instalasi aplikasi yang muncul.
5. KinerjaKu akan terpasang sebagai aplikasi mandiri (*standalone app*) di ponsel Anda dengan tampilan layar penuh dan bilah navigasi bawah (*bottom bar*) satu tangan.

---

## 🚀 Panduan Memulai (Local Development)

### 1. Prasyarat Sistem
- Node.js versi 20+ atau 24+
- Git

### 2. Instalasi Dependensi
```bash
git clone https://github.com/MAN5010100/e-kinerjaku.git
cd e-kinerjaku
npm install
```

### 3. Konfigurasi Variabel Lingkungan
Salin berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi konfigurasi pada `.env.local`:
```env
# Opsional: Google Gemini API Key untuk analitik AI online
# Dapatkan gratis di: https://aistudio.google.com/
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```
> **Catatan:** Jika `GEMINI_API_KEY` dikosongkan, KinerjaKu tetap berfungsi 100% menggunakan **Mode Asisten Offline/Lokal** tanpa koneksi internet.

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

### 5. Menjalankan Suite Pengujian
Jalankan pengujian unit dan integrasi end-to-end:
```bash
npm test
```
*Hasil: 27 pengujian otomatis lulus 100%.*

### 6. Kompilasi Build Produksi
```bash
npm run build
npm run start
```

---

## 🔒 Keamanan, Privasi & Kedaulatan Data

1. **Zero Secret in Repository:** Tidak ada API key, token, atau kata sandi yang disimpan dalam source code atau git history.
2. **Path Traversal Defense:** Endpoint stream berkas fisik `/api/evidence/[id]/file` memeriksa kanonikal direktori menggunakan `path.resolve` guna mencegah eksploitasi direktori sistem.
3. **Isolasi Multi-Pengguna (RLS Simulation):** Seluruh data (periode, RHK, aktivitas, bukti) diikat dengan parameter `userId`. Data satu pengguna tidak dapat diakses atau diubah oleh pengguna lain.
4. **Kedaulatan Data:**
   - **Unduh Arsip Cadangan:** Pengguna dapat mengunduh seluruh data dalam satu paket arsip JSON utuh melalui menu *Pengaturan*.
   - **Pembersihan Data:** Pengguna dapat menghapus seluruh catatan aktivitas dan berkas fisik bukti secara permanen kapan saja melalui fitur *Hapus Data Pribadi*.

---

## 📂 Struktur Repositori

```
├── .data/                      # Direktori data lokal (diabaikan git)
│   ├── evidence_uploads/       # Berkas fisik bukti dukung yang diunggah
│   ├── activities.json         # Jurnal aktivitas harian
│   ├── evidence_files.json     # Metadata berkas bukti & checksum
│   ├── rhks.json               # Bank RHK & indikator SKP
│   ├── periods.json            # Manajemen periode & arsip
│   ├── rhk_mappings.json       # Pemetaan relasi RHK antarperiode
│   └── ai_suggestions.json     # Catatan rekomendasi usulan AI (pending)
├── docs/                       # Dokumentasi arsitektur & rencana
│   ├── architecture.md         # Arsitektur sistem & diagram data
│   ├── data-model.md           # Model data konseptual & relasi M:N
│   ├── security.md             # Kebijakan privasi & keamanan
│   └── implementation-plan.md  # Pelacak tahapan eksekusi proyek
├── src/
│   ├── app/                    # Next.js 16 App Router
│   │   ├── manifest.ts         # Konfigurasi PWA Web App Manifest
│   │   ├── layout.tsx          # Root layout & viewport metadata
│   │   ├── page.tsx            # Dashboard utama & KPI cards
│   │   ├── aktivitas/          # Jurnal aktivitas & form catat cepat
│   │   ├── bukti/              # Bank bukti & Kotak Masuk Bukti (Inbox)
│   │   ├── periode/            # Kelola periode kinerja & arsip
│   │   ├── rhk/                # Bank RHK & parser PDF dokumen SKP
│   │   ├── rekap/              # Matriks rekap kinerja triwulan & cetak
│   │   ├── pengaturan/         # Pengaturan AI, privasi & kedaulatan data
│   │   └── api/                # 17 API Route Handlers dinamis
│   ├── components/             # Komponen antarmuka modular
│   │   ├── ai/                 # Kartu usulan AI & badge keyakinan
│   │   ├── layout/             # AppShell, Sidebar, BottomNav, Header
│   │   ├── rekap/              # Modal pemetaan antarperiode RHK
│   │   └── rhk/                # Modal koreksi ekstraksi PDF SKP
│   ├── contexts/               # React Context (Active Period Provider)
│   ├── lib/                    # Logika bisnis, database & AI adapter
│   │   ├── ai/gemini.ts        # Klien Gemini & Rule-based Offline Engine
│   │   ├── db/                 # Repositori data & fungsi agregasi
│   │   ├── pdf/extractor.ts    # Ekstraktor teks digital PDF SKP BKN
│   │   └── validations/        # Skema validasi Zod
│   └── types/                  # Definisi tipe TypeScript domain
└── tests/                      # Suite pengujian unit & integrasi E2E
    ├── activities.test.ts      # Pengujian jurnal aktivitas
    ├── ai.test.ts              # Pengujian AI engine & human-in-the-loop
    ├── e2e-workflow.test.ts    # Pengujian siklus hidup E2E & isolasi
    ├── evidence.test.ts        # Pengujian bank bukti & SHA-256
    ├── periods.test.ts         # Pengujian periode kinerja
    ├── rekap.test.ts           # Pengujian matriks rekap & ekspor CSV
    └── rhk.test.ts             # Pengujian bank RHK & parser PDF
```

---

## 📋 Riwayat Tahapan Eksekusi

- [x] **Tahap 0: Fondasi Dokumentasi & Repository Baseline** (`33a5dc1`)
- [x] **Tahap 1: Inisialisasi Proyek, Autentikasi & Manajemen Periode** (`7906ea2`)
- [x] **Tahap 2: Bank RHK & Ekstraksi Dokumen PDF SKP e-Kinerja BKN** (`8b929b7`)
- [x] **Tahap 3: Jurnal Aktivitas Cepat, Kotak Masuk Bukti & Relasi M:N** (`561b09b`, `d7afd5c`, `02ec6f5`)
- [x] **Tahap 4: Integrasi Asisten AI Terkontrol (Gemini 2.0 Flash + Fallback Offline)** (`7dda83a`)
- [x] **Tahap 5: Rekap Kinerja Triwulan, Pemetaan Antarperiode & Ekspor CSV/Cetak** (`0a127e1`)
- [x] **Tahap 6: Pengujian End-to-End, Hardening Keamanan, PWA & Rilis Mandiri**

---

## 📄 Lisensi
Hak Cipta © 2026 Tim Pengembang KinerjaKu. Dikembangkan untuk kemudahan aparatur sipil negara dalam mengelola portofolio kinerja secara mandiri, aman, dan terpercaya.
