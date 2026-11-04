"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Printer,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Camera,
  Calendar,
  FileCheck2,
  FileText,
  HelpCircle,
  Clock,
  ShieldCheck,
  Target,
  ArrowRight,
  Upload,
  Layers,
  HeartHandshake,
  AlertCircle,
  Lightbulb,
  GraduationCap,
} from "lucide-react";

export default function PanduanCetakPage() {
  const router = useRouter();
  const [todayDate, setTodayDate] = React.useState("");

  React.useEffect(() => {
    setTodayDate(
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 sm:p-8 font-sans print:p-0 print:m-0 print:bg-white">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="print:hidden max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-white border border-slate-300 flex items-center justify-between shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Aplikasi</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Ukuran Kertas: <strong>A4</strong> | Orientasi: <strong>Potret</strong>
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-6 print:max-w-none">
        
        {/* ==================================================================== */}
        {/* KOP RESMI PANDUAN */}
        {/* ==================================================================== */}
        <div className="border-b-2 border-slate-900 pb-5 mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4" />
            Buku Panduan Praktis Guru & Tenaga Pendidik
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Panduan Penggunaan KinerjaKu
          </h1>
          <p className="text-sm font-semibold text-slate-700 mt-1">
            Asisten Portofolio Mandiri & Bank Bukti Dukung Pelaporan e-Kinerja BKN
          </p>
          <p className="text-xs text-slate-500 italic mt-0.5">
            "Catat sekali, siapkan bukti sepanjang waktu — Menjelang triwulan tinggal salin tanpa beban."
          </p>
        </div>

        {/* ==================================================================== */}
        {/* SEKILAS TENTANG KINERJAKU */}
        {/* ==================================================================== */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 mb-8 break-inside-avoid">
          <h2 className="text-sm font-bold text-emerald-950 flex items-center gap-2 mb-1.5">
            <Lightbulb className="w-4 h-4 text-emerald-700" />
            Untuk Siapa Buku Panduan Ini?
          </h2>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Buku panduan ini disusun khusus untuk <strong>Bapak/Ibu Guru Kelas, Guru Mata Pelajaran, Guru BK, Tenaga Administrasi Sekolah, serta Rekan Pendidik</strong>. Tujuannya adalah agar Bapak/Ibu tidak lagi panik mengumpulkan dokumen saat masa evaluasi triwulan tiba. KinerjaKu adalah buku saku digital pribadi Anda—bukan untuk menggantikan e-Kinerja BKN, melainkan tempat menampung catatan dan foto bukti kegiatan setiap hari agar siap disalin ke portal resmi BKN.
          </p>
        </div>

        {/* ==================================================================== */}
        {/* 4 PRINSIP SEDERHANA */}
        {/* ==================================================================== */}
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-700" />
            1. Empat Prinsip Kerja yang Menenangkan Hati Guru
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                1. Catat Dahulu, Rapikan Nanti
              </p>
              <p className="text-slate-600 leading-relaxed">
                Selesai mengajar atau rapat, cukup tulis 1 kalimat saja dari HP. Tidak perlu pusing memilih RHK atau indikator saat itu juga.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                <Camera className="w-3.5 h-3.5 text-teal-600" />
                2. Unggah Sekali, Pakai Berkali-kali
              </p>
              <p className="text-slate-600 leading-relaxed">
                Satu foto kegiatan (misal: Rapat Kelulusan) bisa dipakai untuk bukti RHK Utama Pembelajaran sekaligus RHK Tugas Tambahan tanpa unggah ulang.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                3. AI Membantu, Guru Menentukan
              </p>
              <p className="text-slate-600 leading-relaxed">
                Kecerdasan buatan (AI) hanya memberi usulan RHK yang cocok. Data tidak akan pernah berubah sebelum Bapak/Ibu menekan tombol <strong>Terima</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                4. Aman & Privasi Terjamin
              </p>
              <p className="text-slate-600 leading-relaxed">
                Aplikasi tidak pernah meminta kata sandi atau akun e-Kinerja BKN Anda. Berkas bukti tersimpan privat di ruang kerja Anda sendiri.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* LANGKAH DEMI LANGKAH PENGGUNAAN */}
        {/* ==================================================================== */}
        <div className="space-y-6 mb-8">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            2. Langkah Praktis Penggunaan (Alur Sederhana)
          </h2>

          {/* LANGKAH 1 */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white break-inside-avoid shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                1
              </div>
              <div className="flex-1 text-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Langkah 1: Menyiapkan SKP Periode Aktif (Cukup Sekali di Awal Tahun)
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Agar aplikasi mengenali butir target Anda, masukkan SKP tahun berjalan:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>
                    Unduh berkas <strong>PDF Dokumen SKP</strong> Anda dari portal resmi e-Kinerja BKN.
                  </li>
                  <li>
                    Buka menu <strong>Bank RHK</strong> pada KinerjaKu, lalu klik <strong>"Impor PDF SKP"</strong>.
                  </li>
                  <li>
                    Sistem akan otomatis membaca butir RHK Utama, RHK Tambahan, dan Indikator Kuantitas/Kualitas Anda.
                  </li>
                  <li>
                    Periksa pada layar peninjauan, lalu klik <strong>"Simpan ke Bank RHK"</strong>.
                  </li>
                </ol>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  💡 <em>Tips: Jika tidak memiliki PDF, Bapak/Ibu dapat mengetik butir RHK secara manual dengan tombol "+ Tambah RHK".</em>
                </div>
              </div>
            </div>
          </div>

          {/* LANGKAH 2 */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white break-inside-avoid shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                2
              </div>
              <div className="flex-1 text-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Langkah 2: Mencatat Kegiatan Harian (Hanya 15 Detik di HP)
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Lakukan setiap kali selesai melaksanakan kegiatan di sekolah:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>
                    Buka KinerjaKu di HP Anda, ketuk tombol hijau bundar <strong>"Catat"</strong> di bagian bawah layar.
                  </li>
                  <li>
                    Pilih tanggal (otomatis terisi hari ini).
                  </li>
                  <li>
                    Ketik uraian ringkas kegiatan Anda pada kotak deskripsi.
                  </li>
                  <li>
                    Ketuk tombol <strong>"Simpan Aktivitas"</strong>.
                  </li>
                </ol>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 text-[11px]">
                    <span className="font-semibold text-emerald-900">Contoh Kegiatan Guru:</span>
                    <p className="text-emerald-800 italic mt-0.5">
                      "Melaksanakan pembelajaran Matematika materi Teorema Pythagoras di kelas VIII-B serta asesmen formatif."
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200 text-[11px]">
                    <span className="font-semibold text-amber-900">Contoh Tugas Tambahan:</span>
                    <p className="text-amber-800 italic mt-0.5">
                      "Melaksanakan piket pagi menyambut siswa di gerbang dan memeriksa presensi harian kelas VII."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LANGKAH 3 */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white break-inside-avoid shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                3
              </div>
              <div className="flex-1 text-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Langkah 3: Menampung Bukti di "Kotak Masuk Bukti"
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Setiap ada foto kegiatan, surat tugas, atau dokumen penugasan:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>
                    Buka menu <strong>Kotak Masuk Bukti</strong>.
                  </li>
                  <li>
                    Pilih foto dari galeri HP atau dokumen PDF surat dinas dari laptop. Anda bisa mengunggah banyak file sekaligus.
                  </li>
                  <li>
                    Berkas akan tersimpan aman dengan tanda centang hijau. Sistem otomatis memeriksa agar tidak ada berkas duplikat.
                  </li>
                  <li>
                    Bapak/Ibu tidak perlu mengisi judul rumit saat itu juga; berkas bisa dirapikan saat ada waktu luang di ruang guru.
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* LANGKAH 4 */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white break-inside-avoid shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                4
              </div>
              <div className="flex-1 text-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Langkah 4: Merapikan & Menautkan dengan Bantuan Asisten AI
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Ketika Bapak/Ibu memiliki waktu senggang:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>
                    Buka <strong>Jurnal Aktivitas</strong> atau <strong>Kotak Masuk Bukti</strong>.
                  </li>
                  <li>
                    Klik tombol <strong>"Analisis dengan AI"</strong> pada kartu kegiatan atau berkas bukti Anda.
                  </li>
                  <li>
                    Asisten AI akan membaca catatan Anda dan menyarankan butir RHK yang paling pas.
                  </li>
                  <li>
                    Muncul kartu usulan berwarna ungu bertuliskan <em>"Ada Usulan AI"</em>. Jika Anda setuju, klik tombol hijau <strong>"Terima"</strong>. Kegiatan langsung otomatis terhubung ke RHK!
                  </li>
                </ol>
                <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900">
                  🤖 <em>Catatan: Jika laptop tidak terkoneksi internet, Asisten AI Lokal tetap bekerja otomatis menggunakan pencocokan kata kunci bahasa Indonesia tanpa memerlukan API Key!</em>
                </div>
              </div>
            </div>
          </div>

          {/* LANGKAH 5 */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white break-inside-avoid shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                5
              </div>
              <div className="flex-1 text-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Langkah 5: Masa Evaluasi Triwulan — Tinggal Salin ke e-Kinerja BKN!
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Saat Kepala Sekolah atau Pengawas mengumumkan batas akhir pengisian e-Kinerja triwulan:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>
                    Buka menu <strong>Rekap Kinerja</strong>.
                  </li>
                  <li>
                    Periksa butir RHK Anda. RHK yang sudah lengkap kegiatan dan bukti fisiknya akan ditandai dengan lencana hijau <strong>"Siap Direkap"</strong>.
                  </li>
                  <li>
                    Klik tombol <strong>"Cetak Laporan"</strong> untuk melihat format resmi cetak kedinasan lengkap dengan kop dan tanda tangan, atau klik <strong>"Ekspor CSV"</strong> untuk membuka di Microsoft Excel.
                  </li>
                  <li>
                    Buka portal <strong>e-Kinerja BKN</strong> di tab sebelah, lalu salin daftar kegiatan dan bukti dukung dengan tenang tanpa ada yang terlewat.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* TABEL CONTOH PENERAPAN DI SEKOLAH */}
        {/* ==================================================================== */}
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
            <FileText className="w-4 h-4 text-emerald-700" />
            3. Contoh Praktis Pemetaan Kegiatan Guru ke RHK
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2.5 border-r border-slate-300 w-1/4">Kegiatan Harian Guru</th>
                  <th className="p-2.5 border-r border-slate-300 w-1/4">Bukti Fisik yang Disimpan</th>
                  <th className="p-2.5 border-r border-slate-300 w-1/3">Target Butir RHK yang Pas</th>
                  <th className="p-2.5 w-1/6">Status Rekap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="p-2.5 border-r border-slate-300 font-medium">
                    Mengajar materi Teks Prosedur Bahasa Indonesia & membagikan lembar kerja
                  </td>
                  <td className="p-2.5 border-r border-slate-300">
                    Foto lembar kerja siswa, presensi kelas, jurnal mengajar
                  </td>
                  <td className="p-2.5 border-r border-slate-300">
                    <strong>RHK Utama:</strong> Terlaksananya pembelajaran berpusat pada peserta didik
                  </td>
                  <td className="p-2.5 text-emerald-700 font-bold">
                    ✓ Siap Direkap
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 border-r border-slate-300 font-medium">
                    Membimbing siswa kelas VII-C yang sering terlambat masuk sekolah
                  </td>
                  <td className="p-2.5 border-r border-slate-300">
                    Buku catatan pembinaan wali kelas, notula komunikasi orang tua
                  </td>
                  <td className="p-2.5 border-r border-slate-300">
                    <strong>RHK Tambahan:</strong> Terlaksananya tugas tambahan sebagai Wali Kelas
                  </td>
                  <td className="p-2.5 text-emerald-700 font-bold">
                    ✓ Siap Direkap
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 border-r border-slate-300 font-medium">
                    Mengikuti Webinar Pemanfaatan Canva untuk Media Ajar di PMM (2 JP)
                  </td>
                  <td className="p-2.5 border-r border-slate-300">
                    Sertifikat webinar PDF, tangkapan layar kehadiran
                  </td>
                  <td className="p-2.5 border-r border-slate-300">
                    <strong>RHK Pengembangan:</strong> Meningkatnya kompetensi melalui pelatihan mandiri
                  </td>
                  <td className="p-2.5 text-emerald-700 font-bold">
                    ✓ Siap Direkap
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* TANYA JAWAB POPULER SESAMA GURU (FAQ) */}
        {/* ==================================================================== */}
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            4. Pertanyaan yang Sering Diajukan Rekan Guru (FAQ)
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 mb-1">
                T: Apakah KinerjaKu meminta password akun e-Kinerja BKN saya?
              </p>
              <p className="text-slate-600">
                <strong>Jawab: TIDAK PERNAH.</strong> KinerjaKu berprinsip <em>Zero Credential BKN</em>. Aplikasi ini tidak meminta kata sandi, NIP, atau OTP portal BKN. Aplikasi murni berfungsi seperti binder/buku portofolio pribadi Anda.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 mb-1">
                T: Bagaimana jika di sekolah tidak ada sinyal internet?
              </p>
              <p className="text-slate-600">
                <strong>Jawab:</strong> Anda tetap bisa mencatat kegiatan dan mengunggah foto ke penyimpanan lokal komputer/ponsel. Asisten AI kami memiliki mode otomatis <em>Offline/Lokal</em> yang tetap bekerja mencocokkan kata kunci tanpa internet.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 mb-1">
                T: Bolehkah 1 foto kegiatan saya hubungkan ke 2 RHK yang berbeda?
              </p>
              <p className="text-slate-600">
                <strong>Jawab: SANGAT BISA.</strong> Sesuai prinsip <em>Unggah Sekali, Tautkan Berkali-kali</em>, satu foto surat tugas atau foto rapat dapat ditautkan ke beberapa kegiatan dan butir RHK sekaligus tanpa membuang ruang penyimpanan.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 mb-1">
                T: Jika tahun depan RHK saya berganti, apakah data tahun ini akan hilang?
              </p>
              <p className="text-slate-600">
                <strong>Jawab: AMAN 100%.</strong> KinerjaKu menerapkan prinsip <em>Isolasi Periode Kinerja</em>. Ketika Bapak/Ibu membuat periode tahun 2026, data tahun 2025 tetap tersimpan rapi di arsip dan tidak akan berubah sedikit pun.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* BLOK TANDA TANGAN & PENGESAHAN */}
        {/* ==================================================================== */}
        <div className="border-t border-slate-300 pt-6 mt-8 break-inside-avoid">
          <div className="text-center text-xs space-y-1 mb-6">
            <p className="font-semibold text-slate-800">
              Buku Panduan Operasional Penggunaan KinerjaKu bagi Pendidik & Tenaga Kependidikan
            </p>
            <p className="text-slate-500">
              Diterbitkan untuk lingkungan kerja sekolah/madrasah guna mendukung kelancaran penilaian kinerja pegawai ASN.
            </p>
          </div>

          <div className="grid grid-cols-2 text-center text-xs pt-4">
            <div className="space-y-16">
              <p>Mengetahui,<br />Kepala Sekolah / Penilai Kinerja</p>
              <div>
                <p className="font-bold underline">(........................................................)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">NIP. .....................................................</p>
              </div>
            </div>

            <div className="space-y-16">
              <p>
                {todayDate || "...................................................."}
                <br />
                Guru / Pegawai yang Bersangkutan
              </p>
              <div>
                <p className="font-bold underline">(........................................................)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">NIP. .....................................................</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
            Dicetak melalui Aplikasi KinerjaKu — Asisten Pribadi Bukti e-Kinerja BKN. Hak Cipta © 2026.
          </div>
        </div>

      </div>
    </div>
  );
}
