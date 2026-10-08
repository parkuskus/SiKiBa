# ASSETS.md — ilustrasi + ikon SIAGA Bunda

> Gaya kunci (Heally kit): ilustrasi vektor flat medis, toska + mint dengan
> aksen lembut pink/peach. Primer = toska `#3CB9A5` + deep `#1F7A6D`.
> Rasio 1:1 untuk ikon/tile, 4:3 atau 16:9 untuk hero dan banner, latar
> transparan kecuali hero/banner. Target `public/illu/`
> penamaan `illu-<nn>-<nama>.png` melanjutkan nomor yang ada (01–09).

Catatan: saya tidak bisa generate gambar di sesi ini, jadi tiap aset saya
kasih prompt siap tempel ke generator (Midjourney/DALL-E/Firefly). Ganti
`[slot]` dengan gaya yang kamu pilih bila perlu.

## Prompt gaya global (tempel di depan tiap prompt)

`flat vector medical illustration, teal turquoise mint palette with soft pink
peach accents, clean geometric shapes, thin minimal line, friendly maternal
app style like Heally UI kit, clean background, high quality, no text`

## 0. Maskot + hero (prioritas 1)

| File | Isi | Prompt |
|---|---|---|
| `illu-10-mascot-bunda.png` | Maskot Bunda, ibu hamil hijab/rambut panjang, senyum, tangan di perut | gaya global + `cute pregnant mother mascot waving, long black hair, pink dress, hands on belly, front view, 1:1 transparent` |
| `illu-11-hero-hamil.png` | Hero S-02, ibu + janin + daun/bunga/logo | gaya global + `pregnant mother with glowing womb and leaves flowers stars around, warm peach background, 4:3` |
| `illu-12-janin-minggu.png` | Template janin per minggu (varian buah: kelengkeng dst) | gaya global + `cute fetus size of longan fruit with scale hint, soft pink womb glow, 1:1` |
| `illu-13-mood-mama.png` | Kartu Cek Mood Mama, wajah Bunda 5 ekspresi | gaya global + `five cute mother faces very happy to sad in a row, pastel circles, 16:9` |

## 1. Tile menu S-02 (prioritas 1, gaya ref: Komunitas/Berat/Bacaan/Lainnya)

| File | Isi | Prompt |
|---|---|---|
| `illu-14-tile-komunitas.png` | Ibu-ibu + balon chat + hati | gaya global + `small group of mothers with chat bubbles and heart above, coral base, 1:1` |
| `illu-15-tile-berat.png` | Timbangan + jejak kaki | gaya global + `bathroom scale with baby footprints, pink, 1:1` |
| `illu-16-tile-bacaan.png` | Buku/artikel + pensil | gaya global + `open book with pencil and bookmark, peach, 1:1` |
| `illu-17-tile-lainnya.png` | Grid 4 kotak | gaya global + `four rounded squares grid, pink, 1:1` |

## 2. Ikon skrining S-03a–f, S-04–05 (prioritas 2)

| File | Layar | Prompt (gaya global + …) |
|---|---|---|
| `illu-18-risiko.png` | S-03a clipboard checklist | `medical clipboard with checkmarks and shield, sage, 1:1` |
| `illu-19-gizi.png` | S-03b makanan + LILA | `healthy food bowl with measuring tape, peach, 1:1` |
| `illu-20-bahaya.png` | S-03c segitiga peringatan | `warning triangle with pregnant silhouette, soft red pink, 1:1` |
| `illu-21-tensi.png` | S-03d tensimeter | `blood pressure monitor with heart, pink, 1:1` |
| `illu-22-gula.png` | S-03e tetes darah + gula | `blood drop with sugar cubes crossed, peach, 1:1` |
| `illu-23-mood.png` | S-03f kepala + hati | `mother head silhouette with heart and stars, pink, 1:1` |
| `illu-24-nifas.png` | S-04 ibu + bayi | `mother holding newborn wrapped blanket, sage pink, 1:1` |
| `illu-25-laktasi.png` | S-04a menyusui | `breastfeeding mother and baby, warm peach, tender, 1:1` |
| `illu-26-ikterus.png` | S-05a bayi + matahari | `newborn baby with soft sun glow on skin, yellow peach, 1:1` |
| `illu-27-tsh.png` | S-05b tetes darah lab | `blood sample tube with checklist, sage, 1:1` |

## 3. Hasil + status (prioritas 2)

| File | Isi | Prompt |
|---|---|---|
| `illu-28-hasil-hijau.png` | Maskot Bunda jempol, confetti sage | gaya global + `happy mother mascot thumbs up with green confetti, 1:1` |
| `illu-29-hasil-kuning.png` | Maskot Bunda waspada + bidan | gaya global + `mother mascot with phone calling midwife, yellow accents, 1:1` |
| `illu-30-hasil-merah.png` | Maskot + ambulans/IGD | gaya global + `mother mascot with ambulance and hospital, soft red accents, urgent but calm, 1:1` |
| `illu-31-kosong.png` | Empty state umum, papan + maskot | gaya global + `empty clipboard with cute mother mascot peeking, 4:3` |

## 4. Edukasi S-06a–h (prioritas 3, cover 4:3)

`illu-32-fertilisasi` (sperma + sel telur) · `illu-33-janin` (janin per
minggu) · `illu-34-plasenta` (plasenta + tali pusat) · `s-06d/Thumbnail.webp`
(thumbnail perubahan fisiologi) · `illu-36-bahaya` (tanda bahaya) · `illu-37-psikologi` (kepala +
hati) · `illu-38-keluhan` (P3K + ibu) · `illu-39-p4k` (tas bersalin + donor
darah). Prompt = gaya global + objek + `book cover illustration, 4:3`.

### S-06 folder thumbnails

Tiap folder layar Edukasi juga memiliki satu thumbnail kolase bernama `Thumbnail.webp`. Thumbnail ini terpisah dari diagram atau ilustrasi per materi.

| Target file | Isi | Peran yang disarankan |
|---|---|---|
| `s-06a/Thumbnail.webp` | Bunda, pasangan, sel telur, dan rahim | Cover/preview Fertilisasi; layar detail tetap memakai lima ilustrasi tahap |
| `s-06b/Thumbnail.webp` | Bunda dan beberapa ilustrasi tumbuh kembang janin | Cover/overview Perkembangan Janin |
| `s-06c/Thumbnail.webp` | Bunda dan ilustrasi pendukung kehamilan | Cover/overview materi plasenta, tali pusat, dan ketuban |
| `s-06d/Thumbnail.webp` | Bunda dan kolase sistem tubuh | Cover/overview perubahan fisiologi |
| `s-06e/Thumbnail.webp` | Bunda berbincang dengan bidan tentang tanda bahaya | Thumbnail katalog Tanda Bahaya Kehamilan; dikonversi dari PNG yang disediakan pengguna |

Semua thumbnail S-06 berada di folder screen masing-masing dalam format WebP. PNG sumber sudah dihapus.

### S-06c internal diagrams

Four generated illustrations used inside the screen, separate from the S-06c catalog cover above. Detailed composition and generation prompts are in `docs/RENCANA_EDUKASI_S06C.md`. The source PNGs were visually checked against the brief, converted to WebP, and the PNG copies removed.

| Target file | Placement | Content |
|---|---|---|
| `s-06c/ketuban.webp` | Air Ketuban tab | Simplified uterus cross-section with fetus inside amniotic sac |
| `s-06c/tali-pusat.webp` | Tali Pusat tab | Cord attached to fetus and placenta, with inset cross-section of 2 arteries + 1 vein inside Wharton's jelly |
| `s-06c/permukaan-plasenta.webp` | Plasenta tab | Side-by-side fetal and maternal surfaces of one placenta |
| `s-06c/insersi-tali-pusat.webp` | Insersi sub-section | Five schematic insertion patterns in one wide comparison diagram |

### S-06d internal illustrations

Twelve supplied illustrations were converted from PNG to WebP: one overview thumbnail plus one illustration per system. Use the same system image in the closed row and expanded detail; see `docs/RENCANA_EDUKASI_S06D.md` for visual mapping and content hierarchy.

| Target file | Placement |
|---|---|
| `s-06d/Thumbnail.webp` | Overview/hero and S-06d catalog tile |
| `s-06d/Rahim.webp` | Rahim and area intim |
| `s-06d/Jantung.webp` | Jantung and pembuluh darah |
| `s-06d/Darah.webp` | Darah Bunda |
| `s-06d/Paru-paru.webp` | Paru-paru |
| `s-06d/Lambung.webp` | Sistem pencernaan |
| `s-06d/Ginjal.webp` | Ginjal and kandung kemih |
| `s-06d/Tiroid.webp` | Metabolisme and tiroid |
| `s-06d/Payudara.webp` | Payudara and persiapan ASI |
| `s-06d/Tulang.webp` | Otot, tulang, and sendi |
| `s-06d/Kulit.webp` | Kulit and rambut |
| `s-06d/Imun.webp` | Sistem imun |

## 5. Tracker + profil (prioritas 3)

`illu-40-bb` (timbangan, S-07) · `illu-41-suplemen` (pil Fe, S-07a) ·
`illu-42-anc` (kalender + stetoskop, S-07b) · `illu-43-diary` (buku + hati,
S-07c) · `illu-44-timeline` (countdown + bintang, S-07d) ·
`illu-45-export` (PDF + WA, S-08b). Prompt = gaya global + objek + `1:1`.

## Cara pasang

Taruh PNG jadi di `public/illu/`, ganti `<Icon …>` / tile di Figma dengan
`<Image src="/illu/illu-NN-nama.png">`, tanpa kartu beige kecil di
belakangnya (aturan `guideline_fe.md` Bagian 3).
