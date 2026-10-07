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
- [x] Kriteria manifest PWA diperbaiki 2026-10-06: ikon 192/512 valid, bahasa Indonesia, `start_url` dan `scope`; pemicu instal otomatis tetap dikendalikan Chrome.
- [x] Logo ibu hamil diperbarui 2026-10-06: ikon PWA, logo transparan untuk UI, dan versi latar putih untuk favicon/ikon layar utama.
- [x] Kartu menu skrining memilih hasil tersimpan terbaru per tipe, bukan hanya hasil hari ini; progress harian tetap dihitung dari tanggal hasil terbaru (2026-10-06).
- [x] Brief prompt ilustrasi dan variasi layout header untuk 10 form skrining dibuat di `docs/SCREENING_HEADER_ILLUSTRATIONS.md` (2026-10-06); generate aset dan implementasi header masih pending.
- [x] Sepuluh ilustrasi header skrining yang dibuat pengguna diurutkan dan dinamai `illu-46` sampai `illu-55` sesuai `docs/SCREENING_HEADER_ILLUSTRATIONS.md`.
- [x] Header S-03a Faktor Risiko memakai komposisi asimetris dan ilustrasi `illu-46-skrining-risiko.png`; logo dihapus dari header agar ilustrasi tidak tertutup.
- [x] Header S-03a dipisahkan dari sheet form tanpa overlap negatif agar ilustrasi dan konten form tidak bertabrakan.
- [x] Header S-03b Status Gizi memakai layout header berilustrasi dengan aset `illu-47-skrining-gizi.png`.
- [x] Header berilustrasi dengan dekorasi lingkaran diterapkan ke seluruh 10 form skrining sesuai pasangan aset `illu-46` sampai `illu-55`.
- [x] Ikon jadwal obat mengikuti status dosis: centang hijau, silang merah, dan tanda tanya abu-abu.
- [x] Field judul diary dan placeholder-nya disamakan ukurannya dengan isi diary; judul tampil tebal saat placeholder maupun saat diketik.
- [x] Lebar grafik/empty state berat badan dibatasi pada area isi card, tidak lagi memakai margin negatif yang membuatnya melewati card.
- [x] Tombol peta pada hasil Tanda Bahaya Kehamilan menggunakan query `Puskesmas Terdekat`, bukan nama fasyankes/profil demo.
- [x] Lonceng Beranda membuka daftar obat hari ini yang belum dicatat dan pemeriksaan terdekat; kartu harian disembunyikan jika tidak ada dosis obat tersisa (2026-10-06).
- [x] Foto profil mendukung pilih foto, zoom, posisi horizontal/vertikal, crop 512×512, bucket privat dan cache Blob offline; tampil di Beranda dan Saya (2026-10-06).
- [x] Migration 007–008 diterapkan ke Supabase tertaut: `avatar_path`, bucket privat/RLS, jadwal obat lengkap, log dosis, langganan push, klaim anti-duplikat dan Cron per menit. `dispatch-reminders` sudah di-deploy dengan VAPID privat di Edge Secrets dan secret Cron di Vault (2026-10-06).
- [x] Pengirim push obat mengikuti jam/hari/periode, dan ANC H-2 serta H-1 pukul 09.00 sesuai zona perangkat; aktivasi melalui pengaturan Notifikasi (2026-10-06).
- [x] Akun Dummy lokal `dummy@siagabunda.test` dengan kode `246810`, usia 26 tahun dan kehamilan sekitar 10 minggu tersedia tanpa inbox; petunjuk dan batas demo dicatat di README (2026-10-06).
- [x] Verifikasi fitur baru lolos: build frontend, pengecekan Deno pengirim push, check kalender/zona waktu/crop, serta uji Chrome untuk penolakan kode salah, login Dummy, lonceng, foto profil dan kartu pengingat kosong. Endpoint pengirim menolak panggilan tanpa autentikasi dengan HTTP 401 (2026-10-06).
- [x] Edukasi tahap awal 2026-10-07: katalog S-06 dan alur baca bergambar lima tahap pada S-06a dipisah ke `EdukasiMenuScreen.tsx` dan `FertilisasiScreen.tsx`; `EdukasiPage.tsx` hanya mengatur perpindahan screen. Memakai lima ilustrasi fertilisasi dan tautan video materi.
- [x] S-06b Perkembangan Janin per Minggu ditambahkan 2026-10-07 dengan selector trimester/minggu, default mengikuti HPHT profil ke minggu materi terdekat, 20 ilustrasi WebP, perkembangan, kondisi Bunda, kewaspadaan, dan tips pada `JaninWeekScreen.tsx` serta `janinWeekData.ts`.
- [x] Rencana layout dan 4 prompt ilustrasi internal S-06c dibuat di `docs/RENCANA_EDUKASI_S06C.md`; empat aset S-06c telah dibuat, ditinjau secara visual, dikonversi ke WebP, dan PNG sumber dihapus.
- [x] S-06c diimplementasikan sebagai satu layar tab ketuban, tali pusat, dan plasenta pada `PlasentaKetubanScreen.tsx`, menggunakan empat ilustrasi WebP yang direncanakan (2026-10-07).
- [x] Rencana layout S-06d dan pemetaan 12 ilustrasi (thumbnail + 11 sistem) diperbarui di `docs/RENCANA_EDUKASI_S06D.md`; 12 PNG dari folder S-06d dikonversi ke WebP dan dimasukkan ke katalog aset.
- [x] S-06d Perubahan Fisiologi diimplementasikan sebagai daftar 11 sistem dengan pencarian, ilustrasi accordion, thumbnail header, dan navigasi dari katalog pada `FisiologiScreen.tsx` serta `fisiologiData.ts`.
- [x] Katalog S-06 diperbarui: materi Keluhan Umum dihapus dan Birth Plan & Persiapan Persalinan (P4K) menjadi S-06g; tile S-06h duplikat dihilangkan (2026-10-07).
- [x] Birth Plan dipindahkan dari katalog edukasi ke kartu akses cepat tersendiri di Beranda, mengikuti revisi layout (2026-10-07).

### Belum selesai / perlu konfirmasi
- [ ] S-06 Edukasi: S-06 sampai S-06d sudah tersedia; S-06e–S-06g masih tampil sebagai “Segera hadir”. Lanjutkan desain/implementasi berdasarkan `docs/EKSTRAK_EDUKASI_LOVABLE.md` dan materi yang divalidasi stakeholder.
- [ ] Validasi seluruh algoritma klinis oleh SpOG/bidan senior. Ambang dan rekomendasi belum boleh dianggap tervalidasi untuk pelayanan.
- [ ] Ethical Clearance sebelum uji coba dengan partisipan.
- [ ] QA end-to-end pada perangkat Android dan iOS: OTP/SMTP produksi, offline dan antrean sync, RLS, retensi data, reminder/notifikasi, mode nifas, chatbot, dan alur MERAH.
- [ ] Setelah deploy frontend, aktifkan push di perangkat dengan akun riil dan uji penerimaan ketika PWA tertutup, termasuk obat, ANC H-2/H-1, serta upload/crop avatar cloud. Backend sudah di-deploy; izin browser belum dapat diberikan dari agen.
- [ ] Tinjau kebutuhan overlay darurat bersama untuk eskalasi chatbot dan hasil MERAH.
- [ ] Finalisasi isi/tampilan PDF bersama stakeholder; pastikan data ekspor dan format berbagi sesuai kebutuhan bidan.
- [ ] Konfigurasi SMTP produksi, secret Edge Function, dan verifikasi deployment Supabase/Cloudflare Pages.
- [ ] Siapkan distribusi Google Play melalui TWA setelah PWA production, keamanan data, validasi klinis, dan persyaratan akun/testing siap.
- [x] Panduan rilis Android ke Google Play Store via TWA/Bubblewrap ditambahkan di `docs/DEPLOY_PLAY_STORE.md` (2026-10-06); implementasi paket Android dan submission masih pekerjaan lanjutan.
- [ ] **Prasyarat Play Store:** deploy manifest/ikon PWA terbaru; siapkan package name permanen, akun Play Console institusi, Bubblewrap, Android SDK, dan signing key.
- [ ] Sajikan `/.well-known/assetlinks.json` sebagai JSON valid di production memakai SHA-256 App Signing certificate dari Play Console.
- [ ] **Keamanan dan kebijakan:** implementasikan enkripsi data kesehatan; lengkapi penghapusan akun dan data cloud; siapkan kebijakan privasi, Data safety, serta Health apps declaration.
- [ ] Uji AAB lewat internal/closed testing pada perangkat Android; siapkan store listing, screenshot, dan akses reviewer. Penuhi closed test tambahan jika diwajibkan tipe/umur akun Play Console.
- [ ] Validasi klinis, review pakar dan Ethical Clearance harus selesai sebelum penggunaan penelitian/publik yang relevan.

## Catatan teknis
- Dexie adalah penyimpanan lokal/offline; Supabase Postgres adalah sumber data cloud dengan RLS per pengguna.
- `app/src/data/crypto.ts` masih stub/plaintext; enkripsi data kesehatan yang direncanakan di `ARCHITECTURE.md` belum diterapkan.
- Belum ada test suite formal. Gerbang verifikasi proyek adalah `cd app && npm run build`; check kecil kalender/jadwal/crop tersedia di `scripts/check-profile-reminders.mjs`.
- Build berhasil, tetapi Vite memberi peringatan bundle utama >500 kB dan beberapa dynamic import tidak menghasilkan pemisahan chunk.
- Data beranda di `app/src/App.tsx` masih memiliki nilai default UK/progress/countdown/HPL; pastikan nilai yang tampil selalu berasal dari profil sebelum rilis.
- Konten edukasi, validasi klinis, dan persetujuan etik bergantung pada stakeholder/peneliti.

## Urutan kerja berikutnya
1. QA dan perbaiki alur data profil/beranda serta kelahiran, lalu verifikasi sinkronisasi Supabase dan RLS.
2. Finalisasi dokumen PDF dan review hasil bersama stakeholder/bidan.
3. Lengkapi S-06b–S-06g sesuai `docs/EKSTRAK_EDUKASI_LOVABLE.md` dan validasi klinis stakeholder; P4K kini memakai ID S-06g.
4. Jalankan validasi pakar, QA lintas perangkat, dan proses Ethical Clearance/UAT.
5. Siapkan deployment produksi dan distribusi yang dipilih.
