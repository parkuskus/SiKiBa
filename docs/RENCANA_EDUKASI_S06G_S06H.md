# Rencana Layout Edukasi S-06g dan S-06h

**Status:** S-06g dan S-06h sudah diimplementasikan sebagai layar Edukasi. Aset tersedia dalam WebP; validasi klinis sebelum publikasi masih diperlukan.

## Acuan visual dan pola FE

- Ikuti `docs/DESIGN.md` dan layar edukasi yang ada di `app/src/features/edukasi/`.
- Kanvas `#FFFCF6`; header sage gelap `#4A6E54` dengan sudut bawah 32 px; sheet materi krem/putih dengan sudut atas 32 px.
- Font Plus Jakarta Sans. Gunakan teks tinta `#1D2B29` / `#33443F`, permukaan putih, garis `#D9E7E2`, mint `#EAF4F0`, dan peach `#FFF1E8`. Pink `#FFE2E2` hanya sebagai aksen; teks putih hanya di atas sage gelap.
- Header detail mengikuti `EdukasiDetailHeader`: tombol kembali, nomor dan label, bagikan, judul, deskripsi. Sheet mengalir vertikal satu kolom pada ponsel; gambar dan kartu tidak saling bertumpuk.
- Target ponsel 320–480 px, jarak isi 20 px, radius kartu 20–24 px, sasaran sentuh minimal 44 px. Tidak membuat navigasi baru.

## S-06g — Inisiasi Menyusu Dini (IMD)

**Sumber:** `docs/materi IMD.pdf` (referensi layout dan naskah awal). Informasi edukasi perlu ditinjau tenaga kesehatan sebelum dipublikasikan.

### Tujuan dan susunan layar

Satu halaman artikel yang dapat digulir, dengan pengertian dan dukungan praktis sebagai fokus. Gunakan judul **IMD: Langkah Awal Menyusu yang Penting bagi Ibu dan Bayi** dan deskripsi singkat dari materi sumber.

```text
┌ Header sage: kembali · Materi 7 · IMD ┐
│ Judul dan deskripsi                  │
└─────────────────────────────────────┘
┌ Sheet materi                         ┐
│ Ilustrasi hero                       │
│ Apa Itu IMD? + ringkasan              │
│ Manfaat                              │
│ 3 kelompok manfaat                   │
│ Bagaimana IMD Dilakukan?              │
│ 4 langkah bernomor                   │
│ Catatan kontak kulit dan keselamatan │
│ Kapan IMD Perlu Disesuaikan?          │
│ Apa yang Perlu Dipersiapkan?          │
│ Penutup + ilustrasi + kembali         │
│ Sumber referensi                     │
└─────────────────────────────────────┘
```

### Bagian dan aset

1. **Header dan pembuka:** pakai `imd-hero.webp` sebagai ilustrasi utama di awal artikel, sebelum atau tepat di bawah judul “Apa Itu IMD?”. Hindari hero gambar yang mendorong inti artikel jauh ke bawah.
2. **Apa Itu IMD?:** satu paragraf ringkas. Tegaskan kesempatan menyusu dini dan kontak kulit ke kulit sesuai rumusan sumber.
3. **Manfaat:** tiga kelompok ringkas “Bagi bayi”, “Bagi ibu”, dan “Bagi ibu dan bayi”. Gunakan `manfaat-bayi.webp` dan `manfaat-ibu.webp`; kelompok ketiga berupa baris/kartu mint sederhana dengan ikon dari pustaka yang sudah dipakai aplikasi, bukan gambar tambahan.
4. **Bagaimana IMD Dilakukan?:** empat baris bernomor dengan penjelasan pendek dan jarak lega. Nomor menjadi penunjuk urutan; tidak perlu empat ilustrasi terpisah.
5. **Catatan durasi dan keselamatan:** blok mint/peach yang menyebutkan anjuran kontak kulit sesuai sumber, disertai syarat pemantauan dan keselamatan ibu-bayi. Jangan mengubahnya menjadi jaminan atau instruksi mutlak.
6. **Kapan IMD Perlu Disesuaikan?:** kartu aksen pink lembut dari materi sumber; keselamatan, stabilisasi, dan arahan tenaga kesehatan tetap menjadi pesan utama.
7. **Apa yang Perlu Dipersiapkan?:** daftar informatif dengan ikon kecil, bukan formulir atau checklist interaktif.
8. **Penutup:** gunakan kembali `imd-hero.webp` bila komposisi tetap terbaca, atau cukup tampilkan pesan utama dalam panel sage/mint. Tombol **Kembali ke Edukasi** memanggil navigasi kembali yang sudah ada.
9. **Sumber Referensi:** tampilkan sumber resmi yang betul-betul dirujuk. Jangan menambahkan tahun, judul publikasi, atau tautan yang belum diverifikasi.

## S-06h — Tanda Persalinan

**Sumber isi:** naskah yang diberikan pengguna pada 2026-10-17. Tautan referensi awal: https://sikibaskr.lovable.app/edukasi/tanda-persalinan. Naskah pengguna menjadi sumber konten untuk rencana ini; referensi klinis dan anjuran tetap perlu ditinjau sebelum publikasi.

### Naskah materi

**Kategori:** Persalinan  
**Estimasi baca:** 4–5 menit baca  
**Judul:** Kenali Tanda-Tanda Persalinan

**Deskripsi**  
Kenali perubahan yang menandakan persalinan mungkin akan segera dimulai agar Bunda dapat mempersiapkan diri dan mengetahui kapan harus mencari pertolongan.

**Apa Itu Tanda-Tanda Persalinan?**  
Tanda-tanda persalinan merupakan perubahan yang menunjukkan bahwa proses persalinan mungkin akan segera dimulai. Tanda yang dialami setiap ibu dapat berbeda, sehingga penting untuk mengenali perubahan yang terjadi dan mengikuti arahan tenaga kesehatan.

**Tanda-Tanda Persalinan**

1. **Kontraksi Rahim yang Teratur**  
   Perut terasa kencang atau mulas yang datang berulang, semakin teratur, lebih kuat, dan lebih sering. Kontraksi palsu umumnya tidak teratur dan dapat mereda ketika ibu beristirahat atau mengubah posisi. Namun, perubahan kontraksi perlu dinilai berdasarkan kondisi masing-masing ibu.
2. **Keluar Lendir Bercampur Darah**  
   Lendir dapat berwarna bening, merah muda, atau kecokelatan. Kondisi ini dapat terjadi ketika leher rahim mulai mengalami perubahan menjelang persalinan. Keluarnya lendir bercampur sedikit darah tidak selalu berarti persalinan akan langsung terjadi.
3. **Air Ketuban Keluar**  
   Air ketuban dapat merembes sedikit demi sedikit atau keluar sekaligus. Jika Bunda menduga air ketuban telah keluar, segera hubungi bidan atau datang ke fasilitas kesehatan, meskipun kontraksi belum terasa.

**Kapan Harus Segera ke Fasilitas Kesehatan?**

- Air ketuban keluar atau dicurigai merembes.
- Perdarahan dari jalan lahir, terutama jika darah banyak.
- Gerakan janin berkurang dari biasanya.
- Kontraksi semakin kuat dan teratur sesuai arahan bidan atau dokter.
- Sakit kepala hebat, pandangan kabur, kejang, atau nyeri perut hebat.

Jangan menunggu semua tanda muncul. Jika air ketuban keluar, terjadi perdarahan, gerakan janin berkurang, atau muncul tanda bahaya, segera cari pertolongan di fasilitas kesehatan.

**Apa yang Perlu Dipersiapkan?**

- Buku KIA dan dokumen pemeriksaan.
- Tas persalinan serta perlengkapan ibu dan bayi.
- Kendaraan dan pendamping persalinan.
- Biaya persalinan serta kontak fasilitas kesehatan.
- Rencana tempat persalinan dan calon pendonor darah jika diperlukan.

Persiapan yang baik membantu Bunda lebih siap menghadapi persalinan. Diskusikan rencana persalinan dengan bidan atau dokter selama pemeriksaan kehamilan.

**Sumber Referensi**

- Kementerian Kesehatan RI, *Buku Kesehatan Ibu dan Anak (KIA)*, Edisi 2024.
- *Buku Saku Pelayanan Kesehatan Ibu di Fasilitas Kesehatan Dasar dan Rujukan*.

### Tujuan dan susunan layar

Satu artikel vertikal berlabel **Persalinan** dengan estimasi baca **4–5 menit**. Tujuannya membantu Bunda mengenali tanda persalinan, mengetahui kapan mencari pertolongan, dan menyiapkan kebutuhan. Pakai judul **Kenali Tanda-Tanda Persalinan** dan deskripsi yang diberikan pengguna. Gunakan gambar hero ibu hamil trimester ketiga bersama tas persalinan, lalu ikuti urutan isi berikut.

```text
┌ Header sage · kembali · Materi 8 · Persalinan ┐
│ Kenali Tanda-Tanda Persalinan                 │
│ Deskripsi                                      │
└───────────────────────────────────────────────┘
┌ Sheet materi                                  ┐
│ Label Persalinan · 4–5 menit baca             │
│ Hero ibu hamil dan tas persalinan              │
│ Apa Itu Tanda-Tanda Persalinan?                │
│ Tanda-Tanda Persalinan                         │
│ 1 Kontraksi Rahim yang Teratur                 │
│ 2 Keluar Lendir Bercampur Darah                │
│ 3 Air Ketuban Keluar                            │
│ Kapan Harus Segera ke Fasilitas Kesehatan?     │
│ Panel peringatan dan anjuran segera mencari    │
│ pertolongan                                    │
│ Apa yang Perlu Dipersiapkan?                   │
│ Lima persiapan dengan ikon                     │
│ Penutup                                        │
│ Sumber Referensi                               │
└───────────────────────────────────────────────┘
```

### Bagian dan aset

- **Header detail:** nomor 8, label **Persalinan**, judul **Kenali Tanda-Tanda Persalinan**, deskripsi, kembali, dan bagikan mengikuti `EdukasiDetailHeader`.
- **Pembuka artikel:** chip kategori **Persalinan** dan waktu baca **4–5 menit baca**, lalu ilustrasi hero `hero-persiapan.webp`. Tambahkan alt text yang menyebut ibu hamil trimester ketiga dan tas persalinan.
- **Apa Itu Tanda-Tanda Persalinan?:** satu paragraf definisi dari naskah pengguna. Letakkan sebelum daftar tanda.
- **Tanda-Tanda Persalinan:** tiga item berurutan dalam kartu sederhana atau baris editorial dengan ilustrasi. Jangan gunakan akordeon yang menyembunyikan tanda penting.
  1. **Kontraksi Rahim yang Teratur** dengan `kontraksi.webp`. Jelaskan perut kencang/mulas yang berulang, makin teratur, kuat, dan sering; bandingkan kontraksi palsu sesuai naskah. Pertahankan catatan bahwa perubahan harus dinilai menurut kondisi ibu.
  2. **Keluar Lendir Bercampur Darah** dengan `lendir-campur-darah.webp`. Jelaskan variasi warna, kaitannya dengan perubahan leher rahim, serta bahwa persalinan tidak selalu langsung terjadi.
  3. **Air Ketuban Keluar** dengan `ketuban-keluar.webp`. Jelaskan kemungkinan merembes atau keluar sekaligus dan anjuran segera menghubungi bidan atau datang ke fasilitas kesehatan meskipun kontraksi belum terasa.
- **Kapan Harus Segera ke Fasilitas Kesehatan?:** tampilkan setelah ketiga tanda dalam panel pink lembut `#FFE2E2` dengan teks tinta kontras. Daftar ringkas mencakup ketuban keluar/diduga merembes, perdarahan terutama jika banyak, gerakan janin berkurang, kontraksi makin kuat dan teratur mengikuti arahan bidan/dokter, serta sakit kepala hebat, pandangan kabur, kejang, atau nyeri perut hebat. Akhiri dengan pesan jangan menunggu semua tanda muncul dan cari pertolongan segera untuk keadaan yang disebutkan.
- **Apa yang Perlu Dipersiapkan?:** lima baris informatif berikon, bukan form: Buku KIA dan dokumen pemeriksaan; tas persalinan serta perlengkapan ibu dan bayi; kendaraan dan pendamping; biaya dan kontak fasilitas kesehatan; rencana tempat persalinan dan calon pendonor darah bila diperlukan.
- **Penutup:** satu paragraf bahwa persiapan membantu Bunda lebih siap, disertai ajakan mendiskusikan rencana dengan bidan atau dokter saat pemeriksaan kehamilan.
- **Sumber Referensi:** tampilkan dua sumber sesuai naskah: Kementerian Kesehatan RI, Buku Kesehatan Ibu dan Anak (KIA), Edisi 2024; dan *Buku Saku Pelayanan Kesehatan Ibu di Fasilitas Kesehatan Dasar dan Rujukan*. Verifikasi metadata bibliografi sebelum menambah tautan atau detail lain.
- **Navigasi:** kembali ke katalog edukasi yang sama. Tidak membuat tab atau alur navigasi baru.

## Inventaris aset WebP

| Layar | Berkas | Penggunaan |
| --- | --- | --- |
| S-06g | `app/public/s-06/s-06g/thumbnail.webp` | Thumbnail katalog |
| S-06g | `app/public/s-06/s-06g/imd-hero.webp` | Hero artikel dan penutup bila sesuai |
| S-06g | `app/public/s-06/s-06g/manfaat-bayi.webp` | Manfaat untuk bayi |
| S-06g | `app/public/s-06/s-06g/manfaat-ibu.webp` | Manfaat untuk ibu |
| S-06h | `app/public/s-06/s-06h/thumbnail.webp` | Thumbnail katalog/pembuka |
| S-06h | `app/public/s-06/s-06h/ketuban-keluar.webp` | Ilustrasi tanda ketuban |
| S-06h | `app/public/s-06/s-06h/kontraksi.webp` | Ilustrasi kontraksi |
| S-06h | `app/public/s-06/s-06h/lendir-campur-darah.webp` | Ilustrasi lendir bercampur darah |
| S-06h | `app/public/s-06/s-06h/hero-persiapan.webp` | Ilustrasi hero ibu trimester ketiga dan tas persalinan; sudah tersedia |

## Ilustrasi tambahan

Untuk IMD, aset yang tersedia cukup; langkah dapat dibedakan dengan angka dan ikon FE. Untuk S-06h, ilustrasi tanda dan hero ibu trimester ketiga dengan tas persalinan sudah tersedia. Prompt generasi hero disimpan sebagai catatan brief aset.

### Prompt hero S-06h

```text
Create a warm, polished flat 2D editorial illustration for the SIAGA Bunda maternal-health education app, consistent with its existing soft sage, dusty pink, peach, and cream artwork. Show a calm Indonesian Muslim pregnant woman in her third trimester wearing a modest sage-green outfit and hijab, standing beside a neatly packed birth bag, one hand resting gently on her belly. Include a few subtle leaves or small heart accents, with a reassuring prepared-for-birth mood. Keep the mother and bag clearly readable at small mobile-screen size, with the main subjects centered and generous clear space around them. Soft clean shapes, gentle shading, refined friendly illustration, no medical procedure, no distress, no text, no letters, no numbers, no labels, no logos, no watermark, no UI, no border. Landscape 4:3 composition, light cream background matching #FFFDEC.
```

Hasil tersedia di `app/public/s-06/s-06h/hero-persiapan.webp`. Ilustrasi sesuai subjek prompt; jangan gunakan teks yang digambar oleh generator.

## Catatan implementasi dan validasi

- Tambahkan kedua topik ke katalog S-06 dan state navigasi `EdukasiPage`; kembali tetap menuju katalog yang sama.
- Ikuti aksesibilitas pola edukasi: heading berurutan, alt text bermakna, tombol dengan label jelas, area tekan 44 px, fokus keyboard, serta teks tidak bergantung pada warna saja.
- Audit naskah IMD terhadap PDF dan sumber referensi resmi; audit semua konten S-06h terhadap halaman yang ditautkan. Minta validasi bidan/dokter untuk klaim, urgensi, dan langkah tindakan.
- Uji pada lebar 320 px dan 360 px, termasuk pembesaran teks, scroll sampai sumber, kondisi gambar, kembali, dan bagikan.
- Nama berkas di tabel adalah nama keluaran setelah konversi PNG ke WebP. PNG sumber telah dihapus sesuai permintaan.
