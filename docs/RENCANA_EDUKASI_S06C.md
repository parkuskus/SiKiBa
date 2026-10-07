# Rencana Layar Edukasi S-06c

**Status:** rencana layout dan brief aset; belum menjadi implementasi atau konten klinis final.

**Screen ID:** S-06c, Perkembangan Plasenta, Tali Pusat, dan Ketuban.

**Sumber isi:** `docs/EKSTRAK_EDUKASI_LOVABLE.md` bagian 3 dan `docs/KONTEN_EDUKASI.md` topik 3. Tujuan dan hubungan layar mengikuti `docs/SiKiBa_Spesifikasi_Storyboard_Prototype.md` bagian V dan IX.

## Arah yang direkomendasikan

Gunakan **satu layar detail dengan tiga tab utama**: Ketuban, Tali Pusat, dan Plasenta. Saat pengguna memilih tab, gambar dan penjelasannya berubah di tempat yang sama. Ini mengikuti bentuk konten prototype, memudahkan perbandingan tiga struktur, dan memakai pola yang sudah familier di S-06a serta S-06b.

Gaya ilustrasi mengikuti lima gambar S-06a: diagram edukasi flat, bidang krem `#FFFDEC`, coral lembut, pink, sage, kontur sederhana, komposisi terpusat, dan tanpa teks di dalam gambar. Label dan penjelasan tetap menjadi teks Figma/aplikasi supaya mudah diedit dan dibaca teknologi bantu.

## Rencana layout

### 1. Header

- Header sage gelap `#4A6E54`, mengikuti layar detail Edukasi.
- Tombol kembali 44 px ke katalog S-06.
- Judul singkat **Pendukung Janin**.
- Pengantar: **Kenali peran ketuban, tali pusat, dan plasenta selama kehamilan.**
- Header membungkus judul panjang dengan aman; tidak meletakkan istilah tiga struktur sebagai tiga baris judul utama.

### 2. Sheet materi

Sheet krem/putih dimulai dengan jarak seperti S-06a saat ini, bukan menumpuk menutupi bagian bawah header. Urutannya:

```text
┌──────────────────────────────────┐
│ [Kembali]     Pendukung Janin     │
│ Kenali peran tiga struktur        │
│ selama kehamilan                  │
└────────── header sage ────────────┘
             jarak 16 px
┌────────── sheet materi ───────────┐
│ [Ketuban] [Tali Pusat] [Plasenta] │
│                                  │
│ Ringkasan tab aktif               │
│ [ilustrasi utama 4:3]             │
│                                  │
│ Fakta inti / ukuran yang tersedia │
│ Fungsi                            │
│ Penjelasan per fungsi             │
│ Hal yang perlu diperiksa          │
│ Tips pemeriksaan                  │
│                                  │
│ Sumber materi                     │
└──────────────────────────────────┘
      navigasi aplikasi tetap
```

### 3. Tab dan isi

Ketiga tab adalah satu segmented control selebar area isi, dengan area tekan minimal 44 px. Tab aktif menggunakan sage gelap dan teks putih; tab tidak aktif putih dengan garis sage lembut. Tab pertama yang aktif saat halaman dibuka adalah **Ketuban**.

| Tab | Isi dan susunan |
| --- | --- |
| **Ketuban** | Ringkasan satu kalimat; ilustrasi fetus di dalam kantung amnion; fakta inti berisi warna serta perubahan volume yang tersedia pada sumber; bagian fungsi dengan lima fungsi berlabel pendek; bagian kewaspadaan dan tips pemeriksaan |
| **Tali Pusat** | Ringkasan penghubung janin-plasenta; ilustrasi tali pusat dan potongan penampang; penjelasan dua arteri dan satu vena serta jeli Wharton; diagram posisi insersi; catatan pemantauan |
| **Plasenta** | Ringkasan fungsi; ilustrasi dua permukaan; pilihan **Sisi Janin** dan **Sisi Ibu** bila penjelasan per sisi memang interaktif; empat fungsi utama; catatan pemantauan |

Di layar sempit, semua materi mengalir satu kolom. Visual tampil sebelum rincian fungsi. Daftar fungsi menggunakan baris editorial sederhana dan ikon Lucide kecil, bukan tumpukan kartu bersarang.

## Inventaris ilustrasi

Empat aset internal digunakan di dalam materi tanpa membuat halaman sesak. Tiga menjadi ilustrasi utama tab; satu berupa diagram lima contoh insersi tali pusat. Folder S-06c juga memiliki `Thumbnail.webp` untuk cover/preview katalog, yang terpisah dari empat ilustrasi dalam layar.

| No. | Nama aset keluaran | Rasio | Letak | Isi visual |
| ---: | --- | --- | --- | --- |
| 1 | `ketuban.webp` | 4:3 | Bagian atas tab Ketuban | Potongan rahim sederhana, janin, kantung amnion, dan ruang cairan ketuban |
| 2 | `tali-pusat.webp` | 4:3 | Bagian atas tab Tali Pusat | Janin terhubung ke plasenta; potongan penampang tali pusat menampilkan tiga pembuluh dan lapisan pelindung |
| 3 | `permukaan-plasenta.webp` | 4:3 | Bagian atas tab Plasenta | Tampilan perbandingan sisi janin yang licin dengan cabang pembuluh dan sisi ibu yang berlobus |
| 4 | `insersi-tali-pusat.webp` | 16:9 | Subbagian “Posisi insersi” | Lima diagram kecil dengan titik insersi berbeda: sentralis, parasentralis, lateralis, marginalis, velamentosa |

Gambar utama berfungsi menjelaskan struktur, bukan menunjukkan kondisi kesehatan pribadi pengguna. Ilustrasi insersi bersifat skematis. Jangan menambahkan tulisan, garis penunjuk, angka, ambang klinis, atau simbol diagnosis ke dalam gambar; informasi tersebut dibuat sebagai layer teks di aplikasi.

## Prompt generasi gambar

### Prompt gaya global

Tempelkan prompt ini di awal keempat prompt agar satu keluarga visual konsisten:

```text
Flat 2D educational medical vector illustration matching the existing SIAGA Bunda pregnancy illustrations: warm solid cream background #FFFDEC, muted sage green, soft coral, dusty pink, and restrained terracotta outlines; friendly maternal health education, simple rounded organic shapes, clean composition, subtle flat color variation only, generous clear space, centered subject, high legibility at mobile size. Medically informed simplified diagram, calm and reassuring. No text, no letters, no numbers, no labels, no watermark, no UI, no border, no photorealism, no 3D, no gradients, no drop shadows. Landscape 4:3 composition.
```

### 1. Ketuban

```text
[PROMPT GAYA GLOBAL]
Show a simplified side cross-section of a pregnant uterus with one curled fetus inside an intact amniotic sac. Make the amniotic membrane and clear fluid envelope visibly surround the fetus as a protective space. Keep the uterus shape anatomically plausible but simplified, with the fluid boundary clearly distinguishable from the uterine wall. Place the illustration centrally with generous cream margins. No arrows or text. Landscape 4:3.
```

### 2. Tali Pusat

```text
[PROMPT GAYA GLOBAL]
Show a fetus connected to a placenta by a naturally curved, gently coiled umbilical cord. Add one clear circular inset beside the cord showing a cross-section with exactly three vessel openings, two matching vessels and one distinct vessel, all surrounded by a soft gelatinous Wharton's jelly layer. Use muted coral and sage only to distinguish the vessel groups; do not imply blood-flow direction. Keep the cord and inset large enough to read on a phone. No labels, no arrows, no text. Landscape 4:3.
```

### 3. Permukaan Plasenta

```text
[PROMPT GAYA GLOBAL]
Create a side-by-side educational comparison of the two faces of one placenta, with a clear visual split and equal scale. Left half: smooth pale fetal surface covered by a translucent amnion, with branching vessels visible and the umbilical cord entering the surface. Right half: deep coral maternal surface divided into rounded lobes (cotyledons), attached toward a simplified uterine wall. Keep both views recognizably the same placenta, accurate in relationship, and free of detached extra cords. No labels, no arrows, no text. Landscape 4:3.
```

### 4. Posisi Insersi Tali Pusat

```text
[PROMPT GAYA GLOBAL, ubah rasio ke landscape 16:9]
Create a clean five-panel educational diagram in one horizontal row. Each panel shows the same simple round placenta seen from above and one umbilical cord insertion point only: center, near-center, side, edge, and vessels traveling through the membranes before reaching the placenta. Preserve equal panel sizes and consistent viewpoint. The fifth velamentous example must clearly show the vessels running within the membrane before entering the placental disk. Use only soft sage, coral, pink, and terracotta. Leave a small blank caption area under each diagram. No text, no letters, no numbers, no arrows, no decorative symbols. Wide 16:9 composition.
```

Prompt insersi sebaiknya menghasilkan satu file berpanel lima; nama jenis insersi ditempelkan sebagai teks terpisah di bawah setiap panel pada UI. Jangan meminta model menggambar label karena kualitas ejaan dan penempatan tulisan pada gambar sulit dijaga.

## Penempatan aset dan layout per tab

### Tab Ketuban

1. Ringkasan: **Cairan di sekitar janin membantu memberi ruang gerak dan perlindungan selama kehamilan.**
2. Aset `ketuban.webp`, lebar area isi penuh, rasio 4:3, radius sekitar 20 px.
3. Fakta ringkas dari sumber, misalnya warna dan perubahan volume; jangan meramal nilai personal.
4. Lima baris fungsi: proteksi, ruang gerak, mencegah perlekatan, regulasi suhu, dan kaitan dengan proses persalinan.
5. Bagian pemantauan yang menekankan konsultasi jika ada cairan merembes, dengan wording yang dikaji tenaga kesehatan.

### Tab Tali Pusat

1. Ringkasan penghubung janin dan plasenta.
2. Aset `tali-pusat.webp` di bagian atas.
3. Dua fakta inti: sekitar 55 cm dan dilindungi jeli Wharton, sesuai sumber.
4. Penjelasan dua arteri dan satu vena sebagai tiga baris dengan label di luar gambar.
5. Judul **Posisi insersi** dan aset lima panel `insersi-tali-pusat.webp`; nama tiap tipe dibuat sebagai teks aplikasi.

### Tab Plasenta

1. Ringkasan pertukaran nutrisi, gas, dan zat sisa.
2. Aset `permukaan-plasenta.webp` di atas.
3. Pilihan **Sisi Janin** dan **Sisi Ibu** dapat mengarahkan fokus ke masing-masing separuh gambar; jangan membuat gambar baru untuk keadaan terpilih.
4. Empat baris fungsi: nutrisi/respirasi, imunitas/barier, produksi hormon, sirkulasi.
5. Fakta bentuk dan waktu perkembangan ditampilkan hanya setelah angka final diverifikasi.

## Spesifikasi aset untuk tahap generasi

- Simpan master sebagai PNG selama review; setelah disetujui, ekspor versi WebP untuk `app/public/s-06/s-06c/`.
- Nama berkas target: `ketuban.webp`, `tali-pusat.webp`, `permukaan-plasenta.webp`, dan `insersi-tali-pusat.webp`.
- Background cream harus menyatu dengan bidang ilustrasi `#FFFDEC`, seperti kelima gambar S-06a.
- Target gambar utama 4:3 dan diagram insersi 16:9. Sisakan objek penting di area tengah agar dapat ditampilkan pada layar selebar 320–480 px.
- Gunakan satu palet dan satu ketebalan kontur untuk keempat gambar. Jangan mencampur render 3D atau foto dengan ilustrasi vektor S-06a/S-06b.
- Alt text ditulis sebagai konten aplikasi yang menjelaskan fungsi visual, bukan digambar ke dalam gambar.
- Semua istilah dan indikasi klinis yang menjadi label atau narasi overlay tetap harus ditinjau pakar.

## Pemeriksaan sebelum implementasi

1. Tinjau anatomi dan hubungan antarbagiannya bersama sumber yang disetujui; ilustrasi AI adalah aset visual, bukan sumber klinis.
2. Pastikan tiga panel tab serta diagram insersi terbaca pada frame 360 × 800.
3. Pastikan sisi janin dan sisi ibu tidak tertukar pada label UI.
4. Pastikan gambar insersi velamentosa berbeda jelas tanpa membuat lima model plasenta yang tampak sebagai lima organ berbeda.
5. Pertahankan pola header sage dan ruang antara header dengan sheet seperti S-06a yang sekarang.
6. Gunakan transisi tab ringan tanpa gerakan otomatis; seluruh isi tetap dapat diakses melalui gulir dan pembaca layar.

## Status berikutnya

- Layout dan prompt ditetapkan dalam dokumen ini.
- Keempat ilustrasi sudah tersedia di `app/public/s-06/s-06c/`, ditinjau secara visual terhadap brief, dan dikonversi ke WebP. Rasio hasil: 4:3 untuk tiga ilustrasi tab dan 16:9 untuk diagram insersi.
- Satu layar bertab telah diimplementasikan di `app/src/features/edukasi/PlasentaKetubanScreen.tsx` dan dihubungkan dari katalog oleh `EdukasiPage.tsx`.
- Data klinis, angka, dan red flag perlu disahkan sebelum konten dianggap siap produksi.
