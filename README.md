# KinerjaKu 🚀
> **Tagline:** *Catat sekali, siapkan bukti sepanjang waktu.*

Asisten pribadi pencatatan aktivitas kerja dan bank bukti dukung pelaporan e-Kinerja BKN.

---

## 📌 Masalah yang Diselesaikan
Menjelang masa evaluasi triwulan e-Kinerja BKN, pegawai sering kali menghadapi kendala:
- Bukti fisik/digital tercecer di galeri ponsel, percakapan WhatsApp, unduhan laptop, atau surat dinas.
- Repot mencocokkan kembali kegiatan yang telah lewat ke butir Rencana Hasil Kerja (RHK) dan indikator pimpinan.
- Dokumen RHK berubah setiap tahun/periode mengikuti dinamika organisasi.

**KinerjaKu** hadir dengan filosofi **"Catat dahulu, rapikan kemudian"**:
1. Memungkinkan pengguna mencatat kegiatan secepat mungkin dari ponsel saat kegiatan baru saja selesai.
2. Menyimpan berkas bukti dukung ke dalam *Kotak Masuk Bukti* meskipun belum dikategorikan atau belum dihubungkan ke RHK.
3. Menggunakan asisten AI untuk memberikan usulan ringkasan dan rekomendasi RHK (pengguna memegang kendali penuh untuk menerima, mengedit, atau menolak).
4. Menghasilkan rekap matriks kinerja yang rapi dan siap menjadi acuan resmi saat mengisi portal e-Kinerja BKN.

> **Catatan Penting:** KinerjaKu adalah **asisten pencatatan pribadi**, bukan pengganti dan tidak melakukan pengisian otomatis (bypass/scraping) ke portal e-Kinerja BKN.

---

## 📂 Struktur Repositori & Dokumentasi
```
├── PRD.md                     # Spesifikasi Kebutuhan Produk Lengkap
├── AGENTS.md                  # Panduan & Batasan Kerja Agen AI
├── README.md                  # Dokumentasi Proyek & Panduan Memulai
├── .env.example               # Template Variabel Lingkungan
├── docs/
│   ├── architecture.md        # Arsitektur Sistem, Komponen & Alur Data
│   ├── data-model.md          # Skema Database PostgreSQL, DDL & Relasi M:N
│   ├── security.md            # Kebijakan Keamanan, Privasi & RLS
│   └── implementation-plan.md # Checklist & Pelacak Progres Tahapan
```

---

## 🛠️ Tech Stack Rekomendasi
* **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, PWA Support.
* **Backend:** Next.js Server Actions & Route Handlers, Zod Validation.
* **Database & Storage:** PostgreSQL (Supabase / Local) dengan Row Level Security (RLS) & Private Object Storage.
* **AI Engine:** Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash`) dengan server-side abstraction adapter.
* **Ekspor:** CSV Engine & Print-Ready Clean HTML/PDF Report.

---

## 🚀 Panduan Memulai Cepat (Local Development)

### 1. Prasyarat
* Node.js v20+ atau v24+
* Git
* Akun PostgreSQL / Supabase lokal atau cloud

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan nilai `DATABASE_URL` dan `GEMINI_API_KEY`.

### 4. Menjalankan Aplikasi
```bash
npm run dev
```
Buka browser pada [http://localhost:3000](http://localhost:3000).

---

## 📋 Tahapan Eksekusi
1. **Tahap 0: Fondasi Dokumentasi & Repository Setup** *(Selesai)*
2. **Tahap 1: Inisialisasi Proyek, Autentikasi & Manajemen Periode** *(Fase Berjalan)*
3. **Tahap 2: Bank RHK & Ekstraksi Dokumen PDF**
4. **Tahap 3: Jurnal Aktivitas Cepat & Bank Bukti (Relasi M:N)**
5. **Tahap 4: Integrasi Asisten AI Terkontrol**
6. **Tahap 5: Rekap Triwulan, Pemetaan Antarperiode & Ekspor**
7. **Tahap 6: Pengujian Lintas Perangkat, Penguatan Keamanan & Rilis Pribadi**
