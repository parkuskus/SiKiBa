# BACKLOG.md — SIAGA Bunda

Catatan status implementasi. Spesifikasi produk dan ID layar mengacu ke `PRODUCT.md` dan `SiKiBa_Spesifikasi_Storyboard_Prototype.md`; aturan visual mengacu ke `DESIGN.md`.

## Status saat ini — 2026-10-06

### Selesai
- [x] Fondasi PWA React, TypeScript, Vite, Tailwind v4, Dexie, Supabase Auth/Postgres, service worker, dan struktur fitur modular.
- [x] Onboarding S-00, S-01, S-01b dengan email OTP Supabase, pembuatan profil berbasis Auth UUID, dan template email.
- [x] Beranda S-02 dengan mode hamil/nifas, kartu profil, aksi cepat, ringkasan reminder, dan pencatatan kelahiran.
- [x] Skrining kehamilan S-03a–S-03g: faktor risiko, gizi, tanda bahaya, preeklamsia, DMG, EPDS, dan hasil traffic light.
- [x] Form Status Gizi mempertahankan angka sebagai teks saat diketik agar input desimal tidak terpotong; preview IMT-LILA langsung di form dihapus sesuai permintaan karena hasil lengkap tampil setelah skrining disimpan (2026-10-08).
- [x] Satuan pada label input form diseragamkan ke dalam tanda kurung, misalnya `(kg)`, `(cm)`, `(mmHg)`, `(hari)`, dan `(tahun)` (2026-10-08).
- [x] Satuan pada label dan pesan validasi form diubah ke format tanda kurung, termasuk BB/TB/LILA, tekanan darah, suhu, usia, hari, dan volume (2026-10-08).
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
- [x] Header S-03a Faktor Risiko memakai komposisi asimetris dan ilustrasi `illu-46-skrining-risiko.webp`; logo dihapus dari header agar ilustrasi tidak tertutup.
- [x] Header S-03a dipisahkan dari sheet form tanpa overlap negatif agar ilustrasi dan konten form tidak bertabrakan.
- [x] Header S-03b Status Gizi memakai layout header berilustrasi dengan aset `illu-47-skrining-gizi.webp`.
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
- [x] S-06d Perubahan Fisiologi diimplementasikan sebagai daftar 11 sistem dengan pencarian, ilustrasi accordion, ilustrasi pada materi, dan navigasi dari katalog pada `FisiologiScreen.tsx` serta `fisiologiData.ts`.
- [x] Katalog S-06 diperbarui: materi Keluhan Umum dihapus dan Birth Plan & Persiapan Persalinan (P4K) menjadi S-06g; tile S-06h duplikat dihilangkan (2026-10-07).
- [x] Birth Plan dipindahkan dari katalog edukasi ke kartu akses cepat tersendiri di Beranda, mengikuti revisi layout (2026-10-07).
- [x] Judul katalog S-06a–S-06f diseragamkan; thumbnail S-06f dipakai di katalog saat layar detailnya belum tersedia (2026-10-08).
- [x] Card “Pelajari lewat video” ditambahkan di atas materi S-06a dan S-06b dengan video MP4 lokal serta kontrol native (2026-10-08).
- [x] Persona chatbot diperbarui menjadi Kira: avatar `gambar-karakter.webp`, sapaan/FAQ offline, label UI, dan prompt Edge Function diselaraskan (2026-10-08).
- [x] Thumbnail S-06e dikonversi menjadi WebP dan dipakai pada tile Tanda Bahaya Kehamilan (2026-10-08).
- [x] Layar S-06e Tanda Bahaya Kehamilan dibuat dengan pencarian, tiga kelompok gejala, kartu buka/tutup, dan video inline otomatis untuk 11 tanda kehamilan yang memiliki video relevan (2026-10-08).
- [x] Layar S-06f Perubahan Psikologi/Emosi dibuat dengan tab trimester, perasaan, penyebab, dukungan keluarga, tanda perlu mencari bantuan, thumbnail katalog, berbagi catatan, dan tautan langsung ke EPDS S-03f (2026-10-08).
- [x] Header detail S-06a–S-06f diseragamkan mengikuti referensi: panel sage, navigasi kembali, nomor dan label materi di tengah, tombol bagikan, judul dan deskripsi; thumbnail tetap dipakai pada katalog, bukan header detail (2026-10-08).
- [x] Margin atas pada panel konten katalog dan S-06a–S-06f dihapus agar konten langsung mengikuti header tanpa bertumpuk (2026-10-08).
- [x] Asset `illu-13-header-pengingat.webp` dipasang di kanan bawah header Pengingat dengan pola ilustrasi header Belajar (2026-10-08).
- [x] Seluruh raster image di `app/public` dan ikon vektor obat dikonversi ke WebP; referensi kode, favicon, ikon manifest, push, dan precache diperbarui (2026-10-08).
- [x] Birth Plan P4K diimplementasikan: Dexie v6, antrean upsert Supabase dan migration 009 dengan RLS, form autosave 25 butir di Beranda mode hamil, pemilihan versi saat konflik lokal/cloud, tampilan Profil read-only, serta PDF bagikan/unduh (2026-10-08).
- [x] Migration `009_birth_plans.sql` diterapkan ke proyek Supabase SIAGA Bunda. Smoke test RLS transaksional memverifikasi select/insert/update milik sendiri, penolakan akses lintas pengguna, akses baca authenticated, dan penolakan baca anon; seluruh data uji di-rollback. Skrip uji tersimpan di `supabase/tests/009_birth_plans_rls.sql` (2026-10-08).
- [x] Sesi akun Dummy dipertahankan setelah refresh; inisialisasi sesi anonim tidak lagi menghapus identitas Dummy, dan pemilihan profil tidak lagi jatuh ke profil pertama di perangkat (2026-10-08).
- [x] Tautan peta pada hasil tanda bahaya dan eskalasi darurat chatbot mencari Puskesmas atau Praktik Mandiri Bidan (PMB) terdekat (2026-10-09).
- [x] Akun Dummy dapat menautkan Web Push untuk pengingat suplemen dan ANC saat PWA tertutup. Jadwal yang diperlukan disinkronkan ke akun Supabase anonim khusus Dummy; notifikasi perlu internet (2026-10-10).
- [x] Push server diperbaiki setelah QA menemukan Edge Function tidak memiliki grant `SELECT` pada jadwal suplemen/ANC/dosis (`42501`); migration `010_service_role_reminder_reads.sql` memberi akses minimum ke role service (2026-10-10).

### Belum selesai / perlu konfirmasi
- [ ] S-06 Edukasi: S-06a–S-06f tersedia; S-06g belum dibuat. Tinjau tanda dari ekstraksi yang belum memiliki video relevan sebelum menambahkannya ke S-06e; materi nifas dan laktasi diarahkan ke S-04/S-04a.
- [ ] QA sinkronisasi Birth Plan dari aplikasi pada akun uji, termasuk antrean offline, pemulihan di perangkat lain, konflik dua versi, serta mode hamil/nifas.
- [ ] Validasi seluruh algoritma klinis oleh SpOG/bidan senior. Ambang dan rekomendasi belum boleh dianggap tervalidasi untuk pelayanan.
- [ ] Ethical Clearance sebelum uji coba dengan partisipan.
- [ ] QA end-to-end pada perangkat Android dan iOS: OTP/SMTP produksi, offline dan antrean sync, RLS, retensi data, reminder/notifikasi, mode nifas, chatbot, dan alur MERAH. Setelah grant 010, cron terpantau membalas HTTP 200 (`sent: 0`) pada 2026-10-10; jadwal aktif saat itu sudah lewat sehingga penerimaan notifikasi perangkat pada menit jadwal berikutnya masih perlu diuji. Belum ada subscription anonim Dummy pada pemeriksaan saat itu.
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
1. QA sinkronisasi Birth Plan dari aplikasi pada akun uji, termasuk antrean offline, pemulihan cloud, konflik dua versi, PDF, dan mode kehamilan/nifas.
2. Lengkapi S-06g P4K dan konten S-06e yang belum memiliki video relevan; lakukan review pakar sebelum publikasi.
3. Lanjutkan QA lintas perangkat, validasi klinis, dan proses Ethical Clearance/UAT.
4. Siapkan deployment produksi dan distribusi yang dipilih.
