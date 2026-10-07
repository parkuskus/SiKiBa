# Rencana Desain Edukasi S-06 dan S-06a

**Status:** usulan perencanaan untuk ditinjau pengguna, belum menjadi desain terkunci.

**Tanggal:** 7 Oktober 2026.

## 1. Arah yang direkomendasikan

**S-06 menjadi katalog visual delapan topik. S-06a menjadi cerita bergambar lima tahap, dilanjutkan bacaan pendukung dan video.**

Ibu dapat memahami alur kehamilan dari gambar dan penjelasan singkat terlebih dahulu. Materi tambahan tetap mudah ditemukan saat ibu ingin membaca lebih jauh. Ilustrasi menjelaskan isi materi, bukan sekadar menghias kartu.

Pengguna telah menyerahkan rekomendasi cara membaca kepada perancang. Usulan ini menggunakan pendekatan Impeccable `shape`: tujuan pembaca, hierarki informasi, komposisi, perilaku, kondisi penggunaan, dan kesiapan aset diselesaikan sebelum mockup.

### Sumber yang menentukan isi

1. [Spesifikasi storyboard](SiKiBa_Spesifikasi_Storyboard_Prototype.md), Bagian V dan IX, menentukan tujuan serta cakupan S-06 dan S-06a.
2. [Ekstraksi edukasi prototype](EKSTRAK_EDUKASI_LOVABLE.md), bagian Fertilisasi, menjadi dasar alur lima tahap.
3. [Materi edukasi PDF](KONTEN_EDUKASI.md), topik 1, memberikan tautan video fertilisasi. Untuk topik ini PDF belum memberikan uraian artikel tambahan.
4. [DESIGN.md](DESIGN.md) dan aset brand menentukan bahasa visual SIAGA Bunda.
5. Lima ilustrasi tersedia di `app/public/s-06/s-06a/`.

**Mode penggunaan:** S-06 berfokus pada menemukan materi; S-06a berfokus pada memahami bacaan. Pengguna utama adalah ibu hamil yang membaca melalui ponsel, dengan waktu dan kualitas koneksi yang bervariasi.

**Hasil yang ingin dicapai:** pengguna mengenali hubungan ovulasi, perjalanan sperma, pembuahan, pembelahan zigot, dan implantasi; dapat membaca ulang tahap tertentu; serta menemukan video dan langkah konfirmasi kehamilan.

## 2. Referensi layout yang diperiksa

| Referensi | Pola yang berguna | Penerapan untuk SIAGA Bunda |
| --- | --- | --- |
| Heally Medical App UI Kit, [gambar lokal](../assets/design-reference/image%20copy%203.png) | Header berwarna, konten putih, navigasi sederhana, dan tile kategori yang mudah dipindai | Struktur S-06 dan hubungan visualnya dengan layar aplikasi lain |
| [HalloBumil](https://hallobumil.com/), [contoh layar resmi](https://hallobumil.com/images/branda/hero/phone-new.webp) | Ilustrasi menjadi fokus, konten putih bertumpuk di bawahnya, dan bahasa yang dekat dengan ibu | Kehangatan dan hierarki gambar di S-06a, diterjemahkan ke palet serta copy SIAGA Bunda |
| [Pregnancy+](https://philips-digital.com/pregnancy-new/), [contoh layar resmi](https://philips-digital.com/wp-content/uploads/2018/08/img-2-en.jpg) | Pemilih posisi di atas satu bidang gambar besar | Pemilih lima tahap dan satu ilustrasi aktif pada S-06a |
| [Flo Health Library](https://flo.health/pregnancy) dan [Flo Pregnancy](https://flo.health/product-tour/pregnancy-app) | Materi dikelompokkan berdasarkan kebutuhan pembaca, dengan informasi lanjutan yang terpisah dari visual utama | Katalog topik S-06 serta pemisahan cerita utama, tanda awal, dan video S-06a |

Referensi eksternal di atas adalah halaman publik dan gambar promosi resmi yang diperiksa. Contoh Pregnancy+ berasal dari aset promosi lama; acuan yang diambil adalah pola navigasinya. Materi medis tetap mengikuti dokumen proyek, bukan copy pemasaran referensi.

### Tiga susunan yang dipertimbangkan

#### A. Daftar bab yang dapat dibuka

```text
Judul dan pengantar
Ovulasi                       v
  gambar dan penjelasan
Perjalanan sperma             >
Fertilisasi                   >
Pembelahan zigot              >
Implantasi                    >
Video dan materi pendukung
```

Kuat untuk mencari ulang bab tertentu. Ilustrasi berikutnya tersembunyi sampai bab dibuka, sehingga hubungan lima tahap kurang terasa pada pembacaan pertama.

#### B. Alur vertikal bergambar

```text
Judul dan ringkasan alur
Gambar ovulasi dan penjelasan
Gambar perjalanan sperma dan penjelasan
Gambar fertilisasi dan penjelasan
Gambar pembelahan dan penjelasan
Gambar implantasi dan penjelasan
Video dan materi pendukung
```

Kuat untuk membaca semua tahap tanpa berpindah pilihan. Lima gambar besar membuat halaman panjang; bila gambar diperkecil, detail biologisnya justru sulit dilihat.

#### C. Cerita per tahap dan bacaan pendukung — rekomendasi

```text
Judul dan pengantar singkat
Pemilih tahap 1 2 3 4 5
Nama tahap yang sedang dibaca
Satu ilustrasi besar
Penjelasan singkat
Sebelumnya        Berikutnya
Tanda awal
Langkah konfirmasi
Video dan sumber
```

Kuat untuk pemahaman pertama: satu gambar menjelaskan satu kejadian. Seluruh tahap dapat dipilih langsung, sementara bacaan pendukung tetap tersedia lewat gulir vertikal. Ini memanfaatkan lima ilustrasi WebP yang tersedia tanpa menumpuk lima gambar penuh dalam satu halaman.

## 3. Bahasa visual

- Kanvas tetap krem `#FFFCF6`.
- Header menggunakan sage gelap `#4A6E54` dengan teks putih.
- Sheet konten putih mempunyai sudut atas membulat 32 px; panggung header mempertahankan karakter sudut bawah membulat aplikasi.
- Pink lembut menjadi aksen pada ilustrasi dan permukaan pendukung. Teks utama memakai `#1D2B29`, teks isi `#33443F`.
- Satu keluarga huruf Plus Jakarta Sans. Judul 24–28 px, subjudul 18 px, isi bacaan 15–16 px dengan jarak baris yang lega, dan keterangan minimal 12 px.
- Jarak tepi awal 20 px. Pemisah antarbab sekitar 24–32 px; judul dan penjelasan yang berhubungan dibuat lebih rapat.
- Materi berada pada satu sheet utama. Bacaan tidak dibungkus menjadi banyak kartu bertingkat.
- Ilustrasi anatomi flat digunakan pada tahap fertilisasi. Ilustrasi Bunda menjadi aksen kecil pada indeks, tidak mengganggu diagram.

**Catatan acuan:** beberapa bagian `DESIGN.md` masih menyebut header pink, sementara aturan kontras dan pola komponennya menggunakan sage gelap. Usulan ini mengikuti header sage gelap yang sudah digunakan aplikasi dan aturan teks putih pada `primary-dark`. Warna serta komponen akan dicocokkan dengan canvas Figma sebelum penguncian desain.

## 4. S-06 — Menu Edukasi

### Tujuan dan hierarki

Pengguna segera memahami bahwa halaman ini berisi materi belajar dan dapat memilih salah satu dari delapan topik tanpa terlebih dahulu membuka filter.

1. Header **Belajar** dan pengantar singkat.
2. Ilustrasi Bunda kecil di kanan header.
3. Sheet dengan judul **Materi Kehamilan**.
4. Katalog dua kolom dengan delapan topik sesuai urutan storyboard.
5. Bottom navigation, dengan Edukasi aktif.

### Sketsa susunan

```text
┌──────────────────────────────────┐
│ Belajar                 [Siba]   │
│ Kenali kehamilan dan             │
│ persiapkan diri       [Bunda]    │
│                                  │
├────── sheet putih membulat ──────┤
│ Materi Kehamilan                 │
│                                  │
│ [gambar]          [gambar]       │
│ Awal Kehamilan    Perkembangan   │
│                  Janin          │
│                                  │
│ [gambar]          [gambar]       │
│ Plasenta          Perubahan      │
│                  Tubuh          │
│                                  │
│ [gambar]          [gambar]       │
│ Tanda Bahaya      Emosi Bunda    │
│                                  │
│ [gambar]          [gambar]       │
│ Keluhan Umum      Persiapan      │
│                  Persalinan     │
│                                  │
├──────────────────────────────────┤
│ Beranda Skrining Edukasi ...     │
└──────────────────────────────────┘
```

### Rencana tiap tile

| Urutan | Label pendek | Keterangan singkat | Tujuan |
| ---: | --- | --- | --- |
| 1 | Awal Kehamilan | Dari sel telur hingga implantasi | S-06a |
| 2 | Perkembangan Janin | Pertumbuhan dari minggu ke minggu | S-06b |
| 3 | Plasenta | Tali pusat dan ketuban | S-06c |
| 4 | Perubahan Tubuh | Adaptasi tubuh selama hamil | S-06d |
| 5 | Tanda Bahaya | Gejala yang perlu diperiksa | S-06e |
| 6 | Emosi Bunda | Perasaan di setiap trimester | S-06f |
| 7 | Keluhan Umum | Penyebab dan cara mengatasi | S-06g |
| 8 | Persiapan Persalinan | Rencana persalinan dan P4K | S-06h |

- Pada frame 360 px, lebar isi sekitar 320 px; setiap tile sekitar 154 px dengan celah 12 px.
- Bidang gambar sekitar 80 px tinggi. Label ditempatkan di bawahnya dan dapat mengambil dua baris. Keterangan memakai maksimal dua baris pendek tanpa pemotongan informasi penting.
- Seluruh tile merupakan area sentuh. Judul, gambar, dan keterangan mengarah ke tujuan yang sama.
- Susunan delapan topik tetap. Materi tanda bahaya tidak menggunakan badge hasil skrining atau status kondisi ibu.
- Jika isi membesar karena ukuran teks perangkat, tile bertambah tinggi; pada layar sempit dengan pembesaran teks tinggi, katalog beralih menjadi satu kolom.

### Penempatan ilustrasi S-06

| Area | Rencana ilustrasi | Ketersediaan dan perlakuan |
| --- | --- | --- |
| Kanan header | Bunda dengan buku, sekitar 90–100 px | `app/public/illu/illu-08-diary.png` sudah tersedia; hanya aksen pendamping judul |
| Tile Awal Kehamilan | Pertemuan sel telur dan sperma | Gunakan `s-06a/3-Fertilisasi.webp` sebagai thumbnail; objek biologis tetap terlihat utuh |
| Tile Perkembangan Janin | Siluet janin netral | Perlu cover tanpa angka minggu; `illu-03-janin.png` memuat teks 28 weeks sehingga bukan cover umum yang sesuai |
| Tile Plasenta | Plasenta, tali pusat, dan kantung ketuban | Rencana cover flat dengan objek yang saling terhubung |
| Tile Perubahan Tubuh | Bunda hamil dan penanda perubahan tubuh | Rencana cover sederhana tanpa banyak organ kecil |
| Tile Tanda Bahaya | Buku KIA dan simbol perhatian | Rencana cover edukasi, tidak menyerupai hasil darurat pengguna |
| Tile Emosi Bunda | Wajah Bunda dan hati | Rencana cover dukungan emosi |
| Tile Keluhan Umum | Bunda beristirahat | Rencana cover keluhan ringan dan kenyamanan |
| Tile Persiapan Persalinan | Tas bersalin dan perlengkapan bayi | Rencana cover persiapan praktis |

Folder `s-06b/`, `s-06c/`, dan `s-06d/` telah tersedia tetapi masih kosong saat pemeriksaan. Tujuh cover selain fertilisasi dicatat sebagai kebutuhan aset, bukan gambar yang sudah selesai. Pada wireframe Figma, slot tersebut dapat memakai ikon penanda sementara dari keluarga ikon yang sama.

### Navigasi dan akses Siba

- Bottom navigation S-06 mengikuti aplikasi dengan Edukasi aktif.
- Usulan untuk halaman katalog adalah akses Siba melalui tombol 44 px di header, memakai sheet chatbot yang sama. Ini menjaga tile dari tertutup tombol mengambang.
- Pemindahan tombol Siba ini merupakan keputusan layout lokal yang perlu disetujui bersama mockup; perilaku chatbot tetap mengikuti aplikasi.
- Kembali dari S-06a memulihkan posisi gulir S-06 sehingga pengguna tidak harus mencari ulang topik.

## 5. S-06a — Terjadinya Kehamilan

### Tujuan dan hierarki

Satu layar detail terdiri atas cerita visual utama dan bacaan pendukung di bawahnya.

1. App bar dengan Kembali, label **Fertilisasi**, dan Bagikan.
2. Judul **Terjadinya Kehamilan** dan satu kalimat pengantar.
3. Sheet cerita dengan lima pilihan tahap.
4. Nama tahap, ilustrasi utama, keterangan gambar, serta penjelasan singkat.
5. Tombol **Sebelumnya** dan **Berikutnya**.
6. Bagian **Tanda Awal**.
7. Bagian **Langkah Selanjutnya** tentang konfirmasi kehamilan.
8. Bagian **Video Fertilisasi**.
9. Bagian **Sumber Materi** dan tautan **Perkembangan Janin** ke S-06b.

### Sketsa susunan

```text
┌──────────────────────────────────┐
│ [Kembali] Fertilisasi [Bagikan]   │
│                                  │
│ Terjadinya Kehamilan             │
│ Kenali perjalanan sel telur      │
│ hingga awal kehamilan.           │
│                                  │
├────── sheet putih membulat ──────┤
│ [1]    [2]    [3]    [4]    [5]  │
│                                  │
│ Ovulasi                          │
│                                  │
│       [ilustrasi tahap 1]         │
│       dalam bidang krem          │
│                                  │
│ Sel telur dilepaskan dari         │
│ ovarium dan bergerak ke           │
│ tuba falopi.                     │
│                                  │
│ [Sebelumnya]       [Berikutnya]   │
│                                  │
│ Tanda Awal                       │
│ ...                              │
│                                  │
│ Langkah Selanjutnya              │
│ ...                              │
│                                  │
│ Video Fertilisasi                │
│ [poster video 16 banding 9]       │
│ [Tonton Video]                   │
│                                  │
│ Sumber Materi                    │
│ [Perkembangan Janin]             │
└──────────────────────────────────┘
```

### Bidang tampilan utama

- Acuan awal adalah frame 360 × 800 dan 390 × 844, dengan pemeriksaan tambahan pada lebar 320 px dan 480 px.
- Header ringkas sekitar 150–175 px, lalu sheet menumpuk sedikit ke atas header. Judul cukup dua baris bila diperlukan.
- Pemilih tahap memakai lima tombol bernomor dengan area sentuh minimal 44 × 44 px. Nama lengkap tahap tampil pada judul bagian aktif dan nama aksesibilitas tombol.
- Bidang ilustrasi sekitar 200–220 px tinggi. Gambar dan penjelasan tahap pertama menjadi fokus viewport awal; video ditempatkan setelah cerita, bukan sebagai hero kedua.
- Penjelasan utama sekitar dua atau tiga kalimat. Rincian tambahan per tahap dapat ditampilkan melalui **Baca Rincian** bila naskah final memang membutuhkannya.
- Tinggi penjelasan tidak dibatasi dengan pemotongan teks. Saat ukuran huruf diperbesar, halaman tetap dapat digulir.
- S-06a diusulkan menggunakan mode detail fokus baca dengan tombol kembali yang jelas. Bottom navigation dan FAB tidak tampil pada detail, mengikuti pola detail/form yang sudah dapat digunakan shell aplikasi. S-06 tetap menjadi pintu kembali ke navigasi utama.
- Tombol tahap berada di dalam alur konten, bukan bilah tetap kedua di bawah layar.

## 6. Rencana lima ilustrasi S-06a

Seluruh nama file berikut benar-benar tersedia dan telah diperiksa secara visual.

| Tahap | File | Letak dan tujuan | Perlakuan gambar |
| --- | --- | --- | --- |
| 1. Ovulasi | [1-Ovulasi.webp](../app/public/s-06/s-06a/1-Ovulasi.webp) | Tengah bidang ilustrasi tahap pertama; memperlihatkan sel telur dilepaskan dari ovarium | Pertahankan objek ovarium dan sel telur; tidak dijadikan latar teks |
| 2. Perjalanan Sperma | [2-Perjalanan sperma.webp](../app/public/s-06/s-06a/2-Perjalanan%20sperma.webp) | Bidang ilustrasi tahap kedua; fokus pada sperma dan sel telur | Sel telur dan arah gerak sperma tetap terlihat; tidak dipotong menjadi satu objek saja |
| 3. Fertilisasi | [3-Fertilisasi.webp](../app/public/s-06/s-06a/3-Fertilisasi.webp) | Bidang ilustrasi tahap ketiga; juga menjadi thumbnail tile S-06 | Pertahankan pertemuan sperma dengan sel telur; warna kuning pada gambar tidak diubah menjadi indikator status klinis |
| 4. Pembelahan Zigot | [4-Pembelahan zigot.webp](../app/public/s-06/s-06a/4-Pembelahan%20zigot.webp) | Menggunakan hampir seluruh lebar bidang ilustrasi agar rangkaian sel terbaca | Trim area kosong di atas dan bawah pada turunan untuk tampilan; seluruh rangkaian dan panah harus tetap utuh |
| 5. Implantasi | [5-Implantasi.webp](../app/public/s-06/s-06a/5-Implantasi.webp) | Bidang ilustrasi tahap kelima, dengan keterangan **Bentuk blastokista** | Gambar yang tersedia adalah blastokista, bukan gambar penempelan pada dinding rahim; penjelasan tertulis menerangkan proses penempelannya |

Thumbnail kolase `app/public/s-06/s-06a/Thumbnail.webp` juga tersedia untuk cover/preview katalog. Thumbnail tersebut bukan pengganti lima ilustrasi tahap dan saat ini belum dipakai pada tile katalog.

### Aturan penggunaan aset

- Ilustrasi WebP mempunyai latar krem dan area kosong yang berbeda-beda. Tampilan utama memakai bidang gambar krem yang sengaja dibedakan dari sheet putih, sehingga latar gambar tidak tampak seperti kesalahan warna halaman.
- Gambar mempertahankan proporsi; objek tidak ditarik untuk memenuhi kotak.
- Pemotongan hanya mengurangi ruang kosong di sekitar objek. Anatomi, sel, dan panah tidak dipotong.
- Hindari penempatan teks di atas diagram. Judul dan keterangan berada di luar gambar.
- Keterangan gambar memakai bahasa sederhana. Gambar informatif mendapatkan deskripsi aksesibilitas, sedangkan Bunda pada header indeks bersifat dekoratif.
- Turunan untuk thumbnail atau penyesuaian ruang kosong dibuat setelah layout Figma disetujui, dengan file sumber tetap sebagai rujukan.
- Jika dibutuhkan visual penempelan implantasi yang lebih jelas, aset tambahan yang tepat adalah blastokista dan lapisan endometrium dalam satu diagram. Itu kebutuhan khusus, bukan alasan mengganti seluruh lima ilustrasi.

### Draf isi tahap untuk kebutuhan layout

Copy berikut adalah draf ringkas berbasis alur sumber, untuk mengukur kebutuhan ruang. Detail angka, istilah, dan isi klinis difinalisasi bersama penyusun materi.

| Tahap | Draf penjelasan ringkas |
| --- | --- |
| Ovulasi | Sel telur dilepaskan dari ovarium dan bergerak ke tuba falopi. Di sinilah perjalanan menuju pembuahan dimulai. |
| Perjalanan Sperma | Sperma bergerak melalui saluran reproduksi menuju sel telur. Pertemuan keduanya dapat terjadi di tuba falopi. |
| Fertilisasi | Satu sperma membuahi sel telur dan membentuk zigot. Zigot membawa materi genetik dari ibu dan ayah. |
| Pembelahan Zigot | Zigot membelah menjadi beberapa sel sambil bergerak ke rahim. Kumpulan sel ini berkembang menjadi morula dan blastokista. |
| Implantasi | Blastokista menempel pada lapisan dalam rahim. Proses penempelan ini disebut implantasi, dan hormon hCG mulai diproduksi. |

## 7. Materi pendukung di bawah cerita

### Tanda Awal

Gunakan daftar bacaan ringkas dengan ikon kecil, bukan pilihan gejala yang menyerupai skrining.

- Haid terlambat.
- Mual.
- Cepat lelah.

Tambahkan kalimat bahwa keluhan awal tidak dapat memastikan kehamilan. Flek yang ada pada prototype tidak langsung diberi label normal karena terdapat perbedaan dengan aturan tanda bahaya dalam spesifikasi. Penempatannya mengikuti hasil finalisasi materi, dan bila dibahas harus disertai arahan pemeriksaan yang sesuai.

### Langkah Selanjutnya

Satu blok singkat tentang konfirmasi kehamilan melalui tes dan pemeriksaan tenaga kesehatan. Gunakan judul umum, bukan atribusi kepada nama bidan fiktif. Label **Terverifikasi Ahli** hanya digunakan ketika peninjauan memang telah dilakukan.

### Video Fertilisasi

- Video berasal dari tautan pada materi PDF: <https://youtu.be/_5OvgQW6FG4?si=sl7BZofIK3tihY_T>.
- Slot video mempunyai rasio 16:9 dan tombol **Tonton Video**.
- Poster pada wireframe dapat memakai ilustrasi fertilisasi dengan label video; poster final mengikuti isi video yang disetujui penyusun materi.
- Pemutar dimuat setelah pengguna menekan tombol. Tidak ada pemutaran otomatis.
- Jika pemutar gagal, sediakan tindakan **Buka YouTube**.
- Saat luring, artikel dan lima ilustrasi tetap bisa dibaca, sedangkan area video menjelaskan bahwa video membutuhkan internet.

### Sumber Materi dan bacaan lanjutan

- Tampilkan sumber yang benar-benar dipakai dan identitas peninjau bila tersedia.
- Detail bibliografi dapat dibuka melalui **Lihat Sumber** agar tidak mendominasi bacaan utama.
- Akhir halaman mempunyai satu tautan utama **Perkembangan Janin** untuk melanjutkan ke S-06b.
- Bagikan berada di app bar dan membagikan judul serta tautan artikel, tanpa menyertakan data profil pengguna.

## 8. Interaksi dan kondisi penggunaan

| Kondisi | Perilaku yang direncanakan |
| --- | --- |
| Pertama membuka S-06a | Tahap Ovulasi terpilih; gambar dan teks langsung terlihat |
| Menekan nomor tahap | Gambar, judul, keterangan, dan penjelasan berubah bersama; bagian pendukung tidak berubah |
| Sebelumnya/berikutnya | Mengubah satu tahap; di tahap pertama Sebelumnya tidak aktif, di tahap terakhir Berikutnya tidak aktif |
| Membaca urutan bebas | Semua nomor tahap dapat dipilih tanpa harus menyelesaikan tahap sebelumnya |
| Tahap panjang | Rincian terbuka di bawah penjelasan, tidak melalui pop-up |
| Ukuran teks besar | Kontainer dan tile menyesuaikan tinggi; tidak ada teks yang hilang |
| Gambar tidak termuat | Nama tahap dan penjelasan tetap tersedia; bidang gambar menampilkan keterangan sederhana |
| Video luring atau gagal | Penjelasan tertulis tetap lengkap; status video dan tindakan pemulihan jelas |
| Berbagi tidak tersedia | Salin tautan sebagai tindakan alternatif dengan konfirmasi singkat |
| Kembali ke katalog | Posisi gulir katalog dipulihkan |

Pergantian tahap harus dapat dilakukan dengan tombol biasa dan keyboard. Gestur geser bukan satu-satunya cara navigasi. Jika nanti ditambahkan transisi, cukup pergantian lembut singkat pada bidang gambar dan teks, tanpa autoplay serta dengan dukungan pengurangan gerak.

## 9. Cakupan mockup Figma setelah rencana disetujui

Mockup diperlukan untuk memeriksa proporsi gambar terhadap bacaan, panjang label, dan ruang navigasi. Rencana outputnya adalah:

1. **S-06 viewport awal** serta tampilan lanjutan katalog untuk memastikan delapan topik berurutan.
2. **S-06a tahap Ovulasi** sebagai contoh viewport awal.
3. **S-06a tahap Pembelahan Zigot** sebagai contoh rasio ilustrasi paling melebar.
4. **S-06a tahap Implantasi** untuk menguji keterangan blastokista.
5. **S-06a bagian bawah** yang memperlihatkan tanda awal, langkah selanjutnya, video, sumber, dan bacaan lanjutan.
6. Kondisi video luring dan ukuran teks besar sebagai varian pemeriksaan.

Lima tahap S-06a memakai satu struktur layout dengan lima keadaan, bukan lima tujuan navigasi yang berbeda. Sebelum mockup dibuat, file Figma tujuan dan komponen yang sudah ada perlu dipastikan agar hasil mengikuti desain terkini pada canvas.

### Kriteria untuk menyetujui rancangan

- Delapan topik dapat dikenali tanpa membaca paragraf panjang dan tidak berubah urutan.
- Pengguna mengerti cara berpindah tahap tanpa bergantung pada gestur.
- Gambar ovulasi dan pembelahan tetap jelas pada ponsel kecil.
- Konten pendukung dan video dapat ditemukan lewat gulir biasa.
- Area sentuh minimal 44 px dan teks mempunyai kontras yang memadai.
- Konten tidak tertutup navigasi atau tombol mengambang.
- Label pendek, bahasa EYD, dan tanda baca UI mengikuti ketentuan proyek.
- Materi sumber, draf copy, aset tersedia, serta aset yang perlu disiapkan mempunyai status yang jelas.

## 10. Keputusan yang perlu dikonfirmasi

1. Persetujuan konsep **katalog dua kolom dan cerita bergambar per tahap**.
2. Persetujuan mode fokus baca untuk S-06a dan letak akses Siba pada S-06.
3. Pilihan file Figma tujuan untuk mockup serta penyelarasan header dengan canvas terkini.

Setelah konfirmasi, urutan kerja berikutnya adalah mockup Figma, peninjauan layout dan materi, penguncian desain, lalu implementasi.
