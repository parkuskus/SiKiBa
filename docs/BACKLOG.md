# BACKLOG.md — SIAGA Bunda (sebelumnya SiKiBa)

> Catatan pengembangan & progress harian. Brand **SIAGA Bunda** — Sistem Informasi Antisipasi & menjaGA Bunda, tagline “Siaga menjaga bunda dan buah hati”, logo `Logo Aplikasi Siaga Bunda.png`, palet Sage `#6B8E73`/Pink `#FFE2E2`/`#FFCFCF`/Bg `#FFFDEC`, font `Plus Jakarta Sans Variable` (`PRODUCT.md:1a`). Sumber: `PRODUCT.md` roadmap + `ARCHITECTURE.md` PWA + `SiKiBa_Spesifikasi_Storyboard_Prototype.md`.

## ⚠️ Reminder — update BACKLOG tiap progress penting (untuk follow-up pindah session)
- [x] **Diterima — Kuisioner EPDS 10 item dari Diva (Cox et al. 1987)** → sudah diupdate ke `S-03f` & `SK05` (Tabel 1, skor 0-3, klasifikasi HIJAU 0-8 / KUNING 9-13 / MERAH ≥14 atau item 10 ≥1)
- [x] **S-05c Kelainan Kongenital — DIBATALKAN** (tidak diimplementasikan, sesuai arahan stakeholder)
- [ ] **Aturan:** tiap selesai 1 form / clinical-rule / setup infrastruktur → centang di `Progress (Done)` + tulis tanggal, biar next session langsung lanjut tanpa baca ulang semua file

## Progress (Done) — snapshot 2026-08-26
- [x] Setup Vite+React+TS, Tailwind v4 + shadcn radix-nova (`app/`), Plus Jakarta Sans Variable, palet SIAGA Bunda
- [x] Alias `@/*`, `.gitignore` Vite+React, RAB MVP `RAB_SiKiBa_MVP.xlsx` Rp 2.35jt
- [x] Fix rumus UK di S-01/S-02: `×3¼` → `selisih bulan ×4⅓` (verified ACOG/Halodoc)
- [x] Update klasifikasi MAP stakeholder: `<90 Normal · 90-99 Waspada · >99 Risiko tinggi` (S-03d, SK02)
- [x] Tambah link prototype https://sikibaskr.lovable.app
- [x] Rebrand SIAGA Bunda: `Logo Aplikasi Siaga Bunda.png` → `public/logo-siaga-bunda.png`, palet #6B8E73/#FFE2E2/#FFCFCF/#FFFDEC/#E57373/#F3B465/#81C784, manifest `SIAGA Bunda` (`vite.config.ts:15`), `exportService` watermark SIAGA Bunda
- [x] Sync brand ke semua `.md` `docs/` (PRODUCT.md:1a, ARCHITECTURE.md, SiKiBa_Spesifikasi...)
- [x] Keputusan DB: **Supabase Postgres** (8 tabel, RLS `auth.uid()`) — ganti Firestore, `firebase` deprecated
- [x] Supabase setup done: `profiles`..`bbl_profiles` (SQL IF NOT EXISTS) + `.env` + `@supabase/supabase-js@2.112.4` + `app/src/data/supabase.ts` `createClient`
- [x] PWA: `vite-plugin-pwa` manifest SIAGA Bunda + `workbox` 36 entries, build lolos 114kB
- [x] Data layer: `app/src/data/db.ts` Dexie 8 store + `app/src/data/crypto.ts` stub + `app/src/data/supabase.ts`
- [x] Clinical-rules 7/7: `ukHpl` (4⅓+Naegele), `poedjiRochjati` SK01, `imtLila` SK03, `mapCalculator` SK02, `epds` SK05 Tabel1, `meows` SK06, `kramerZone` S-05a
- [x] Forms logic (tanpa FE): `registerForm` S-01, `riskFactorForm` S-03a, `giziForm` S-03b, `dangerSignForm` S-03c, `preeklamsiaForm` S-03d, `dmgForm` S-03e, `mentalForm` S-03f, `nifasForm` S-04, `laktasiForm` S-04a, `ikterusForm` S-05a, `hipotiroidForm` S-05b, `weight/supplement/anc/diary/timelineForm` S-07a-d, `exportService` S-08b rudimentary
- [x] Kuisioner EPDS final 10 item (Tabel 1, Cox 1987) → sinkron ke S-03f & SK05, siap implementasi `app/src/clinical-rules/epds.ts`
- [x] Supabase migrations aman no-overwrite: `supabase/migrations/001_init_siaga_bunda.sql` (8 tabel `IF NOT EXISTS`) + `002_chat_rag.sql` — policy RLS via cek `pg_policies` dulu (tanpa `DROP`), `003_chat_grants.sql` grant-only

## In Progress — sesi Figma-first redesign (2026-10-01, lihat `AGENTS.md`)
- [x] FE section Ingat 2026-10-01: timeline difokuskan ke minggu/trimester/HPL dan tonggak terdekat; grid 40 kotak dan kutipan acak dihapus, warna tracker diseragamkan.
- [x] FE Pengaturan Notifikasi/Penyimpanan 2026-10-01: kedua halaman memakai stage sage dan panel mint; status izin/penyimpanan serta aksi tetap dinamis.
- [x] FE Edit Profil 2026-10-01: header sage, panel Data Diri/Data Kehamilan/Pendamping, input tanggal DD/MM/YYYY, dan tombol Simpan konsisten dengan gaya terbaru.
- [x] FE Profil Saya detail 2026-10-01: detail diri/kehamilan diubah ke panel mint, stage sage, tanggal DD/MM/YYYY, dan aksi akun; form Edit Profil dikembalikan seperti semula.
- [x] FE section Saya 2026-10-01: header sage, kartu identitas mint, grup aksi data/pengaturan/bantuan, dan tombol keluar diseragamkan dengan gaya terbaru.
- [x] FE S-05a/b Bayi 2026-10-01: Ikterus Neonatal dan Hipotiroid Kongenital memakai shell sage/mint, pengelompokan input, pilihan dan CTA terbaru.
- [x] FE S-04a Laktasi 2026-10-01: pola menyusu, kondisi ibu, dan kecukupan ASI dikelompokkan dalam shell form sage/mint terbaru.
- [x] FE S-04 Nifas 2026-10-01: form pemantauan disusun ke panel vital, ASI, suasana hati, dan keluhan dengan shell sage/mint terbaru.
- [x] Chatbot S-09 2026-10-01: header/status, pesan, topik cepat, composer, new chat, offline badge, emergency alert dengan tautan peta dan berbagi bidan.
- [x] Kartu Masa Nifas Beranda 2026-10-01: disamakan dengan kartu mint Beranda; hari nifas, sisa hari, BB/PB bayi memakai data tersimpan.
- [x] FE S-03d/e/f 2026-10-01: Preeklamsia, Diabetes Gestasional, dan Kesehatan Mental diseragamkan ke shell form sage/mint, kontrol dan CTA terbaru.
- [x] FE S-03g hasil 2026-10-01: layout stage badge, faktor, langkah, aksi, floral footer; state HIJAU/KUNING/MERAH mencakup empty-factor fallback dan panel darurat MERAH.
- [x] FE S-03a/b/c 2026-10-01: form Faktor Risiko tiga langkah, Status Gizi, dan Tanda Bahaya memakai shell header/isi/floral sesuai Figma; BottomNav dan Siba disembunyikan selama form terbuka.
- [x] S-03 state nifas/bayi terkunci 2026-10-01: dua frame Figma dibuat dari pola menu skrining dengan ilustrasi `illu-06-nifas` dan `illu-07-bayi`; node `126:2`, `126:126`.
- [x] Format tanggal form 2026-10-01: seluruh input tanggal menampilkan `DD/MM/YYYY` melalui komponen bersama, nilai tersimpan tetap `YYYY-MM-DD`; lock dicatat di `DESIGN.md`.
- [x] Aturan latar screen 2026-10-01: semua kanvas screen memakai `#FFFCF6` seperti Beranda; dicatat sebagai lock di `DESIGN.md`.
- [x] Fix reload setelah login demo 2026-10-01: hapus penanda logout saat jalur login/daftar sukses, termasuk akun demo tanpa sesi Supabase.
- [x] S-03 Menu Skrining 2026-10-01: stage/progress, tab, kartu menu enam skrining dan status mengikuti Figma `23:1345`; judul/deskripsi asli FE dipertahankan.
- [x] S-01 OTP Login 2026-10-01: layar verifikasi enam kotak + DemoCard, stage, tombol, dan footer mengikuti referensi OTP Figma `21:1036`.
- [x] S-01b Login 2026-10-01: layar input nomor mengikuti frame Figma `23:1071` — stage sapaan, awalan +62, tombol OTP, trust row, dan floral footer.
- [x] Fix Keluar 2026-10-01: Splash tidak auto-masuk kembali dari profil Dexie setelah logout; penanda logout tersimpan sampai sesi baru dibuat.
- [x] Figma eksplorasi bebas S-00 s.d. S-03g (semua A+) — file `Project SIAGA Bunda`, token `primary #7AAE9A` / `primary-dark #4A6E54`, pink sekunder. Status per layar: `SCREENS.md`
- [x] FE ikut Figma: S-00 (hero `illu-01-hero`, florist `illu-11-florist-2`), S-01 + OTP 6 kotak, S-02 Beranda (hero `illu-12-hero-2`, tanpa AppHeader & kartu Pekan). `index.css`: blok global `h1/h2` dihapus
- [ ] Lanjut: Figma S-04 (Nifas) lalu FE-nya — pola stage + sheet + BottomNav pil (lihat `DESIGN.md`)
- [x] OTP Supabase Auth S-01/S-01b — **DEMO** sintetis `@siagabunda.test` + kode demo 6 digit tampil di UI `RegisterScreen.tsx:90` `LoginScreen.tsx:30` — real SMS OTP pending setup Twilio di Supabase Dashboard (Auth → Providers → Phone), untuk UAT ganti ke SMS beneran
- [x] FE shell HP-only 480px + S-00 Splash 2.2s + S-01 Register + S-01b Login + S-02 Beranda Image2-style + S-03a RiskFactorScreen end-to-end (Dexie + sync) — modular `app/src/features/` `app/src/shared/` `App.tsx:40`
- [x] FE S-03b-f 5 skrining sisa — `GiziScreen.tsx` `DangerSignScreen.tsx` `PreeklamsiaScreen.tsx` `DmgScreen.tsx` `MentalScreen.tsx` + `SkriningPage.tsx` 6 tab + progress + ringkasan, Dexie queue fix `crypto.randomUUID` fallback `features/skrining/**/*.ts`
- [ ] Sync Dexie ↔ Supabase (wire `*Form.ts` `db.*.put()` → `supabase.from().insert()` saat online) — stub `supabase.ts` sudah siap, tinggal 1 baris per form
- [ ] FE S-04, S-05a/b — logic done, UI menyusul (next)
- [ ] Validasi pakar & Ethical Clearance (di luar dev)

## Backlog (Fase 1-7) — logic done, FE pending
- [x] Fase 0 — Fondasi: Vite+Supabase+Dexie+PWA (done)
- [x] Fase 1 — Onboarding S-01 `registerForm` + clinical-rules 7/7 (done)
- [x] Fase 2 — Skrining Ibu Hamil S-03a–S-03f (6 form logic done)
- [x] Fase 3 — Nifas S-04/S-04a + BBL S-05a–S-05b (4 form logic done; S-05c **dibatalkan**)
- [x] Fase 4 — Tracker S-07a-d (4 form + timeline done); S-06 Edukasi pending konten stakeholder `PRODUCT.md:88`
- [x] Fase 5 — Profil S-08b Export `exportService.ts` rudimentary (perlu desain dokumen final)
- [ ] Fase 6 — QA + validasi pakar SpOG + test retensi/notifikasi lintas browser (butuh APK PWA)
- [ ] Fase 7 — UAT (butuh Ethical Clearance)
- [ ] **Deploy Play Store (TWA)**: `VitePWA` manifest (`vite.config.ts:6`) + `public/logo-siaga-bunda.png` + `bubblewrap build` → `.aab` → Play Console `riset@poltekkesbandung.ac.id` `ARCHITECTURE.md:33,162`

## Catatan Keputusan
- PWA, bukan native — mitigasi retensi iOS (Dexie cache + sync Supabase) `ARCHITECTURE.md:6,9`
- Stack: React+Vite+TS, Tailwind+shadcn, Zustand, Dexie, Supabase (`supabase-js`), jsPDF — Firebase diganti Supabase
- VPS Poltekkes → tidak perlu untuk MVP (Supabase cloud), opsi self-host Supabase nanti kalau butuh on-premise

## Next Action (pindah session → baca BACKLOG ini dulu)
1. Wire sync Supabase: tambah `supabase.from('screening_results').insert()` di tiap `*Form.ts` (1 baris)
2. FE shell placeholder (pakai prototype https://sikibaskr.lovable.app) — BottomNav + Routing
3. Desain dokumen PDF final S-08b — review stakeholder
