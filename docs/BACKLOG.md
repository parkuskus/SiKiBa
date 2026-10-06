# BACKLOG.md — SIAGA Bunda

Catatan status implementasi. Spesifikasi produk dan ID layar mengacu ke `PRODUCT.md` dan `SiKiBa_Spesifikasi_Storyboard_Prototype.md`; aturan visual mengacu ke `DESIGN.md`.

## Status saat ini — 2026-10-06

### Selesai
- [x] Fondasi PWA React, TypeScript, Vite, Tailwind v4, Dexie, Supabase Auth/Postgres, service worker, dan struktur fitur modular.
- [x] Onboarding S-00, S-01, S-01b dengan email OTP Supabase, pembuatan profil berbasis Auth UUID, dan template email.
- [x] Beranda S-02 dengan mode hamil/nifas, kartu profil, aksi cepat, ringkasan reminder, dan pencatatan kelahiran.
- [x] Skrining kehamilan S-03a–S-03g: faktor risiko, gizi, tanda bahaya, preeklamsia, DMG, EPDS, dan hasil traffic light.
- [x] Skrining nifas/laktasi S-04 dan S-04a, serta bayi S-05a dan S-05b. S-05c dibatalkan stakeholder.
- [x] Logika tracker S-07–S-07d untuk berat badan, suplemen, ANC, diary, dan timeline; UI tracker tersedia.
- [x] Profil: edit/detail, riwayat, pengaturan notifikasi dan penyimpanan, serta ekspor PDF dasar.
- [x] Sinkronisasi Dexie ke Supabase dengan antrean offline untuk profil, hasil skrining, berat, suplemen, ANC, diary, nifas, dan profil bayi. Pemanggilan helper sudah terhubung pada alur utama; perlu QA perilaku RLS dan retry.
- [x] Chatbot Siba memakai Edge Function saat online dan FAQ lokal sebagai fallback; batas topik, format jawaban, badge sumber terverifikasi, dan peringatan darurat tersedia.
- [x] Redesign Figma-first yang tercatat 1 Oktober: onboarding, beranda, form skrining, nifas/BBL, tracker, profil, dan chatbot mengikuti stage sage, panel mint/putih, serta format tanggal `DD/MM/YYYY`.
- [x] Migration Supabase 001–006 untuk skema awal, chatbot/RAG, grant, email profil, akses terautentikasi, dan kolom sync profil.
- [x] Build produksi berhasil pada 2026-10-06 (`npm run build`).

### Belum selesai / perlu konfirmasi
- [ ] S-06 Edukasi: konten dan layar topik menunggu materi klinis dari stakeholder; `EdukasiPage.tsx` saat ini masih perlu ditinjau untuk kelengkapan produk.
- [ ] Validasi seluruh algoritma klinis oleh SpOG/bidan senior. Ambang dan rekomendasi belum boleh dianggap tervalidasi untuk pelayanan.
- [ ] Ethical Clearance sebelum uji coba dengan partisipan.
- [ ] QA end-to-end pada perangkat Android dan iOS: OTP/SMTP produksi, offline dan antrean sync, RLS, retensi data, reminder/notifikasi, mode nifas, chatbot, dan alur MERAH.
- [ ] Tinjau kebutuhan overlay darurat bersama untuk eskalasi chatbot dan hasil MERAH.
- [ ] Finalisasi isi/tampilan PDF bersama stakeholder; pastikan data ekspor dan format berbagi sesuai kebutuhan bidan.
- [ ] Konfigurasi SMTP produksi, secret Edge Function, dan verifikasi deployment Supabase/Cloudflare Pages.
- [ ] Putuskan dan siapkan distribusi: PWA produksi serta TWA/Play Store bila tetap dibutuhkan.

## Catatan teknis
- Dexie adalah penyimpanan lokal/offline; Supabase Postgres adalah sumber data cloud dengan RLS per pengguna.
- `app/src/data/crypto.ts` masih stub/plaintext; enkripsi data kesehatan yang direncanakan di `ARCHITECTURE.md` belum diterapkan.
- Tidak ada test suite saat ini. Gerbang verifikasi proyek adalah `cd app && npm run build`.
- Build berhasil, tetapi Vite memberi peringatan bundle utama >500 kB dan beberapa dynamic import tidak menghasilkan pemisahan chunk.
- Data beranda di `app/src/App.tsx` masih memiliki nilai default UK/progress/countdown/HPL; pastikan nilai yang tampil selalu berasal dari profil sebelum rilis.
- Konten edukasi, validasi klinis, dan persetujuan etik bergantung pada stakeholder/peneliti.

## Urutan kerja berikutnya
1. QA dan perbaiki alur data profil/beranda serta kelahiran, lalu verifikasi sinkronisasi Supabase dan RLS.
2. Finalisasi dokumen PDF dan review hasil bersama stakeholder/bidan.
3. Terima materi S-06 dan implementasikan layar edukasi sesuai konten yang disetujui.
4. Jalankan validasi pakar, QA lintas perangkat, dan proses Ethical Clearance/UAT.
5. Siapkan deployment produksi dan distribusi yang dipilih.
