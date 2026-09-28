# SIAGA Bunda — Spesifikasi Storyboard & Prototype (sebelumnya SiKiBa)
## Aplikasi Mobile Skrining Kesehatan Ibu dan Bayi

> Dokumen ini merupakan hasil konversi dan konsolidasi dari *Storyboard Prototype SiKiBa (Pendekatan IPO)* — **rebrand resmi menjadi SIAGA Bunda** (*Sistem Informasi Antisipasi & menjaGA Bunda*, tagline “Siaga menjaga bunda dan buah hati”, logo `Logo Aplikasi Siaga Bunda.png`, palet Sage `#6B8E73`/Pink `#FFE2E2`/`#FFCFCF`/Bg `#FFFDEC`, font `Plus Jakarta Sans Variable` — lihat `PRODUCT.md:1a`), untuk keperluan penelitian **PDUPT Poltekkes Kemenkes Bandung 2026**. Bagian teknis tambahan (Bagian X) merupakan evaluasi independen terhadap tech stack yang diusulkan, disusun sebagai bahan diskusi finalisasi arsitektur sebelum tahap Develop.

**Peneliti:** Titi Legiati Praptiretno Sarwoayu, SST, M.Kes
**Anggota:** Diyan Indrayani, SST., S.Keb., Bd., M.Keb · Nurdiva Mardhiyyatuz Zahro, S.Tr., Keb
**Institusi:** Poltekkes Kemenkes Bandung
**Tahun:** 2026
**Tahap:** Define–Design (metode R&D 4D)
**Target platform (dikonfirmasi via FGD):** Mobile app (Android prioritas, iOS pengembangan lanjutan)
**Prototype:** https://sikibaskr.lovable.app

---

## Daftar Isi

1. [Arsitektur Informasi Aplikasi](#i-arsitektur-informasi-aplikasi)
2. [Modul Onboarding & Beranda](#ii-modul-onboarding--beranda)
3. [Modul Skrining Ibu Hamil](#iii-modul-skrining-ibu-hamil)
4. [Modul Skrining Nifas & Bayi Baru Lahir](#iv-modul-skrining-ibu-nifas--bayi-baru-lahir)
5. [Modul Edukasi](#v-modul-edukasi)
6. [Modul Reminder, Tracker & Profil](#vi-modul-reminder-tracker--profil)
7. [Tabel Detail Algoritma Skrining Klinis](#vii-tabel-detail-algoritma-skrining-klinis)
8. [Spesifikasi Teknis & Navigasi Aplikasi (Draft Awal)](#viii-spesifikasi-teknis--navigasi-aplikasi-draft-awal)
9. [Matriks Sinkronisasi Draft Storyboard & Proposal](#ix-matriks-sinkronisasi-draft-storyboard--proposal)
10. [Evaluasi & Usulan Penyesuaian Tech Stack](#x-evaluasi--usulan-penyesuaian-tech-stack)

---

## I. Arsitektur Informasi Aplikasi

Aplikasi **SIAGA Bunda** (sebelumnya SiKiBa) terdiri dari **5 modul utama** yang terhubung melalui bottom navigation. Setiap modul memiliki sub-layar independen dengan alur IPO tersendiri.

### Modul ONBOARDING
| Screen ID | Fitur / Sub-menu |
|---|---|
| S-00 — SplashScreen | Splash screen & branding |
| S-01 — RegisterScreen | Registrasi akun baru |
| S-01b — LoginScreen | Login / masuk akun |

### Modul BERANDA
| Screen ID | Fitur / Sub-menu |
|---|---|
| S-02 — HomeScreen | Dashboard utama ibu hamil |
| S-02a — ProfileCard (komponen) | Kartu profil & status kehamilan |
| S-02b — QuickAction (komponen) | Quick action — akses cepat menu utama |
| S-02c — LastSkrCard (komponen) | Status skrining terakhir |
| S-02d — ReminderSnippet (komponen) | Reminder harian (ringkasan) |

### Modul SKRINING
| Screen ID | Fitur / Sub-menu |
|---|---|
| S-03 — SkrMenuScreen | Menu skrining — ibu hamil |
| S-03a — RiskFactorScreen | Skrining faktor risiko (Poedji Rochjati) |
| S-03b — GiziScreen | Skrining status gizi (IMT, LILA) |
| S-03c — DangerSignScreen | Skrining tanda bahaya kehamilan |
| S-03d — PreeklamsiScreen | Skrining preeklamsia (MAP, TD, proteinuria) |
| S-03e — DMGScreen | Skrining diabetes mellitus gestasional (DMG) |
| S-03f — MentalScreen | Skrining kesehatan mental — EPDS antenatal |
| S-03g — SkrResultScreen | Hasil & rekomendasi skrining |
| S-04 — NifasSkrScreen | Skrining ibu nifas (perdarahan, infeksi, PE) |
| S-04a — LaktasiScreen | Skrining masalah menyusui & laktasi |
| S-05 — BBLScreen | Skrining bayi baru lahir |
| S-05a — IkterusScreen | Skrining ikterus neonatal |
| S-05b — HipotiroidScreen | Skrining hipotiroid kongenital |
| ~~S-05c — KelainanScreen~~ | ~~Dibatalkan~~ |

### Modul EDUKASI
| Screen ID | Fitur / Sub-menu |
|---|---|
| S-06 — EduMenuScreen | Menu edukasi beranda |
| S-06a — FertilisasiScreen | Terjadinya kehamilan (fertilisasi) |
| S-06b — JaninWeekScreen | Perkembangan janin per minggu |
| S-06c — (nama layar belum diberi kode eksplisit) | Perkembangan plasenta, tali pusat, ketuban |
| S-06d — FisiologiScreen | Perubahan fisiologi per sistem organ (11 sistem) |
| S-06e — TandaBahayaEduScreen | Tanda bahaya kehamilan (artikel/video) |
| S-06f — PsikologiScreen | Perubahan psikologi trimester 1-2-3 |
| S-06g — CommonDisorderScreen | Keluhan umum kehamilan & cara mengatasi |
| S-06h — BirthPlanScreen | Birth plan & persiapan persalinan P4K |

### Modul REMINDER & TRACKER
| Screen ID | Fitur / Sub-menu |
|---|---|
| S-07 — BBTrackerScreen | Tracker berat badan mingguan |
| S-07a — SuplemenScreen | Reminder suplemen harian (Fe, Folat, Ca) |
| S-07b — ANCScheduleScreen | Reminder & jadwal kunjungan ANC |
| S-07c — DiaryScreen | Diary harian ibu hamil |
| S-07d — TimelineScreen | Timeline pregnancy & countdown HPL |

### Modul PROFIL
| Screen ID | Fitur / Sub-menu |
|---|---|
| S-08 — ProfileScreen | Profil ibu & data kehamilan |
| S-08a — HistoryScreen | Riwayat skrining lengkap |
| S-08b — ExportScreen | Ekspor data ke PDF / bidan |
| S-08c — SettingScreen | Pengaturan notifikasi & privasi |

---

## II. Modul Onboarding & Beranda
*Screen S-00 s.d. S-02d*

**Deskripsi modul:**
- **Onboarding**: Splash, Registrasi, Login — pintu masuk aplikasi.
- **Beranda**: Dashboard personal ibu hamil, menampilkan status kehamilan terkini, status skrining, dan akses cepat ke semua fitur utama.

### S-00 — Splash Screen (SplashScreen)
**Fungsi:** Layar pembuka aplikasi **SIAGA Bunda** dengan identitas brand dan tombol masuk/daftar.

- **Input:** Tidak ada input pengguna. Waktu tampil 2–3 detik (auto). Status login tersimpan (SharedPreferences).
- **Proses:**
  - Cek status sesi login: jika sudah login → redirect ke HomeScreen (S-02); jika belum login → tampil tombol Daftar/Masuk.
  - Preload data profil pengguna dari lokal DB.
- **Output:** Logo **SIAGA Bunda** (`Logo Aplikasi Siaga Bunda.png`, palet `#6B8E73`/`#FFFDEC`) + tagline “Siaga menjaga bunda dan buah hati”, animasi masuk layar, tombol "Mulai sekarang" / "Sudah punya akun?", versi aplikasi (footer).
- **Navigasi:** Auto → S-02 (jika sudah login) · Tap Daftar → S-01 · Tap Masuk → S-01b.
- **Referensi:** Storyboard draft baris 1; desain user-centered onboarding.

### S-01 — Registrasi Akun Baru (RegisterScreen)
**Fungsi:** Form pendaftaran ibu hamil. Data ini menjadi basis seluruh kalkulasi otomatis di aplikasi (usia kehamilan, G-P-A, HPL).

- **Input:** Nama lengkap, tanggal lahir (DD/MM/YYYY), nomor telepon (WhatsApp), hamil ke- (gravida), jumlah persalinan (para), jumlah keguguran (abortus), HPHT (Hari Pertama Haid Terakhir), fasyankes/nama bidan.
- **Proses:**
  - Kalkulasi otomatis usia kehamilan: **UK (minggu) = selisih bulan (Tgl. Periksa − HPHT) × 4⅓**.
  - Kalkulasi HPL (Naegele): **HPL = HPHT + 9 bulan + 7 hari**.
  - Format G-P-A dari input numerik.
  - Validasi: semua field wajib, format tanggal, nomor valid.
   - Simpan ke Dexie (IndexedDB) lokal + sync ke Supabase Postgres.
- **Output:** Akun tersimpan, tampil profil (Nama, Usia, G-P-A), usia kehamilan dalam minggu (dinamis), estimasi HPL, redirect ke HomeScreen.
- **Navigasi:** Daftar berhasil → S-02 · Sudah punya akun → S-01b.
- **Referensi:** Storyboard draft baris 1; rumus UK (selisih bulan × 4⅓); Naegele rule untuk HPL; Brand SIAGA Bunda `PRODUCT.md:1a`.

### S-02 — Beranda / Dashboard (HomeScreen) — UPDATED 2026-08-31
**Fungsi:** Pusat informasi personal ibu hamil. Menampilkan status kehamilan aktif, skrining terakhir, pengingat hari ini, dan akses cepat ke semua modul. **Mengelola 2 mode tampilan (Hamil & Nifas/BBL)** serta menyediakan pemicu transisi persalinan dan akses balik ke riwayat kehamilan.

> **Komponen bento:** `S-02a ProfileCard` · `S-02b QuickAction` · `S-02c LastSkrCard` · `S-02d ReminderSnippet` — sesuai tabel Arsitektur Informasi Modul BERANDA.

- **Input:**
  - Data profil dari DB (nama, UK, G-P-A) — `db.profiles`
  - Status skrining terakhir (dari SkrResult DB) — `db.screeningResults`
  - Jadwal reminder aktif — `db.ancVisits` / `db.supplementReminders`
  - Tanggal hari ini (sistem)
  - **Data kelahiran (untuk transisi):** Tgl & Jam Lahir Bayi, Jenis Kelamin, BB (kg) & PB (cm), Metode Persalinan (Normal/Caesar)

- **Proses:**
  - **Mode Hamil (default):**
    - Hitung ulang UK setiap kali halaman dibuka: **UK = selisih bulan (today − HPHT) × 4⅓ (≈ ×4.33)** — *tetap 4⅓ sesuai verifikasi Halodoc/TzuChi/ACOG*
    - Hitung countdown HPL (hari tersisa) via Naegele `HPL = HPHT + 7 hari − 3 bulan + 1 tahun` (= HPHT + 280 hari / +9 bln+7 hr)
    - Tentukan trimester (T1: UK<14, T2: 14–27, T3: ≥28)
    - Hitung progress bar kehamilan: **UK / 40 minggu × 100%**
    - Load notifikasi reminder yang jatuh tempo hari ini
    - Load kartu status skrining terakhir
  - **Pemicu Transisi Persalinan:**
    - Tampilkan tombol **"Sudah melahirkan? Klik di sini"** di dalam card profil, di bawah G-P-A dan HPL (S-02a)
    - Saat user tap → tampilkan **Pop-up Form Kelahiran** (dialog isian: Tanggal & Jam Lahir, Jenis Kelamin, BB & PB, Metode Normal/Caesar)
    - Saat user simpan form → `db.profiles.isPostpartum = true`, switch seluruh tampilan Dashboard ke **Mode Nifas & BBL** (persist)
  - **Mode Nifas & BBL (setelah transisi):**
    - Hitung **Hari Nifas** (Hari ke-1 s.d. 42 / Masa KF 1–4) dan **Usia Bayi** (KN 1–3: KN1 0–7 hr, KN2 8–28 hr, KN3 29 hr–42 hr)
    - Load kartu status skrining nifas dan BBL terakhir (S-04, S-05a/b)
    - Progress bar nifas + countdown 42 hari + reminder nifas/BBL

- **Output:**
  - **Mode Hamil:**
    - Kartu profil S-02a: nama, usia, G-P-A, UK (minggu, dinamis), HPL
    - Progress bar kehamilan + countdown HPL
    - Kartu status skrining terakhir (hijau/kuning/merah) S-02c
    - Quick action S-02b: Skrining, Catat BB, Reminder, Edukasi
    - Reminder harian S-02d: suplemen + ANC
    - Tombol transisi "Sudah melahirkan? Klik di sini"
    - Bottom navigation 5 tab
  - **Pop-up Form Kelahiran:** dialog isian data persalinan & BBL (validasi BB 1000–6000g, PB 30–60cm, wajib isi)
  - **Mode Nifas & BBL (setelah transisi):**
    - Kartu profil: nama, status bayi (BB & PB), tanggal lahir, jenis kelamin, metode persalinan
    - Progress bar nifas + countdown nifas 42 hari
    - Kartu status skrining nifas dan BBL terakhir (hijau/kuning/merah)

- **Navigasi:**
  - Tap Skrining → S-03 · Tap Edukasi → S-06 · Tap Reminder → S-07 · Tap Profil → S-08 · Kartu skrining → S-03g
  - Tap **"Sudah melahirkan? Klik di sini"** → tampilkan Popup Form Kelahiran
  - Tap **Simpan** pada form kelahiran → switch Beranda ke Mode Nifas & BBL → akses S-04 s.d. S-05b (nifas & BBL)

- **Referensi:** Storyboard draft baris 1; **UK formula selisih bulan ×4⅓** (verified Halodoc 2026, TzuChi 2025, Haibunda 2024 — 1 bulan ≈ 4.33 minggu; Hibahkan: S-01/S-02 konsisten `app/src/clinical-rules/ukHpl.ts:8` `13/3`); Naegele HPL `HPHT+7hr−3bln+1th` / `+280 hari` (Alodokter, Halodoc); Dokumen konfidensial PDUPT Poltekkes Bandung 2026.

---

## III. Modul Skrining Ibu Hamil
*Screen S-03 s.d. S-03g*

**Kerangka teori:**
1. **Pendekatan Risiko** — sistem skoring Poedji Rochjati/Mochtar untuk faktor risiko kehamilan (Risiko Rendah ≤2, Sedang 4–6, Tinggi ≥8).
2. **Maternal & Neonatal Early Warning System (MEWS/MEOWS)** — threshold klinis tanda bahaya untuk ibu nifas dan bayi baru lahir.

Hasil skrining dikategorikan dengan kode warna: **Hijau** (aman), **Kuning** (waspada), **Merah** (bahaya — rujuk segera).

### S-03 — Menu Skrining (SkrMenuScreen)
**Fungsi:** Halaman indeks semua skrining tersedia, dengan indikator warna status penyelesaian.

- **Input:** Riwayat skrining dari DB, status (Selesai/Belum/Perlu Cek), usia kehamilan aktif.
- **Proses:** Load daftar skrining dari database, filter berdasarkan tab aktif (Ibu Hamil / Nifas / BBL), tampilkan status tiap item dengan dot indikator, tentukan skrining mana yang relevan berdasarkan UK.
- **Output:** Tab (Ibu Hamil | Nifas | Bayi Baru Lahir), daftar skrining dengan status (dot hijau/kuning/merah/abu), badge (Selesai/Perlu Cek/Belum), progress keseluruhan skrining.
- **Navigasi:** Tap item → layar skrining terkait · Tab Nifas → S-04 · Tab BBL → S-05.
- **Referensi:** Storyboard baris 15–24; Proposal Bab Tinjauan Pustaka.

### S-03a — Skrining Faktor Risiko Kehamilan (RiskFactorScreen)
**Fungsi:** Skrining komprehensif faktor risiko kehamilan berbasis sistem skoring Poedji Rochjati (anamnesis, riwayat obstetri, kondisi medis).

- **Input:** Usia ibu (tahun), usia kehamilan (minggu), status paritas (primigravida/multi/grande), jarak kehamilan terakhir, riwayat komplikasi obstetri, riwayat penyakit kronik, tekanan darah saat ini, tinggi & berat badan, riwayat preeklamsia sebelumnya, kehamilan multipel (gemeli), teknik reproduksi berbantu.
- **Proses:**
  - Skor dasar ≥1 = 2 poin.
  - Usia <20 th atau >35 th: +4.
  - Paritas ≥4: +4.
  - Jarak <2 th: +4.
  - Riwayat komplikasi: +4/+8.
  - Penyakit kronik (HT, DM, Jantung, Ginjal): +8.
  - Kehamilan multipel: +4.
  - Kategorisasi total skor: 2 = Risiko Rendah (KRR) · 4–6 = Risiko Sedang (KRS) · ≥8 = Risiko Tinggi (KRT).
- **Output:** Total skor risiko, kategori (KRR/KRS/KRT dengan kode warna), daftar faktor risiko teridentifikasi, faktor protektif normal, rekomendasi tindak lanjut spesifik, rujukan ke fasyankes sesuai level risiko, simpan ke riwayat skrining.
- **Navigasi:** Hitung skor → S-03g (Hasil) · Kembali → S-03.
- **Referensi:** Poedji Rochjati 2003; Mochtar, Sinopsis Obstetri; Proposal Pendekatan Risiko.

### S-03b — Skrining Status Gizi (GiziScreen)
**Fungsi:** Penilaian status gizi ibu hamil berdasarkan IMT pra-hamil dan LILA, serta kalkulasi kenaikan BB yang direkomendasikan.

- **Input:** Berat badan sebelum hamil (kg), tinggi badan (cm), Lingkar Lengan Atas/LILA (cm), berat badan saat ini (kg), usia kehamilan (minggu).
- **Proses:**
  - Kalkulasi IMT pra-hamil: **BB (kg) / TB² (m)**.
  - Kategorisasi IMT WHO: <18,5 Kurus (target +12,5–18 kg) · 18,5–24,9 Normal (target +11,5–16 kg) · 25–29,9 Gemuk (target +7–11,5 kg) · ≥30 Obesitas (target +5–9 kg).
  - Evaluasi LILA: <23,5 cm = KEK (Kurang Energi Kronik).
  - Hitung kenaikan BB aktual vs target per UK; evaluasi trajectory (sesuai/kurang/lebih).
- **Output:** IMT pra-hamil & kategori, status LILA (normal/KEK), kenaikan BB aktual vs rekomendasi, grafik trajectory BB, rekomendasi kebutuhan kalori harian, anjuran konsultasi gizi jika KEK/obesitas.
- **Navigasi:** Simpan → S-03g · Kembali → S-03.
- **Referensi:** IOM 2009 (gestational weight gain); WHO LILA cutoff <23,5 cm; Kemenkes Pedoman Gizi Ibu Hamil.

### S-03c — Skrining Tanda Bahaya Kehamilan (DangerSignScreen)
**Fungsi:** Checklist mandiri tanda bahaya kehamilan dengan algoritma triage otomatis berdasarkan kombinasi gejala.

- **Input:** Perdarahan per vagina (ada/tidak), nyeri kepala hebat (skala 1–5), pandangan kabur/fotofobia, nyeri abdomen hebat, bengkak wajah/tangan/kaki, gerakan janin berkurang (<10x/2jam), demam tinggi (>38°C), keluar cairan/ketuban pecah, sesak napas mendadak.
- **Proses:**
  - Setiap "Ya" = flag merah.
  - Perdarahan / nyeri kepala + penglihatan kabur / nyeri abdomen hebat → BAHAYA MERAH.
  - Bengkak + TD tinggi → risiko preeklamsia → cek S-03d.
  - Gerakan janin <10x/2jam → WASPADAI.
  - Kombinasi ≥2 gejala → SEGERA KE FASYANKES.
  - Tentukan level urgensi: Segera/Pantau/Normal.
- **Output:** Status triage (AMAN/WASPADA/BAHAYA), list tanda bahaya tercentang, penjelasan klinis tiap gejala, rekomendasi (Pantau/Ke bidan/Ke IGD RS), link Google Maps fasyankes terdekat (jika bahaya), nomor darurat bidan/puskesmas.
- **Navigasi:** Hasil bahaya → S-03g + notifikasi darurat · Kembali → S-03.
- **Referensi:** Storyboard draft Menu 5; Kemenkes Pedoman ANC Terpadu 2020; WHO Danger Signs in Pregnancy.

### S-03d — Skrining Preeklamsia (PreeklamsiScreen)
**Fungsi:** Skrining risiko preeklamsia menggunakan kalkulasi MAP (Mean Arterial Pressure) dan sistem skoring risiko multifaktor.

- **Input:** TD sistolik & diastolik (mmHg), usia kehamilan (minggu), ada/tidak proteinuria (dipstik), riwayat preeklamsia sebelumnya, kehamilan multipel, IMT pre-hamil, nullipara/multipara, riwayat HT kronik, penyakit autoimun (APS, SLE).
- **Proses:**
  - Kalkulasi MAP: **(2×Diastolik + Sistolik) / 3**.
  - Kategorisasi TD: Normal <120/80 · Prehipertensi 120–139/80–89 · HT stage 1: 140–159/90–99 · HT stage 2/krisis ≥160/110.
  - Skoring risiko preeklamsia (NICE): risiko tinggi jika riwayat PE, HT kronik, penyakit ginjal, DM, autoimun; risiko sedang jika ≥2 faktor moderate (nullipara, usia >40, BMI>35, jarak >10th, riwayat keluarga).
  - Kategorisasi MAP: <90 mmHg = Normal · 90–99 mmHg = Waspada · >99 mmHg = Risiko tinggi preeklamsia.
- **Output:** Nilai MAP terhitung, kategorisasi TD, kategori risiko PE (Rendah/Sedang/Tinggi), rekomendasi aspirin 75–150mg jika risiko tinggi UK <16mg (untuk dokter/bidan), jadwal pemantauan TD berikutnya, anjuran segera ke fasyankes jika TD ≥160/110.
- **Navigasi:** Simpan → S-03g · Kembali → S-03.
- **Referensi:** Storyboard draft Menu 18; WHO ANC Recommendations 2016; NICE Guideline NG133 (Hypertension in Pregnancy); Proposal skrining preeklamsia MAP.

### S-03e — Skrining DMG / Diabetes Mellitus Gestasional (DMGScreen)
**Fungsi:** Skrining faktor risiko diabetes mellitus gestasional, direkomendasikan pada UK 24–28 minggu sesuai panduan Kemenkes.

- **Input:** Usia (tahun), IMT pra-hamil, riwayat DMG sebelumnya, riwayat bayi makrosomia (>4kg), riwayat DM pada keluarga dekat, glikosuria pada pemeriksaan urin, polisistik ovarium (PCOS), etnis berisiko tinggi (Asia, Afrika), usia kehamilan saat skrining.
- **Proses:**
  - Wajib skrining TTGO jika UK 24–28 minggu.
  - Faktor risiko mayor (≥1): riwayat DMG, bayi makrosomia, DM keluarga dekat, IMT>30.
  - Kategorisasi: Risiko rendah / Risiko tinggi → TTGO.
  - Kalkulasi BMI sebagai faktor risiko; tentukan urgensi pemeriksaan glukosa darah.
- **Output:** Profil risiko DMG (rendah/sedang/tinggi), rekomendasi pemeriksaan TTGO jika UK 24–28mg, anjuran diet pradiabetes (karbohidrat kompleks, GI rendah), jadwal kontrol selanjutnya, penjelasan gejala hiperglikemia yang perlu diwaspadai.
- **Navigasi:** Simpan → S-03g · Kembali → S-03.
- **Referensi:** Storyboard draft Menu 19; POGI PERKENI — Konsensus DMG 2021; Kemenkes Pedoman ANC Terpadu 2020.

### S-03f — Skrining Kesehatan Mental / EPDS Antenatal (MentalScreen)
**Fungsi:** Skrining depresi dan kecemasan antenatal menggunakan adaptasi EPDS (Edinburgh Postnatal Depression Scale) 10 item yang telah tervalidasi untuk kehamilan.

- **Input:** 10 pertanyaan EPDS (skor 0–3 per item), konteks 7 hari terakhir — lihat Tabel 1. Kuisioner lengkap (Cox et al. 1987) sebagai berikut:

  **Tabel 1. Kuisioner EPDS (diterima dari Diva — final):**
  | No | Pertanyaan | 0 | 1 | 2 | 3 |
  |---|---|---|---|---|---|
  | 1 | Saya dapat tertawa dan melihat sisi yang menyenangkan dari suatu hal | Sebanyak-banyaknya | Sekarang ini tidak terlalu banyak | Sedikit | Tidak sama sekali |
  | 2 | Saya gembira menghadapi segala sesuatu | Sebanyak-banyaknya | Berkurang sedikit dari biasanya | Sangat kurang dari biasanya | Hampir tidak pernah |
  | 3 | Saya menyalahkan diri sendiri secara tidak semestinya bila keadaan menjadi buruk | Tidak, tidak pernah | Tidak terlalu sering | Ya, kadang-kadang | Ya, hampir selalu |
  | 4 | Saya merasa khawatir atau cemas tanpa alasan yang jelas | Tidak, tidak sama sekali | Hampir tidak pernah | Ya, kadang-kadang | Ya, sangat sering |
  | 5 | Saya merasa takut atau panik tanpa alasan yang jelas | Tidak sama sekali | Tidak, tidak banyak | Ya, kadang-kadang | Ya, cukup sering |
  | 6 | Segala sesuatu terasa membebani saya | Tidak, saya bisa mengatasinya dengan baik seperti biasa | Tidak, hampir selalu saya bisa mengatasinya dengan baik | Ya, kadang-kadang saya tidak bisa mengatasinya sebaik biasanya | Ya, hampir selalu saya tidak bisa mengatasinya |
  | 7 | Saya merasa tidak bahagia hingga saya merasa sulit untuk tidur | Tidak sama sekali | Tidak terlalu sering | Ya, kadang-kadang | Ya, hampir setiap waktu |
  | 8 | Saya merasa sedih dan jengkel tidak menentu | Tidak sama sekali | Tidak, tidak banyak | Ya, kadang-kadang | Ya, hampir setiap waktu |
  | 9 | Saya merasa sangat tidak bahagia hingga menangis | Tidak sama sekali | Tidak begitu sering | Ya, cukup sering | Ya, hampir setiap waktu |
  | 10 | Pikiran untuk melukai diri sendiri telah terjadi pada saya | Tidak pernah | Hanya sesekali | Ya, cukup sering | Ya, hampir setiap waktu |

  Sumber: Cox, J.L., Holden, J.M., and Sagovsky, R. (1987).

- **Proses:**
  - Kalkulasi total skor EPDS (0–30): 0–8 kemungkinan tidak ada depresi · 9–11 kemungkinan depresi ringan → pantau · 12–13 kemungkinan depresi sedang → rujuk konseling · ≥14 kemungkinan depresi berat → rujuk spesialis.
  - Item no. 10 skor ≥1 (menyakiti diri) → langsung rujuk MERAH, terlepas dari total skor.
  - Tampilkan pesan validasi emosi per rentang skor; simpan tren skor per trimester.
- **Output:** Skor total EPDS, kategori (HIJAU 0–8 / KUNING 9–13 / MERAH ≥14 atau item 10 ≥1), pesan empatik berbasis skor, rekomendasi (Mandiri/Konseling bidan/Rujuk spesialis jiwa), sumber daya dukungan (hotline, konseling), tren skor kesehatan mental dari waktu ke waktu.
- **Navigasi:** Simpan → S-03g · Kembali → S-03.
- **Referensi:** Storyboard draft Menu 14 & 20; Cox JL (1987) — EPDS original; Adaptasi Indonesia: Irawati & Yuliani (2005); Kuisioner final Diva.

### S-03g — Hasil & Rekomendasi Skrining (SkrResultScreen)
**Fungsi:** Layar hasil akhir setelah satu sesi skrining selesai — summary, faktor risiko, dan rekomendasi tindak lanjut terstruktur.

- **Input:** Skor/status dari skrining yang baru diselesaikan, data profil pengguna, riwayat skrining sebelumnya (untuk perbandingan).
- **Proses:**
  - Tentukan warna hasil: Hijau (aman, semua parameter normal) · Kuning (waspada, ada faktor risiko sedang) · Merah (bahaya, risiko tinggi/tanda bahaya).
  - Generate rekomendasi tindak lanjut berbasis algoritma; tentukan urgensi (Pantau mandiri/Kunjungi bidan/Segera ke IGD).
  - Simpan hasil ke riwayat skrining (timestamp); kirim notifikasi pengingat tindak lanjut.
- **Output:** Indikator warna besar (hijau/kuning/merah), skor + kategori risiko, list faktor risiko teridentifikasi, list kondisi normal (reassurance), langkah tindak lanjut (numbered steps), tombol Ulangi Skrining / Ke Beranda / Bagikan ke Bidan, tanggal & waktu skrining tersimpan.
- **Navigasi:** Selesai → S-02 (Beranda) · Ulangi → form skrining terkait · Bagikan → ekspor PDF.
- **Referensi:** Proposal Pendekatan Risiko + MEWS; Poedji Rochjati KRR/KRS/KRT; WHO traffic light triage system.

---

## IV. Modul Skrining Ibu Nifas & Bayi Baru Lahir
*Screen S-04 s.d. S-05b — berbasis MEWS/MEOWS & Neonatal Warning System (S-05c dibatalkan)*

**Catatan sistem:** Setiap parameter vital memiliki threshold "zona kuning" (perlu pantau) dan "zona merah" (tindakan segera). Jika ibu berada di masa nifas (0–42 hari pasca bersalin), modul Nifas otomatis aktif menggantikan modul Kehamilan di beranda.

### S-04 — Skrining Ibu Nifas (NifasSkrScreen)
**Fungsi:** Skrining komprehensif kondisi kesehatan ibu pada masa nifas (0–42 hari) — tanda bahaya vital, kondisi luka, laktasi, dan psikologis.

- **Input:** Hari ke- masa nifas, suhu tubuh (°C), tekanan darah (mmHg), kondisi perdarahan (normal lochia/abnormal), kondisi luka perineum/SC (baik/bengkak/bernanah), keluhan nyeri (skala 0–10), produksi ASI (ada/tidak/sedikit), kondisi payudara, suasana hati, frekuensi menyusui, tanda infeksi (demam, menggigil, bau lochia).
- **Proses:**
  - MEOWS: TD >160/110 atau <90/60 → merah; suhu >38°C atau <36°C → merah.
  - Evaluasi perdarahan: normal lochia rubra (0–3 hr), serosa (4–10 hr), alba (11–42 hr); abnormal jika >500ml, berbau, atau bergumpal besar.
  - Evaluasi infeksi: demam >38°C + nyeri uterus → curiga endometritis.
  - Evaluasi preeklamsia nifas: TD tinggi + sakit kepala + penglihatan kabur.
  - Skrining baby blues/depresi postpartum (EPDS adaptasi nifas).
- **Output:** Status per parameter (Hijau/Kuning/Merah), summary (Aman/Perlu Pantau/Bahaya), rekomendasi spesifik per keluhan, edukasi perawatan nifas sesuai temuan, pengingat kunjungan nifas (KN1–4), rujukan segera jika parameter merah.
- **Navigasi:** Simpan → S-03g · Kembali → S-03 · Diakses via Tab Nifas di SkrMenu.
- **Referensi:** Storyboard Menu 22; WHO MEWS thresholds; Kemenkes Buku KIA Nifas 2022; Proposal skrining ibu nifas.

### S-04a — Skrining Masalah Menyusui / Laktasi (LaktasiScreen)
**Fungsi:** Skrining mandiri masalah laktasi umum pada ibu nifas, dengan panduan praktis dan indikasi kapan harus mencari bantuan tenaga kesehatan.

- **Input:** Usia bayi (hari/bulan), frekuensi menyusui per 24 jam, durasi per sesi menyusui, kondisi puting (nyeri/luka/masuk/normal), kondisi payudara (bengkak/keras/normal), volume ASI (cukup/sedikit/tidak ada), berat badan bayi (tren naik/turun/stagnan), frekuensi BAK bayi per hari, warna urin bayi.
- **Proses:**
  - Evaluasi kecukupan ASI: normal jika BAK ≥6x/hari & BB naik ≥15–30g/hari; kurang jika BAK <6x/hari & BB stagnan/turun.
  - Kondisi puting luka → indikasi posisi menyusui salah → edukasi latch-on.
  - Evaluasi mastitis: bengkak + merah + nyeri + demam → rujuk + antibiotik.
  - Identifikasi engorgement vs mastitis; rekomendasi teknik menyusui spesifik.
- **Output:** Status menyusui (Baik/Perlu Bantuan/Masalah Serius), identifikasi masalah spesifik, panduan teknik menyusui (gambar/ilustrasi), kapan harus ke konselor laktasi/bidan, rekomendasi pijat payudara mandiri.
- **Navigasi:** Simpan → S-03g · Kembali → S-04.
- **Referensi:** Storyboard Menu 23; WHO/UNICEF BFHI guidelines; Kemenkes Panduan Menyusui 2020.

### S-05 — Skrining Bayi Baru Lahir (BBLScreen)
**Fungsi:** Dashboard skrining komprehensif bayi baru lahir — indeks semua pemeriksaan neonatal yang tersedia dalam aplikasi.

- **Input:** Usia bayi (jam/hari), data lahir (berat, panjang, lingkar kepala), skor APGAR (jika diketahui), jenis persalinan (normal/SC), usia gestasi saat lahir (cukup bulan/prematur).
- **Proses:**
  - Tentukan skrining relevan berdasarkan usia bayi: 0–24 jam (APGAR, suhu, pernapasan, warna kulit), hari 2–7 (ikterus, menyusu, pola eliminasi), hari 7–28 (hipotiroid kongenital, perkembangan).
  - Tandai skrining yang sudah/belum dilakukan.
- **Output:** Daftar skrining BBL dengan status, usia bayi dalam hari (dinamis), rekomendasi skrining prioritas berdasarkan usia, progress penyelesaian skrining BBL.
- **Navigasi:** Tap Ikterus → S-05a · Tap Hipotiroid → S-05b · Kembali → S-03 (tab BBL) — S-05c dibatalkan.
- **Referensi:** Storyboard draft baris akhir (BBL); Proposal Skrining BBL; Kemenkes Buku KIA Neonatal 2022.

### S-05a — Skrining Ikterus Neonatal (IkterusScreen)
**Fungsi:** Pemantauan ikterus (kuning) pada bayi baru lahir menggunakan metode visual Kramer dan panduan kapan harus ke fasyankes.

- **Input:** Usia bayi (hari), warna kulit — kuning dari kepala sampai zona (1–5 Kramer), kuning muncul kapan (jam pertama/setelah 24 jam), aktivitas bayi (aktif/mengantuk/tidak mau minum), warna feses (normal/putih/dempul), warna urin, prematur atau tidak.
- **Proses:**
  - Evaluasi zona Kramer: Zona 1 (kepala-leher) kemungkinan normal jika >24 jam · Zona 3 (sampai pusar) waspadai · Zona 4–5 (telapak tangan/kaki) BAHAYA — fototerapi segera.
  - Evaluasi waktu onset: <24 jam selalu patologis → segera rujuk; 24–72 jam fisiologis vs patologis → pantau; >2 minggu prolonged jaundice → evaluasi penyebab.
  - Red flag: feses dempul → curiga atresia bilier.
- **Output:** Zona Kramer teridentifikasi, status (Fisiologis/Waspadai/Patologis — rujuk segera), penjelasan penyebab ikterus, anjuran (menyusu lebih sering/pantau/fototerapi/rujuk), edukasi cara cek ikterus di rumah, link fasyankes jika perlu fototerapi.
- **Navigasi:** Simpan → S-03g · Kembali → S-05.
- **Referensi:** Storyboard BBL; Kramer LIS (1969) — ikterus neonatal; AAP Guidelines for Jaundice 2022; Kemenkes MTBM ikterus.

### S-05b — Skrining Hipotiroid Kongenital (HipotiroidScreen)
**Fungsi:** Informasi dan panduan skrining hipotiroid kongenital — kondisi tanpa gejala awal, harus dideteksi sebelum usia 6 bulan untuk mencegah retardasi mental.

- **Input:** Sudah dilakukan skrining TSH? (Ya/Tidak), usia bayi saat pengambilan darah, gejala yang mungkin ada (ikterus lama, konstipasi, tangisan serak, aktivitas kurang, lidah besar).
- **Proses:**
  - Evaluasi apakah skrining sudah dilakukan (rekomendasi UK 48–72 jam); jika belum → beri pengingat dan edukasi pentingnya skrining.
  - Evaluasi gejala klinis yang mengarah ke hipotiroid; tentukan urgensi (Rutin/Segera ke fasyankes).
- **Output:** Status skrining TSH, penjelasan prosedur tes tetes darah, gejala yang perlu diwaspadai, pengingat jadwal skrining jika belum, rekomendasi fasyankes yang menyediakan skrining TSH neonatal.
- **Navigasi:** Simpan → S-03g · Kembali → S-05.
- **Referensi:** Storyboard BBL; Kemenkes Panduan Skrining Hipotiroid 2014; IDAI Rekomendasi Skrining Neonatal.

### S-05c — Skrining Kelainan Kongenital (KelainanScreen) — **DIBATALKAN**
> **Dibatalkan sesuai arahan stakeholder — tidak diimplementasikan.** Baris sebelumnya “Perlu dilengkapi” tidak berlaku.

---

## V. Modul Edukasi
*Screen S-06 s.d. S-06h — konten edukasi kehamilan, nifas, dan BBL*

### S-06 — Menu Edukasi Beranda (EduMenuScreen)
> Detail IPO belum dirinci pada dokumen sumber — berfungsi sebagai halaman indeks menuju S-06a s.d. S-06h.

### S-06a — Terjadinya Kehamilan / Fertilisasi (FertilisasiScreen)
> Berdasarkan matriks sinkronisasi: diadopsi dari Menu 1 storyboard draft, dipindah ke modul Edukasi. Format: artikel + video embed. Detail IPO rinci belum tercantum pada dokumen sumber.

### S-06b — Perkembangan Janin Per Minggu (JaninWeekScreen)
**Fungsi:** Konten edukasi interaktif perkembangan janin per minggu, menampilkan informasi relevan untuk minggu kehamilan aktif ibu.

- **Input:** Usia kehamilan aktif (minggu) dari data profil, navigasi manual ke minggu lain (opsional).
- **Proses:**
  - Ambil data konten untuk UK aktif dari database konten.
  - Personalisasi judul: "Minggu ke-28 kehamilan Ibu".
  - Hitung ukuran/berat janin estimasi berdasarkan UK.
  - Tampilkan apa yang harus dilakukan ibu minggu ini; tandai UK kritis (organogenesis, viabilitas, dll.).
- **Output:** Ilustrasi ukuran janin (dibanding buah/benda), berat & panjang estimasi janin, perkembangan organ/kemampuan minggu ini, tips kebutuhan ibu di minggu tersebut, tombol navigasi minggu sebelumnya/berikutnya.
- **Navigasi:** Auto buka UK aktif · Manual pilih minggu · Kembali → S-06.
- **Referensi:** Storyboard draft Menu 2; Williams Obstetrics 25th Ed.; Varney's Midwifery 6th Ed.

### S-06c — Perkembangan Plasenta, Tali Pusat, Ketuban
> Berdasarkan matriks sinkronisasi: diadopsi dari Menu 3 storyboard draft, ditambah konten kondisi yang membahayakan sistem ini. Detail IPO rinci belum tercantum pada dokumen sumber.

### S-06d — Perubahan Fisiologi per Sistem Organ (FisiologiScreen)
> Berdasarkan matriks sinkronisasi: diadopsi dari Menu 4 storyboard draft, dikembangkan per sistem organ (11 sistem) dengan ilustrasi interaktif. Detail IPO rinci belum tercantum pada dokumen sumber.

### S-06e — Tanda Bahaya Kehamilan — Edukasi (TandaBahayaEduScreen)
> Berdasarkan matriks sinkronisasi: perluasan dari Menu 5 storyboard draft (semula hanya info), kini bercabang menjadi konten edukasi di sini dan skrining interaktif dengan triage otomatis di S-03c. Detail IPO rinci format artikel/video belum tercantum pada dokumen sumber.

### S-06f — Perubahan Psikologi Trimester 1-2-3 (PsikologiScreen)
> Berdasarkan matriks sinkronisasi: diadopsi dari Menu 6 storyboard draft, diperkaya dengan konten per trimester dan link ke skrining mental (S-03f). Detail IPO rinci belum tercantum pada dokumen sumber.

### S-06g — Keluhan Umum Kehamilan (CommonDisorderScreen)
**Fungsi:** Skrining keluhan umum kehamilan dengan penilaian normal vs patologis. Fitur unik: ibu memasukkan keluhannya dan aplikasi menilai apakah normal atau perlu diwaspadai.

- **Input:** Pilih keluhan dari daftar 25+ keluhan umum kehamilan, input detail (intensitas, durasi, frekuensi), tambah keluhan manual (opsional).
- **Proses:**
  - Database keluhan dengan algoritma klasifikasi: Normal/fisiologis → penjelasan penyebab + cara mengatasi; Patologis/bahaya → arahkan ke fasyankes.
  - Contoh klasifikasi: mual-muntah (normal T1 vs hiperemesis gravidarum), nyeri kepala (tension normal vs preeklamsia), bengkak kaki (fisiologis vs preeklamsia), perdarahan (tidak ada yang normal).
  - Untuk keluhan patologis: tampilkan peta fasyankes terdekat.
- **Output:** Kategori keluhan (Fisiologis/Waspadai/Patologis), penjelasan klinis mudah dipahami, cara mengatasi (untuk fisiologis), tanda yang harus segera diwaspadai, link Google Maps fasyankes (untuk patologis).
- **Navigasi:** Pilih keluhan → hasil penilaian · Fasyankes → buka Google Maps · Kembali → S-06.
- **Referensi:** Storyboard draft Menu 8 (25 jenis keluhan); Varney's Midwifery; Williams Obstetrics.

### S-06h — Birth Plan & Persiapan Persalinan P4K (BirthPlanScreen)
**Fungsi:** Panduan perencanaan persalinan berbasis Program Perencanaan Persalinan dan Pencegahan Komplikasi (P4K) Kemenkes.

- **Input:** Nama penolong persalinan, tempat akan bersalin, pendamping persalinan, nama calon donor darah (minimal 2 orang, golongan darah sama), transportasi yang disiapkan, dana persalinan (estimasi), perlengkapan ibu & bayi (checklist), nomor HP bidan/dokter siaga, tanda persalinan yang sudah dipahami.
- **Proses:** Tampilkan checklist P4K secara dinamis, hitung progress kelengkapan P4K (%), validasi field penting (donor darah, transportasi), beri pengingat jika ada yang belum terisi, generate summary P4K yang bisa dibagikan ke bidan/keluarga.
- **Output:** Form P4K terisi, progress bar kelengkapan persiapan, ringkasan P4K yang bisa dicetak/dibagikan, checklist perlengkapan ibu & bayi, tanda-tanda persalinan (alert).
- **Navigasi:** Simpan → S-02 · Bagikan → ekspor PDF · Kembali → S-06.
- **Referensi:** Storyboard draft Menu 7; Kemenkes P4K 2021; Buku KIA halaman persiapan persalinan.

---

## VI. Modul Reminder, Tracker & Profil
*Screen S-07 s.d. S-08c*

### S-07 — Tracker Berat Badan (BBTrackerScreen)
**Fungsi:** Pencatatan dan visualisasi kenaikan berat badan mingguan ibu hamil, dengan evaluasi otomatis terhadap target kenaikan BB berbasis IMT pre-hamil.

- **Input:** Berat badan saat ini (kg), tanggal penimbangan, BB sebelum hamil (dari registrasi), IMT pre-hamil (kalkulasi otomatis).
- **Proses:** Kalkulasi kenaikan BB aktual (BB sekarang − BB pre-hamil), target kenaikan BB per UK berdasarkan IMT (IOM 2009), evaluasi trajectory (Normal/Kurang/Lebih), simpan riwayat BB ke database, buat grafik tren BB vs target, berikan alert jika BB di luar rentang target.
- **Output:** Grafik garis (line chart) BB mingguan vs garis target, full-bleed kiri-kanan, dengan skala sumbu Y adaptif mengikuti rentang BB yang tercatat (min−1 kg sampai maks+1 kg, target ikut dalam domain bila terlihat), total kenaikan BB aktual, status (Normal/Perlu Perhatian), riwayat 8 minggu terakhir, rekomendasi gizi jika kurang/lebih. Target awal dari IOM 2009 tetapi dapat diubah manual oleh pengguna. Bila belum ada data, tampilkan empty state (tanpa data contoh).
- **Aturan entri:** tambah BB lewat tombol → form bottom-sheet (tanggal, jam, timbangan kg); pembaruan di hari yang sama diperbolehkan dan digambar pada sumbu-x yang sama (beda tinggi Y); garis ke hari berikut memakai nilai terbaru hari sebelumnya; titik baru digambar hanya bila beratnya berbeda dari entri sebelumnya di hari itu.
- **Navigasi:** Simpan → refresh grafik · Kembali → S-02 · Quick access dari beranda.
- **Referensi:** Storyboard draft Menu 9; IOM 2009 — Weight Gain in Pregnancy; Kemenkes Pedoman Gizi Bumil.

### S-07a — Reminder Suplemen Harian (SuplemenScreen)
**Fungsi:** Pengingat harian konsumsi suplemen ibu hamil (Tablet Fe, Asam Folat, Kalsium), dapat dikustomisasi waktu dan on/off per suplemen.

- **Input:** Toggle on/off per suplemen, waktu pengingat (jam), suplemen yang dikonsumsi (pilih/sesuaikan).
- **Proses:** Daftarkan lokal notification per suplemen yang aktif, trigger notifikasi sesuai jam yang dikonfigurasi, catat kepatuhan (berhasil diminum vs dilewati), kalkulasi adherence rate (%).
- **Output:** Daftar suplemen dengan toggle on/off, waktu pengingat terkonfigurasi, notifikasi push harian sesuai jadwal, riwayat kepatuhan konsumsi (7 hari).
- **Navigasi:** Kembali → S-07/S-02 · Pengaturan → edit waktu.
- **Referensi:** Storyboard draft Menu 11; Kemenkes Pedoman TTD Ibu Hamil 2020; WHO Daily Iron and Folic Acid Supplementation.

### S-07b — Jadwal ANC & Reminder (ANCScheduleScreen)
**Fungsi:** Kalender kunjungan ANC sesuai rekomendasi Kemenkes (minimal 6 kali: 2x T1, 1x T2, 3x T3), dengan jadwal berikutnya dan pengingat H-3 sebelum kunjungan.

- **Input:** HPHT (dari registrasi), tanggal kunjungan ANC yang sudah dilakukan, fasyankes tujuan, nama bidan/dokter.
- **Proses:** Generate jadwal ANC otomatis berbasis HPHT, sesuaikan dengan rekomendasi Kemenkes 2020, hitung kunjungan sudah & belum, set notifikasi H-3 & H-1 sebelum kunjungan, tandai kunjungan yang sudah selesai, catat catatan singkat tiap kunjungan.
- **Output:** Timeline jadwal ANC 6 kunjungan, kunjungan yang sudah dilakukan (centang), kunjungan berikutnya dengan countdown, notifikasi H-3 dan H-1, catatan per kunjungan.
- **Navigasi:** Kembali → S-07 · Tap kunjungan → detail & catatan.
- **Referensi:** Storyboard draft Menu 10; Kemenkes Pedoman ANC Terpadu 2020; Standar 6 kunjungan ANC Kemenkes.

### S-07c — Diary Harian Ibu Hamil (DiaryScreen)
**Fungsi:** Catatan harian ekspresif ibu hamil — ruang untuk mencurahkan perasaan, merekam momen, dan memantau mood; opsional dengan background musik instrumental.

- **Input:** Teks bebas (diary entry), pilihan mood (5 level: Sangat baik → Tidak baik), tanggal (otomatis), toggle musik instrumental (opsional).
- **Proses:** Simpan entri diary ke database lokal, tag entri dengan mood, tampilkan kalender mood (warna per hari), cari entri berdasarkan tanggal/kata kunci.
- **Output:** Diary tersimpan dengan timestamp, kalender mood (warna per hari), riwayat entri diary, tren mood mingguan.
- **Navigasi:** Simpan → refresh list · Kembali → S-07.
- **Referensi:** Storyboard draft Menu 12 (dengan audio tenang); Reflective journaling — maternal wellbeing.

### S-07d — Timeline Pregnancy & Countdown (TimelineScreen)
**Fungsi:** Visualisasi motivasional perjalanan kehamilan — kalender minggu demi minggu dengan countdown hari bertemu si kecil.

- **Input:** HPHT (dari registrasi), HPL (kalkulasi otomatis), hari ini (sistem).
- **Proses:** Kalkulasi hari tersisa menuju HPL, buat kalender 40 minggu kehamilan, tandai UK saat ini dengan highlight, tampilkan milestone penting per trimester, hitung persentase kehamilan yang sudah dilalui.
- **Output:** Countdown hari menuju HPL, kalender 40 minggu dengan UK saat ini ditandai, milestone (organogenesis lengkap, viabilitas, full term), quote/motivasi berganti harian, progress bar besar kehamilan.
- **Navigasi:** Kembali → S-07/S-02.
- **Referensi:** Storyboard draft Menu 13; Developmental milestones in pregnancy.

### S-08 — Profil Ibu & Data Kehamilan (ProfileScreen)
> Detail IPO belum dirinci pada dokumen sumber — berfungsi sebagai hub yang menghubungkan ke S-08a (HistoryScreen), S-08b (ExportScreen), dan S-08c (SettingScreen).

### S-08a — Riwayat Skrining Lengkap (HistoryScreen)
> Detail IPO belum dirinci pada dokumen sumber — kemungkinan menampilkan seluruh riwayat hasil skrining (S-03g dan turunannya) secara kronologis. Perlu dilengkapi pada tahap Develop.

### S-08b — Ekspor Data & Berbagi ke Bidan (ExportScreen)
**Fungsi:** Mengekspor ringkasan data kehamilan, riwayat skrining, dan hasil pemantauan ke format PDF yang dapat dibagikan ke bidan atau disimpan.

- **Input:** Pilih periode data (bulan/semua), pilih isi yang akan diekspor (skrining/BB/ANC/semua), nama bidan tujuan (opsional).
- **Proses:** Generate PDF terstruktur berisi profil ibu, riwayat skrining, tren BB, jadwal ANC; format PDF ramah cetak A4 (palet SIAGA Bunda `#6B8E73`/`#FFFDEC`); opsi kirim via WhatsApp, email, atau simpan lokal; tanda air (watermark) "SIAGA Bunda — untuk keperluan medis" + tagline “Siaga menjaga bunda dan buah hati”.
- **Output:** File PDF ringkasan data kehamilan, preview sebelum ekspor, tombol Simpan ke perangkat / Kirim via WhatsApp.
- **Navigasi:** Kembali → S-08 · Ekspor berhasil → notifikasi sukses.
- **Referensi:** Kebutuhan integrasi tenaga kesehatan; kebutuhan FGD bidan — berbagi data pasien.

### S-08c — Pengaturan Notifikasi & Privasi (SettingScreen)
> Detail IPO belum dirinci pada dokumen sumber. Berdasarkan spesifikasi teknis (Bagian VIII), modul ini kemungkinan mencakup pengaturan notifikasi reminder dan kontrol privasi data (terkait enkripsi & penyimpanan lokal-first). Perlu dilengkapi pada tahap Develop.

---

## VII. Tabel Detail Algoritma Skrining Klinis

*Rujukan teknis untuk pengembang dan validator pakar. Tabel ini merangkum algoritma penilaian setiap modul skrining secara klinis, untuk divalidasi oleh pakar (dokter SpOG/bidan senior) pada tahap Develop. Sistem traffic light: Hijau = Aman · Kuning = Waspada · Merah = Bahaya/Rujuk Segera.*

### SK01 — Faktor Risiko Kehamilan (Skor Poedji Rochjati / Mochtar)
- **Input:** Usia ibu, paritas (G-P-A), jarak kehamilan, riwayat komplikasi, penyakit kronik, kehamilan multipel, teknologi reproduksi berbantu.
- **Algoritma:**
  - Skor dasar: semua ibu = 2.
  - Terlalu muda (<20 th) atau terlalu tua (>35 th): +4.
  - Grande multipara (≥4 anak): +4.
  - Jarak persalinan terakhir <2 tahun: +4.
  - Terlalu banyak anak (>4): +4.
  - Kehamilan berulang / riwayat operasi SC: +8.
  - Riwayat PE/eklampsia: +4.
  - Penyakit kronik (DM, HT, Jantung, Ginjal, SLE): +8.
  - Kehamilan kembar: +4.
  - Hidramnion: +4.
  - Kelainan letak (lintang/sungsang UK≥32mg): +8.
- **Output & Kategorisasi:** HIJAU: Skor 2 = KRR (bersalin di BPM/Puskesmas) · KUNING: Skor 4–6 = KRS (bersalin di Puskesmas PONED) · MERAH: Skor ≥8 = KRT (bersalin di RS PONEK).
- **Referensi:** Poedji Rochjati 2003; Mochtar, Sinopsis Obstetri; Kemenkes PONED/PONEK.

### SK02 — Preeklamsia & Tekanan Darah (MAP + Faktor Risiko NICE)
- **Input:** TD sistolik/diastolik, proteinuria, UK saat pemeriksaan, riwayat PE, faktor risiko.
- **Algoritma:**
  - MAP = (2×Diastolik + Sistolik) / 3.
  - Normal: MAP <90 mmHg.
  - Waspada: MAP 90–99 mmHg.
  - Risiko tinggi preeklamsia: MAP >99 mmHg.
  - HT gestasional: TD ≥140/90 setelah UK 20mg.
  - Preeklamsia: TD ≥140/90 + proteinuria ≥300mg/24jam.
  - PE berat: TD ≥160/110 atau proteinuria masif atau gejala berat.
  - Risiko tinggi PE (≥1): riwayat PE, HT kronik, DM, ginjal, autoimun.
  - Risiko sedang (≥2): nullipara, >40 th, BMI>35, jarak >10 th.
- **Output & Kategorisasi:** HIJAU: TD <140/90, MAP <90, tanpa proteinuria · KUNING: TD 140-159/90-109, atau MAP 90-99, atau risiko tinggi PE (aspirin profilaksis, rekomendasi untuk bidan/dokter) · MERAH: TD ≥160/110, atau MAP >99, atau PE berat, atau eklampsia (segera ke IGD RS).
- **Referensi:** NICE NG133 (2023); WHO ANC Recommendations 2016; Kemenkes Pedoman PE 2020.

### SK03 — Status Gizi & IMT (IOM 2009 + WHO LILA)
- **Input:** BB sebelum hamil (kg), TB (cm), LILA (cm), BB saat ini (kg), UK (minggu).
- **Algoritma:**
  - IMT = BB(kg) / TB²(m).
  - Kurus: IMT <18,5 → target +12,5–18 kg. Normal: 18,5–24,9 → target +11,5–16 kg. Gemuk: 25–29,9 → target +7–11,5 kg. Obesitas: ≥30 → target +5–9 kg.
  - LILA <23,5 cm = KEK.
  - Kenaikan BB aktual vs target per trimester: T1 total +0,5–2 kg, T2–T3 +0,4 kg/minggu (normal).
- **Output & Kategorisasi:** HIJAU: IMT normal, LILA ≥23,5, kenaikan BB sesuai target · KUNING: IMT kurus/gemuk, atau LILA 23–23,5, atau BB naik kurang · MERAH: LILA <23,5cm + gejala KEK, atau kenaikan BB jauh di bawah target (rekomendasi konsultasi gizi jika KEK/obesitas).
- **Referensi:** IOM 2009; WHO LILA cutoff <23,5 cm; Kemenkes Pedoman Gizi Bumil.

### SK04 — Tanda Bahaya Kehamilan (Checklist Triage Mandiri)
- **Input:** Perdarahan per vagina, nyeri kepala hebat, pandangan kabur, nyeri abdomen hebat, bengkak wajah/tangan, gerakan janin berkurang, demam >38°C, ketuban pecah, sesak napas mendadak.
- **Algoritma:**
  - MERAH langsung jika: perdarahan atau nyeri kepala + penglihatan kabur atau nyeri abdomen hebat atau ketuban pecah.
  - KUNING jika: bengkak + TD tinggi atau gerakan janin <10x/2jam atau demam >38°C.
  - Kombinasi ≥2 gejala KUNING → eskalasi ke MERAH.
  - HIJAU: tidak ada gejala di atas.
- **Output & Kategorisasi:** HIJAU: lanjutkan pemantauan rutin · KUNING: waspadai, hubungi bidan, pantau lebih ketat · MERAH: SEGERA ke IGD RS — tampil peta fasyankes + nomor darurat.
- **Referensi:** WHO Danger Signs in Pregnancy; Kemenkes Pedoman ANC 2020; Storyboard Menu 5 & 17.

### SK05 — Kesehatan Mental (EPDS)
- **Input:** 10 item EPDS, skor per item 0–3, konteks 7 hari terakhir — lihat Tabel 1 di S-03f (kuisioner final Diva, Cox et al. 1987). Rincian 10 pertanyaan tercantum lengkap di S-03f.
- **Algoritma:**
  - Total skor 0–30: 0–8 kemungkinan tidak ada depresi · 9–11 kemungkinan depresi ringan → pantau · 12–13 kemungkinan depresi sedang → rujuk konseling · ≥14 kemungkinan depresi berat → rujuk spesialis.
  - Item 10 skor ≥1 (menyakiti diri) → SEGERA rujuk MERAH berapapun total skor.
  - Simpan tren skor per kunjungan (perbandingan antar trimester).
- **Output & Kategorisasi:** HIJAU: Skor 0–8 (aman) · KUNING: Skor 9–13 (pantau & dukungan sosial, waspada) · MERAH: Skor ≥14 atau item 10 ≥1 (rujuk segera — bahaya); pesan empatik dan validasi perasaan per kategori; sumber daya dukungan (hotline konseling).
- **Referensi:** Cox JL et al. (1987); Validasi Indonesia: Irawati & Yuliani; WHO mhGAP Intervention Guide; Kuisioner final Diva (Tabel 1).

### SK06 — Skrining Ibu Nifas (MEOWS — Maternal Early Warning)
- **Input:** Hari ke- nifas, TD sistolik/diastolik, suhu tubuh, kondisi lochia, kondisi luka, nyeri (skala 0–10), tanda infeksi, gejala depresi.
- **Algoritma:**
  - MERAH (tindakan segera): TD >160/110 atau <90/60 · Nadi >130 atau <40 bpm · Suhu >38,5°C atau <36°C · SpO2 <95%.
  - KUNING (pantau ketat): TD 150-159/100-109 atau 80-89/50-59 · Suhu 38–38,4°C.
  - Perdarahan >500ml → HPP → MERAH.
  - Infeksi: demam + nyeri uterus + lochia berbau → curiga endometritis → KUNING/MERAH.
- **Output & Kategorisasi:** HIJAU: semua parameter normal (nifas fisiologis) · KUNING: ≥1 parameter kuning (pantau ketat, hubungi bidan) · MERAH: ≥1 parameter merah (segera ke fasyankes/IGD); rekomendasi per parameter abnormal.
- **Referensi:** Singh S et al. MEOWS UK (2012); Kemenkes Pedoman Nifas 2022; Proposal skrining nifas; Storyboard Menu 22.

---

## VIII. Spesifikasi Teknis & Navigasi Aplikasi (Draft Awal)

*Bagian ini merupakan spesifikasi teknis sebagaimana tercantum pada storyboard sumber. Evaluasi dan usulan penyesuaian teknis tercantum pada Bagian X.*

### 8.1 Spesifikasi Teknis Aplikasi (draft awal)

| Parameter | Spesifikasi |
|---|---|
| Nama aplikasi | **SIAGA Bunda** — Sistem Informasi Antisipasi & menjaGA Bunda (sebelumnya SiKiBa) — tagline “Siaga menjaga bunda dan buah hati” |
| Platform target | Android (prioritas) · iOS (pengembangan lanjutan) |
| Minimum SDK Android | Android 8.0 (API level 26) ke atas |
| Bahasa antarmuka | Bahasa Indonesia (utama) · Bahasa Sunda (opsional, fase berikutnya) |
| Framework (rekomendasi awal) | Flutter (cross-platform) atau React Native |
| Database lokal | SQLite (offline-first architecture) |
| Database cloud | Supabase Postgres (sumber kebenaran, sinkronisasi multi-perangkat) |
| Autentikasi | Nomor telepon (OTP via Supabase Auth) · tanpa email wajib |
| Notifikasi push | Web Push + Supabase Realtime untuk notifikasi darurat |
| Mode offline | Semua fitur skrining & edukasi tersedia offline — cloud hanya untuk backup |
| Ekspor data | PDF generation (library: iText / flutter_pdf) |
| Navigasi utama | Bottom Navigation Bar — 5 tab: Beranda, Skrining, Edukasi, Reminder, Profil |
| Sistem warna triage | Hijau (#1D9E75) = Aman · Kuning (#EF9F27) = Waspada · Merah (#E24B4A) = Bahaya |
| Aksesibilitas | Font size minimal 14sp · Contrast ratio ≥4,5:1 · Ukuran tap target ≥44dp |
| Privasi data | Data tersimpan di perangkat (lokal-first) · Enkripsi AES-256 untuk data sensitif |
| Kaji etik | Wajib Ethical Clearance sebelum uji coba kepada pengguna (tahap Develop) |

### 8.2 Alur Navigasi Utama (User Journey)

**Ibu Hamil:**
- S-00 Splash → S-01 Registrasi → S-02 Beranda (hub utama)
- Beranda → S-03 Skrining → S-03a Form risiko → S-03g Hasil → Beranda
- Beranda → S-06 Edukasi → S-06b Janin minggu ini → Kembali
- Beranda → S-07 Reminder → S-07a Suplemen / S-07b ANC / S-07c Diary
- Beranda → S-08 Profil → S-08b Ekspor data ke bidan

**Ibu Nifas:**
- Beranda (mode nifas aktif otomatis setelah HPL + konfirmasi bersalin)
- Beranda → S-03 tab Nifas → S-04 Skrining nifas → S-04a Skrining laktasi → S-03g Hasil
- Beranda → S-03 tab BBL → S-05 Skrining BBL → S-05a Ikterus / S-05b Hipotiroid

**Darurat:**
- Jika hasil skrining = MERAH: tampil overlay darurat dengan tombol besar "Hubungi Bidan" dan "Buka Peta Fasyankes".
- Notifikasi push darurat dikirim ke nomor bidan yang terdaftar (jika fitur aktif).
- Semua hasil MERAH tersimpan dengan timestamp dan tidak bisa dihapus oleh pengguna.

---

## IX. Matriks Sinkronisasi Draft Storyboard & Proposal

*Pemetaan item storyboard draft → desain final SIAGA Bunda (sebelumnya SiKiBa).*

| No. | Item Storyboard Draft | Status Sinkronisasi & Penyesuaian | Screen ID |
|---|---|---|---|
| 1 | Registrasi (G-P-A, HPHT, UK) | Diadopsi & diperluas — ditambah HPL otomatis, fasyankes, nama bidan; rumus UK dicantumkan eksplisit | S-01 |
| 2 | Menu 1 – Fertilisasi | Diadopsi — dipindah ke modul Edukasi, format artikel + video embed | S-06a |
| 3 | Menu 2 – Perkembangan janin per minggu | Diadopsi & diperkaya — ditambah konten personal (UK ibu aktif), tips kebutuhan ibu per minggu kritis | S-06b |
| 4 | Menu 3 – Plasenta, tali pusat, ketuban | Diadopsi — dipindah ke S-06c, ditambah konten kondisi yang membahayakan sistem ini | S-06c |
| 5 | Menu 4 – Perubahan fisiologi 11 sistem | Diadopsi — dikembangkan per sistem organ dengan ilustrasi interaktif | S-06d |
| 6 | Menu 5 – Tanda bahaya (hanya info) | Diperluas menjadi skrining — edukasi di S-06e + skrining interaktif di S-03c dengan triage otomatis | S-03c, S-06e |
| 7 | Menu 6 – Perubahan psikologi | Diadopsi — diperkaya dengan konten per trimester dan link ke skrining mental | S-06f |
| 8 | Menu 7 – Birth plan | Diadopsi & distrukturisasi — ditambah form P4K lengkap sesuai Kemenkes (donor darah, transportasi, dll.) | S-06h |
| 9 | Menu 8 – Keluhan umum (25+ jenis) | Diperluas dengan AI klasifikasi — ditambah penilaian normal vs patologis dan link Google Maps fasyankes | S-06g |
| 10 | Menu 9 – Tracker BB | Diadopsi & divisualisasi — ditambah grafik tren, target kenaikan BB per IMT (IOM 2009), alert | S-07 |
| 11 | Menu 10 – Reminder ANC | Diadopsi — jadwal ANC otomatis 6 kunjungan sesuai Kemenkes 2020 | S-07b |
| 12 | Menu 11 – Reminder suplemen | Diadopsi — ditambah toggle per suplemen, riwayat kepatuhan, dan adherence rate | S-07a |
| 13 | Menu 12 – Diary ibu hamil | Diadopsi dengan penambahan — tracker mood, kalender mood, filter audio instrumental | S-07c |
| 14 | Menu 13 – Timeline pregnancy | Diadopsi — ditambah milestone per trimester dan progress bar besar | S-07d |
| 15 | Menu 14 – Skrining depresi antenatal | Diperluas dengan instrumen terstandar — adaptasi EPDS 10 item tervalidasi (sebelumnya belum ada instrumen) | S-03f |
| 16 | Menu 15 – Skrining faktor risiko | Dilengkapi algoritma — skor Poedji Rochjati lengkap dengan kategorisasi KRR/KRS/KRT | S-03a |
| 17 | Menu 16 – Skrining status gizi | Dilengkapi algoritma — target kenaikan BB per IMT (IOM 2009), evaluasi LILA, trajectory | S-03b |
| 18 | Menu 17 – Skrining tanda bahaya | Dilengkapi triage otomatis — checklist + algoritma triage otomatis + link maps fasyankes darurat | S-03c |
| 19 | Menu 18 – Skrining preeklamsia | Dilengkapi kalkulasi MAP — kalkulasi MAP otomatis + skoring NICE + rekomendasi aspirin | S-03d |
| 20 | Menu 19 – Skrining DMG | Dilengkapi algoritma — faktor risiko IADPSG + rekomendasi TTGO + diet pradiabetes | S-03e |
| 21 | Menu 20 – Skrining kesehatan mental | Dilengkapi EPDS — dimerger dengan Menu 14; instrumen EPDS 10 item + tren skor | S-03f |
| 22 | Menu 21 – Persiapan persalinan P4K | Diadopsi & distrukturisasi — dimerger dengan birth plan; form P4K lengkap + progress kelengkapan | S-06h |
| 23 | Menu 22 – Skrining nifas | Dilengkapi MEOWS — threshold MEOWS klinis + evaluasi per parameter vital | S-04 |
| 24 | Menu 23 – Skrining menyusui & laktasi | Dilengkapi algoritma — evaluasi kecukupan ASI, deteksi mastitis, panduan teknik menyusui | S-04a |
| — | BBL – Skrining bayi baru lahir | Ditambahkan dari proposal | S-05, S-05a–S-05b (S-05c dibatalkan) |
| — | Konsultasi dengan bidan (proposal) | Ditambahkan sebagai fitur ekspor — ekspor ringkasan skrining ke PDF yang bisa dibagikan ke bidan via WhatsApp | S-08b |

**Keterangan status:**
- **Diadopsi** — item dari storyboard draft dipertahankan sepenuhnya, mungkin dengan penyesuaian minor format/tampilan.
- **Diperluas** — item dikembangkan signifikan dengan algoritma klinis, instrumen terstandar, atau fitur interaktif tambahan.
- **Dilengkapi** — item yang sebelumnya kosong/belum ada konten di draft, kini dilengkapi berdasarkan sumber klinis dan proposal.
- **Ditambahkan** — item baru yang tidak ada di draft storyboard, namun wajib ada berdasarkan proposal penelitian (terutama skrining BBL dan integrasi MEWS).

---

## X. Evaluasi & Usulan Penyesuaian Tech Stack

> Konteks: fungsi dan tujuan utama pada Bagian 8.1 dipertahankan sesuai hasil FGD dan kebutuhan riset. Bagian ini murni membahas sisi **implementasi teknis** — di mana ada penyesuaian yang berpotensi lebih efisien/tepat guna, disertai alasannya, agar bisa didiskusikan sebelum masuk tahap Develop.

### 1. Framework — Flutter vs React Native
**Spesifikasi awal:** "Flutter atau React Native" (belum ditentukan).

**Usulan:** Pilih **Flutter** sebagai keputusan final, bukan dibiarkan sebagai opsi terbuka. Alasan:
- Aplikasi ini sangat form-heavy dan calculation-heavy (14+ jenis skrining dengan rumus klinis berbeda-beda) — komponen form Flutter (`TextFormField`, validator bawaan) lebih ringkas ditulis dan divalidasi dibanding RN yang butuh library tambahan (Formik/React Hook Form) untuk hasil setara.
- Dukungan offline-first di Flutter sudah matang lewat `drift`/`sqflite` dengan type-safety query, sehingga risiko bug pada logika skrining (yang sensitif secara klinis) lebih kecil dibanding raw SQL di RN.
- Satu codebase dengan performa rendering native (tidak melalui bridge JS seperti RN versi lama), penting karena akan ada banyak layar dengan grafik (tren BB, timeline, mood) yang butuh render mulus.
- Siklus iterasi cepat (hot reload) relevan untuk tahap uji coba/RnD yang masih akan banyak revisi UI bersama tim FGD.

*Catatan: keduanya sama-sama layak secara teknis — ini rekomendasi berdasarkan karakteristik aplikasi (banyak form + kalkulasi + grafik), bukan berarti React Native tidak bisa dipakai.*

### 2. Database lokal — SQLite mentah vs ORM
**Spesifikasi awal:** "SQLite (offline-first)".

**Usulan penyesuaian:** Tetap SQLite sebagai mesin penyimpanan, **tapi jangan diakses secara mentah**. Gunakan lapisan ORM seperti `drift` (Flutter) yang menyediakan schema migration otomatis dan query type-safe.

**Alasan:** Skema data aplikasi ini akan cukup kompleks — riwayat skrining lintas 14 jenis pemeriksaan, tracker BB mingguan, diary harian, adherence suplemen, semuanya longitudinal (bertambah terus per waktu). Tanpa ORM dengan migration bawaan, setiap kali ada penyesuaian field (misalnya nanti nambah 1 parameter di skrining DMG), tim harus menulis migration SQL manual dan rawan human error — cukup krusial mengingat ini data kesehatan.

### 3. Sinkronisasi cloud — Dexie + Supabase Postgres
**Spesifikasi awal:** SQLite lokal + Firestore cloud opsional untuk "sinkronisasi multi-perangkat", cloud hanya untuk backup.

**Implementasi final PWA: Dexie (IndexedDB) sebagai cache offline + Supabase Postgres sebagai sumber kebenaran (semua data).**

**Usulan penyesuaian:** Perlu diperjelas dulu skenario pemakaiannya, karena dua opsi ini punya konsekuensi implementasi yang beda:
- **Jika kebutuhannya hanya backup sekali-sekali** (misal saat ganti HP): cukup fitur export/import manual (backup ke file terenkripsi), tidak perlu sync cloud penuh — mengurangi kompleksitas sinkronisasi dan biaya.
- **Jika kebutuhannya bidan bisa melihat data pasien dari perangkat lain (sesuai catatan "kebutuhan FGD bidan" pada matriks sinkronisasi)**: ini baru butuh Supabase, tapi berarti perlu dirancang sebagai *sumber kebenaran* (source of truth), bukan sekadar cadangan pasif dari Dexie — sebab kalau dua database berjalan paralel tanpa strategi sinkronisasi/konflik yang jelas (misal data diubah offline di dua sesi berbeda), akan muncul risiko data konflik/hilang yang sensitif untuk data kesehatan.

**Rekomendasi konkret (final):** PWA pakai Dexie + Supabase Postgres sejak awal — semua data (profil, skrining, tracker) di-sync otomatis saat online. Untuk jejak historis, rekomendasi lama "mulai lokal-only dulu" sudah digantikan oleh arsitektur Supabase offline-first.

### 4. Autentikasi — OTP via WhatsApp/SMS
**Spesifikasi awal:** "Nomor telepon (OTP via WhatsApp/SMS)".

**Usulan penyesuaian:** Pisahkan dua jalur ini karena biaya dan kompleksitas integrasinya jauh berbeda:
- **SMS OTP** — bisa langsung pakai Supabase Auth (Phone/Email OTP), sudah teruji dan terintegrasi dengan RLS Postgres, cocok untuk MVP/uji coba.
- **WhatsApp OTP** — butuh WhatsApp Business API (berbayar per pesan, perlu approval Meta), jauh lebih rumit untuk disiapkan di tahap RnD ini.

**Rekomendasi (final):** Mulai dengan OTP via Supabase Auth untuk tahap uji coba; WhatsApp OTP bisa jadi peningkatan di fase produksi jika dana dan waktu memungkinkan.

### 5. Ekspor PDF — iText tidak cocok untuk Flutter
**Spesifikasi awal:** "PDF generation (library: iText / flutter_pdf)".

**Catatan koreksi teknis:** **iText adalah library Java/Android native**, bukan library Flutter/Dart — kalau frameworknya Flutter, iText tidak relevan dan tidak bisa dipakai langsung (perlu platform channel yang menambah kompleksitas tanpa manfaat jelas). Untuk Flutter, gunakan kombinasi package Dart-native: `pdf` (untuk generate dokumen) + `printing` (untuk preview/cetak/share) — keduanya cross-platform (Android & iOS sekaligus, sesuai rencana ekspansi ke iOS nanti) dan sudah cukup matang untuk kebutuhan laporan terstruktur seperti pada S-08b.

### 6. Notifikasi — Web Push/Supabase Realtime vs local notification
**Spesifikasi awal:** "Firebase Cloud Messaging (FCM) untuk reminder harian" di bagian yang sama dengan "mode offline: semua fitur tersedia offline".

**Catatan potensi kontradiksi:** FCM adalah push notification dari server, yang **membutuhkan koneksi internet** untuk terima pesan — ini bertentangan dengan prinsip offline-first yang dinyatakan sendiri di spesifikasi. Untuk reminder terjadwal yang sifatnya lokal seperti suplemen (S-07a) dan jadwal ANC (S-07b), notifikasi seharusnya dijadwalkan **di perangkat** (misalnya via Notification API + in-app reminder), bukan dikirim dari server, sehingga tetap berfungsi tanpa internet.

**Web Push/Supabase Realtime tetap relevan** untuk skenario lain yang memang butuh push dari server — misalnya notifikasi darurat ke bidan saat hasil skrining MERAH (Bagian 8.2), yang memang perlu dikirim antar-perangkat secara real-time via Supabase Realtime/Edge Functions.

**Rekomendasi (final PWA):** pisahkan dua mekanisme ini secara eksplisit — in-app + Notification API untuk reminder rutin (offline), Supabase Realtime/Web Push khusus untuk notifikasi darurat lintas-perangkat.

### 7. Enkripsi data sensitif
**Spesifikasi awal:** "Enkripsi AES-256 untuk data sensitif".

**Usulan penyesuaian:** Perlu dijelaskan lebih konkret cara implementasinya, karena "AES-256" saja belum berarti aman kalau kunci enkripsinya tidak dikelola dengan benar. Rekomendasi:
- Gunakan `sqlcipher` (varian SQLite dengan enkripsi bawaan) sehingga seluruh database terenkripsi otomatis, bukan field-by-field manual.
- Simpan kunci enkripsi di Android Keystore (bukan hardcode di kode aplikasi), agar kunci tidak bisa diekstrak meski aplikasi di-reverse engineer.

### 8. Pemisahan "clinical rules engine" dari UI
**Ini bukan koreksi terhadap spesifikasi awal, melainkan usulan arsitektur tambahan** yang belum disebutkan di Bagian 8.1.

**Alasan:** Ada 6+ algoritma klinis (Poedji Rochjati, MAP, IMT/LILA, EPDS, MEOWS, zona Kramer) yang perlu **divalidasi terpisah oleh pakar (SpOG/bidan senior)** sesuai catatan di Bagian VII. Kalau logika perhitungan ini tercampur langsung di dalam kode tampilan (widget/screen), akan sulit diuji secara terisolasi dan sulit ditelusuri saat proses validasi pakar.

**Rekomendasi:** Buat modul terpisah (misalnya folder `lib/clinical_rules/`) berisi murni fungsi kalkulasi skor per algoritma, tanpa dependensi ke UI, sehingga:
- Bisa ditulis unit test untuk tiap algoritma secara independen (penting untuk memastikan akurasi klinis sebelum uji coba pengguna).
- Pakar SpOG/bidan senior bisa mereview logikanya secara terpisah dari tampilan aplikasi.

### 9. Minimum SDK & Aksesibilitas
Spesifikasi Android 8.0 (API 26), kontras ≥4,5:1, dan tap target ≥44dp sudah wajar dan tidak perlu diubah — cakupan perangkat Android di Indonesia pada level API tersebut sudah sangat luas, dan standar aksesibilitasnya sudah sesuai praktik umum untuk aplikasi kesehatan yang menyasar pengguna lintas usia.

### 10. Catatan non-teknis yang perlu ditandai (di luar scope tech stack)
Di luar aspek teknis murni, ada satu hal yang perlu dikonfirmasi ke tim/pembimbing riset sebelum masuk Develop: apakah aplikasi ini akan dikategorikan sebagai **perangkat lunak sebagai alat kesehatan (Software as a Medical Device)** menurut regulasi Kemenkes/BPOM, mengingat aplikasi memberi rekomendasi klinis otomatis (termasuk kategorisasi MERAH yang mengarahkan rujukan darurat). Ini menentukan apakah ada persyaratan tambahan di luar Ethical Clearance yang sudah dicantumkan di Bagian 8.1. Ini catatan untuk didiskusikan dengan tim peneliti/bidang etik, bukan rekomendasi teknis.

---

### Ringkasan Usulan Penyesuaian

| Aspek | Spesifikasi Awal | Usulan |
|---|---|---|
| Framework | Flutter atau React Native | Tetapkan Flutter |
| Akses DB lokal | SQLite langsung | SQLite + ORM (drift) |
| Cloud sync | SQLite + Firestore paralel | Dexie (IndexedDB) + Supabase Postgres (sync otomatis, sumber kebenaran) |
| Autentikasi | OTP WhatsApp/SMS | Mulai dari OTP via Supabase Auth, WhatsApp menyusul |
| Ekspor PDF | iText / flutter_pdf | `jsPDF`/`pdfmake` (client-side, PWA) |
| Reminder harian | FCM | Notification API in-app; Supabase Realtime/Web Push khusus notifikasi darurat |
| Enkripsi | AES-256 (belum dirinci) | sqlcipher + Android Keystore |
| Arsitektur tambahan | — | Modul clinical rules engine terpisah dari UI, untuk testability & validasi pakar |
