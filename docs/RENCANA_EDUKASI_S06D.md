# Rencana Layar Edukasi S-06d

**Status:** perencanaan layout diperbarui berdasarkan aset yang telah disediakan; screen belum diimplementasikan.

**Screen ID:** S-06d, Perubahan Fisiologi Kehamilan.

**Sumber isi:** `docs/EKSTRAK_EDUKASI_LOVABLE.md` bagian 4 dan `docs/KONTEN_EDUKASI.md` topik 4. Tujuan mengikuti `docs/SiKiBa_Spesifikasi_Storyboard_Prototype.md` Bagian V, yang meminta edukasi per sistem organ dengan ilustrasi interaktif.

## Arah yang direkomendasikan

Jadikan S-06d sebagai **indeks perubahan tubuh dengan pencarian dan 11 baris sistem yang dapat dibuka satu per satu**. `Thumbnail.webp` memberi konteks umum pada bagian pengantar. Setiap baris memakai ilustrasi sistem tubuh yang sesuai; saat dibuka, ilustrasi membesar dan informasi berubah menjadi uraian serta tips.

Sebelas ilustrasi khusus sekarang tersedia di `app/public/s-06/s-06d/`. Aset dipakai sesuai sistem yang digambarkan; gambar berfungsi sebagai materi visual, bukan sumber fakta klinis. Jangan tambahkan label anatomi atau klaim yang tidak disetujui pakar.

### Hasil yang diharapkan

- Pengguna dapat menemukan salah satu dari 11 sistem melalui judul atau kata kunci keluhan.
- Setiap sistem menunjukkan perubahan tubuh dan penjelasan singkat; tips hanya muncul jika tersedia dari materi sumber.
- Pengguna memahami bahwa S-06d menjelaskan adaptasi fisiologis, bukan memberi diagnosis atau menetapkan tingkat risiko.
- Tanda kewaspadaan yang terkait mengarah ke S-06e atau skrining S-03c tanpa menggandakan alur triase.

## Hierarki layar

1. App bar detail dengan tombol kembali ke katalog S-06.
2. Header sage berisi judul **Perubahan tubuh**, pengantar singkat, dan ilustrasi Bunda.
3. Sheet materi dengan deskripsi bahwa tubuh menyesuaikan diri selama kehamilan.
4. Kolom pencarian **Cari perubahan tubuh**.
5. Jumlah hasil pencarian saat kata kunci digunakan.
6. Daftar 11 topik akordeon. Maksimal satu topik terbuka dalam satu waktu.
7. Dalam topik terbuka: label sistem, perubahan utama, penjelasan dari sumber, dan tips bila tersedia.
8. Catatan singkat bahwa keluhan berat atau memburuk perlu dibahas dengan bidan atau dokter.
9. Bagian sumber materi yang dapat dibuka.

## Sketsa alur layout

```text
┌──────────────────────────────────┐
│ [Kembali]      Perubahan tubuh    │
│                                  │
│ Tubuh Bunda beradaptasi selama    │
│ kehamilan untuk mendukung janin.  │
│                  [Thumbnail]      │
└────────── header sage ────────────┘
             jarak seperti S-06a
┌────────── sheet materi ───────────┐
│ Cari perubahan tubuh              │
│ 11 sistem                          │
│                                  │
│ [gambar] Rahim dan area intim   v │
│ [gambar] Jantung dan pembuluh   > │
│ [gambar] Darah Bunda            > │
│ [gambar] Paru-paru              > │
│ [gambar] Sistem pencernaan      > │
│ [gambar] Ginjal dan kandung ... > │
│ [gambar] Metabolisme dan tiroid > │
│ [gambar] Payudara               > │
│ [gambar] Otot, tulang, dan sendi> │
│ [gambar] Kulit dan rambut       > │
│ [gambar] Sistem imun            > │
│                                  │
│ Jika keluhan berat atau memburuk, │
│ konsultasikan dengan tenaga       │
│ kesehatan.                       │
│                                  │
│ Sumber materi                     │
└──────────────────────────────────┘
       navigasi aplikasi tetap
```

Saat baris dibuka, ringkasan perubahan muncul di bawah judul baris yang sama, dilanjutkan tips jika tersedia. Hindari menempatkan setiap baris ke dalam kartu besar tersendiri; daftar putih dengan pemisah lembut lebih hemat ruang dan mudah dipindai.

## Daftar 11 sistem dan ilustrasi

Satu aset thumbnail dipakai untuk hero/katalog. Sebelas aset sistem dipakai sebagai gambar pada baris tertutup dan diperbesar ketika detail sistem dibuka.

| Urutan | Sistem/topik layar | Aset | Isi yang dibuka |
| ---: | --- | --- | --- |
| 1 | Rahim dan area intim | `Rahim.webp` | Uterus, serviks, vagina/perineum, vulva, ovarium; perubahan vaskularisasi dan sekresi dari topik 4 PDF |
| 2 | Jantung dan pembuluh darah | `Jantung.webp` | Volume darah, denyut jantung, perubahan tekanan, dan posisi terlentang dari topik 4 PDF |
| 3 | Darah Bunda | `Darah.webp` | Peningkatan plasma dan sel darah merah serta hemodilusi fisiologis menurut usia kehamilan dari topik 4 PDF |
| 4 | Paru-paru | `Paru-paru.webp` | Perubahan posisi diafragma, kebutuhan oksigen, dan ventilasi dari topik 4 PDF |
| 5 | Sistem pencernaan | `Lambung.webp` | Perubahan gerak usus, lambung, dan konstipasi dari topik 4 PDF |
| 6 | Ginjal dan kandung kemih | `Ginjal.webp` | Aliran plasma ginjal, GFR, ureter, kandung kemih, dan frekuensi berkemih dari topik 4 PDF |
| 7 | Metabolisme dan tiroid | `Tiroid.webp` | Subbagian tiroid serta metabolisme glukosa dan lipid dari topik 4 PDF |
| 8 | Payudara dan persiapan ASI | `Payudara.webp` | Mammogenesis, laktogenesis awal, perubahan areola, dan kolostrum dari topik 4 PDF |
| 9 | Otot, tulang, dan sendi | `Tulang.webp` | Relaksin, sendi panggul, lordosis, dan nyeri punggung dari topik 4 PDF |
| 10 | Kulit dan rambut | `Kulit.webp` | Hiperpigmentasi, melasma, striae, eritema palmar, linea nigra, spider telangiectases dari topik 4 PDF |
| 11 | Sistem imun | `Imun.webp` | Adaptasi sistem imun dan perubahan risiko infeksi dari topik 4 PDF |

Thumbnail pengantar/katalog: `Thumbnail.webp`. Semua aset berada di `app/public/s-06/s-06d/`. Urutan mengikuti ekstraksi prototype; bagian tubuh tambahan pada satu baris dijelaskan dengan subjudul dalam panel, bukan menambah sistem baru.

## Konten saat akordeon terbuka

Susunan isi yang disarankan:

1. **Yang berubah:** satu kalimat pengantar dari materi sumber.
2. **Penjelasan:** ringkas, bahasa awam, mempertahankan istilah penting dengan definisi bila perlu.
3. **Tips:** tampilkan hanya bila materi sumber menyediakannya dan dapat dipertanggungjawabkan.
4. **Perlu diperiksa:** tampilkan tautan ke S-06e atau S-03c hanya bila gejala/tanda bahaya memang relevan dan sudah diselaraskan dengan aturan skrining.

Contoh untuk panel Sistem Pencernaan:

```text
Sistem pencernaan
Hormon dan pembesaran rahim dapat memengaruhi gerak usus serta posisi organ pencernaan.

Yang mungkin Bunda rasakan
Konstipasi atau rasa penuh di perut.

Tips dari materi
Lihat panduan Keluhan Umum untuk cara mengatasi konstipasi.
```

Contoh ini adalah placeholder struktur, bukan naskah klinis final. Isi masing-masing sistem harus ditulis dari sumber yang ditinjau, bukan dihasilkan dari ikon atau asumsi visual.

## Interaksi dan pencarian

- Kolom pencarian memfilter judul sistem dan sinonim keluhan yang didefinisikan pada data konten, misalnya “sembelit”, “sering berkemih”, atau “gusi”.
- Pencarian hanya membantu menemukan materi. S-06d tidak menyebut hasilnya normal/patologis, tidak memberi skor, dan tidak menilai diagnosis.
- Daftar awal menampilkan seluruh 11 sistem. Membuka satu topik menutup topik sebelumnya agar tidak membuat layar terlalu panjang.
- Hasil kosong menggunakan teks: **Topik belum ditemukan. Coba kata lain.**
- Tombol akordeon memiliki `aria-expanded`, area tekan minimal 44 px, indikator buka/tutup, dan dapat digunakan dengan keyboard.
- Tombol kembali mengarah ke katalog S-06 dan memulihkan posisi scroll sebelumnya.
- Jika bagian Perlu diperiksa merujuk tanda bahaya, tautannya membawa pengguna ke edukasi S-06e; skrining interaktif tetap di S-03c.

## Aset yang tersedia dan pemeriksaan visual

Folder `app/public/s-06/s-06d/` berisi satu thumbnail kolase dan 11 ilustrasi sistem tubuh; seluruhnya telah dikonversi ke WebP. Nama stem aset mempertahankan nama sumber agar mudah dicocokkan.

| Aset | Penggunaan | Hasil tinjauan visual |
| --- | --- | --- |
| `Thumbnail.webp` | Hero pengantar dan tile katalog S-06d | Kolase Bunda dan beberapa sistem tubuh; gunakan sebagai pembuka, bukan sebagai gambar detail sistem |
| `Rahim.webp` | Rahim dan area intim | Ilustrasi uterus sederhana dan jelas |
| `Jantung.webp` | Jantung dan pembuluh darah | Simbol jantung coral, mudah dikenali |
| `Darah.webp` | Darah Bunda | Tetes darah sederhana |
| `Paru-paru.webp` | Paru-paru | Ilustrasi paru dan saluran napas |
| `Lambung.webp` | Sistem pencernaan | Ilustrasi lambung sederhana |
| `Ginjal.webp` | Ginjal dan kandung kemih | Ilustrasi ginjal berpasangan; kandung kemih dijelaskan dengan teks |
| `Tiroid.webp` | Metabolisme dan tiroid | Ilustrasi kelenjar tiroid di area leher |
| `Payudara.webp` | Payudara dan persiapan ASI | Diagram payudara lebih rinci daripada simbol organ lain; tampilkan pada detail terbuka |
| `Tulang.webp` | Otot, tulang, dan sendi | Tulang berwarna sangat pucat; uji keterbacaan di latar aplikasi sebelum desain dikunci |
| `Kulit.webp` | Kulit dan rambut | Potongan kulit rinci; gunakan gambar lebih besar pada detail, tidak hanya thumbnail kecil |
| `Imun.webp` | Sistem imun | Simbol perisai dan medis, palet sesuai namun bergaya lebih sederhana |

### Konsistensi gaya

Seluruh aset memakai latar krem dengan warna coral/pink dan beberapa aksen sage. Tingkat perinciannya bervariasi: `Darah.webp` serta `Imun.webp` berupa simbol sederhana, sedangkan `Kulit.webp` dan `Payudara.webp` berupa diagram berlapis. Pada UI, thumbnail dibuat kecil dan konsisten ukurannya; gambar diperbesar saat panel terbuka. Pastikan `Tulang.webp` cukup kontras. Tidak perlu mencari aset eksternal atau membuat gambar tambahan untuk versi awal.

### Interaksi gambar

- Setiap baris sistem menampilkan ilustrasi kecil yang sesuai.
- Saat baris dibuka, ilustrasi sistem yang sama diperbesar di bagian isi.
- Gambar bukan peta diagnosis dan tidak diberi hotspot yang menyiratkan lokasi atau risiko klinis tertentu.
- Alt text menjelaskan apa yang ditampilkan, misalnya “Ilustrasi ginjal” atau “Lapisan kulit”.

## Batas konten klinis

- KONTEN_EDUKASI topik 4 memiliki uraian untuk sebelas sistem; EKSTRAK_EDUKASI mencatat ringkasan prototype untuk setiap topik.
- Angka, dosis, ambang, dan klaim pada PDF/prototype adalah bahan sumber, bukan otomatis standar klinis yang tervalidasi. Jangan tampilkan angka kuantitatif tanpa rujukan dan persetujuan pakar.
- Hindari menyatakan semua perubahan pasti normal atau akan hilang setelah melahirkan. Jelaskan sebagai perubahan yang dapat terjadi sesuai sumber.
- Jangan salin label “Terverifikasi Bidan/Ahli” dari prototype kecuali proses verifikasi SIAGA Bunda benar-benar dilakukan.
- S-06d adalah edukasi fisiologi. Klasifikasi keluhan dan triase tetap dipisah ke S-06g dan S-03c.

## Checklist sebelum mockup/implementasi

- [ ] Urutan 11 sistem dan judulnya disetujui.
- [ ] Sumber untuk setiap penjelasan dan tips dapat ditelusuri.
- [ ] Setiap angka atau klaim berambang telah ditinjau pakar.
- [ ] Thumbnail dan ilustrasi tiap sistem terbaca jelas pada ukuran kecil dan besar; kontras `Tulang.webp` telah diperiksa.
- [ ] Pencarian tidak memberi kesan bahwa layar melakukan diagnosis.
- [ ] Ukuran 360 × 800, 320 px, dan pembesaran teks tetap dapat dibaca tanpa overflow.
- [ ] Kondisi hasil pencarian kosong, panel terbuka, dan navigasi kembali dirancang.

## Status berikutnya

- Layout dan inventaris seluruh aset S-06d sudah diperbarui berdasarkan berkas yang tersedia.
- Dua belas PNG sumber sudah dikonversi menjadi WebP; tidak perlu generasi atau pencarian aset tambahan untuk versi awal.
- Naskah fisiologi dan tips perlu ditata serta ditinjau tenaga kesehatan.
- Setelah isi dan ilustrasi ditinjau, implementasikan dalam `FisiologiScreen.tsx` dan sambungkan ke katalog S-06.
