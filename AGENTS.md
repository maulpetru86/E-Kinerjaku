# Panduan Kerja Agen (AGENTS.md) — KinerjaKu

Dokumen ini adalah aturan kerja wajib bagi AI Assistant / AI Agent dalam mengembangkan dan memelihara proyek **KinerjaKu**.

---

## 1. Prinsip Utama Produk
1. **Catat Dahulu, Rapikan Kemudian:** Prioritaskan kemudahan pengguna mencatat aktivitas dan menyimpan berkas tanpa hambatan kelengkapan metadata di awal.
2. **AI Menyarankan, Pengguna Memutuskan:** Seluruh rekomendasi AI (keterangan, tanggal, saran RHK, dsb.) berstatus `pending` (perlu ditinjau) hingga dikonfirmasi pengguna. Tidak ada data yang berubah otomatis tanpa persetujuan.
3. **Zero Hallucination:** Dilarang mengarang fakta, tanggal, capaian, indikator, atau bukti. Informasi yang tidak ditemukan harus dibiarkan kosong/`null` atau diberi tanda "perlu diperiksa".
4. **Isolasi Periode Kinerja:** Data periode lama tidak boleh terpengaruh, terhapus, atau berubah saat periode baru dibuat.
5. **Unggah Sekali, Tautkan Berkali-kali:** Satu berkas bukti fisik di cloud storage dapat ditautkan ke banyak aktivitas dan indikator RHK tanpa perlu diunggah ulang.
6. **Privasi & Keamanan:** Tidak meminta atau menyimpan kata sandi/OTP e-Kinerja BKN. Berkas bersifat privat secara default.

---

## 2. Aturan Baku AI Agent
1. **Baca PRD dan AGENTS.md** sebelum membuat atau mengubah kode.
2. **Implementasikan bertahap, satu fase dalam satu waktu.** Jangan melompat ke fase berikutnya sebelum fase aktif selesai dan terverifikasi.
3. **Konfirmasi Layanan Berbayar & Eksternal:** Sebelum mengaktifkan atau mengirim data ke provider eksternal berbayar, jelaskan implikasi biaya, privasi, dan minta persetujuan pengguna.
4. **Data Uji Bebas Informasi Nyata:** Dilarang menggunakan data pribadi nyata (NIP asli, nama asli instansi sensitif, nomor HP riil) sebagai data uji; gunakan data *mock/dummy*.
5. **Zero Secret in Code:** Jangan menyimpan API Key, token, password, atau credential di source code maupun repository. Gunakan `.env.local` dan sediakan `.env.example`.
6. **Validasi Server-Side:** Semua input wajib divalidasi di sisi server (menggunakan Zod atau pustaka validasi serupa).
7. **Migrasi Database:** Perubahan skema harus menggunakan skrip migrasi terstruktur yang dapat ditinjau ulang (reproducible).
8. **Bahasa UI & Pesan Kesalahan:** Gunakan Bahasa Indonesia yang baku, sopan, dan mudah dipahami untuk antarmuka pengguna serta pesan validasi/error.
9. **Penanganan Kegagalan AI:** Kegagalan koneksi atau ekstraksi AI tidak boleh menggagalkan alur pencatatan manual. Sistem harus tetap menyimpan berkas/catatan dan menandai status perlu pemeriksaan manual.
10. **Batasan Ruang Lingkup:** Dilarang membuat fitur integrasi scraping/auto-submit ke portal BKN tanpa persetujuan tertulis dan revisi PRD resmi.

---

## 3. Definition of Done (DoD)
Sebuah fitur atau modul dianggap **SELESAI (DONE)** jika dan hanya jika:
- [ ] Memenuhi seluruh kriteria penerimaan fungsional (FR) yang relevan dalam PRD.
- [ ] Menangani kemungkinan kesalahan (*graceful error handling*) dan menampilkan pesan kesalahan ramah pengguna.
- [ ] Berfungsi dengan baik di tampilan mobile (HP Android) dan desktop (laptop).
- [ ] Memiliki validasi keamanan data (kontrol akses kepemilikan data / RLS).
- [ ] Lolos pengujian (*unit/integration test*) yang relevan.
- [ ] Dokumentasi terkait (`docs/implementation-plan.md`, `README.md`, dll.) diperbarui.
