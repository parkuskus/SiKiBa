# Audit layer processing, RBAC, modularity, dan kebocoran akses

**Tanggal:** 27 Oktober 2026  
**Asumsi beban:** banyak pengguna menyimpan data kesehatan pribadi melalui PWA, berganti akun/perangkat, dan menggunakan chatbot serta push.  
**Cakupan:** entry point, auth/MFA, data lokal dan sinkronisasi, export, clinical rules, seluruh migration/policy yang relevan, Edge Functions chat/MFA/reminder/delete-account, dokumentasi build/deploy, serta skrip uji keamanan yang tersedia.

## What this repo does

SIAGA Bunda adalah PWA untuk skrining ibu dan bayi, tracker, edukasi, ekspor, dan chatbot. Data disimpan terenkripsi di IndexedDB lokal, disinkronkan ke Supabase, dan akses akun cloud dibatasi dengan RLS. Model cloud yang dipilih adalah enkripsi platform Supabase plus RLS, bukan enkripsi ujung-ke-ujung (E2E).

## Kesimpulan

- **Tidak ditemukan bukti kebocoran lintas-akun melalui jalur anon/authenticated** pada policy dan fungsi yang dibaca. Migrations memberi policy owner dan klaim MFA untuk tabel pengguna; service-role hanya berada di server pada jalur yang ditinjau.
- **Belum dapat menyatakan keamanan produksi terverifikasi:** konfigurasi, grants, deployment migration, dan akses operator pada proyek Supabase live tidak diperiksa.
- Tindak lanjut: dua Must fix chatbot sudah ditangani di source; Should fix terkait default-exposure tabel public, pengujian RLS/clinical rules, dan partial failure hapus akun masih terbuka.

## Must fix

### 1. [Ditangani di kode, menunggu deploy] Chatbot meneruskan data kesehatan dan teks bebas ke penyedia LLM eksternal

- **Lokasi:** alur saat ini `app/src/features/chatbot/ChatbotPage.tsx:64-86,212-219`, `app/src/services/chatService.ts:47-66,69-103`, `supabase/functions/chat/index.ts:102-180,224-230`, `supabase/functions/_shared/chatRequest.ts`, dan `supabase/functions/_shared/chatContext.ts`.
- **Sebelumnya:** endpoint mengirim pesan dan riwayat ke embedding/LLM, serta membaca profil, skrining, nifas, dan bayi untuk konteks prompt. RLS mengisolasi akun, tetapi bukan aliran keluar ke vendor.
- **Perbaikan kode:** UI meminta persetujuan eksplisit sebelum request online pertama; izin hanya berlaku sampai obrolan baru. Tanpa izin, jawaban cepat/FAQ/offline tetap lokal. Edge Function menolak request AI tanpa flag persetujuan dan tidak membaca data klinis tersimpan. Email dan nomor telepon yang cocok dengan pola umum disamarkan pada pesan/riwayat sebelum embedding dan prompt; indikator MERAH hanya dipakai untuk eskalasi. UI menjelaskan pemrosesan dan penyimpanan chat.
- **Sisa risiko:** masking hanya mencakup pola email/nomor telepon umum, bukan nama, alamat, atau semua kemungkinan pengenal; UI menyarankan pengguna tidak mengetikkannya. Flag consent dapat dipalsukan oleh klien nonresmi dan bukan bukti persetujuan yang disimpan server. Retensi vendor harus diverifikasi. Perubahan Edge Function belum dideploy.

### 2. [Migration diterapkan, menunggu Edge Function deploy] Chat tidak membatasi ukuran pesan maupun frekuensi pemanggilan

- **Lokasi:** `supabase/functions/_shared/chatRequest.ts`, `supabase/functions/chat/index.ts`, `supabase/migrations/016_chat_rate_limit.sql`, dan `app/src/features/chatbot/ChatbotPage.tsx`.
- **Sebelumnya:** pesan bebas dikirim penuh ke completion; embedding memotongnya pada 2.000 karakter. Riwayat dipotong diam-diam, body diparse tanpa batas ukuran, dan tidak ada kuota.
- **Perbaikan kode:** stream body ditolak saat melampaui 32 KiB; pesan dibatasi 2.000 karakter dan tiap maksimal 6 giliran riwayat 1.000 karakter. Oversize ditolak sebelum embedding atau completion. Nilai pesan tervalidasi yang sama digunakan pada keduanya; textarea juga membatasi input.
- **Rate limit:** migration menambah limiter atomik per pengguna, maksimal 20 request AI per jendela 10 menit. Hanya Edge Function service-role yang dapat memanggil RPC; jika limiter gagal, request AI ditolak (fail closed). Permintaan cepat/FAQ yang dijawab lokal tidak memakai kuota vendor.
- **Verifikasi/sisa:** migration `016` diterapkan ke proyek tertaut `SIAGA-Bunda`; `supabase migration list --linked` mengonfirmasi versi lokal dan remote sama-sama `016`. Ada pemeriksaan batas input di `app/scripts/check-chat-privacy.mjs` dan SQL regression test `supabase/tests/016_chat_rate_limit.sql`, tetapi SQL test belum dijalankan. Edge Function belum dideploy, jadi endpoint live belum memakai validasi atau limiter baru.
- **Tindak lanjut:** deploy Edge Function `chat` setelah review/pengecekan Deno; limiter aktif untuk endpoint hanya setelah deploy itu.

## Should fix

### 3. [Migration diterapkan] Tabel public baru dapat terekspos API jika migration lupa mengaktifkan RLS

- **Lokasi:** `supabase/config.toml:19-23`, `supabase/migrations/017_fail_closed_default_privileges.sql`, dan `supabase/tests/017_fail_closed_default_privileges.sql`.
- **Temuan runtime:** `pg_default_acl` proyek tertaut memperlihatkan default privileges pada schema `public` memberi hak ke `anon`, `authenticated`, dan `service_role` untuk tabel baru. Karena itu config lokal saja tidak cukup.
- **Perbaikan source:** config lokal menetapkan `auto_expose_new_tables = false`; migration 017 mencabut default privilege tabel/view, sequence, dan function bagi API roles sampai ada grant eksplisit. SQL test membuat objek sintetis dalam transaksi lalu memeriksa tidak ada hak API role.
- **Status/verifikasi:** migration 017 diterapkan ke proyek tertaut SIAGA-Bunda. Query `pg_default_acl` pasca-migration mengonfirmasi ACL schema `public` untuk tabel, sequence, dan function tidak lagi memberi default privilege kepada `anon`, `authenticated`, atau `service_role`.
- **Operasional:** migration fitur baru tetap harus memasang RLS/policy dan grant yang dibutuhkan secara eksplisit.

### 4. [Harness diperbarui, belum dijalankan live] Skrip uji RLS A/B belum mengikuti MFA dan tidak menguji semua operasi silang

- **Lokasi:** `app/scripts/check-rls-ab.mjs`, `app/scripts/check-rls-hardening.mjs`, dan `supabase/migrations/015_email_mfa.sql:213-238`.
- **Perbaikan:** harness kini membaca semua migration, memastikan ke-12 tabel terdaftar dalam MFA owner-policy, login dengan sandi lalu meminta dan memverifikasi OTP email, me-refresh sesi, serta menguji klaim MFA server. Ia menguji baca/ubah silang untuk seluruh tabel ber-owner, hapus untuk tabel yang memang memberi grant delete, insert palsu, penyimpanan avatar, akun tanpa MFA, dan anon. Birth plan yang sudah ada dipulihkan saat cleanup.
- **Cara menjalankan:** dari `app/`, jalankan `node --experimental-strip-types scripts/check-rls-ab.mjs`; siapkan dua akun uji dan kredensial di `supabase/.env` seperti sebelumnya, lalu masukkan OTP yang dikirim untuk tiap akun saat diminta.
- **Status/batas:** belum dijalankan terhadap akun live karena mengirim OTP dan menulis data sintetis. Static check `app/scripts/check-rls-hardening.mjs` memeriksa coverage serta konfigurasi tanpa mengubah data.

### 5. [Ditambahkan test otomatis] Clinical rules tidak memiliki unit test otomatis yang ditemukan

- **Lokasi:** `app/src/clinical-rules/meows.ts:13-24`, `epds.ts:4-12`, `poedjiRochjati.ts:16-35`, `mapCalculator.ts:3-16`, `imtLila.ts:3-35`, `kramerZone.ts:9-15`; strategi test yang dijanjikan di `docs/ARCHITECTURE.md:153-159`; `app/package.json:6-10` tidak menyediakan test script.
- **Apa ini:** fungsi tersebut mengubah input klinis dan ambang menjadi skor/kategori traffic-light, namun tidak ditemukan file test unit untuk modul-modul tersebut.
- **Masalah dan prinsip:** perubahan kecil di batas ambang dapat mengubah hasil HIJAU/KUNING/MERAH tanpa kegagalan build. Contohnya, perubahan operator pada batas EPDS total 14 atau nilai MAP 99 dapat mengubah kategori tanpa tertangkap TypeScript. Ambang dan kebenaran klinis tetap perlu validasi pakar; test hanya menjaga implementasi sesuai aturan yang disetujui.
- **Perbaikan:** `app/scripts/clinical-rules.test.mjs` dan `npm test` mengunci batas/kategori untuk seluruh tujuh modul, termasuk `evaluasiGizi`. Ambang dan fungsi produksi tidak diubah.
- **Verifikasi dan batas:** test lulus. Ini hanya mencegah perubahan perilaku tak sengaja dari implementasi saat ini; bukan validasi pakar. Perhatian yang perlu diputuskan pakar: cabang MEOWS merah `<90/<60` membuat cabang kuning 80–89/50–59 tak terjangkau; nilai tepat sistolik 160 dan diastolik 110 saat ini HIJAU.

### 6. [Kompensasi diperkuat dan dideploy] Penghapusan akun dapat menghapus avatar tetapi gagal menghapus akun

- **Lokasi:** `supabase/functions/delete-account/index.ts:54-65`; UI mempertahankan data lokal ketika function gagal di `app/src/features/profil/ProfilPage.tsx:121-137`.
- **Apa ini:** function menghapus semua objek avatar, lalu baru menghapus pengguna Auth.
- **Masalah dan prinsip:** jika penghapusan objek berhasil tetapi `admin.auth.admin.deleteUser` gagal karena gangguan sementara, function mengembalikan 502. Pengguna tetap ada, tetapi avatarnya sudah hilang; aplikasi juga memberi tahu bahwa penghapusan belum berhasil. Ini partial failure lintas Storage/Auth yang tidak atomik.
- **Perbaikan:** helper `supabase/functions/_shared/deleteAccount.ts` memindahkan avatar ke staging path unik sebelum menghapus Auth, memulihkan path pada kegagalan termasuk respons `move` yang ambigu, dan mencoba ulang cleanup sekali. Cleanup yang tetap gagal dicatat dengan UID dan folder staging untuk tindak lanjut; account delete tidak salah dilaporkan gagal setelah Auth sudah dihapus.
- **Verifikasi dan batas:** regression test mencakup kegagalan Auth, staging parsial, respons `move` hilang, retry cleanup, dan cleanup yang tetap pending. Edge Function versi 3 sudah dideploy. Belum diuji dengan akun/Auth/Storage live; jika kedua percobaan cleanup gagal, berkas masih perlu dibersihkan dari folder staging.

## Penilaian RBAC dan modularity

- **Policy yang dibaca:** `001_init_siaga_bunda.sql:96-130`, `002_chat_rag.sql:46-57`, `007_avatar_push_reminders.sql:24-50,61-77`, `009_birth_plans.sql:19-31`, dan `015_email_mfa.sql:213-251`. Tabel pengguna membatasi owner dengan `auth.uid()` dan policy MFA; `guideline_chunks` dibaca pengguna terautentikasi karena berisi panduan umum, bukan data pasien. `reminder_deliveries` hanya dipakai jalur service-role dan tidak diberi policy pengguna.
- **Auth/MFA:** `custom_access_token_hook` menghapus klaim MFA bawaan lalu menambahkannya hanya untuk signup terkonfirmasi atau sesi yang diverifikasi (`015_email_mfa.sql:174-207`). Endpoint chat dan hapus akun memeriksa token/claim. Service-role memang melewati RLS, tetapi ditemukan hanya di server pada jalur admin yang dibaca; jangan pernah bundel key tersebut ke frontend.
- **Peran bidan:** belum ada role/delegasi akses bidan langsung. Ini sesuai alur sekarang yang berbagi PDF secara eksplisit oleh pengguna; bukan temuan. Jika akses bidan ditambah, perlu persetujuan per pasien, masa berlaku, pencabutan, audit log, dan policy terpisah—bukan grant umum ke `authenticated`.
- **Modularity:** clinical rules, data, sync, layanan chat, dan utilitas MFA dipisahkan. `supabase/functions/chat/index.ts` masih mencampur autentikasi, query konteks, retrieval, prompt, streaming, filter output, dan penyimpanan chat; ini menyulitkan test privasi dan request limits. Pemisahan konteks dari transport LLM akan bernilai saat dua temuan chat diperbaiki, tetapi audit tidak menganggap ukuran file saja sebagai bug.
- **Enkripsi cloud yang dipilih:** dokumentasi kini menyatakan data cloud memakai enkripsi at-rest/in-transit Supabase dan RLS, bukan E2E (`docs/ARCHITECTURE.md:107-109,133-136`, `docs/PRODUCT.md:80`). Payload tetap terbaca oleh role database/service-role berwenang. Status konfigurasi proyek live belum dibuktikan.
- **Lokal:** AES-GCM diterapkan melalui hook Dexie (`app/src/data/db.ts:139-181,298-352`); kunci non-ekspor disimpan di IndexedDB (`app/src/data/crypto.ts:25-63`). Ini melindungi penyimpanan lokal tertentu, bukan dari script same-origin/XSS saat sesi terbuka.

## Verifikasi dan batas audit

- `npm test` lulus (12 test); `npm run lint`, `npm run build`, `node scripts/check-rls-hardening.mjs`, dan `git diff --check` lulus. SQL regression test default privileges sempat gagal sebelum migration 018, kemudian lulus sesudah diterapkan.
- Harness RLS A/B yang sudah diselaraskan MFA belum dijalankan; kredensial akun tersedia, tetapi `SIAGA_TEST_OTP_A/B` tidak ada sehingga pengujian memerlukan OTP email interaktif dan menulis data sintetis.
- Build aplikasi tidak mengompilasi Edge Function. Deploy Supabase berhasil; `deno check` tidak tersedia. Test helper delete-account memakai Node, bukan test live Storage/Auth.
- Tidak membaca setiap komponen UI, setiap helper form, seluruh konfigurasi Dashboard, log/retensi vendor LLM, atau melakukan penetration test. Audit berfokus pada jalur berisiko tinggi yang disebut di cakupan.

**Verdict:** migration 016–018 sudah diterapkan; SQL regression test fail-closed kini lulus. Clinical test coverage dan kompensasi avatar ditingkatkan; Edge Function delete-account versi 3 aktif. Uji A/B MFA masih menunggu OTP interaktif. Keputusan pakar tetap diperlukan untuk menilai batas klinis, terutama MEOWS.

**Not checked:** grants/policies aktual proyek Supabase, SSL enforcement, backup dan akses organisasi, konfigurasi rate limit gateway, kontrak/retensi LLM, audit log, dan uji perangkat produksi.
