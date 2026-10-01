# SCREENS.md — SIAGA Bunda build list (Figma-first)

> ATURAN: desain tidak boleh berpatok pada FE yang sudah diimplementasi.
> Tujuannya merombak ulang desain. Figma adalah sumber kebenaran; kode
> lama hanya arsip, dipakai lagi setelah Figma lock. Detail IPO tiap layar
> lihat `SiKiBa_Spesifikasi_Storyboard_Prototype.md`. Pola UI diringkas di
> `DESIGN.md`.

Legenda: `DONE` sudah di Figma (ID node) · `TODO` belum digambar.

## Onboarding

| ID | Layar | Figma | Isi kunci |
|---|---|---|---|
| S-00 | SplashScreen | DONE `21:936` | Panggung pink + sheet putih |
| S-01 | RegisterScreen L1 | DONE `21:972` | Stage pink + sheet form |
| S-01 OTP | RegisterScreen L2 | DONE `21:1036` | Stage pink + 6 kotak + demo |
| S-01b | LoginScreen | DONE `23:1071` | Stage pink + kartu + pil +62 |

## Beranda (S-02)

| ID | Layar | Figma | Isi kunci |
|---|---|---|---|
| S-02 | HomeScreen | DONE `23:1098` | Stage sapaan + sheet + pil nav |
| S-02a | ProfileCard | TODO | Nama, UK, HPL, tombol Sudah melahirkan |
| S-02b | QuickAction | TODO | Skrining, Catat BB, Reminder, Edukasi |
| S-02c | LastSkrCard | TODO | Hijau/Kuning/Merah terakhir |
| S-02d | ReminderSnippet | TODO | Suplemen + ANC hari ini |

## Skrining ibu hamil (S-03)

| ID | Layar | Figma | Isi kunci |
|---|---|---|---|
| S-03 | SkrMenuScreen | DONE `23:1345` · Nifas terkunci `126:2` · Bayi terkunci `126:126` | Stage + tab + kartu menu / empty state terkunci |
| S-03a | RiskFactorScreen | DONE `24:1845` + L2 `24:1892` + L3 `24:1947` | Ala FE 3 langkah lengkap |
| S-03b | GiziScreen | DONE `24:1516` | Ukur + kartu IMT otomatis |
| S-03c | DangerSignScreen | DONE `24:1553` | Toggle Ya Tidak + hasil |
| S-03d | PreeklamsiScreen | DONE `24:1604` | TD + kartu MAP otomatis |
| S-03e | DMGScreen | DONE `24:1642` | Chip riwayat + info TTGO |
| S-03f | MentalScreen | DONE `24:1681` | EPDS opsi + progress |
| S-03g | SkrResultScreen | DONE `24:1799` | Badge + faktor + langkah |

## Nifas + BBL (S-04 – S-05)

| ID | Layar | Figma | Isi kunci |
|---|---|---|---|
| S-04 | NifasSkrScreen | TODO | MEOWS + lochia + EPDS nifas |
| S-04a | LaktasiScreen | TODO | Kecukupan ASI + deteksi mastitis |
| S-05 | BBLScreen | TODO | Indeks via tab BBL, prioritas per usia |
| S-05a | IkterusScreen | TODO | Zona Kramer 1-5 + onset |
| S-05b | HipotiroidScreen | TODO | Status TSH 48-72 jam |
| S-05c | — | DIBATALKAN | Sesuai arahan stakeholder |

## Edukasi (S-06)

| ID | Layar | Figma | Isi kunci |
|---|---|---|---|
| S-06 | EduMenuScreen | TODO | Indeks + kartu mini |
| S-06a | FertilisasiScreen | TODO | Artikel + video |
| S-06b | JaninWeekScreen | TODO | Personal per UK aktif |
| S-06c | PlasentaScreen | TODO | + kondisi bahaya |
| S-06d | FisiologiScreen | TODO | 11 sistem organ |
| S-06e | TandaBahayaEduScreen | TODO | Pasangan S-03c |
| S-06f | PsikologiScreen | TODO | Per trimester + link S-03f |
| S-06g | CommonDisorderScreen | TODO | 25+ keluhan + klasifikasi |
| S-06h | BirthPlanScreen | TODO | Form P4K + progress |

## Reminder + Tracker (S-07)

| ID | Layar | Figma | Isi kunci |
|---|---|---|---|
| S-07 | BBTrackerScreen | TODO | Grafik vs target IOM, empty state |
| S-07a | SuplemenScreen | TODO | Toggle + kepatuhan 7 hari |
| S-07b | ANCScheduleScreen | TODO | 6 kunjungan + notif H-3/H-1 |
| S-07c | DiaryScreen | TODO | Mood 5 level + kalender mood |
| S-07d | TimelineScreen | TODO | Countdown HPL + milestone |

## Profil (S-08)

| ID | Layar | Figma | Isi kunci |
|---|---|---|---|
| S-08 | ProfileScreen | TODO | Hub ke 08a/08b/08c |
| S-08a | HistoryScreen | TODO | Kronologis + hapus (kecuali MERAH) |
| S-08b | ExportScreen | TODO | PDF + WA, watermark SIAGA |
| S-08c | SettingScreen | TODO | Notifikasi + privasi |

## Urutan gambar disarankan

1. S-01b (klon pola OTP, kecil)
2. S-02 + 02a-d (hub semua modul)
3. S-03 shell + S-03g (kerangka hasil dipakai semua skrining)
4. S-03a–f satu per satu
5. S-04, S-04a, S-05a, S-05b
6. S-07–07d, S-08–08c
7. S-06a–h (tunggu konten klinis)
