# Kebijakan Keamanan & Privasi Data — KinerjaKu

Dokumen ini menjelaskan arsitektur keamanan, mitigasi privasi, dan tata kelola kredensial pada aplikasi **KinerjaKu** sesuai Bagian 10 PRD.

---

## 1. Prinsip Utama Keamanan & Privasi
1. **Tidak Ada Kredensial e-Kinerja BKN:** Aplikasi dilarang keras meminta, menyimpan, atau menampung kata sandi, NIP, atau OTP portal BKN.
2. **Isolasi Mutlak Berbasis Pemilik (Owner Isolation):** Setiap pengguna hanya memiliki akses baca/tulis ke data dan berkas miliknya sendiri.
3. **Penyimpanan Berkas Privat (Zero Public Buckets):** Seluruh berkas bukti dukung (SK, surat tugas, foto kegiatan, dokumen laporan) disimpan di bucket privat dan hanya diakses menggunakan *Short-Lived Signed URLs*.
4. **Perlindungan Data Sensitif dari AI Eksternal:** Sebelum mengirim teks dokumen ke AI API, data diminimalisir agar tidak memaparkan data pribadi peserta didik atau informasi rahasia dinas yang tidak relevan.

---

## 2. Row Level Security (RLS) PostgreSQL
Setiap tabel yang memiliki kolom `user_id` wajib menerapkan kebijakan RLS PostgreSQL:

```sql
-- Contoh Penerapan RLS pada Tabel Activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna hanya dapat mengakses aktivitas miliknya"
ON activities
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```
Prinsip serupa diterapkan untuk seluruh tabel: `performance_periods`, `rhks`, `rhk_indicators`, `evidence_files`, `activity_rhk_links`, `activity_evidence_links`, `rhk_evidence_links`, `rhk_mappings`, dan `ai_suggestions`.

---

## 3. Tata Kelola Berkas & Object Storage
- **Struktur Path Berkas:**
  ```
  bucket-kinerjaku/
  └── private/
      └── {user_id}/
          └── {period_id}/
              └── {uuid}-{sanitized-filename}.pdf
  ```
- **Akses Berkas:** Klien tidak pernah mendapatkan URL publik permanen. Ketika pengguna melihat pratinjau bukti atau mengunduh berkas, backend menghasilkan URL bertanda tangan (*Presigned URL*) yang kedaluwarsa otomatis dalam 15 menit.
- **Validasi MIME Type & Ukuran:** File divalidasi tipe aslinya (magic bytes) di sisi server, bukan hanya dari ekstensi file. Batas ukuran default: maksimal 15MB per file (dapat dikonfigurasi).

---

## 4. Manajemen Rahasia (Secrets & Environment Variables)
- **Zero Hardcoded Secrets:** Tidak ada API Key, JWT secret, database password, atau access key yang dimasukkan ke dalam kode sumber git.
- **Variabel Server-Only:** Kunci API (seperti `GEMINI_API_KEY`, `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) hanya terbaca di lingkungan runtime server Next.js (tidak berawalan `NEXT_PUBLIC_`).
- File `.env.local` diabaikan dalam `.gitignore`. Hanya template `.env.example` yang dikomit ke repository.

---

## 5. Perlindungan Pemrosesan AI
- **Pemberitahuan Transparan:** UI menampilkan indikator saat berkas atau teks akan diproses oleh asisten AI.
- **Penyimpanan Status Pending:** Seluruh respons ekstraksi AI berstatus `pending` di tabel `ai_suggestions` hingga disetujui pengguna.
- **Audit Log Saran:** Setiap persetujuan atau modifikasi saran dicatat dengan timestamp `reviewed_at`.
- **Hak Memilih Jalur Manual:** Pengguna dapat menonaktifkan fitur AI kapan saja melalui Pengaturan dan beralih ke 100% pengelolaan manual.

---

## 6. Hak Ekspor & Penghapusan Data (Data Sovereignty)
- **Ekspor Komprehensif:** Pengguna berhak mengunduh seluruh arsip data (CSV/JSON) beserta daftar bukti kapan saja.
- **Alur Penghapusan Bersih:** Jika pengguna meminta penghapusan akun atau periode, sistem melakukan pembersihan beruntun (*cascade delete*) pada metadata database dan menghapus objek fisik terkait di storage bucket.
