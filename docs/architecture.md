# Arsitektur Sistem — KinerjaKu

## 1. Ikhtisar Arsitektur
KinerjaKu dirancang dengan arsitektur **Full-Stack Web Application (Mobile-First / PWA)** yang memisahkan client responsif, backend API/Server Actions yang aman, lapisan abstraksi AI, serta penyimpanan database dan object storage terproteksi.

```
+-------------------------------------------------------------+
|                        Klien (Browser/PWA)                  |
|  - Tampilan Mobile-First (HP Android)                       |
|  - Tampilan Desktop Workspace (Laptop)                      |
|  - Offline-aware state & UI feedback ramah                  |
+-------------------------------------------------------------+
                               |
                               | HTTPS / Server Actions / REST API
                               v
+-------------------------------------------------------------+
|                  Lapisan Aplikasi (Next.js)                 |
|  - Server Actions & Route Handlers                          |
|  - Input Validation (Zod Schemas)                           |
|  - Auth Middleware & Session Handler                        |
|  - PDF Parser & Normalizer Engine                           |
|  - Export Engine (CSV, Print-Ready HTML/PDF)                |
+-------------------------------------------------------------+
            |                                  |
            v                                  v
+-----------------------+          +--------------------------+
|  AI Provider Adapter  |          | Database & Storage       |
|  - Google Gemini API  |          | - PostgreSQL (Supabase)  |
|  - Structured Output  |          |   * Row Level Security   |
|  - Graceful Fallback  |          | - Private Object Storage |
+-----------------------+          |   * Signed URLs          |
                                   +--------------------------+
```

---

## 2. Komponen Utama

### A. Frontend Layer (Next.js App Router + Tailwind CSS)
* **Mobile-First Layout:** Navigasi bawah (*Bottom Navigation Bar*) untuk ponsel pintar, mengutamakan tombol cepat **"Catat Aktivitas"** dan **"Unggah Bukti"**.
* **Desktop Layout:** Sidebar yang terorganisir untuk telaah mendalam, pengelolaan Bank RHK, penataan Bank Bukti, dan modul Rekap Kinerja.
* **Komponen Pratinjau & Koreksi:** Komponen tabel interaktif untuk meninjau hasil ekstraksi PDF RHK dan konfirmasi saran AI sebelum disimpan.

### B. Backend Layer (Server Actions & Route Handlers)
* **Validasi Skema:** Seluruh input form divalidasi dengan Zod sebelum diproses ke database.
* **Autentikasi & Otorisasi:** Memastikan sesi pengguna terverifikasi pada setiap transaksi.
* **File Upload Pipeline:**
  * Pengunggahan berkas langsung atau melalui server terproteksi ke Private Bucket.
  * Hashing berkas (MD5/SHA256) untuk deteksi duplikasi tanpa penghapusan paksa.
  * Pengambilan berkas privat menggunakan *Presigned URL* dengan masa kedaluwarsa singkat (mis. 15-30 menit).

### C. Modul AI & Abstraksi (`AIProviderAdapter`)
* Desain adapter independen:
  ```typescript
  export interface AIProviderAdapter {
    extractRHKFromDocument(documentText: string): Promise<ExtractedRHKResult>;
    summarizeEvidence(fileBuffer: Buffer, mimeType: string): Promise<EvidenceAISuggestion>;
    suggestRHKForActivity(description: string, activeRHKs: RHKItem[]): Promise<RHKLinkSuggestion[]>;
  }
  ```
* **Guardrail:** Semua respons AI disimpan dengan status `pending` pada tabel `ai_suggestions`. Data riil baru diperbarui saat aksi `confirm` dipicu pengguna.
* **Fallback:** Jika layanan AI timeout atau kuota habis, transaksi inti (simpan catatan, simpan berkas) tetap berhasil 100%.

### D. Data & Storage Layer
* **PostgreSQL:** Penyimpanan relasional yang mengikat data aktivitas, bukti, dan indikator RHK dengan integritas *foreign key*.
* **Row Level Security (RLS):** Memastikan penyewa/pengguna hanya dapat membaca dan menulis data miliknya sendiri (`user_id = auth.uid()`).
* **Object Storage:** Berkas tersimpan dalam direktori privat terisolasi per pengguna (`/evidence/{user_id}/{file_id}.ext`).

---

## 3. Alur Data Kunci

### Alur 1: Catat Cepat Aktivitas
1. Klien mengirim form (minimal: `tanggal`, `deskripsi`).
2. Server memvalidasi dan menyimpan ke `activities` dengan status `Baru` atau `Perlu Ditinjau`.
3. Jika RHK dipilih, server menyambungkan ke `activity_rhk_links`.
4. Jika berkas dilampirkan, berkas disimpan ke storage dan dihubungkan ke `activity_evidence_links`.
5. Asinkron / latar belakang: Server dapat meminta saran AI untuk penyempurnaan kalimat/rekomendasi RHK tanpa memblokir respons ke pengguna.

### Alur 2: Kotak Masuk Bukti (Unggah Dulu, Rapikan Nanti)
1. Klien mengunggah 1 atau banyak berkas ke `evidence_files` dengan status `Baru`.
2. File masuk ke **Kotak Masuk Bukti**.
3. Sistem secara opsional memicu AI summarization untuk mengekstrak tanggal dokumen dan kata kunci.
4. Pengguna membuka Kotak Masuk Bukti kapan saja untuk meninjau saran, menautkan ke RHK, atau membiarkannya tersimpan aman di Bank Bukti.

### Alur 3: Ekstraksi Dokumen RHK
1. Pengguna mengunggah dokumen PDF RHK awal/evaluasi.
2. Server membaca teks/tabel dan menyusun struktur sementara.
3. Klien menampilkan antarmuka tabel editor (pratinjau & koreksi).
4. Pengguna memperbaiki baris yang kurang tepat dan menekan tombol **"Simpan ke Bank RHK"**.
5. Data resmi tersimpan ke tabel `rhks` dan `rhk_indicators` terikat pada `period_id` aktif.
