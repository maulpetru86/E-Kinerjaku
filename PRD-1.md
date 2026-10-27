# PRD --- KinerjaKu

## Asisten Pribadi Pencatatan Aktivitas dan Bank Bukti Dukung e-Kinerja

-   **Versi:** 1.0
-   **Status:** Draf spesifikasi produk untuk Google Antigravity
-   **Bahasa:** Indonesia
-   **Nama kerja:** KinerjaKu
-   **Tagline:** Catat sekali, siapkan bukti sepanjang waktu.

## 1. Ringkasan

KinerjaKu adalah aplikasi pribadi untuk mencatat aktivitas kerja,
mengumpulkan bukti dukung sejak aktivitas dilakukan, menghubungkan
aktivitas dan bukti dengan Rencana Hasil Kerja (RHK), serta menyiapkan
rekap menjelang pengisian e-Kinerja BKN.

Masalah utama pengguna adalah bukti kegiatan sering baru dicari saat
masa pelaporan tiba. Bukti mungkin tersebar di galeri HP, unduhan,
WhatsApp, laptop, atau belum dikumpulkan secara khusus. Aplikasi harus
memungkinkan pengguna menyimpan bukti dahulu dan merapikannya kemudian.

Aplikasi ini **bukan pengganti e-Kinerja BKN** dan pada versi awal tidak
mengisi atau mengirim data langsung ke sistem BKN. Aplikasi adalah
asisten pencatatan pribadi dan penyusun rekap.

## 2. Masalah, Tujuan, dan Batasan

### Masalah yang diselesaikan

-   Bukti dukung baru dicari ketika pelaporan.
-   Berkas tersebar dan sulit ditemukan.
-   Kegiatan perlu dipetakan ke RHK dan indikator yang relevan.
-   RHK dapat berubah setiap tahun/periode mengikuti RHK intervensi
    pimpinan.
-   Satu RHK dapat memiliki beberapa aspek/indikator seperti kuantitas,
    kualitas, dan waktu.
-   Satu bukti dapat mendukung beberapa aktivitas/RHK tanpa harus
    diunggah berulang.
-   Arsip periode lama harus tetap utuh.

### Tujuan pengguna

Mencatat aktivitas dan bukti secara cepat, lalu memperoleh rekap per
RHK/periode tanpa mencari semua berkas dari awal ketika masa e-Kinerja
tiba.

### Bukan tujuan

-   Menggantikan e-Kinerja BKN atau mengirim data otomatis ke BKN.
-   Membuat dashboard pimpinan atau mengelola kinerja satu lembaga.
-   Mengarang aktivitas, hasil, target, tanggal, realisasi, atau bukti.
-   Memaksa semua metadata dilengkapi saat bukti pertama kali diunggah.
-   Memindahkan capaian lama ke periode baru secara otomatis.

## 3. Pengguna dan Platform

-   Pengguna awal: satu pengguna pribadi.
-   Perangkat: HP Android dan laptop dengan data yang tersinkronisasi.
-   Penyimpanan: cloud storage privat.
-   Pendekatan: aplikasi web responsif/PWA, mobile-first, nyaman
    digunakan di laptop.
-   Offline penuh bukan persyaratan MVP. Bila jaringan terputus, status
    unggah harus jelas dan aplikasi tidak boleh mengaku data sudah
    tersimpan di cloud sebelum ada konfirmasi server.

## 4. Prinsip Produk

1.  **Catat dahulu, rapikan kemudian.**
2.  **Minimalkan langkah** untuk mencatat aktivitas dari HP.
3.  **AI menyarankan, pengguna memutuskan.** Relasi RHK dan metadata
    hasil AI harus ditinjau.
4.  **Tidak mengarang fakta.** Informasi yang tidak ditemukan harus
    kosong atau ditandai perlu diperiksa.
5.  **Periode terpisah.** Data lama tidak berubah saat periode baru
    dibuat.
6.  **Unggah satu kali.** Berkas dapat ditautkan ke beberapa catatan.
7.  **Privasi sejak awal.** Jangan meminta atau menyimpan kata sandi/OTP
    e-Kinerja BKN.
8.  **Data dapat diekspor** dan tidak dikunci hanya di dalam aplikasi.

## 5. Ruang Lingkup

### MVP wajib

-   Autentikasi pribadi dan kontrol akses.
-   Periode kinerja dengan tanggal mulai/akhir dan arsip.
-   Impor RHK dari dokumen yang sudah ada, PDF sebagai prioritas
    pertama.
-   Ekstraksi struktur dokumen dengan pratinjau dan koreksi sebelum
    disimpan.
-   Struktur RHK pimpinan yang diintervensi, RHK individu, kategori,
    aspek, indikator, target dan satuan jika tersedia.
-   Jurnal aktivitas.
-   Unggah satu atau banyak bukti ke cloud.
-   Kotak Masuk Bukti untuk file yang belum dikategorikan.
-   AI menyarankan keterangan, tanggal/jenis bukti, dan RHK yang
    relevan.
-   Pengguna dapat menerima, mengubah, atau menolak saran.
-   Bank Bukti Dukung, pencarian dan filter.
-   Tautan satu file ke beberapa aktivitas/RHK tanpa mengunggah ulang.
-   Rekap per periode, RHK, indikator, aktivitas, dan bukti.
-   Status kelengkapan dan daftar yang perlu ditinjau.
-   Pemetaan saran RHK lama ke RHK baru dengan persetujuan pengguna.
-   Ekspor CSV dan laporan yang dapat dicetak (HTML/PDF); XLSX dapat
    menjadi tambahan.
-   Sinkronisasi lintas HP dan laptop.
-   Ekspor data dan alur penghapusan data yang jelas.

### Setelah MVP

-   Impor batch dari ZIP/folder.
-   Integrasi Google Drive jika tersedia dan diizinkan pengguna.
-   Pengingat untuk mencatat atau meninjau bukti.
-   Format ekspor yang dapat dikonfigurasi.
-   Deteksi duplikat yang lebih canggih.

### Di luar ruang lingkup awal

-   Login atau integrasi langsung ke e-Kinerja BKN.
-   Pengisian/pengiriman otomatis ke BKN.
-   Multi-pegawai, dashboard supervisor, atau admin institusi.
-   Penilaian kinerja otomatis oleh AI.

## 6. Navigasi Utama

1.  Dashboard
2.  Catat Aktivitas
3.  Kotak Masuk Bukti
4.  Jurnal Harian
5.  Bank RHK
6.  Bank Bukti Dukung
7.  Rekap Kinerja
8.  Arsip Periode
9.  Pengaturan

Di HP, utamakan tombol Catat Aktivitas dan Unggah Bukti. Di laptop,
gunakan sidebar.

## 7. Alur Pengguna

### A. Persiapan periode dan impor RHK

1.  Pengguna membuat periode.
2.  Pengguna mengunggah dokumen RHK/evaluasi.
3.  Sistem memeriksa jenis dokumen dan mengekstrak informasi yang
    terbaca.
4.  Sistem menampilkan hasil ekstraksi dalam tabel yang bisa diedit.
5.  Pengguna memeriksa dan mengonfirmasi sebelum data menjadi RHK aktif.
6.  Bila kolom tidak ditemukan, biarkan kosong dan tandai perlu
    diperiksa.

Dokumen evaluasi dapat memuat realisasi dan umpan balik; jangan
menganggap semua dokumen impor adalah dokumen rencana awal. Jangan
otomatis mengubah realisasi menjadi target.

### B. Catat aktivitas cepat

1.  Pengguna memilih Catat Aktivitas.
2.  Tanggal default hari ini dan bisa diubah.
3.  Pengguna menulis deskripsi singkat dan, jika ada, menambahkan bukti.
4.  Pemilihan RHK bersifat opsional.
5.  Catatan disimpan.
6.  AI boleh menyarankan perbaikan kalimat atau RHK terkait.
7.  Pengguna menerima, mengedit, atau menolak saran.

### C. Kotak Masuk Bukti --- kombinasi otomatis dan manual

1.  Pengguna mengunggah satu atau beberapa berkas.
2.  Berkas disimpan di cloud dan muncul di Kotak Masuk Bukti meskipun
    belum dikategorikan.
3.  AI/OCR, jika tersedia, membantu membaca teks dan menyarankan
    tanggal, jenis, ringkasan, serta RHK.
4.  Setiap saran diberi status perlu ditinjau dan tidak dianggap benar
    sebelum dikonfirmasi.
5.  Pengguna dapat menyimpan bukti tanpa melengkapi semua metadata.
6.  Pengguna bisa mengategorikan satu per satu atau secara batch di lain
    waktu.
7.  Jika AI gagal, berkas tetap tersedia untuk pengelolaan manual.

### D. Rekap triwulan

1.  Pengguna memilih periode.
2.  Sistem menampilkan RHK/indikator, aktivitas, bukti terkait, dan
    status kelengkapan.
3.  Pengguna memeriksa relasi dan informasi yang belum lengkap.
4.  Pengguna mengekspor rekap sebagai acuan pengisian e-Kinerja.
5.  Informasi yang tidak tersedia tetap kosong/perlu diperiksa.

### E. RHK periode baru

1.  Pengguna membuat periode baru dan mengimpor RHK terbaru.
2.  Sistem dapat menyarankan pemetaan dengan RHK periode lama.
3.  Pengguna mengonfirmasi, mengedit, atau menolak tiap pemetaan.
4.  Pemetaan hanya menjadi referensi. Aktivitas, target, realisasi, dan
    bukti lama tidak disalin atau dihitung sebagai capaian baru.

## 8. Persyaratan Fungsional

### FR-01 --- Akun dan keamanan

-   Sediakan autentikasi aman.
-   Data dan berkas hanya dapat diakses pemilik akun.
-   Jangan meminta atau menyimpan kredensial/OTP e-Kinerja.
-   Pengguna dapat keluar dan menghapus data melalui alur yang jelas.

**Kriteria penerimaan:** pengguna tanpa sesi tidak dapat mengakses data
privat; pengguna tidak dapat membaca data akun lain.

### FR-02 --- Periode

-   Membuat, mengubah nama, membuka, menutup, dan mengarsipkan periode.
-   Setiap periode memiliki nama, tanggal awal/akhir, status, dan
    catatan opsional.
-   Periode lama tetap dapat dibaca dan diekspor.
-   Filter periode tidak boleh mencampur data dari periode lain.

**Kriteria penerimaan:** pengguna dapat menyimpan dua periode berbeda
dan masing-masing mempertahankan RHK serta bukti sendiri.

### FR-03 --- Impor RHK

-   Prioritaskan PDF; rancangan memungkinkan dukungan DOCX/XLSX
    kemudian.
-   Simpan dokumen sumber.
-   Ekstrak jika tersedia: RHK pimpinan yang diintervensi, RHK individu,
    kategori, aspek, indikator, target, satuan, periode, realisasi, dan
    umpan balik.
-   Tampilkan hasil ekstraksi untuk koreksi dan konfirmasi.
-   Kolom yang tidak ditemukan dibiarkan kosong.
-   Tampilkan peringatan jika tabel/teks tidak terbaca.
-   Batalkan impor tanpa mengubah data yang sudah tersimpan.

**Kriteria penerimaan:** tidak ada hasil ekstraksi yang menjadi data
final tanpa konfirmasi pengguna; sistem tidak menciptakan target atau
indikator yang tidak ada di sumber.

### FR-04 --- Struktur RHK

-   Satu periode memiliki banyak RHK.
-   RHK dapat mencatat RHK intervensi pimpinan, RHK individu, kategori,
    sumber, dan catatan.
-   Satu RHK dapat memiliki banyak aspek/indikator.
-   Aspek tidak dibatasi hanya pada Kuantitas, Kualitas, dan Waktu.
-   Target dapat berupa angka atau teks; satuan dan target boleh kosong
    jika tidak diketahui.

### FR-05 --- Jurnal aktivitas

-   Membuat, melihat, mengubah, dan menghapus aktivitas.
-   Field minimum: tanggal dan deskripsi.
-   Field opsional: periode, waktu, hasil, catatan, label,
    RHK/indikator, dan bukti.
-   Aktivitas boleh disimpan tanpa RHK.
-   Pencarian/filter berdasarkan tanggal, periode, kata kunci, dan
    status kategorisasi.

**Kriteria penerimaan:** catatan sederhana dapat disimpan dengan field
minimum; aktivitas tanpa RHK tetap dapat ditemukan.

### FR-06 --- File dan Bank Bukti

-   Prioritaskan JPG, PNG, PDF, dan DOCX; batas ukuran dapat
    dikonfigurasi.
-   Unggah banyak file sekaligus.
-   Simpan nama, tipe, ukuran, waktu unggah, tanggal bukti jika
    diketahui, status, dan lokasi cloud.
-   Tampilkan progres, keberhasilan, atau kegagalan secara akurat.
-   File privat secara default.
-   Dukung pratinjau, unduh, edit metadata, dan hapus.
-   Satu file dapat ditautkan ke beberapa aktivitas/RHK.
-   Deteksi duplikat boleh menawarkan pilihan, tetapi tidak boleh
    menghapus otomatis.

**Kriteria penerimaan:** file yang berhasil diunggah dapat diakses dari
HP dan laptop; file yang gagal tidak ditampilkan sebagai berhasil.

### FR-07 --- Kotak Masuk Bukti

-   Menampung file yang belum memiliki kategori/RHK.
-   Status minimal: Baru, Sedang Diproses, Perlu Ditinjau, Sudah
    Dikategorikan, Gagal Diproses.
-   Dukung kategorisasi satu per satu dan batch.
-   File yang gagal dianalisis tetap dapat dikategorikan manual.
-   File tanpa RHK tetap dapat dicari.

### FR-08 --- AI sebagai asisten

AI boleh: - Merangkum konten berkas menjadi usulan keterangan. -
Menyarankan tanggal jika ditemukan dari teks atau metadata. -
Menyarankan jenis bukti. - Menyarankan RHK/indikator pada periode
terpilih. - Menandai informasi yang tidak diketahui/meragukan. -
Menyarankan pemetaan RHK antarperiode. - Membantu membuat ringkasan dari
catatan dan bukti yang sudah ada.

AI tidak boleh: - Mengarang aktivitas, hasil, tanggal, target,
realisasi, jumlah, atau bukti. - Mengubah data penting atau relasi
menjadi terkonfirmasi tanpa persetujuan pengguna. - Mengklaim suatu
bukti pasti diterima secara resmi oleh BKN. - Mengirim dokumen ke
provider AI eksternal tanpa pemberitahuan dan konfigurasi/izin yang
sesuai.

Jika AI tidak tersedia, pencatatan manual harus tetap berjalan.

**Kriteria penerimaan:** saran dapat diterima, diedit, atau ditolak;
penolakan tidak menghapus berkas; ketidakpastian ditampilkan secara
jelas.

### FR-09 --- Rekap dan kelengkapan

-   Rekap berdasarkan periode, RHK, indikator, aktivitas, dan bukti.
-   Status: Belum Ada Bukti, Ada Bukti, Perlu Ditinjau, Siap Direkap.
-   Status hanya alat bantu organisasi, bukan penilaian resmi.
-   Tampilkan jumlah aktivitas dan berkas terhubung; bedakan dari
    realisasi indikator resmi.
-   Jangan menghitung realisasi jika sumber data tidak cukup.
-   Tautkan setiap baris rekap ke aktivitas dan file sumber.

### FR-10 --- Pemetaan RHK antarperiode

-   Sarankan pasangan RHK berdasarkan teks/metadata.
-   Pengguna dapat menyetujui, mengubah, atau menolak saran.
-   Simpan status pemetaan dan waktu konfirmasi.
-   Pemetaan tidak menyalin aktivitas, target, realisasi, atau bukti ke
    periode baru.

### FR-11 --- Ekspor

-   Ekspor per periode ke CSV dan laporan HTML/PDF yang dapat dicetak.
-   XLSX dapat ditambahkan sesuai prioritas.
-   Isi rekap: periode, RHK, indikator/aspek, aktivitas, bukti, tanggal
    yang tersedia, dan catatan pemeriksaan.
-   Pengguna dapat memilih daftar nama file atau tautan privat bila
    aman.
-   Ekspor tidak menyatakan data sudah dikirim atau diterima BKN.

### FR-12 --- Pencarian dan arsip

-   Cari berdasarkan nama file, deskripsi, RHK, kata kunci, dan tanggal.
-   Filter berdasarkan periode, tipe file, status, RHK, dan tanggal.
-   Pengarsipan tidak sama dengan penghapusan.
-   Arsip dapat dibaca dan diekspor.

## 9. Model Data Konseptual

Nama tabel akhir dapat disesuaikan dengan stack, tetapi relasi berikut
perlu dipertahankan.

### `users`

`id`, identitas autentikasi, `created_at`, `updated_at`.

### `performance_periods`

`id`, `user_id`, `name`, `start_date`, `end_date`, `status`, `notes`,
`created_at`, `updated_at`.

### `source_documents`

`id`, `user_id`, `period_id` nullable, `file_id`, `document_type`,
`original_filename`, `imported_at`, `extraction_status`,
`extraction_summary`, `confirmed_at`.

### `rhks`

`id`, `user_id`, `period_id`, `source_document_id` nullable,
`intervened_lead_rhk` nullable, `individual_rhk`, `category` nullable,
`notes`, `status`, timestamps.

### `rhk_indicators`

`id`, `rhk_id`, `aspect` nullable, `indicator_text` nullable,
`target_value` nullable, `target_unit` nullable, `target_period_text`
nullable, `source_text` nullable, `review_status`, timestamps.

### `activities`

`id`, `user_id`, `period_id` nullable, `activity_date` nullable,
`activity_time` nullable, `description`, `result_notes` nullable,
`private_notes` nullable, `categorization_status`, timestamps.

### `activity_rhk_links`

`id`, `activity_id`, `rhk_id`, `indicator_id` nullable, `link_source`,
`confirmed_at`, `notes`.

### `evidence_files`

`id`, `user_id`, `storage_key`, `original_filename`, `mime_type`,
`file_size`, `checksum` nullable, `uploaded_at`, `evidence_date`
nullable, `source_location` nullable, `processing_status`, `ai_summary`
nullable, `user_description` nullable, `review_status`, timestamps.

### `activity_evidence_links`

`id`, `activity_id`, `evidence_file_id`, `created_at`.

### `rhk_evidence_links`

`id`, `rhk_id`, `indicator_id` nullable, `evidence_file_id`,
`link_source`, `confirmed_at`, `notes`.

### `rhk_mappings`

`id`, `user_id`, `old_rhk_id`, `new_rhk_id`, `similarity_score`
nullable, `mapping_status`, `confirmed_at` nullable, `notes`,
timestamps.

### `ai_suggestions`

`id`, `user_id`, `entity_type`, `entity_id`, `suggestion_type`,
`suggestion_payload`, `confidence_label` nullable, `status`,
`created_at`, `reviewed_at` nullable.

### Relasi dan integritas

-   Terapkan foreign key dan aturan penghapusan yang mencegah file
    terhapus saat masih ditautkan ke entitas lain.
-   Gunakan aturan akses berbasis pemilik data pada database dan
    storage.
-   Target dan tanggal yang tidak diketahui harus dapat disimpan sebagai
    null.
-   Catat sumber relasi: input pengguna, saran AI yang dikonfirmasi,
    atau impor.

## 10. Persyaratan Nonfungsional

### Keamanan dan privasi

-   Autentikasi terkelola dan akses database/storage berbasis pemilik.
-   File privat secara default; gunakan URL bertanda tangan berumur
    terbatas bila diperlukan.
-   API key hanya di server melalui environment variables.
-   Jangan menyimpan secret di source code atau repository.
-   Jangan mencatat isi dokumen sensitif di log yang tidak diperlukan.
-   Jelaskan ketika konten akan diproses provider AI eksternal.
-   Berkas mungkin memuat data peserta didik, tanda tangan, atau data
    internal; minimalkan informasi yang dikirim/dipaparkan.
-   Sediakan ekspor dan penghapusan data.

### Sinkronisasi dan ketahanan

-   Data yang telah dikonfirmasi server tersedia di perangkat lain.
-   Tampilkan status sinkronisasi dan kesalahan.
-   Tangani konflik perubahan dengan pesan yang jelas; jangan menimpa
    diam-diam.
-   Sediakan migrasi database, backup/restore, dan ekspor.
-   Tidak ada penghapusan otomatis karena duplikat atau perubahan RHK.

### Kinerja dan aksesibilitas

-   Mobile-first dan responsif.
-   Form Catat Cepat memiliki sedikit field wajib.
-   Unggah menampilkan progres dan dapat dicoba ulang.
-   Tombol nyaman disentuh, label jelas, pesan kesalahan mudah dipahami.
-   Status tidak dibedakan hanya dengan warna.

## 11. Teknologi Awal yang Disarankan

Pilihan awal untuk dievaluasi di Google Antigravity: - Frontend:
Next.js + TypeScript, desain responsif/PWA. - Database/backend:
PostgreSQL melalui Supabase atau layanan setara. - Autentikasi: provider
terkelola. - File: object storage privat. - AI: panggilan melalui
server-side API dengan lapisan abstraksi agar provider dapat diganti. -
PDF: parser teks terlebih dahulu; OCR bila diperlukan. - Pengujian:
unit, integration, dan end-to-end. - Hosting: layanan yang mendukung
environment variables dan kontrol akses.

Ini rekomendasi awal, bukan keputusan yang sudah dikunci. Sebelum
memilih provider, tinjau biaya, privasi, batas unggahan, kemudahan
ekspor, dan pemulihan data. Jangan menaruh API key di browser.

## 12. Rancangan Layar

### Dashboard

-   Periode aktif.
-   Tombol Catat Aktivitas dan Unggah Bukti.
-   Jumlah bukti belum dikategorikan.
-   RHK yang belum memiliki bukti.
-   Aktivitas terbaru.
-   Status sinkronisasi.
-   Akses ke rekap periode.

### Catat Aktivitas

-   Tanggal (default hari ini, bisa diubah).
-   Deskripsi.
-   Tambah bukti.
-   Pilih RHK opsional.
-   Catatan tambahan opsional.
-   Tombol Simpan.
-   Saran AI ditampilkan setelah penyimpanan, terpisah dari data
    terkonfirmasi.

### Kotak Masuk Bukti

-   Ikon/thumbnail, nama file, waktu unggah, tanggal yang ditemukan,
    ringkasan, status, saran RHK.
-   Aksi Tinjau, Hubungkan, dan Hapus.
-   Kategorisasi batch dengan konfirmasi yang jelas.

### Bank RHK

-   Pemilih periode.
-   Daftar RHK dan indikator.
-   Target asli jika tersedia.
-   Sumber dokumen dan status pemeriksaan.
-   Impor, edit, tambah manual, dan ekspor.

### Bank Bukti

-   Tampilan daftar/grid.
-   Pencarian dan filter.
-   Detail file beserta semua aktivitas/RHK terkait.
-   Tautan unduh privat.

### Rekap

-   Pemilih periode.
-   Ringkasan per RHK/indikator.
-   Aktivitas, bukti, status, dan item perlu ditinjau.
-   Tombol ekspor.

## 13. Pipeline AI dan Kegagalan

1.  Simpan aktivitas atau berkas terlebih dahulu.
2.  Jika AI diaktifkan, proses ekstraksi dijalankan setelah penyimpanan.
3.  Validasi teks/metadata hasil ekstraksi.
4.  AI mengembalikan saran terstruktur.
5.  Server memvalidasi hasil dan menyimpan sebagai `pending`.
6.  Pengguna menerima, mengedit, atau menolak saran.
7.  Hanya saran yang dikonfirmasi menjadi data terverifikasi.

Jika proses gagal, file dan catatan tetap tersedia, status menjadi
gagal/perlu ditinjau, dan pengguna dapat mencoba ulang atau melanjutkan
manual. Kegagalan AI tidak boleh menghalangi jurnal.

## 14. Metrik Keberhasilan

-   Pengguna dapat mencatat aktivitas dengan langkah minimum.
-   Bukti yang belum dikategorikan tetap tersimpan dan dapat ditemukan.
-   Hasil impor RHK dapat diperiksa sebelum disimpan.
-   Data dan file dapat dibuka dari HP dan laptop.
-   Rekap per periode tersedia tanpa pencarian ulang semua file.
-   Tidak ada fakta yang dikarang oleh AI.
-   Periode lama tetap utuh setelah periode baru dibuat.
-   Pengguna dapat mengekspor catatan dan data yang dibutuhkan.

Target angka kinerja baru ditetapkan setelah prototipe diuji.

## 15. Rencana Implementasi

### Tahap 0 --- Persiapan

-   Tinjau PRD dan keputusan teknis.
-   Siapkan repository, `AGENTS.md`, environment, dan arsitektur.
-   Rancang skema database dan aturan akses.

### Tahap 1 --- Fondasi

-   Autentikasi.
-   UI responsif.
-   Database, migrasi, dan periode kinerja.
-   Aturan akses privat.

### Tahap 2 --- RHK

-   Unggah PDF.
-   Ekstraksi.
-   Editor hasil ekstraksi.
-   Penyimpanan RHK dan indikator.

### Tahap 3 --- Aktivitas dan bukti

-   Jurnal aktivitas.
-   Unggah cloud.
-   Kotak Masuk Bukti dan Bank Bukti.
-   Relasi aktivitas, file, dan RHK.
-   Pencarian/filter.

### Tahap 4 --- AI

-   Ringkasan dan saran metadata.
-   Saran RHK.
-   Konfirmasi/penolakan saran.
-   Penanganan kegagalan provider.

### Tahap 5 --- Rekap dan arsip

-   Rekap per RHK/indikator.
-   Status kelengkapan.
-   Ekspor.
-   Pemetaan antarperiode.

### Tahap 6 --- Pengujian dan peluncuran pribadi

-   Uji Android dan laptop.
-   Uji izin akses, unggah gagal, dan sinkronisasi.
-   Uji ekspor serta backup/restore.
-   Uji periode lama dan periode baru.
-   Deploy secara aman.

## 16. Strategi Pengujian

### Unit test

-   Validasi periode dan tanggal.
-   Relasi aktivitas/bukti/RHK.
-   Status saran AI.
-   Validasi hasil ekstraksi.
-   Filter dan ringkasan rekap.

### Integration test

-   Autentikasi dan akses data.
-   Unggah, unduh, dan hapus file.
-   Impor dan konfirmasi RHK.
-   Ekspor rekap.
-   Pemetaan RHK antarperiode.

### End-to-end test

1.  Masuk.
2.  Buat periode.
3.  Impor PDF RHK dan koreksi hasil.
4.  Catat aktivitas.
5.  Unggah bukti tanpa RHK.
6.  Terima/tolak saran AI.
7.  Buka data dari perangkat lain.
8.  Buat rekap.
9.  Buat periode baru dan pastikan periode lama tidak berubah.

### Uji keamanan

-   Akses tanpa autentikasi.
-   Upaya membaca file akun lain di lingkungan pengujian.
-   Pemeriksaan secret pada source code.
-   Pemeriksaan URL privat.
-   Uji penghapusan, ekspor, dan aturan relasi.

## 17. Instruksi untuk Google Antigravity

Jadikan PRD ini sumber utama kebutuhan produk. Implementasikan bertahap,
bukan sekaligus.

### Artefak repository

-   `PRD.md` --- kebutuhan produk.
-   `AGENTS.md` --- aturan kerja agent.
-   `README.md` --- setup, konfigurasi, test, dan deployment.
-   `.env.example` --- nama variabel tanpa secret.
-   `docs/architecture.md` --- arsitektur dan keputusan.
-   `docs/data-model.md` --- tabel dan relasi.
-   `docs/security.md` --- akses, privasi, dan secret.
-   `docs/implementation-plan.md` --- progres dan pekerjaan berikutnya.
-   Folder migrasi database dan folder test.

### Aturan agent

1.  Baca PRD dan AGENTS.md sebelum mengubah kode.
2.  Sebelum memilih layanan berbayar atau mengirim data ke provider
    eksternal, jelaskan biaya, konsekuensi, dan minta persetujuan.
3.  Implementasikan satu tahap per satu waktu.
4.  Jangan menggunakan data pribadi nyata sebagai data uji.
5.  Jangan menyimpan API key, token, password, atau credential dalam
    source code.
6.  Validasi input di server.
7.  Gunakan migrasi database yang dapat ditinjau.
8.  Buat dan jalankan test setelah perubahan.
9.  Jangan mengklaim fitur selesai jika belum diuji.
10. Jangan menambahkan integrasi e-Kinerja BKN tanpa persetujuan dan
    perubahan ruang lingkup.
11. Jika kebutuhan ambigu, pilih tindakan yang paling menjaga data dan
    minta konfirmasi sebelum tindakan sulit dibatalkan.
12. Semua saran AI harus dapat diperiksa dan dikoreksi pengguna.
13. Gunakan bahasa Indonesia untuk UI dan pesan kesalahan.
14. Dokumentasikan keterbatasan dan pekerjaan yang belum selesai.

### Definition of Done

Fitur selesai jika memenuhi kriteria penerimaan, menangani kesalahan,
melindungi data lintas akun, memiliki test relevan, berfungsi di layar
HP/laptop jika berkaitan dengan UI, dan dokumentasinya diperbarui.

## 18. Risiko dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                              Mitigasi
  ----------------------------------- -----------------------------------
  Format PDF berubah atau sulit       Simpan sumber asli, gunakan
  dibaca                              ekstraksi fleksibel, minta
                                      konfirmasi pengguna.

  AI salah memetakan bukti            Semua saran berstatus pending
                                      sampai disetujui.

  Bukti hilang akibat unggah gagal    Tampilkan status nyata, retry, dan
                                      jangan mengaku berhasil sebelum
                                      server mengonfirmasi.

  Biaya AI tinggi                     Ekstrak teks terlebih dahulu,
                                      batasi pemrosesan AI, sediakan alur
                                      manual.

  Data sensitif terkirim ke layanan   Beri pemberitahuan, minimalkan
  eksternal                           data, dan minta persetujuan
                                      konfigurasi.

  RHK berubah                         Arsip periode terpisah dan pemetaan
                                      tanpa pemindahan capaian.

  Aplikasi menambah pekerjaan         Catat cepat, field opsional, Kotak
                                      Masuk Bukti.

  Data terkunci di aplikasi           Sediakan ekspor dan dokumentasi
                                      backup.
  -----------------------------------------------------------------------

## 19. Asumsi dan Keputusan Terbuka

Asumsi yang telah disepakati: - Aplikasi pribadi satu pengguna pada
versi awal. - Android dan laptop memakai data yang sama. - Bukti
disimpan di cloud. - RHK diimpor dari dokumen yang sudah ada. - RHK
dapat berubah tiap periode/tahun. - Arsip periode lama dipertahankan. -
Pemetaan RHK lama-baru hanya berupa saran yang dikonfirmasi pengguna. -
Bukti boleh masuk ke Kotak Masuk tanpa kategori. - AI membantu ekstraksi
dan saran; pengguna dapat memilih alur manual. - Tidak ada integrasi
langsung ke e-Kinerja BKN pada MVP.

Keputusan teknis yang perlu disepakati sebelum implementasi: provider
cloud/database, provider AI, batas ukuran file, biaya, dan kebijakan
retensi. Jangan membuat akun berbayar atau mengaktifkan layanan berbiaya
tanpa persetujuan pengguna.

## Lampiran --- Prinsip utama

**KinerjaKu harus mengurangi pekerjaan mencari bukti, bukan memindahkan
pekerjaan administrasi ke aplikasi baru.** Pengguna boleh mencatat
secara sederhana sekarang, menyempurnakan metadata nanti, dan memeriksa
saran AI sebelum menggunakan rekap sebagai acuan laporan.
