# Audit layer processing, RBAC, modularity, dan kebocoran akses

**Tanggal:** 27 Oktober 2026  
**Asumsi beban:** banyak pengguna menyimpan data kesehatan pribadi melalui PWA, berganti akun/perangkat, dan menggunakan chatbot serta push.  
**Cakupan:** entry point, auth/MFA, data lokal dan sinkronisasi, export, clinical rules, seluruh migration/policy yang relevan, Edge Functions chat/MFA/reminder/delete-account, dokumentasi build/deploy, serta skrip uji keamanan yang tersedia.

## What this repo does

SIAGA Bunda adalah PWA untuk skrining ibu dan bayi, tracker, edukasi, ekspor, dan chatbot. Data disimpan terenkripsi di IndexedDB lokal, disinkronkan ke Supabase, dan akses akun cloud dibatasi dengan RLS. Model cloud yang dipilih adalah enkripsi platform Supabase plus RLS, bukan enkripsi ujung-ke-ujung (E2E).

## Kesimpulan

- **Tidak ditemukan bukti kebocoran lintas-akun melalui jalur anon/authenticated** pada policy dan fungsi yang dibaca. Migrations memberi policy owner dan klaim MFA untuk tabel pengguna; service-role hanya berada di server pada jalur yang ditinjau.
- **Belum dapat menyatakan keamanan produksi terverifikasi:** konfigurasi, grants, deployment migration, dan akses operator pada proyek Supabase live tidak diperiksa.
- Prioritas perbaikan: kendalikan data yang keluar ke penyedia chatbot, pasang batas pemakaian chatbot, dan tutup jalur default-exposure untuk tabel public baru.

## Must fix

### 1. [Ditangani di kode, menunggu deploy] Chatbot meneruskan data kesehatan dan teks bebas ke penyedia LLM eksternal

- **Lokasi:** alur saat ini `app/src/features/chatbot/ChatbotPage.tsx:64-86,212-219`, `app/src/services/chatService.ts:47-66,69-103`, `supabase/functions/chat/index.ts:102-159,224-230`, dan `supabase/functions/_shared/chatContext.ts`.
- **Sebelumnya:** endpoint mengirim pesan dan riwayat ke embedding/LLM, serta membaca profil, skrining, nifas, dan bayi untuk konteks prompt. RLS mengisolasi akun, tetapi bukan aliran keluar ke vendor.
- **Perbaikan kode:** UI meminta persetujuan eksplisit sebelum request online pertama; izin hanya berlaku sampai obrolan baru. Tanpa izin, jawaban cepat/FAQ/offline tetap lokal. Edge Function tidak lagi membaca data klinis tersimpan; ke LLM hanya dikirim system prompt, riwayat yang dikirim pengguna, pertanyaan, dan potongan panduan relevan. Indikator hasil MERAH dipakai hanya untuk keputusan eskalasi, bukan prompt. UI mengungkap bahwa chat yang disetujui dikirim ke layanan AI dan disimpan di SIAGA Bunda.
- **Sisa risiko:** teks bebas dan riwayat tetap dapat memuat pengenal jika pengguna mengetikkannya; minimisasi otomatis belum dilakukan. Retensi vendor perlu diverifikasi dari konfigurasi/kontrak. Perubahan Edge Function belum dideploy dan persetujuan adalah kontrol UI, bukan bukti consent yang diverifikasi server.

### 2. Chat tidak membatasi ukuran pesan maupun frekuensi pemanggilan pada lapisan aplikasi

- **Lokasi:** `supabase/functions/chat/index.ts:131-160,218-229`; klien mengirim isi pesan di `app/src/services/chatService.ts:46-65`.
- **Apa ini:** handler hanya memeriksa pesan kosong. Riwayat dibatasi enam giliran dan seribu karakter per giliran, tetapi `message` sendiri tidak punya batas; embedding memotong pesan ke 2.000 karakter, sementara prompt completion memakai pesan utuh.
- **Masalah dan prinsip:** satu akun atau skrip dapat mengirim body besar sampai batas gateway, atau mengulang request yang masing-masing dapat memicu biaya embedding dan completion. Batas `max_tokens` hanya membatasi jawaban, bukan ukuran input atau jumlah request.
- **Perbaikan:** tolak body yang melebihi batas byte sebelum parsing, validasi panjang pesan dan riwayat server-side, dan pasang rate limit/kuota per pengguna pada gateway atau server. Gunakan batas input yang sama untuk embedding dan completion serta uji batas dan payload malformed.
- **Jika dibiarkan:** biaya, latensi, dan kapasitas chatbot dapat terganggu oleh satu akun atau klien yang salah konfigurasi.

## Should fix

### 3. Tabel public baru dapat terekspos API jika migration lupa mengaktifkan RLS

- **Lokasi:** `supabase/config.toml:11-23`, khususnya `schemas = ["public", "graphql_public"]` dan komentar `auto_expose_new_tables` yang menyatakan default true bila tidak disetel; contoh pembuatan tabel di `supabase/migrations/001_init_siaga_bunda.sql`.
- **Apa ini:** konfigurasi menyatakan tabel baru pada schema yang diekspos dapat dijangkau role Data API tanpa grant eksplisit, sesuai default cloud. Tabel yang sudah ada umumnya mengaktifkan RLS, tetapi exposure API dan RLS adalah dua kontrol yang berbeda.
- **Masalah dan prinsip:** jika migration berikutnya menambah tabel sensitif di `public` lalu lupa mengaktifkan RLS/policy, Data API dapat menyediakan akses dengan grant default. Ini risiko konkret untuk tabel kesehatan baru; audit ini tidak menemukan tabel pengguna saat ini yang diketahui sengaja dibiarkan tanpa RLS.
- **Perbaikan:** gunakan konfigurasi fail-closed untuk tabel baru pada lingkungan yang didukung; di hosted project verifikasi/restrict default grants melalui mekanisme Supabase yang berlaku. Wajibkan tiap migration tabel sensitif memasang RLS dan policy owner sebelum data dimasukkan, serta tambahkan pemeriksaan schema yang menggagalkan build/release bila tabel publik tanpa RLS ditemukan. Jangan mendorong seluruh `config.toml` ke production tanpa meninjau drift.
- **Jika dibiarkan:** developer dapat menambah tabel sensitif yang tampak bekerja di frontend tetapi tidak memiliki pembatas per pengguna.

### 4. Skrip uji RLS A/B belum mengikuti MFA dan tidak menguji semua operasi silang

- **Lokasi:** `app/scripts/check-rls-ab.mjs:15-21,55-65,89-100,102-145`; policy MFA `supabase/migrations/015_email_mfa.sql:234`; test SQL MFA `supabase/tests/015_email_mfa_rls.sql:146-184`.
- **Apa ini:** skrip A/B login dengan sandi saja, tetapi policy saat ini mewajibkan klaim `app_mfa_verified`. Skrip juga hanya membaca migration 001, 002, 007, dan 009, sehingga tidak memeriksa policy MFA migration 015.
- **Masalah dan prinsip:** ketika dijalankan terhadap deployment saat ini, sesi baru dari `signInWithPassword` tidak punya klaim MFA; bahkan operasi akun A sendiri akan ditolak. Selain itu, operasi baca/ubah/hapus silang hanya diuji pada lima tabel.
- **Perbaikan:** update harness agar membuat sesi uji yang telah menyelesaikan MFA atau memakai JWT terkontrol pada Postgres lokal; masukkan migration 015 ke pemeriksaan sumber, lalu uji operasi yang di-grant pada seluruh tabel. Pertahankan verifikasi anon dan akun tanpa MFA harus ditolak.
- **Jika dibiarkan:** test A/B tidak lagi menjadi bukti bahwa pemilik sah bisa mengakses data, dan beberapa regresi policy silang tidak terdeteksi.

### 5. Clinical rules tidak memiliki unit test otomatis yang ditemukan

- **Lokasi:** `app/src/clinical-rules/meows.ts:13-24`, `epds.ts:4-12`, `poedjiRochjati.ts:16-35`, `mapCalculator.ts:3-16`, `imtLila.ts:3-35`, `kramerZone.ts:9-15`; strategi test yang dijanjikan di `docs/ARCHITECTURE.md:153-159`; `app/package.json:6-10` tidak menyediakan test script.
- **Apa ini:** fungsi tersebut mengubah input klinis dan ambang menjadi skor/kategori traffic-light, namun tidak ditemukan file test unit untuk modul-modul tersebut.
- **Masalah dan prinsip:** perubahan kecil di batas ambang dapat mengubah hasil HIJAU/KUNING/MERAH tanpa kegagalan build. Contohnya, perubahan operator pada batas EPDS total 14 atau nilai MAP 99 dapat mengubah kategori tanpa tertangkap TypeScript. Ambang dan kebenaran klinis tetap perlu validasi pakar; test hanya menjaga implementasi sesuai aturan yang disetujui.
- **Perbaikan:** tambahkan test tabel untuk batas tepat di bawah, sama dengan, dan di atas ambang serta input invalid untuk tiap aturan, dengan expected values yang disetujui pakar. Jalankan sebagai gate CI.
- **Jika dibiarkan:** regresi kategori klinis dapat lolos build dan tampil sebagai hasil skrining yang salah.

### 6. Penghapusan akun dapat menghapus avatar tetapi gagal menghapus akun

- **Lokasi:** `supabase/functions/delete-account/index.ts:54-65`; UI mempertahankan data lokal ketika function gagal di `app/src/features/profil/ProfilPage.tsx:121-137`.
- **Apa ini:** function menghapus semua objek avatar, lalu baru menghapus pengguna Auth.
- **Masalah dan prinsip:** jika penghapusan objek berhasil tetapi `admin.auth.admin.deleteUser` gagal karena gangguan sementara, function mengembalikan 502. Pengguna tetap ada, tetapi avatarnya sudah hilang; aplikasi juga memberi tahu bahwa penghapusan belum berhasil. Ini partial failure lintas Storage/Auth yang tidak atomik.
- **Perbaikan:** buat cleanup dapat dipulihkan dan diulang. Simpan/pertahankan daftar path dan status cleanup, atau gunakan alur staging/kompensasi agar kegagalan Auth dapat memulihkan avatar. Jangan sekadar memindahkan urutan sebelum memastikan constraint Storage saat penghapusan Auth.
- **Jika dibiarkan:** percobaan hapus akun yang gagal sebagian dapat merusak data akun yang masih aktif.

## Penilaian RBAC dan modularity

- **Policy yang dibaca:** `001_init_siaga_bunda.sql:96-130`, `002_chat_rag.sql:46-57`, `007_avatar_push_reminders.sql:24-50,61-77`, `009_birth_plans.sql:19-31`, dan `015_email_mfa.sql:213-251`. Tabel pengguna membatasi owner dengan `auth.uid()` dan policy MFA; `guideline_chunks` dibaca pengguna terautentikasi karena berisi panduan umum, bukan data pasien. `reminder_deliveries` hanya dipakai jalur service-role dan tidak diberi policy pengguna.
- **Auth/MFA:** `custom_access_token_hook` menghapus klaim MFA bawaan lalu menambahkannya hanya untuk signup terkonfirmasi atau sesi yang diverifikasi (`015_email_mfa.sql:174-207`). Endpoint chat dan hapus akun memeriksa token/claim. Service-role memang melewati RLS, tetapi ditemukan hanya di server pada jalur admin yang dibaca; jangan pernah bundel key tersebut ke frontend.
- **Peran bidan:** belum ada role/delegasi akses bidan langsung. Ini sesuai alur sekarang yang berbagi PDF secara eksplisit oleh pengguna; bukan temuan. Jika akses bidan ditambah, perlu persetujuan per pasien, masa berlaku, pencabutan, audit log, dan policy terpisah—bukan grant umum ke `authenticated`.
- **Modularity:** clinical rules, data, sync, layanan chat, dan utilitas MFA dipisahkan. `supabase/functions/chat/index.ts` masih mencampur autentikasi, query konteks, retrieval, prompt, streaming, filter output, dan penyimpanan chat; ini menyulitkan test privasi dan request limits. Pemisahan konteks dari transport LLM akan bernilai saat dua temuan chat diperbaiki, tetapi audit tidak menganggap ukuran file saja sebagai bug.
- **Enkripsi cloud yang dipilih:** dokumentasi kini menyatakan data cloud memakai enkripsi at-rest/in-transit Supabase dan RLS, bukan E2E (`docs/ARCHITECTURE.md:107-109,133-136`, `docs/PRODUCT.md:80`). Payload tetap terbaca oleh role database/service-role berwenang. Status konfigurasi proyek live belum dibuktikan.
- **Lokal:** AES-GCM diterapkan melalui hook Dexie (`app/src/data/db.ts:139-181,298-352`); kunci non-ekspor disimpan di IndexedDB (`app/src/data/crypto.ts:25-63`). Ini melindungi penyimpanan lokal tertentu, bukan dari script same-origin/XSS saat sesi terbuka.

## Verifikasi dan batas audit

- Tidak ada `npm test` atau unit test clinical-rules dalam konfigurasi/package dan pencarian test yang ditinjau. Build TypeScript tidak menguji akurasi klinis atau policy runtime.
- RLS A/B dan SQL test tersedia, tetapi skrip A/B perlu diselaraskan dengan MFA migration 015 sebelum bisa menjadi verifikasi deployment saat ini. Tidak dijalankan pada proyek live karena menulis data sintetis dan butuh kredensial; hasil historis backlog bukan verifikasi konfigurasi sekarang.
- Tidak menjalankan `npm run build` untuk audit ulang ini; perubahan laporan tidak mengubah kode. Sebelumnya build setelah pembaruan dokumen/model enkripsi berhasil, tetapi itu bukan bukti RLS atau production configuration.
- Tidak membaca setiap komponen UI, setiap helper form, seluruh konfigurasi Dashboard, log/retensi vendor LLM, atau melakukan penetration test. Audit berfokus pada jalur berisiko tinggi yang disebut di cakupan.

**Verdict:** policy owner/MFA yang ada tampak mencegah akses silang pada jalur cloud yang ditinjau, tetapi verifikasi live belum ada dan skrip A/B perlu diperbarui agar sesuai MFA. Perbaiki minimisasi data chatbot, pembatasan request, fail-closed untuk tabel baru, serta gap uji RLS dan clinical rules.

**Not checked:** grants/policies aktual proyek Supabase, SSL enforcement, backup dan akses organisasi, konfigurasi rate limit gateway, kontrak/retensi LLM, audit log, dan uji perangkat produksi.
