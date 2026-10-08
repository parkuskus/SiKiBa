# Rencana Implementasi Birth Plan, Chatbot, dan Edukasi

Rencana kerja lanjutan untuk SIAGA Bunda. Dokumen ini memetakan perubahan UI, data lokal/cloud, konten, aset, dan verifikasi sebelum implementasi. Referensi visual Birth Plan dan video edukasi berasal dari gambar yang diberikan pengguna.

## Tujuan dan batasan

1. Birth Plan/P4K menjadi form pribadi yang bisa diedit dari kartu khusus di Beranda saat mode kehamilan, tersimpan otomatis, dapat dilanjutkan saat dibuka kembali, dibagikan sebagai PDF, dan ditampilkan read-only di Profil.
2. Chatbot memakai ilustrasi karakter baru dan persona bidan virtual bernama Kira sesuai `docs/karakter-chatbot.png`; gambar karakter polos berada di `app/public/gambar-karakter.webp`.
3. Perbarui header dan materi S-06a–S-06f, judul enam materi yang sudah disebutkan, pemutaran video tanda bahaya, dan thumbnail yang konsisten.
4. Gunakan sumber klinis yang dapat ditelusuri dan ditinjau pakar. Panduan kesehatan tidak ditulis sebagai diagnosis atau pengganti bidan/dokter.

## Peta implementasi yang disarankan

| Urutan | Bagian | Hasil |
|---:|---|---|
| 1 | Skema dan helper Birth Plan | Dexie + Supabase, RLS, sinkronisasi, autosave dan pemuatan draft |
| 2 | Form Birth Plan | Kartu Beranda khusus mode hamil, lima langkah, daftar kekurangan dinamis, ringkasan dan tombol PDF |
| 3 | Profil dan PDF | Ringkasan read-only di Profil serta PDF P4K berdiri sendiri untuk dibagikan/diunduh |
| 4 | Persona Kira | Avatar gambar, nama/copy, FAQ offline, prompt Edge Function dan kondisi darurat selaras |
| 5 | Header video dan thumbnail S-06a–S-06f | Video pembelajaran di bagian atas S-06a/S-06b; thumbnail di katalog; header detail diseragamkan |
| 6 | Video S-06e dan aset cover tersisa | Autoplay video saat detail tanda bahaya dibuka; thumbnail cover konsisten untuk katalog dan detail |
| 7 | Review konten dan UAT | Pemeriksaan klinis, aksesibilitas, offline, sinkronisasi, PDF dan mode nifas |

Urutan 1–3 saling bergantung dan menjadi prioritas utama. Perubahan konten klinis dan pemilihan video S-06e perlu persetujuan pakar sebelum dirilis.

## 1. Birth Plan dan P4K

### Alur dan aturan akses

- Kartu **Birth Plan & Persiapan Persalinan (P4K)** di Beranda hanya ditampilkan ketika `isPostpartum === false`.
- Membuka kartu Beranda membuka form edit. Form hanya dapat disimpan saat mode kehamilan. Jika mode berubah saat form terbuka, cegah penyimpanan edit dan minta pengguna kembali ke mode kehamilan.
- Profil memuat rencana yang sama dalam tampilan read-only. Tidak ada tombol edit di Profil; perubahan hanya melalui kartu Beranda.
- Saat form dibuka, muat data lokal terlebih dahulu agar langsung responsif. Jika ada versi cloud yang lebih baru, gabungkan/tawarkan pemulihan data cloud tanpa menimpa draft lokal diam-diam.
- Simpan lokal setiap perubahan dengan debounce singkat dan sediakan tombol **Simpan & Kembali ke Beranda** sebagai konfirmasi eksplisit. Kegagalan cloud tidak menghalangi penyimpanan lokal; status sinkronisasi dapat ditampilkan.
- Jika tidak ada jaringan, simpan di Dexie dan antrekan upsert. Saat online, gunakan mekanisme `fireOrQueue`/`flushSyncQueue` yang telah ada.

### Struktur layar form

Ikuti hierarki gambar pengguna: layar penuh dengan judul dan tombol tutup, kartu progres, blok kekurangan berwarna kuning, kartu langkah, ringkasan P4K, lalu aksi simpan dan PDF.

1. **Ringkasan progres** — “Rencana Persalinan Saya”, status lengkap/belum lengkap, progress bar, jumlah dari 25 butir.
2. **Masih perlu dilengkapi** — daftar dinamis dari butir yang belum terisi. Contoh sesuai gambar: dua calon donor, transportasi, tempat bersalin, penolong, nomor bidan/dokter siaga, dan estimasi dana. Setiap item mengarah/fokus ke field terkait.
3. **Langkah 1 · Informasi Persalinan** — nama penolong, tempat bersalin, pendamping, nomor HP bidan/dokter siaga.
4. **Langkah 2 · Persiapan Darurat** — nama dan golongan darah dua calon donor, transportasi yang disiapkan. Tampilkan pengingat ketersediaan transportasi 24 jam menjelang HPL.
5. **Langkah 3 · Persiapan Biaya** — estimasi dana persalinan, menerima nilai nol sebagai input tetapi dianggap belum terisi sampai pengguna mengonfirmasi angka/keputusan.
6. **Langkah 4 · Checklist Perlengkapan Ibu & Bayi** — 10 checkbox seperti gambar: Buku KIA, KTP/BPJS, pakaian ibu, pakaian bayi, popok, pembalut nifas, selimut bayi, perlengkapan mandi, peralatan menyusui, tas persalinan siap.
7. **Langkah 5 · Tanda Persalinan yang Dipahami** — 5 checkbox seperti gambar: kontraksi teratur, lendir bercampur darah, ketuban pecah, gerakan janin tetap dipantau, mengetahui kapan menuju fasilitas kesehatan. Sertakan kotak tanda untuk segera ke fasilitas kesehatan.
8. **Ringkasan Rencana Persalinan** — tempat bersalin, penolong, pendamping, HP siaga, donor 1/2, transportasi dan estimasi dana.
9. **Aksi bawah** — simpan/kembali dan bagikan atau unduh PDF. Pertahankan akses minimum 44 px dan layout mobile-first.

### Definisi progres dan kelengkapan

- Total progres adalah **25 butir**: 4 field Langkah 1 + 5 field Langkah 2 + 1 field biaya + 10 checklist perlengkapan + 5 checklist tanda persalinan.
- Setiap field dari 25 butir harus lengkap untuk progres 100%, termasuk pilihan golongan darah kedua donor (A/B/AB/O). Daftar kekurangan donor sebaiknya menunjukkan nama dan golongan darah yang belum diisi secara spesifik. Jika stakeholder menetapkan golongan darah belum diketahui boleh diterima, definisi progres harus diubah dan disepakati sebelum implementasi.
- Input teks dianggap terisi jika setelah `trim()` masih memiliki isi. Checklist dianggap terisi setelah dicentang. Nilai dana harus angka nonnegatif yang secara eksplisit dikonfirmasi; jangan menganggap placeholder `0` sebagai keputusan pengguna.
- Daftar “Masih perlu dilengkapi” hanya menampilkan item belum lengkap dan hilang ketika tidak ada kekurangan. Untuk field berkelompok, gunakan pesan khusus yang jelas, misalnya “Minimal dua calon donor darah perlu diisi”.
- Status 100% berarti semua 25 butir di atas terisi/terkonfirmasi. Status ini hanya indikator kelengkapan rencana, bukan jaminan kesiapan klinis.
- Teks darurat pada mockup harus diverifikasi bidan/SpOG; jangan menyalin ambang kontraksi atau gerakan janin tanpa validasi dan konteks usia kehamilan.

### Model data lokal dan Supabase

Tambahkan satu record per pengguna dan perencanaan aktif. Hindari memecah setiap field menjadi tabel karena seluruh form merupakan satu dokumen yang disimpan bersama.

```ts
type BirthPlan = {
  id: string                 // UUID tetap; unik untuk satu rencana aktif
  userId: string             // auth uid / id profil lokal
  penolong: string
  tempatBersalin: string
  pendamping: string
  hpBidanSiaga: string
  donor1Nama: string
  donor1GolonganDarah: "A" | "B" | "AB" | "O" | ""
  donor2Nama: string
  donor2GolonganDarah: "A" | "B" | "AB" | "O" | ""
  transportasi: string
  estimasiDana: number | null
  danaDikonfirmasi: boolean
  checklistPerlengkapan: Record<string, boolean> // 10 key tetap
  tandaPersalinanDipahami: Record<string, boolean> // 5 key tetap
  createdAt: string
  updatedAt: string
  syncedAt?: string
}
```

**Dexie:** tambah `BirthPlan` dan tabel `birthPlans` berindeks `id` unik dan `userId`; naikkan versi Dexie dari 5 ke 6 tanpa menghapus data yang sudah ada. Draft baru dapat diinisialisasi dengan checklist bernilai `false`, tetapi jangan dianggap sebagai data tersimpan penuh sebelum ada edit.

**Supabase:** migration baru (nomor berikutnya setelah migration terakhir yang ada saat eksekusi) membuat `public.birth_plans` dengan `id uuid primary key`, `user_id uuid not null references public.profiles(id) on delete cascade unique`, kolom form, checklist `jsonb not null default '{}'`, dan `created_at`/`updated_at`. Aktifkan RLS; policy `select/insert/update/delete` hanya untuk `auth.uid() = user_id`. Tambah grant untuk role authenticated sesuai pola migration terdahulu.

**Sinkronisasi:** buat helper `syncBirthPlan` yang melakukan upsert dengan konflik `user_id`; payload harus selalu membawa pemilik yang cocok dengan sesi. Operasi demo (`demo-*`) tetap lokal. Penyimpanan lokal selesai lebih dahulu; sinkronisasi cloud berjalan terpisah dan antre saat offline. Gunakan `updated_at` untuk mendeteksi perubahan. Untuk konflik dua perangkat, gunakan last-write-wins yang terlihat oleh pengguna: apabila cloud dan lokal berubah sejak sync terakhir, beri pilihan memuat versi cloud atau mempertahankan versi perangkat sebelum menulis ulang.

**Catatan privasi:** data ini mencakup informasi kontak, donor dan persiapan biaya. Terapkan RLS dan minimalkan data pada log. `app/src/data/crypto.ts` saat ini masih stub/plaintext; enkripsi at-rest belum ada dan harus dicatat sebagai batasan keamanan yang sudah ada, bukan diklaim telah ditangani oleh tabel baru.

### Profil read-only

- Tambahkan baris **Rencana Persalinan (P4K)** di area Data Saya atau section tersendiri, hanya jika data lokal/cloud ditemukan.
- Buka layar/detail ringkasan tanpa input, checkbox, atau tombol edit. Tampilkan waktu pembaruan, status progres dan daftar informasi ringkas.
- Jika data belum tersedia, tampilkan empty state informatif; jangan membuat record baru hanya karena pengguna membuka Profil.
- Memuat cloud hanya boleh memakai user id aktif dan tetap menghormati RLS. Bila profil dibuka offline, tampilkan record Dexie terakhir.

### PDF P4K

- Dokumen A4 multi-halaman, header sage SIAGA Bunda, panel cream, aksen mint, tipografi dan footer konsisten dengan PDF ringkasan sekarang.
- Isi: judul **Rencana Persalinan Bunda**, tanggal dibuat/diperbarui, nama Bunda bila tersedia, progres/25, informasi persalinan, donor dan golongan darah, transportasi, estimasi biaya, checklist perlengkapan, tanda persalinan yang dipahami, kekurangan yang masih perlu dilengkapi, serta informasi kontak/aksi darurat yang telah disetujui pakar.
- Belum diisi ditampilkan eksplisit; jangan membuat PDF seolah semua lengkap. Tambahkan catatan bahwa rencana adalah alat persiapan, bukan pengganti konsultasi tenaga kesehatan.
- Tombol **Bagikan / Unduh PDF** memakai Web Share API bila mendukung file, dan fallback unduh seperti `shareViaWA`. Gunakan nama file netral `Rencana-Persalinan-SIAGA-Bunda.pdf`.
- Uji teks panjang, halaman pecah, karakter Indonesia, nilai kosong, checklist dan file sharing Android/iOS.

## 2. Chatbot dan persona Kira

### Observasi karakter

`docs/karakter-chatbot.png` memberi persona **Kira · Bidan Virtual SIAGA Bunda**, dengan peran keluhan ibu dan respons awal. Karakter mendengarkan, memberi informasi awal yang aman, lalu mengarahkan langkah berikutnya. `app/public/gambar-karakter.webp` adalah ilustrasi karakter tanpa teks dan lebih sesuai untuk avatar/header UI. Hindari menjanjikan diagnosis atau menggambarkan Kira sebagai pengganti bidan manusia.

### Perubahan rencana

- Ganti emoji avatar di `personality.ts` dan avatar chat pada `ChatbotPage.tsx` dengan `<img src="/gambar-karakter.webp">`; gunakan crop object-fit agar wajah/stetoskop terlihat pada ukuran header dan bubble.
- Ubah nama, sapaan, label typing, placeholder, jawaban FAQ, empty/fallback, error dan aksesibilitas dari Siba menjadi Kira. Pastikan aturan copy SIAGA Bunda tetap berlaku.
- Ubah `SYSTEM_PROMPT` di `supabase/functions/chat/index.ts` mengikuti persona visual: dengarkan keluhan, akui perasaan tanpa menghakimi, berikan informasi umum ringkas, beri satu atau lebih langkah aman, dan arahkan pemeriksaan bila perlu.
- Pertahankan batas klinis yang ada: tidak mendiagnosis, tidak menetapkan obat/dosis, menyarankan tenaga kesehatan untuk keputusan klinis, dan tanda gawat langsung ke fasilitas kesehatan. Eskalasi chatbot harus memakai overlay darurat yang sama sesuai backlog, bukan hanya teks biasa.
- Selaraskan FAQ offline dan online agar nama, batas cakupan dan tindakan darurat konsisten. FAQ hanya diberi badge terverifikasi setelah review pakar.
- Ubah nama internal tipe pesan `siba` bila mudah digabung dalam perubahan ini, tetapi jangan membuat migrasi/konversi data percakapan karena chat tidak disimpan sebagai riwayat database.

## 3–8. Perubahan materi Edukasi S-06

### Judul kanonis

Gunakan label lengkap berikut pada katalog/detail dan konsistenkan istilah di dokumentasi:

| ID | Judul yang dituju | Aset/header utama |
|---|---|---|
| S-06a | Terjadinya Kehamilan (Fertilisasi) | `s-06a/Thumbnail.webp`; card belajar video sebelum materi |
| S-06b | Perkembangan Janin per Minggu | `s-06b/Thumbnail.webp`; card belajar video sebelum materi |
| S-06c | Perkembangan Plasenta, Tali Pusat, dan Ketuban | header bersama; thumbnail di tile katalog |
| S-06d | Perubahan Fisiologi Kehamilan | `s-06d/Thumbnail.webp` sudah ada; periksa crop/rasio |
| S-06e | Tanda Bahaya Kehamilan | `s-06e/Thumbnail.webp`; video inline per gejala yang memiliki aset relevan |
| S-06f | Perubahan Psikologi/Emosi | header bersama; thumbnail di tile katalog |
| S-06g | Birth Plan & Persiapan Persalinan (P4K) | kartu Beranda menjadi pintu masuk form; bukan materi artikel katalog |

Gunakan ejaan **Plasenta** pada judul layar meskipun daftar awal pengguna menulis “Plasentas”. Pertahankan ID yang sudah disepakati sebelumnya: P4K adalah S-06g; tidak menghidupkan kembali materi Keluhan Umum atau layar S-06h.

### Card belajar video untuk S-06a dan S-06b

- Tambahkan card horizontal di bagian paling atas main content, sebelum materi utama, mengikuti gambar 5 dan 6: bidang mint lembut, label kecil **Pelajari lewat video**, copy ringkas, tombol **Tonton Video**, dan thumbnail di sisi kanan.
- S-06a memakai `/s-06/s-06a/Thumbnail.webp`, video `/s-06/s-06a/S-06a - Terjadinya kehamilan.mp4`.
- S-06b memakai `/s-06/s-06b/Thumbnail.webp`, video `/s-06/s-06b/S-06b - Perkembangan Janin.mp4`.
- Gunakan elemen video native dengan kontrol, `playsInline`, poster thumbnail, dan tidak autoplay; tombol eksplisit mengikuti mockup dan lebih aman untuk data/aksesibilitas. Buka inline atau player overlay yang dapat ditutup dan tetap menyediakan kontrol native.
- Pastikan encode/path dengan spasi dan kapitalisasi diuji pada dev server serta build PWA.

### Header detail S-06a–S-06f

- Semua layar detail memakai pola bersama sesuai referensi terbaru: panel sage rounded bawah, tombol kembali di kiri, nomor dan label materi di tengah, tombol bagikan di kanan, lalu judul besar dan deskripsi.
- Thumbnail masing-masing materi tetap dipakai di tile katalog. Header detail tidak menampilkan thumbnail agar keenam layar konsisten dengan referensi terbaru.

### Video pada detail tanda bahaya S-06e

- Inventarisasi 12 video yang saat ini ada di `app/public/s-06/s-06e/`: perdarahan, pandangan kabur, nyeri ulu hati, nyeri perut, nyeri payudara, nyeri kepala, napas pendek, masalah kejiwaan, ketuban pecah, jantung berdebar, gerakan janin berkurang, dan demam.
- Cocokkan video dengan kartu tanda bahaya yang tepat; mapping tidak boleh ditebak hanya dari nama file. Simpan mapping lokal pada data konten setelah validasi pakar.
- Tampilkan video untuk tanda kehamilan yang cocok. `nyeri payudara.mp4` berkaitan dengan laktasi dan disimpan untuk materi S-04a; tanda dari ekstraksi yang belum memiliki video relevan tidak boleh dipasangkan secara paksa.
- Ketika pengguna membuka/expand satu kartu, tampilkan videonya inline seperti gambar 7 dan mulai otomatis dalam keadaan muted serta `playsInline`, dengan controls terlihat. Coba `play()` dan tangani penolakan browser secara senyap dengan tombol putar yang tetap terlihat.
- Hanya satu video yang boleh aktif. Ketika kartu ditutup, pindah tanda, atau meninggalkan layar, pause video dan kembalikan ke awal. Jangan autoplay semua video saat render atau ketika kartu masih tertutup.
- Sediakan label/caption, poster bila ada, alt/teks pendamping, dan tetap tampilkan penjelasan gejala/tindakan. Video bukan satu-satunya penyampai informasi.
- Verifikasi setiap video memang relevan untuk gejala dan copy. Ambang seperti frekuensi gerakan janin atau kontraksi wajib dirujuk sumber pakar terbaru; bila video tidak cocok, jangan tampilkan sebagai representasi gejala tersebut.

## 9. Thumbnail: pencarian aset dan prompt ilustrasi

### Aset yang sudah tersedia

- Seluruh image asset di `app/public` sekarang menggunakan WebP.
- S-06e kini memiliki `s-06e/Thumbnail.webp` sebagai cover katalog; aset disediakan pengguna dan dikonversi dari PNG.
- S-06g menjadi form personal, bukan kartu materi edukasi. Untuk kartu Beranda, prioritaskan ikon/ilustrasi tas persalinan yang relevan; jangan ambil gambar stok tanpa lisensi.
- Gunakan aset lokal dahulu sebelum mencari gambar tambahan. Periksa isi visual, crop, resolusi, lisensi, atribusi dan konsistensi merek sebelum bundling.

### Strategi gambar luar

1. Cari aset berlisensi jelas di Wikimedia Commons atau repositori pemerintah/WHO/UNICEF/Kemenkes bila ilustrasi edukatifnya cocok. Simpan URL sumber, kreator, lisensi, tanggal akses, atribusi dan perubahan/crop pada katalog aset.
2. Hindari mengambil gambar dari hasil Google Images, situs stok berbayar, atau situs klinik hanya karena dapat diunduh; hasil pencarian bukan lisensi penggunaan.
3. Untuk gambar yang tidak cocok, lebih konsisten membuat ilustrasi baru bergaya flat vector SIAGA Bunda, bukan menggunakan foto stok dengan gaya yang bertabrakan.

### Prompt awal bila perlu generate

Gunakan sebagai brief/prompt awal dan sesuaikan dengan generator. Rasio cover 4:3, tanpa teks, ikon atau simbol medis yang menyatakan diagnosis, palet sage `#7AAE9A`/`#4A6E54`, cream `#FFFDEC`, blush lembut, suasana hangat, ilustrasi flat vector bersih, Bunda Indonesia berhijab dengan busana sage bila ada karakter manusia, komposisi sederhana dan terbaca pada thumbnail kecil.

- **S-06g Birth Plan:** “Bunda hamil Indonesia dan pendamping menyiapkan tas persalinan, Buku KIA, checklist sederhana, dan kendaraan keluarga sebagai simbol rencana P4K, suasana siap dan optimistis, flat vector, palet sage-cream-blush SIAGA Bunda, cover 4:3, tanpa teks.”
- **Cover yang belum tersedia/cocok setelah review:** gunakan prompt generik di atas dengan objek spesifik sesuai materi; jangan menghasilkan anatomi klinis detail tanpa brief dan review pakar.

## 10. Sumber konten klinis dan guidebook/vector DB

- Repositori memiliki `scripts/ingest-guideline.py`, tetapi pencarian berkas tidak menemukan indeks/vector DB guidebook di tree kerja. Pada awal implementasi, pastikan lokasi database, versi dokumen, metadata sumber dan jalur retrieval yang benar; jangan mengasumsikan fitur RAG dapat diakses di browser.
- Chat online memakai Supabase Edge Function dan RAG. Periksa sumber yang benar-benar tersedia di fungsi chat/knowledge table, hak akses, versi, dan sitasi yang dikembalikan. Chat offline hanya memakai FAQ lokal sehingga perlu tetap ringkas, statis, dan disetujui pakar.
- Untuk konten edukasi tertulis, buat matriks per klaim: kalimat, sumber, tahun/versi, tautan/halaman, reviewer, tanggal review, dan status persetujuan. Prioritaskan Buku KIA Kemenkes yang berlaku, pedoman Kemenkes/WHO/organisasi profesi yang relevan, bukan blog tanpa otoritas.
- Hindari menyalin teks berhak cipta secara panjang. Ringkas dengan bahasa sendiri, pertahankan makna, simpan rujukan dan minta validasi bidan/SpOG.
- Tanda bahaya, tindakan segera, klaim tentang gerakan janin, kontraksi, dan nomor darurat adalah blok berisiko tinggi; tidak publish sebelum persetujuan klinis.

## Perubahan berkas yang diperkirakan

| Area | Berkas/target |
|---|---|
| Dexie | `app/src/data/db.ts`, versi 6 + tabel `birthPlans` |
| Cloud | migration Supabase berikutnya, `public.birth_plans`, RLS/grants |
| Sync | `app/src/data/sync.ts`, `syncBirthPlan` dan enqueue upsert |
| Birth Plan | fitur baru di `app/src/features/birth-plan/` atau fitur edukasi sesuai pola navigasi; card dari `BerandaPage.tsx`; read-only dari `ProfilPage.tsx` |
| PDF | `app/src/services/exportService.ts` atau helper modul Birth Plan yang memakai jsPDF terpasang |
| Chatbot | `personality.ts`, `ChatbotPage.tsx`, `supabase/functions/chat/index.ts`, asset `app/public/gambar-karakter.webp` |
| Edukasi | `FertilisasiScreen.tsx`, `JaninWeekScreen.tsx`, `PlasentaKetubanScreen.tsx`, `FisiologiScreen.tsx`, komponen/data S-06e dan S-06f, katalog, `docs/ASSETS.md` |
| Panduan | dokumen ini, `docs/BACKLOG.md`, referensi konten yang disetujui |

Daftar ini indikatif. Sebelum implementasi, periksa ulang status working tree, migration Supabase terakhir yang sudah diterapkan, dan perubahan lokal pengguna.

## Progress implementasi

- 2026-10-08: Judul katalog S-06a–S-06f diperbarui. Judul detail S-06a–S-06d diseragamkan, thumbnail S-06f dipasang pada tile katalog sebelum layar detail tersedia.
- 2026-10-08: Card belajar video ditambahkan di bagian atas S-06a/S-06b dengan MP4 lokal, thumbnail, dan kontrol native. Prompt thumbnail S-06e ditambahkan ke `docs/ASSETS.md`. Persona chatbot diganti menjadi Kira dengan gambar karakter, copy/FAQ offline, dan prompt online yang selaras.
- 2026-10-08: Thumbnail S-06e dari pengguna dikonversi ke WebP dan dipakai di tile katalog; prompt generator yang sebelumnya disiapkan untuk cover S-06e tidak lagi diperlukan.
- 2026-10-08: S-06e kini membuka layar dengan pencarian dan tiga kelompok gejala; satu kartu dapat terbuka pada satu waktu dan video gejala yang sesuai mulai diputar muted, inline, dengan kontrol native. Video laktasi tidak dipasang pada materi tanda bahaya kehamilan.
- 2026-10-08: Birth Plan P4K selesai diimplementasikan pada Dexie v6 dan migration Supabase 009. Form mendukung autosave dan pemulihan draft, sinkronisasi antrean, pilihan saat versi perangkat/cloud berbeda, akses edit hanya dari Beranda mode kehamilan, tampilan Profil read-only, serta PDF bagikan/unduh. Migration sudah diterapkan; QA client offline dan multi-device masih pending.
- 2026-10-08: Migration 009 diterapkan ke proyek Supabase SIAGA Bunda. Smoke test RLS transaksional sukses untuk pembacaan dan perubahan data sendiri, penolakan lintas pengguna, serta akses anon; seluruh perubahan uji di-rollback. Skrip dapat dijalankan ulang lewat `supabase/tests/009_birth_plans_rls.sql`. Sinkronisasi client offline/multi-device masih menunggu QA aplikasi.
- 2026-10-08: Layar S-06f dibuat dengan thumbnail katalog, tiga pilihan trimester, bagian perasaan/penyebab/dukungan, panduan mencari bantuan, bagikan catatan emosi, dan deep link langsung ke EPDS S-03f saat mode kehamilan. Pada mode nifas, tombol EPDS tidak ditampilkan karena skrining tersebut hanya tersedia di mode kehamilan saat ini.
- 2026-10-08: Header detail S-06a–S-06f diperbarui menjadi satu komponen/pola mengikuti referensi terbaru. Thumbnail tetap tampil di katalog dan video S-06a/S-06b, tidak di header detail.
- 2026-10-08: Semua image asset dalam `app/public` dikonversi ke WebP dan referensi aplikasi/PWA diperbarui. WebP ikut dicakup precache service worker.

## Kriteria penerimaan

### Birth Plan

- Mode nifas tidak menampilkan kartu edit di Beranda dan tidak dapat membuka form edit melalui jalur itu.
- Perubahan tersimpan lokal otomatis; tutup/buka ulang mempertahankan data. Reload saat offline tetap menampilkan draft.
- Akun terautentikasi menyinkronkan satu record milik sendiri, antre offline, dan tidak dapat membaca/menulis rencana pengguna lain.
- Konflik cloud-lokal tidak menghapus versi dengan diam-diam.
- Indikator menghitung 25 butir sesuai definisi; daftar kekurangan berubah akurat setiap edit.
- Profil menampilkan data read-only, termasuk ketika cloud sedang tidak tersedia jika data lokal ada.
- PDF multi-halaman terbaca, sesuai visual SIAGA Bunda, berisi data kosong secara jujur, dapat diunduh dan dibagikan.

### Chatbot

- Gambar karakter tampil di header dan bubble dengan ukuran/crop yang sesuai.
- Nama Kira, persona, sapaan, respons error/fallback, FAQ offline dan prompt online konsisten.
- Jawaban tanda bahaya membuka jalur eskalasi yang telah ditentukan dan tidak memberi diagnosis/obat yang tidak aman.

### Edukasi

- Judul enam materi cocok di katalog dan header.
- Card video S-06a/b memakai thumbnail dan MP4 lokal yang ditentukan, berfungsi offline setelah precache PWA, dan memiliki kontrol yang dapat diakses.
- Header S-06a–S-06f menampilkan pola navigasi, label materi, tombol berbagi, judul, dan deskripsi yang konsisten pada layar sempit dan besar.
- Video S-06e hanya diputar untuk kartu terbuka, satu per waktu, berhenti ketika ditutup, dan tetap dapat diputar manual bila autoplay ditolak.
- Semua aset baru memiliki izin penggunaan/atribusi yang tercatat; konten medis memiliki sumber dan reviewer.

### Verifikasi teknis dan klinis

- Jalankan `npm run build` dari `app/`.
- QA perangkat/browser: mobile 360 px, layar besar, PWA offline/online, mode kehamilan/nifas, refresh saat edit, dua perangkat/conflict, share PDF, izin autoplay dan screen reader/keyboard.
- Jalankan SQL migration pada lingkungan yang benar, periksa RLS per user, lalu verifikasi antrean sync dan pemulihan data.
- Pakar klinis meninjau isi P4K (terutama emergency warning), mapping video tanda bahaya, teks edukasi, FAQ dan prompt chatbot sebelum dipakai publik.
- Jangan menandai validasi klinis atau Ethical Clearance selesai hanya karena build/QA teknis lolos.

## Catatan keputusan terbuka untuk sesi implementasi

1. Konfirmasi apakah rencana lama tetap dibaca setelah profil berganti akun di perangkat yang sama; implementasi wajib scope record dengan `userId` agar data tidak bocor.
2. Konfirmasi apakah donor dan biaya memiliki aturan validasi tambahan dari stakeholder; rencana awal hanya memakai isian minimum yang terlihat pada mockup.
3. Pastikan dokumen guidebook/vector DB yang boleh dijadikan sumber dan apakah metadata/sitasi dapat dipakai di jawaban pengguna.
4. Dapatkan persetujuan klinis untuk daftar tanda segera ke fasilitas kesehatan pada mockup dan mapping masing-masing video S-06e.
5. Konfirmasi apakah share PDF perlu membuka WhatsApp langsung atau cukup native share sheet dan fallback unduh. Rencana awal mengikuti pola `navigator.share` yang sudah ada.
