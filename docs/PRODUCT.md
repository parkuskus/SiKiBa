# PRODUCT.md — SIAGA Bunda (Sistem Informasi Antisipasi & menjaGA Bunda)

> Dokumen perencanaan produk untuk tahap implementasi berbasis **PWA (Progressive Web App)**, sesuai keputusan yang telah ditetapkan. Nama resmi **SIAGA Bunda** (sebelumnya SiKiBa). Disusun berdasarkan storyboard IPO yang dikirim klien dan hasil diskusi lanjutan mengenai platform & tech stack. Detail lengkap tiap layar (Input-Proses-Output, rumus klinis, referensi medis) ada di `SiKiBa_Spesifikasi_Storyboard_Prototype.md` — dokumen ini fokus ke ringkasan produk dan perencanaan level tinggi.

## 1. Ringkasan Produk

**SIAGA Bunda** — *Sistem Informasi Antisipasi & menjaGA Bunda* — adalah aplikasi web progresif (PWA) untuk skrining mandiri kesehatan ibu hamil, ibu nifas, dan bayi baru lahir, dikembangkan sebagai bagian dari riset PDUPT Poltekkes Kemenkes Bandung 2026. *Tagline:* **“Siaga menjaga bunda dan buah hati”**. Aplikasi menggabungkan dua kerangka klinis utama — **Pendekatan Risiko Poedji Rochjati** dan **Maternal & Neonatal Early Warning System (MEWS/MEOWS)** — untuk memberi hasil skrining dengan sistem traffic light (Hijau/Kuning/Merah) beserta rekomendasi tindak lanjut. Aplikasi dapat di-install ke home screen HP layaknya aplikasi native, dan sebagian besar fitur dapat diakses tanpa koneksi internet.

### 1a. Brand Identity SIAGA Bunda

**Filosofi/Makna:** Secara alami, seorang ibu memiliki naluri protektif untuk memberikan perlindungan terbaik bagi dirinya dan buah hatinya sejak masa kehamilan. “Siaga” merepresentasikan kesiapan untuk mengenali, memahami, dan mengantisipasi berbagai kondisi selama perjalanan kehamilan hingga masa nifas dan bayi baru lahir. Nama ini mencerminkan kehadiran aplikasi yang senantiasa mengingatkan, mendampingi, dan membantu Bunda dalam menjaga kesehatan dirinya dan buah hati. Sementara “Bunda” menjadi representasi dari sosok ibu sebagai pusat perhatian dan penerima manfaat utama aplikasi.

**Logo:** ikon PWA `app/public/logo-pwa-512x512.png`; logo transparan di UI `app/public/logo-siaga-transparent.png`; versi latar putih `app/public/logo-siaga-white.png` untuk favicon dan ikon layar utama:
- Ibu Hamil (fokus utama pengguna)
- Tangan Melindungi (kasih sayang, perlindungan, kesiapan menjaga buah hati)
- Daun (pertumbuhan dan perkembangan)
- Bunga (harapan dan kehidupan baru)
- Kilau Bintang (pengetahuan dan semangat)

**Colour Palette:**
| Token | Hex | Penggunaan |
|---|---|---|
| Primary Sage | `#7AAE9A` | Primary, ikon aktif |
| Primary Deep Sage | `#4A6E54` | Tombol primer, header panel |
| Secondary Soft Pink | `#FFE2E2` | Border, secondary |
| Surface / Card Fair Pink | `#FFCFCF` | Card bg |
| Background Light Yellow | `#FFFDEC` | App bg |
| Semantic Alert Soft Crimson | `#E57373` | MERAH |
| Semantic Warning Soft Amber | `#F3B465` | KUNING |
| Semantic Normal Sage Green | `#81C784` | HIJAU |
| Text Main Charcoal | `#3C4245` | Body |
| Text Sec Slate | `#6C757D` | Muted |

**Fonts:** Single family `Plus Jakarta Sans Variable` (400–800) untuk heading & body — via `@fontsource-variable/plus-jakarta-sans` (`app/src/index.css:4`, `@theme inline`). Heading 700–800 `tracking -0.04em`, Body 400–500 `tracking -0.01em`. Menggantikan `Poppins`/`Open Sans` yang terasa dated dan overused; Jakarta Sans lebih modern, hangat, dan relevan untuk konteks Indonesia (geometrik humanist, legibilitas tinggi di layar HP 320–480px). Variable font = 1 file untuk semua weight, lebih ringan untuk PWA offline.

## 2. Target Pengguna & Konteks Penggunaan

- **Pengguna utama:** ibu hamil, ibu nifas (0–42 hari pasca bersalin), dan orang tua bayi baru lahir (0–28 hari), termasuk kemungkinan pengguna dari daerah dengan konektivitas internet terbatas.
- **Pengguna sekunder:** bidan/tenaga kesehatan penerima hasil ekspor skrining (via S-08b).
- **Konteks pemakaian:** dipakai berkala, bukan harian (screening tidak dilakukan tiap hari), sehingga data yang tersimpan harus tetap ada meski aplikasi jarang dibuka dalam periode tertentu — ini konteks penting untuk strategi penyimpanan data PWA (lihat ARCHITECTURE.md Bagian 6 & 9).

## 3. Tujuan & Kriteria Sukses (tahap uji coba)

- Seluruh fitur skrining dan edukasi dapat digunakan tanpa koneksi internet setelah aplikasi ter-install.
- Hasil kalkulasi tiap algoritma klinis (skor Poedji Rochjati, MAP, IMT/LILA, EPDS, MEOWS, zona Kramer) tervalidasi oleh pakar (dokter SpOG/bidan senior) sebelum dipakai partisipan uji coba.
- Aplikasi lolos Ethical Clearance sebelum dirilis ke partisipan.
- Partisipan dapat menyelesaikan minimal satu sesi skrining dan memahami hasilnya tanpa bantuan.
- Partisipan berhasil melakukan instalasi aplikasi ke home screen (Android dan/atau iOS) tanpa kendala berarti.

## 4. Cakupan Produk (In-Scope)

Lima modul sesuai storyboard, dengan total ±30 layar:

| Modul | Ringkasan | Screen ID |
|---|---|---|
| Onboarding | Splash, registrasi (dengan kalkulasi UK & HPL otomatis), login | S-00, S-01, S-01b |
| Beranda | Dashboard personal dengan status kehamilan, progress, quick action | S-02–S-02d |
| Skrining | 7 jenis skrining ibu hamil, skrining nifas, skrining BBL (ikterus & hipotiroid) | S-03–S-05b (S-05c dibatalkan) |
| Edukasi | 8 topik edukasi kehamilan, termasuk penilaian keluhan umum normal vs patologis | S-06–S-06h |
| Reminder & Tracker | Tracker BB, reminder suplemen & ANC, diary, timeline kehamilan | S-07–S-07d |
| Profil | Profil, riwayat skrining, ekspor PDF, pengaturan | S-08–S-08c |

Detail IPO tiap layar: lihat Bagian II–VI di dokumen spesifikasi storyboard.

## 5. Functional Requirements (ringkasan)

- Registrasi berbasis HPHT dengan kalkulasi otomatis usia kehamilan (UK) dan HPL (rumus Naegele).
- 7 alur skrining ibu hamil dengan algoritma skoring masing-masing (lihat Bagian VII dokumen spesifikasi untuk rumus lengkap).
- Sistem kategorisasi hasil traffic light (Hijau/Kuning/Merah) konsisten di semua jenis skrining.
- Overlay darurat + notifikasi ke bidan terdaftar saat hasil MERAH (via Web Push, lihat catatan reliabilitas di ARCHITECTURE.md Bagian 7).
- Riwayat skrining tersimpan permanen, tidak dapat dihapus pengguna untuk hasil MERAH.
- Ekspor ringkasan data ke PDF, dapat dibagikan via WhatsApp.
- Reminder harian (suplemen, ANC) — diimplementasikan dengan strategi hybrid mengingat keterbatasan notifikasi terjadwal murni di PWA (lihat ARCHITECTURE.md Bagian 7).

## 6. Non-Functional Requirements

| Aspek | Requirement | Catatan implementasi PWA |
|---|---|---|
| Offline-first | Semua fitur skrining & edukasi berfungsi penuh tanpa internet setelah install pertama | Dicapai lewat Service Worker + IndexedDB; perlu strategi cache & fallback offline yang matang |
| Keamanan data | Data kesehatan terenkripsi di penyimpanan lokal & cloud; kunci enkripsi tidak boleh disimpan dalam kode aplikasi | Diimplementasikan custom via Web Crypto API + RLS Supabase (`auth.uid()`) |
| Aksesibilitas | Font minimal 14sp (setara ~14px web), contrast ratio ≥4,5:1, tap target ≥44dp (setara ~44px) | Standar sama, diterapkan lewat desain sistem Tailwind |
| Bahasa | Bahasa Indonesia (utama); Bahasa Sunda opsional untuk fase berikutnya | |
| Platform | Web app installable (PWA) — Android via Chrome/TWA ke Play Store, iOS via Safari Add to Home Screen | Kapabilitas berbeda signifikan antar platform, lihat ARCHITECTURE.md Bagian 1 & 12 |
| Reliabilitas notifikasi | Reminder rutin sebisa mungkin tetap terjadwal tanpa internet | **Risiko diketahui**: PWA tidak punya padanan setara notifikasi lokal native, terutama di iOS. Mitigasi dirinci di ARCHITECTURE.md Bagian 7 |
| Retensi data lokal | Riwayat skrining tidak boleh hilang meski aplikasi jarang dibuka | **Mitigasi**: Dexie cache + sync otomatis ke Supabase Postgres `ARCHITECTURE.md:6,9` |
| Persistensi cloud | Semua data (profil, skrining, tracker) tersimpan di Supabase Postgres | Sumber kebenaran; RLS per user, view agregat untuk tim riset |
| Kepatuhan etik | Wajib Ethical Clearance sebelum uji coba ke pengguna asli | |

## 7. Di Luar Cakupan (Out of Scope untuk fase awal)

- Bahasa Sunda (opsional, fase berikutnya)
- Dashboard web terpusat untuk bidan/peneliti (bisa langsung pakai Supabase view — lihat ARCHITECTURE.md Bagian 9)
- OTP via WhatsApp Business API (dimulai dari OTP via Supabase Auth untuk MVP, WhatsApp menyusul jika dibutuhkan)
- S-05c (Skrining Kelainan Kongenital) — **dibatalkan** (tidak diimplementasikan)
- Fitur yang bergantung penuh pada Bluetooth/NFC/sensor perangkat lanjutan (di luar kebutuhan storyboard saat ini, dan memang lebih terbatas di PWA dibanding native)

## 8. Roadmap Fase Implementasi

| Fase | Cakupan | Prasyarat keluar dari fase ini |
|---|---|---|
| Fase 0 — Persiapan | Finalisasi storyboard (dosen), setup akun/infrastruktur (Supabase project, auth, DB), setup project PWA (service worker, manifest), finalisasi desain UI/UX | Storyboard & desain disetujui, Supabase siap, kerangka PWA bisa di-install & jalan offline |
| Fase 1 — Fondasi | Onboarding, Beranda, arsitektur data & clinical rules engine | Alur registrasi & dashboard berfungsi penuh offline |
| Fase 2 — Skrining Ibu Hamil | S-03–S-03g, validasi algoritma tahap awal | Seluruh 7 skrining terhitung benar sesuai rumus |
| Fase 3 — Nifas & BBL | S-04–S-05b | Modul nifas & BBL berfungsi (S-05c dibatalkan) |
| Fase 4 — Edukasi & Reminder/Tracker | S-06–S-07d | Konten edukasi terisi, strategi reminder offline diuji di Android & iOS |
| Fase 5 — Profil & Ekspor | S-08–S-08c | Ekspor PDF berfungsi |
| Fase 6 — QA & Validasi Klinis | Testing internal (termasuk lintas-browser Android/iOS) + review pakar SpOG/bidan senior | Seluruh algoritma disetujui pakar, isu retensi data & notifikasi teratasi/termitigasi |
| Fase 7 — UAT | Uji coba terbatas ke partisipan, termasuk uji instalasi PWA di device asli | Ethical Clearance terbit, feedback partisipan terkumpul |

## 9. Ketergantungan Eksternal (di luar kendali development)

- **Ethical Clearance** — menentukan kapan Fase 7 (UAT) bisa dimulai.
- **Konten edukasi** (artikel, video, ilustrasi untuk S-06a–S-06h; daftar 25+ keluhan umum untuk S-06g) — disiapkan tim klinis, bukan tim development.
- **Validasi algoritma klinis** oleh dokter SpOG/bidan senior — prasyarat sebelum Fase 7.
- **Data fasyankes riil** di area uji coba — untuk fitur peta rujukan darurat.
- **Konfirmasi kebutuhan akses data terpusat** oleh tim riset (memengaruhi keputusan arsitektur di ARCHITECTURE.md Bagian 9).

## 10. Referensi

- `SiKiBa_Spesifikasi_Storyboard_Prototype.md` — spesifikasi IPO lengkap, tabel algoritma klinis, matriks sinkronisasi.
- `ARCHITECTURE.md` — keputusan teknis dan struktur implementasi berbasis PWA.
- Storyboard Prototype SiKiBa (dokumen sumber dari klien, PDUPT Poltekkes Kemenkes Bandung 2026).
