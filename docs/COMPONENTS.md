# COMPONENTS.md — komponen bersama SIAGA Bunda

> ATURAN: daftar dan rencana layar dalam Markdown menjadi acuan implementasi;
> Figma opsional untuk eksplorasi atau sinkronisasi. Pola visual mengacu
> `DESIGN.md`. Satu aksen `primary-dark` untuk semua CTA primer (alasan
> kontras, lihat DESIGN.md Bagian 2).

## Fondasi

| Komponen | Wujud di Figma | Pakai |
|---|---|---|
| Button primer | Pill 24 `primary-dark` + label putih 16 bold | Semua CTA utama |
| Button sekunder | Outline `pink-card`/`border` + label tinta | Aksi kedua |
| HeaderPanel | Panel `primary-dark`, tombol kembali putih + judul putih | Semua layar form |
| PinkStage + WhiteSheet | Stage pink rounded bawah 32 + sheet putih rounded atas 32 | Auth + layar hero |
| Card | Putih rounded 24 + ring `border` + shadow soft | Konten |
| Input | Tint `background`, rounded 14–16, label 12 di atas | Semua form |
| Dialog | Kartu tengah + ikon lingkaran + 2 tombol | Popup, sukses/gagal, keluar |

## Layout

| Komponen | Wujud di Figma | Pakai |
|---|---|---|
| BottomNav | Bar putih, aktif pil `primary-dark` + label putih | 5 tab utama |
| BirthDialog | Form kelahiran: tanggal, jam, BB gram, PB cm, metode | Transisi S-02 |

## Fitur bersama

| Komponen | Wujud di Figma | Pakai |
|---|---|---|
| ResultScreen | Template traffic light + langkah + bagikan | S-03g semua skrining |
| WeightChart | Grafik BB vs target + empty state | S-07 |
| WeightFormSheet | Bottom-sheet tambah BB | S-07 |
| WeightHistory | Riwayat 8 minggu | S-07 |
| ANCCalendar | Kalender + strip tanggal | S-07b |
| SupplementSection | Toggle + kepatuhan | S-07a |
| MedForm | Form obat: nama, dosis, jam, hari | S-07a |
| DiaryHistory | Daftar catatan harian | S-07c |
| ProfileCard | Kartu profil + status kehamilan | S-02a |
| QuickActionGrid | 4 tile menu | S-02b |
| LastCheckCard | Status skrining terakhir | S-02c |
| TodayReminderCard | Suplemen + ANC hari ini | S-02d |

## Aturan tambah komponen baru

1. Cek tabel di atas dulu — pakai ulang bila ada yang mirip.
2. Gunakan ulang pola `DESIGN.md` dan komponen yang sudah ada sebelum membuat pola baru.
3. Tidak ada `• — :` di teks, jam pakai titik, tap target min 44.
4. Pastikan kontras, fokus keyboard, label aksesibel, dan target sentuh min 44 px. Audit Figma tidak diwajibkan.
