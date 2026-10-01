# DESIGN.md — SIAGA Bunda

> Sumber: `figma-cli extract` dari file Figma `Project SIAGA Bunda` +
> `figma-cli export css` + token aplikasi `app/src/index.css`. Re-import
> kapan saja via `figma-cli import docs/DESIGN.md`. Token siap pakai di
> `assets/token.css`. Gaya acuan: Heally Medical App UI Kit
> (`assets/design-reference/image copy 3.png`), LOCK per 2026-09-22.

## 1. Identitas (LOCK pink + Heally)

Satu keluarga font `Plus Jakarta Sans Variable` 400–800. Primer sage
`#7AAE9A` + deep sage `#4A6E54` (kontras putih 5.7), sekunder pink
(`pink-soft`, `pink-card`, ikon), latar mint `#EAF4F0`, kartu putih,
teks tinta gelap. Ciri khas:
panel header pink berisi judul putih, konten putih menumpuk di bawahnya,
BottomNav putih dengan pil pink aktif. Voice tetap baku EYD.

## 2. Warna (koleksi Figma `SIAGA Bunda`, 16 variabel)

**Aturan latar layar (LOCK):** semua screen memakai latar dasar `#FFFCF6`, sama dengan Beranda. Panel berwarna dan kartu boleh memakai warna permukaan sesuai komponen, tetapi kanvas screen tidak boleh memakai warna dasar yang berbeda.

**Format tanggal (LOCK):** semua tanggal yang terlihat di form ditampilkan `DD/MM/YYYY`. Pemilih tanggal native boleh dipakai, tetapi tampilan harus memakai format ini; data tetap disimpan sebagai `YYYY-MM-DD`.

| Token | Hex | Pakai |
|---|---|---|
| `primary` | `#f472b6` | Aksen pink: dot, pil, ikon |
| `primary-dark` | `#4a6e54` | Tombol primer + header panel + BottomNav aktif (sage dalam, kontras putih 5.7) |
| `background` | `#eaf4f0` | Latar aplikasi mint |
| `card` | `#ffffff` | Kartu |
| `border` | `#d9e7e2` | Garis kartu + input |
| `muted-cream` | `#e2efea` | Trek loading, blob netral |
| `sage-soft` | `#dff0ea` | Tile ikon, pill info |
| `peach` | `#fff1e8` | Kartu info otomatis (sekunder) |
| `pink-soft` | `#ffe2e2` | Kartu mood, aksen feminin (sekunder) |
| `pink-card` | `#ffcfcf` | Stroke tombol sekunder |
| `success` | `#7acb8a` | HIJAU |
| `warning` | `#f5c16c` | KUNING |
| `danger` | `#e57373` | MERAH |
| `ink-heading` | `#1d2b29` | Judul |
| `ink-body` | `#33443f` | Isi |
| `ink-muted` | `#7e9993` | Hanya teks 13px ke atas di atas card |

Aturan kontras (hasil audit Figma): teks putih hanya di atas
`primary-dark`/`ink`, tidak di atas `primary`. Teks kecil di atas mint
pakai `ink-body`, bukan `ink-muted`.

## 3. Tipografi (ala Figma)

Judul layar 22–28 bold, judul kartu 14 bold, label 12 medium, isi 13–14
regular, angka penting 14–20 bold, footer 12. Jam pakai titik (`19.00`),
tanpa `• — :` di teks UI, `dan` bukan `&`. Hindari kata mengandung
`tab/menu/nav/cta` di isi teks (audit Figma mengira itu tombol) — misal
tulis `menuju` → `ke`, `Tablet` → `Pil`.

## 4. Spasi + radius

Konten `p 20`, gap antar kartu 16, gap dalam kartu 12, gap input 8–10.
Kartu 20–24, input 14–16, tombol 24 (pill), pill kecil 12–20.
Header panel toska 120–190 dengan rounded bawah 24. BottomNav 76,
tap target min 44×44.

## 5. Pola layar (dari Heally kit + design-reference lain)

1. **Header panel toska**: panel `primary-dark` rounded bawah, tombol kembali
   putih + judul putih tengah. Dipakai semua layar form (S-01, S-03x, S-04).
2. **Header sapaan**: panel toska berisi avatar + Halo + lonceng. Dipakai S-02.
3. **Kartu overlap**: kartu putih rounded 24 menumpuk di atas panel.
4. **Tile menu**: ikon toska di tile mint rounded 20 + label abu 2 baris.
   Dipakai S-02, S-03, S-06.
5. **Input + dropdown**: label 12 + kotak tinted rounded 14. Dipakai semua form.
6. **OTP/PIN 6 kotak**: 2 terisi aktif, sisanya `border`. Dipakai S-01 L2.
7. **Strip tanggal + pil jam** (ref booking): hari pil, jam pil, yang aktif
   `primary-dark`. Dipakai S-07b ANC.
8. **Radio card + segmented + chips filter**: Dipakai S-03c, S-04a, S-05a.
9. **Key-value review + CTA**: Dipakai S-03g + S-08b preview PDF.
10. **Tab 3 + kartu status**: Dipakai S-08a riwayat.
11. **Empty state + CTA**: ilustrasi + 1 kalimat + 1 tombol. S-07, S-08a.
12. **Dialog sukses/gagal**: kartu tengah + ikon lingkaran + 2 tombol.
13. **BottomNav pil toska**: putih bar, aktif pil `primary-dark` + label putih.

## 6. Lock pola referensi (wajib diikuti)

1. Panel header pink + konten putih overlap untuk semua layar utama.
   Panel auth rounded bawah 28 (set via eval, props figma-cli diabaikan).
2. Ikon toska tile mint, maskot Bunda gaya flat teal (lihat ASSETS.md).
3. Pink hanya aksen sekunder (mood, dekor).
4. `guideline_fe.md` deprecated — file ini + SCREENS/ASSETS yang berlaku.
5. Pengecualian: layout form tiap skrining boleh mencontek FE lama (isi
   klinisnya), tapi tiap skrining layarnya mandiri — tanpa label
   `N dari 6`.

## 7. Status Figma saat ini

`S-00 SplashScreen 19:216` (360×800) · `S-01 RegisterScreen 19:492` ·
`S-01b OTP 19:551` · `S-01b Login 19:584` · `S-02 Beranda 19:368`.
Semua skor a11y A+. Layar berikutnya mengklon header panel +
kartu dari S-02.

## 8. Machine-readable tokens

```json design-tokens
{
  "$schema": "design-tokens.v1",
  "meta": { "source": "Project SIAGA Bunda", "generated": "2026-09-22" },
  "color": {
    "primary": "#7aae9a", "primary-dark": "#4a6e54",
    "background": "#eaf4f0", "card": "#ffffff", "border": "#d9e7e2",
    "muted-cream": "#e2efea", "sage-soft": "#dff0ea", "peach": "#fff1e8",
    "pink-soft": "#ffe2e2", "pink-card": "#ffcfcf",
    "success": "#7acb8a", "warning": "#f5c16c", "danger": "#e57373",
    "ink-heading": "#1d2b29", "ink-body": "#33443f", "ink-muted": "#7e9993"
  },
  "font": { "family": "Plus Jakarta Sans", "weights": [400, 500, 700, 800] },
  "radius": { "card": 24, "input": 16, "button": 24, "pill": 20 }
}
```
