# Ilustrasi dan Layout Header Skrining

Dokumen ini menjadi brief visual untuk aset dan header form skrining SIAGA Bunda. Header dibuat bervariasi per topik, tetapi tetap terasa satu keluarga desain.

## Arah visual bersama

- Ukuran utama ilustrasi **1:1**, PNG dengan latar transparan. Tempatkan pada sisi kanan header, dengan subjek terbaca ketika tampil sekitar 84–104 px.
- Gaya flat-vector yang hangat dan bersih, bentuk sederhana, garis lembut, detail tidak terlalu kecil, sesuai ilustrasi ibu dan bayi SIAGA Bunda.
- Gunakan palet brand: deep sage `#4A6E54`, sage `#7AAE9A`, cream `#FFFDEC`, mint `#EAF4F0`, soft pink `#FFE2E2`, dan peach `#FFF1E8` sebagai aksen seperlunya.
- Ibu dapat digambarkan sebagai perempuan Indonesia dengan busana sopan dan hijab sage. Bayi digambarkan dengan aman, nyaman, dan tidak tertekan.
- Ilustrasi adalah ornamen editorial, **bukan** penanda hasil pemeriksaan. Jangan gunakan lampu hijau-kuning-merah, angka, kurva ambang klinis, teks, label diagnosis, logo palsu, atau alat medis dengan hasil terukur.
- Jangan menaruh teks hasil, skor, status, atau nilai klinis statis pada gambar. Informasi tersebut harus tetap berasal dari data aplikasi.

### Prompt gaya bersama

Tempelkan bagian ini di awal setiap prompt di bawah:

```text
Create a warm, polished flat-vector illustration for SIAGA Bunda, an Indonesian maternal and newborn health screening app. Friendly Indonesian maternal-care visual language, clean geometric silhouettes, gentle rounded shapes, restrained soft linework, calm and reassuring rather than childish. Brand palette: deep sage #4A6E54, sage #7AAE9A, warm cream #FFFDEC, mint #EAF4F0, with restrained soft pink #FFE2E2 or peach #FFF1E8 accents. Center one clear subject with generous breathing room, composed to sit on the RIGHT side of a compact mobile app header. Square 1:1 composition, transparent background, crisp high-resolution PNG. No text, no letters, no numbers, no watermark, no UI, no fake logo, no traffic-light colors, no diagnosis, no readable measurements, no photorealism, no 3D, no frightening medical scene.
```

## Peta aset dan layout header

| ID | Nama layar | File aset yang disarankan | Variasi header |
|---|---|---|---|
| S-03a | Faktor Risiko Kehamilan | `app/public/illu/illu-46-skrining-risiko.webp` | Arch pelindung di kanan, judul rata kiri |
| S-03b | Status Gizi | `app/public/illu/illu-47-skrining-gizi.webp` | Ilustrasi tile peach mengambang di bawah judul |
| S-03c | Tanda Bahaya Kehamilan | `app/public/illu/illu-48-skrining-bahaya.webp` | Komposisi diagonal lembut dan ikon peringatan netral |
| S-03d | Preeklamsia | `app/public/illu/illu-49-skrining-preeklamsia.webp` | Bentuk monitor melengkung di kanan, ruang judul lega |
| S-03e | Diabetes Gestasional | `app/public/illu/illu-50-skrining-dmg.webp` | Pola titik/glukosa abstrak dengan ilustrasi dalam lingkaran |
| S-03f | Kesehatan Mental | `app/public/illu/illu-51-skrining-mental.webp` | Halo pink-peach dan ekspresi suportif |
| S-04 | Skrining Masa Nifas | `app/public/illu/illu-52-skrining-nifas.webp` | Ilustrasi ibu dan bayi dalam siluet lengkung |
| S-04a | Laktasi dan Menyusui | `app/public/illu/illu-53-skrining-laktasi.webp` | Komposisi horizontal intim, ibu dan bayi di sisi kanan |
| S-05a | Ikterus Neonatal | `app/public/illu/illu-54-skrining-ikterus.webp` | Sunburst cream, bayi nyaman, tanpa kulit kuning berlebihan |
| S-05b | Hipotiroid Kongenital | `app/public/illu/illu-55-skrining-hipotiroid.webp` | Kartu skrining abstrak dan bayi, gaya klinis yang lembut |

## Prompt ilustrasi per skrining

Gunakan **prompt gaya bersama** lalu tambahkan deskripsi khusus berikut.

### S-03a — Faktor Risiko Kehamilan

```text
Show a calm pregnant Indonesian mother in a sage hijab beside a simple blank prenatal checklist card, with a small protective leaf-shield shape. The checklist has only a few abstract empty marks, no writing or numbers. Protective and thoughtful mood, balanced silhouette, no alarm symbols.
```

### S-03b — Status Gizi

```text
Show a pregnant Indonesian mother in a sage hijab choosing nourishing everyday foods: a small bowl with fruit and vegetables, plus a soft measuring-tape curve suggesting healthy growth. Keep the food culturally familiar and simple. No scale reading, body measurement, weight number, or idealized body shape.
```

### S-03c — Tanda Bahaya Kehamilan

```text
Show a pregnant Indonesian mother noticing a gentle neutral alert symbol, such as an outlined rounded triangle beside a small checklist. Her expression is attentive and supported, not frightened. Add a small leaf or caring hand motif. Do not depict bleeding, injury, emergency vehicles, or a red warning light.
```

### S-03d — Preeklamsia

```text
Show a pregnant Indonesian mother with a home blood-pressure cuff and a simple blank monitor with no digits, no waveform, and no result indicator. Add a small heart and soft sage arcs. The equipment should look recognizable but calm and generic, without implying a measured result.
```

### S-03e — Diabetes Gestasional

```text
Show a pregnant Indonesian mother beside a simple blank glucose test device and one small abstract droplet with a leaf. Use a gentle peach accent and a few subtle round dots. No needles, no blood, no glucose numbers, no sugar cubes, and no result color.
```

### S-03f — Kesehatan Mental

```text
Show a thoughtful but supported pregnant Indonesian mother in a sage hijab, with a gentle heart-shaped leaf and a small range of soft facial-expression motifs around her. The expression is calm and emotionally safe, not distressed. Use restrained pink and peach accents; do not depict a diagnosis or crisis.
```

### S-04 — Skrining Masa Nifas

```text
Show an Indonesian mother resting comfortably after birth while holding her swaddled newborn close. Add a soft blanket, one small caring-heart motif, and a subtle blank checklist card suggesting a postpartum check. Modest clothing, warm supportive mood, no hospital emergency scene and no medical readings.
```

### S-04a — Laktasi dan Menyusui

```text
Show an Indonesian mother in a modest sage hijab breastfeeding her newborn in a comfortable supported position, with discreet coverage and a calm bond. Add a small milk-drop or leaf motif. Respectful, non-sexual, reassuring maternal-care illustration. No bottle-feeding symbols, no text, no claims about milk quantity.
```

### S-05a — Ikterus Neonatal

```text
Show a newborn resting safely in a soft cream blanket with a gentle warm sun arc nearby, and a caregiver's hand lightly checking the baby's face. Keep the baby's natural skin tone; do not color the skin yellow or depict illness. A small abstract zone-card shape may appear blank, with no numbered body diagram.
```

### S-05b — Hipotiroid Kongenital

```text
Show a calm newborn beside a simple neonatal screening card with a few abstract blank circles suggesting a routine heel-prick blood-spot test, and a caring adult hand. No visible needle, blood, labels, test result, or hospital distress. Use a clean sage and cream composition with subtle mint accents.
```

## Rencana layout header

### Sistem dasar bersama

- Pertahankan `SkriningFormShell` sebagai shell dasar supaya tombol kembali, safe area, lebar HP, dan posisi isi tetap konsisten.
- Stage header memakai deep sage `#4A6E54`, rounded bawah 28–32 px. Kanvas tetap `#FFFCF6`; sheet/konten memakai putih dan mint `#EAF4F0`.
- Di bagian atas, tampilkan tombol kembali dengan tap target minimal 44×44 px. Jangan ulangi logo di header form; identitas SIAGA Bunda hadir lewat warna, tipografi, dan ilustrasi topik.
- Judul berada di kiri, 20–24 px bold, maksimal dua baris. Deskripsi satu baris pendek, sekitar 12–13 px. Hindari label urutan seperti `N dari 6`.
- Ilustrasi kanan dibatasi sekitar 88–104 px dan tidak boleh menutupi judul. Gunakan dua lingkaran dekoratif mint/pink di belakang ilustrasi pada stage sage. Header total sekitar 150–185 px, cukup lega untuk layar 360×800.
- Form dimulai pada sheet putih yang overlap sekitar 16–24 px dengan rounded top 28–32 px. Gunakan pola kartu dan input yang sama pada semua form.
- Variasikan susunan, crop dekoratif, bentuk mint/peach/pink, dan posisi ilustrasi. Jangan mengubah kontras tombol kembali, hierarki judul, warna kanvas, atau pola form.
- Jangan mengodekan status Hijau/Kuning/Merah dalam warna ilustrasi atau dekorasi header. Status hanya muncul dari hasil hitung.

### Variasi per layar

| ID | Susunan header | Aksen/dekorasi | Metadata dinamis yang boleh ditampilkan |
|---|---|---|---|
| S-03a | Judul dan deskripsi kiri; ilustrasi di sisi kanan | Lingkaran mint besar dan ring pink lembut di belakang ilustrasi | Tidak perlu menambah angka; profil G-P-A tetap berada di field form |
| S-03b | Judul di kiri atas; tile ilustrasi berada di kanan bawah dan sedikit overlap ke sheet | Tile peach `#FFF1E8` berbentuk rounded | Boleh tampilkan keterangan IMT/LILA otomatis jika data sudah tersedia; jangan hard-code |
| S-03c | Tombol kembali di atas; judul kiri; ilustrasi kecil di kanan dengan ruang negatif lebar | Garis lengkung mint, bukan badge merah | Tidak menampilkan status bahaya sebelum form dihitung |
| S-03d | Judul dua baris kiri; ilustrasi monitor di kanan dalam lingkaran mint | Ring tipis sage, tanpa grafik angka | Jangan tampilkan nilai TD/MAP dummy di header |
| S-03e | Header lebih kompak; judul di kiri bawah lockup; ilustrasi lingkaran berada di kanan | Dots lembut dan aksen peach | Usia kehamilan hanya jika berasal dari profil tersimpan |
| S-03f | Judul kiri; ilustrasi wajah/daun di kanan atas | Blob pink-soft kecil sebagai aksen emosional | Tidak menampilkan skor EPDS sebelum pengisian |
| S-04 | Lockup dan tombol kembali di baris atas; judul kiri; ibu-bayi kanan | Lengkung sage seperti selimut | Hari nifas hanya jika dihitung dari tanggal persalinan tersimpan |
| S-04a | Header dua bagian: judul di kiri atas, ilustrasi ibu-bayi lebih besar di kanan bawah | Kartu mint yang overlap tipis ke sheet | Usia bayi hanya dari data kelahiran tersimpan |
| S-05a | Judul kiri pada stage sage; ilustrasi bayi kanan dengan sunburst cream | Aksen cream/peach, bukan kuning menyala | Usia bayi boleh dinamis dari tanggal lahir tersimpan |
| S-05b | Judul rata kiri; kartu screening abstrak berada di kanan dalam panel mint | Motif titik kertas skrining dengan aksen sage | Jadwal TSH hanya bila tanggal lahir tersedia; jangan tampilkan hasil rekaan |

## Instruksi penempatan aset

1. Generate satu ilustrasi per layar menggunakan prompt gaya bersama dan prompt layar terkait.
2. Simpan dengan nama file pada tabel. Pastikan file benar-benar transparan dan crop subjek tidak terpotong.
3. Terapkan ke header setelah aset final disetujui. Gunakan `alt=""` dan `aria-hidden="true"` untuk ilustrasi dekoratif; berikan alt deskriptif hanya bila gambar membawa informasi yang tidak tersedia di teks.
4. Pastikan logo transparan tetap kontras di tile putih, dan semua kontrol header tetap mudah disentuh.
5. Uji tiap header pada lebar 320 px, 360 px, dan 480 px. Judul tidak boleh bertabrakan dengan ilustrasi atau tombol kembali.

## Checklist review visual

- [x] Satu ilustrasi khusus tersedia untuk masing-masing 10 layar dan nama filenya mengikuti tabel aset.
- [ ] Tidak ada teks atau detail klinis rekaan di gambar.
- [x] Semua form memakai header berilustrasi dan buletan dekoratif dengan satu gaya brand.
- [ ] Tombol kembali dan judul terbaca jelas tanpa logo yang menutupi ilustrasi.
- [ ] Ilustrasi dekoratif tidak mengambil fokus dari pertanyaan skrining.
- [ ] Tidak memakai warna ilustrasi untuk menyimpulkan status skrining.
- [ ] Layout responsif dan tap target tetap memenuhi standar desain.
