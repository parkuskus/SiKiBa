# ARCHITECTURE.md — SIAGA Bunda (Sistem Informasi Antisipasi & menjaGA Bunda) — sebelumnya SiKiBa

> Dokumen arsitektur teknis untuk implementasi berbasis **PWA (Progressive Web App)** — brand **SIAGA Bunda** (`assets/Logo Aplikasi Siaga Bunda.png`, palet Sage `#6B8E73`/Pink `#FFE2E2`/`#FFCFCF`/Bg `#FFFDEC`, font `Plus Jakarta Sans Variable` — lihat `PRODUCT.md:1a`). Merujuk ke `PRODUCT.md` untuk cakupan fitur dan `SiKiBa_Spesifikasi_Storyboard_Prototype.md` untuk detail algoritma klinis per layar.

## 1. Ringkasan Keputusan Arsitektur

**Platform: PWA (Progressive Web App)**, installable ke home screen Android dan iOS, dengan kapabilitas offline lewat Service Worker dan penyimpanan lokal lewat IndexedDB.

Dua area yang secara teknis lebih terbatas dibanding native dan perlu mitigasi eksplisit dalam implementasi (bukan alasan untuk pindah platform, melainkan risiko yang harus dikelola sejak desain arsitektur):

1. **Reminder terjadwal offline** — web tidak punya padanan persis `flutter_local_notifications`; strategi mitigasi di Bagian 7.
2. **Retensi data lokal jangka panjang, khususnya di iOS** — Safari dapat menghapus data yang jarang diakses; strategi mitigasi di Bagian 6 & 9.

Kedua area ini dicatat di sini supaya jadi bagian dari rencana kerja (bukan ditemukan belakangan saat testing), dan dites secara eksplisit sebagai kriteria keluar dari Fase 6 (lihat PRODUCT.md Bagian 8).

## 2. Tech Stack Final

| Layer                                  | Pilihan                                                                       | Catatan                                                                                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework frontend                     | React + Vite                                                                  | Selaras dengan stack yang dihasilkan prototype Lovable, memudahkan transisi referensi desain                                                         |
| Bahasa                                 | TypeScript                                                                    | Type-safety penting mengingat banyak kalkulasi klinis                                                                                                |
| Styling & komponen UI                  | Tailwind CSS + shadcn/ui                                                      | Konsisten dengan prototype yang sudah divalidasi lewat FGD                                                                                           |
| State management                       | Zustand (atau React Context + React Query untuk data async)                   | Untuk aplikasi sebesar ini (5 modul, ±30 layar), disarankan pola terstruktur sejak awal                                                              |
| PWA & Service Worker                   | Workbox via `vite-plugin-pwa`                                                 | Standar industri untuk generate service worker, caching strategy, dan manifest                                                                       |
| Penyimpanan lokal                      | IndexedDB, dibungkus **Dexie.js** (cache offline)                             | Dexie untuk offline-first; sinkronisasi ke Supabase saat online (lihat Bagian 9)                                                                     |
| Database utama (cloud)                 | **Supabase Postgres** via `supabase-js`                                       | Sumber kebenaran untuk semua data: `profiles`, `screening_results`, `weight_entries`, dll — lihat Bagian 5 & 9                                      |
| Enkripsi data                          | **Web Crypto API** (lapisan custom, dienkripsi sebelum tulis ke Dexie & Supabase) | Browser tidak punya enkripsi storage bawaan setara SQLCipher — komponen harus dibangun sendiri                                                        |
| Autentikasi                            | **Supabase Auth** — Phone/Email OTP untuk MVP                                 | Menggantikan Firebase Auth; WhatsApp Business API dipertimbangkan di fase lanjutan (lihat Bagian 8)                                                 |
| Notifikasi darurat lintas-perangkat    | Web Push API + Supabase Realtime / Edge Functions                             | Untuk notifikasi ke bidan saat hasil MERAH; di iOS baru aktif setelah PWA di-install ke home screen dan izin diberikan                               |
| Reminder rutin (suplemen, ANC)         | Notification API + strategi hybrid (lihat Bagian 7)                           | Titik risiko utama, dirinci terpisah                                                                                                                 |
| Ekspor PDF                             | `jsPDF` atau `pdfmake`                                                        | Berjalan di sisi client                                                                                                                              |
| Peta & lokasi fasyankes                | Google Maps JavaScript API                                                    | Tidak ada kendala berarti di PWA                                                                                                                     |
| Pembungkus Android untuk Play Store    | **Bubblewrap (TWA — Trusted Web Activity)**                                   | Supaya tetap muncul resmi di Play Store meski berbasis web                                                                                           |
| Hosting                                | Vercel / Firebase Hosting (HTTPS wajib)                                       | HTTPS wajib untuk Service Worker; keduanya kompatibel dengan Supabase                                                                                |

## 3. Struktur Arsitektur Aplikasi

```
UI Layer (React components / pages)
   ↕
State Management (Zustand stores / React Query)
   ↕
Clinical Rules Engine (murni fungsi TypeScript, tanpa dependensi UI)
   ↕
Data Layer (Dexie.js local cache + Supabase Postgres — repository pattern, dengan lapisan enkripsi Web Crypto)
   ↕
Supabase Cloud (Postgres + Auth + Realtime)
```

**Alasan pemisahan Clinical Rules Engine:** ada 6+ algoritma klinis (Poedji Rochjati, MAP, IMT/LILA, EPDS, MEOWS, zona Kramer) yang wajib divalidasi terpisah oleh pakar (dokter SpOG/bidan senior) sesuai catatan di dokumen spesifikasi Bagian VII. Dengan logika kalkulasi terpisah dari komponen UI:

- Setiap algoritma bisa ditulis unit test independen (misalnya dengan Vitest) untuk memastikan akurasi sebelum uji coba pengguna.
- Pakar klinis bisa mereview logika perhitungan secara terpisah dari tampilan aplikasi.
- Perubahan pedoman klinis di masa depan (misal update ambang batas MEOWS) hanya menyentuh satu modul.

## 4. Struktur Folder (usulan)

```
app/src/
├── main.tsx
├── clinical-rules/          # Logika murni tiap algoritma skrining, unit-testable
│   ├── poedjiRochjati.ts
│   ├── mapCalculator.ts
│   ├── imtLila.ts
│   ├── epds.ts
│   ├── meows.ts
│   └── kramerZone.ts
├── data/
│   ├── db.ts                 # Setup Dexie + skema tabel (mirror Supabase)
│   ├── supabase.ts           # Supabase client + type
│   ├── crypto.ts              # Lapisan enkripsi Web Crypto sebelum tulis Dexie/Supabase
│   └── repositories/         # Tiap repo: read Dexie dulu, sync ke Supabase saat online
├── features/
│   ├── onboarding/
│   ├── beranda/
│   ├── skrining/
│   │   ├── ibu-hamil/
│   │   ├── nifas/
│   │   └── bbl/
│   ├── edukasi/
│   ├── reminder-tracker/
│   └── profil/
├── shared/
│   ├── components/
│   └── theme/                 # Warna traffic light, tipografi, dsb
├── services/
│   ├── notificationService.ts
│   ├── exportService.ts
│   └── authService.ts
├── sw.ts                       # Service worker (via vite-plugin-pwa)
└── manifest.webmanifest
```

## 5. Model Data (entitas utama — Dexie local mirror Supabase Postgres)

| Entitas (tabel Supabase) | Field kunci                                                                                | Terkait layar              |
| ------------------------ | ------------------------------------------------------------------------------------------ | -------------------------- |
| `profiles`               | id (FK auth.users), nama, tanggal_lahir, HPHT, G-P-A, fasyankes, nama_bidan               | S-01, S-02, S-08           |
| `screening_results`      | id, user_id, tipe_skrining, timestamp, skor, kategori (hijau/kuning/merah), detail (JSONB) | S-03g dan semua turunannya |
| `weight_entries`         | id, user_id, tanggal, berat_kg                                                             | S-07                       |
| `supplement_reminders`   | id, user_id, nama_suplemen, waktu, status_aktif, riwayat_kepatuhan                         | S-07a                      |
| `anc_visits`             | id, user_id, tanggal_terjadwal, status_selesai, catatan                                    | S-07b                      |
| `diary_entries`          | id, user_id, tanggal, teks, mood                                                           | S-07c                      |
| `nifas_screenings`       | id, user_id, hari_ke, parameter_vital (JSONB), status                                      | S-04                       |
| `bbl_profiles`           | id, user_id, data_lahir, APGAR, usia_gestasi                                               | S-05                       |

Dexie menyimpan mirror lokal dengan skema identik untuk offline-first. Seluruh field kesehatan personal dienkripsi lewat `data/crypto.ts` sebelum tulis ke Dexie maupun Supabase. RLS Supabase: user hanya bisa akses `user_id = auth.uid()`.

## 6. Retensi Data Lokal — Risiko & Mitigasi

**Risiko:** Safari/iOS dapat menghapus data IndexedDB dari origin yang jarang diakses (kebijakan _least-recently-used eviction_), terutama relevan karena SIAGA Bunda dipakai berkala, bukan harian.

**Mitigasi yang direncanakan:**

1. Meminta izin **Persistent Storage API** ke pengguna saat onboarding, agar browser memprioritaskan data SIAGA Bunda untuk tidak dihapus otomatis.
2. Menyediakan **pengingat berkala** ke pengguna untuk melakukan ekspor PDF (S-08b) sebagai backup manual.
3. **Sinkronisasi otomatis ke Supabase** (lihat Bagian 9) sebagai jaring pengaman utama — semua data termasuk hasil MERAH langsung di-sync saat online.
4. Testing eksplisit skenario "aplikasi tidak dibuka selama 2–4 minggu" sebagai bagian dari kriteria keluar Fase 6 (lihat PRODUCT.md).

## 7. Notifikasi — Risiko & Mitigasi

| Jenis notifikasi                           | Kondisi ideal                   | Keterbatasan PWA                                                                                                                                             | Mitigasi                                                                                                                                                                                                                                    |
| ------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reminder rutin (suplemen S-07a, ANC S-07b) | Terjadwal, jalan tanpa internet | Tidak ada API scheduling notifikasi lokal murni yang didukung penuh lintas browser; di iOS, push hanya aktif setelah install ke home screen + izin diberikan | Kombinasi: (a) in-app reminder saat aplikasi dibuka berdasarkan jadwal tersimpan di Dexie, (b) Web Push terjadwal dari server sebagai penguat untuk perangkat yang online, (c) badge/notifikasi visual di ikon aplikasi saat dibuka kembali |
| Notifikasi darurat ke bidan (hasil MERAH)  | Real-time lintas-perangkat      | Bergantung koneksi saat pengiriman & penerimaan                                                                                                              | Dikirim via Supabase Realtime / Edge Functions + Web Push saat device online; ditambah opsi kirim manual via WhatsApp dari S-08b sebagai fallback jika notifikasi tidak sampai                        |

Strategi ini perlu diuji langsung di device Android dan iOS asli sebagai bagian dari QA (PRODUCT.md Fase 6), karena perilaku browser terhadap notifikasi berbeda-beda dan berubah dari waktu ke waktu.

## 8. Autentikasi & Keamanan

- **MVP:** Supabase Auth dengan OTP (SMS/Email) — setara Firebase Phone Auth, terintegrasi langsung dengan RLS Postgres.
- **Fase lanjutan:** WhatsApp OTP via WhatsApp Business Platform, jika dibutuhkan.
- **Enkripsi:** data kesehatan dienkripsi lewat Web Crypto API sebelum disimpan ke Dexie maupun Supabase (lapisan `data/crypto.ts`); kunci enkripsi diturunkan dari kredensial pengguna, tidak disimpan dalam kode aplikasi. RLS Supabase membatasi akses per `auth.uid()`.
- **HTTPS wajib** — persyaratan teknis PWA sekaligus praktik keamanan dasar untuk data kesehatan.

## 9. Sinkronisasi & Backup — Supabase sebagai Sumber Kebenaran

**Status saat ini: Dexie (IndexedDB) sebagai cache offline, Supabase Postgres sebagai sumber kebenaran — semua data (profil, skrining, tracker) disimpan ke Supabase.**

Strategi offline-first: tulis ke Dexie dulu → sync ke Supabase saat online (background sync + Supabase Realtime). Karena risiko retensi data di iOS (Bagian 6), sinkronisasi tidak ditunda — aktif sejak Fase 1.

**Yang perlu diputuskan sebelum Fase 4 (lihat PRODUCT.md):**

1. Apakah semua tabel di-sync real-time atau batch periodic (trade-off baterai vs freshness).
2. Apakah tim riset butuh dashboard agregat — jika ya, Supabase langsung bisa dipakai sebagai backend riset (view SQL, RLS untuk akses peneliti).

Rekomendasi: sync otomatis untuk `profiles` + `screening_results` (terutama kategori MERAH) sejak Fase 1–2; tabel tracker (`weight_entries`, `diary_entries`) bisa menyusul.

## 10. Ekspor Data

Menggunakan `jsPDF` atau `pdfmake` untuk generate dokumen di sisi client, sesuai kebutuhan S-08b (ekspor ringkasan skrining ke PDF, dibagikan via WhatsApp).

## 11. Testing Strategy

- **Unit test** (Vitest) untuk seluruh fungsi di `clinical-rules/` — wajib, karena ini yang divalidasi pakar klinis.
- **Component test** untuk alur form skrining (validasi input, navigasi antar layar).
- **Testing lintas-browser eksplisit** — Chrome/Android dan Safari/iOS diuji terpisah, karena kapabilitas PWA berbeda signifikan antar keduanya (lihat Bagian 1, 6, 7).
- **Manual QA** per modul sebelum lanjut ke modul berikutnya (lihat roadmap fase di PRODUCT.md).
- **Review pakar klinis** sebagai gerbang wajib sebelum Fase 7 (UAT).

## 12. Deployment & Distribusi

- **Hosting:** Vercel / Firebase Hosting (HTTPS otomatis, wajib untuk Service Worker) — keduanya kompatibel dengan Supabase.
- **Database & Auth:** Supabase Cloud (region `ap-southeast-1` Singapore terdekat) — project atas nama institusi Poltekkes Kemenkes Bandung.
- **Android:** dibungkus dengan Bubblewrap (TWA) agar dapat didistribusikan resmi lewat Google Play Console (didaftarkan atas nama institusi Poltekkes Kemenkes Bandung).
- **iOS:** instalasi lewat Safari → Share → Add to Home Screen (tidak ada App Store listing untuk PWA murni); perlu disiapkan panduan instalasi bergambar untuk partisipan, karena tidak ada install prompt otomatis di iOS seperti di Android.
- **Update aplikasi:** dapat langsung tayang tanpa proses review store (kecuali untuk listing TWA di Play Store yang tetap melalui review Google).

## 13. Referensi

- `PRODUCT.md` — cakupan fitur, roadmap fase, requirement produk.
- `SiKiBa_Spesifikasi_Storyboard_Prototype.md` (brand lama SiKiBa) — detail IPO tiap layar dan tabel algoritma klinis lengkap — brand baru SIAGA Bunda lihat `PRODUCT.md:1a`.
