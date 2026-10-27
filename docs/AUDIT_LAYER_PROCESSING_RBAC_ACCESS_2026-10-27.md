# Audit layer processing, RBAC, modularity, dan akses data

**Tanggal:** 27 Oktober 2026  
**Cakupan:** frontend data/auth/sync/export, Supabase migrations dan RLS, Edge Functions MFA/chat/pengingat/hapus akun, serta dokumentasi arsitektur terkait.  
**Asumsi beban:** banyak pengguna memakai aplikasi pada perangkat sendiri; akun dan data kesehatan harus terisolasi. Chatbot dapat dipanggil berulang oleh pengguna terautentikasi.

## Ringkasan

Ada isolasi akses cloud yang cukup baik untuk pola produk saat ini: setiap akun hanya mengakses baris miliknya, token harus memuat klaim MFA, avatar memakai path per pengguna, dan operasi admin dibatasi di Edge Function. Tidak ditemukan jalur nyata untuk membaca baris Supabase milik akun lain melalui anon/authenticated client.

Namun, dua klaim perlindungan data belum sesuai dengan alur aktual: payload kesehatan dikirim dan disimpan di Supabase dalam bentuk terbaca, dan chatbot mengirim isi chat serta sebagian konteks kesehatan ke penyedia model eksternal. Endpoint chat juga belum membatasi ukuran input atau laju pemanggilan. Temuan ini perlu ditangani sebelum data kesehatan nyata dipakai.

**Tindak lanjut temuan 1 (2026-10-27):** dipilih enkripsi at-rest/in-transit terkelola Supabase + RLS, tanpa E2E pada lapisan aplikasi. Dokumentasi produk, arsitektur, deployment, dan backlog telah diselaraskan. Konfigurasi proyek Supabase live dan kebijakan/akses operasional belum diverifikasi; temuan belum dianggap terverifikasi tuntas sampai pemeriksaan itu selesai.

## Must fix

### 1. Data kesehatan di cloud tidak dienkripsi oleh aplikasi

- **Lokasi:** `app/src/data/sync.ts:141-210`; `app/src/data/sync.ts:60-69`; `app/src/data/crypto.ts:106-125`; klaim dokumentasi di `docs/PRODUCT.md:80`, `docs/ARCHITECTURE.md:107,133`.
- **Apa ini:** helper sync membentuk payload profil, hasil skrining, berat, jurnal, nifas, bayi, dan tracker lalu mengirimnya langsung ke Supabase. Enkripsi AES-GCM yang ada dipasang sebagai lapisan Dexie (`app/src/data/db.ts:298-346`), bukan pada payload jaringan.
- **Masalah:** ketika pengguna menyimpan hasil skrining, field seperti `detail`, `parameter_vital`, nama, HPHT, dan catatan masuk ke Postgres sebagai plaintext aplikasi. RLS mengurangi akses antar-pengguna, tetapi tidak mengenkripsi isi untuk operator/service-role atau akses database yang sah. Jadi persyaratan “terenkripsi di lokal dan cloud” tidak dipenuhi oleh kode, meskipun TLS dan enkripsi disk dari penyedia cloud mungkin tetap berlaku.
- **Perbaikan:** putuskan dan dokumentasikan model perlindungan cloud. Jika perlu enkripsi ujung-ke-ujung, enkripsi payload sensitif sebelum sync dan rancang pemulihan kunci/lintas perangkat sebelum implementasi; jangan memakai kunci lokal per perangkat untuk data cloud. Jika RLS + enkripsi infrastruktur Supabase yang dipilih, koreksi klaim produk/privasi dan batasi akses operasional, backup, serta ekspor sesuai kebijakan yang disetujui.
- **Jika dibiarkan:** kebocoran kredensial administratif, ekspor database, backup, atau akses internal dapat membuka data kesehatan dalam bentuk terbaca; kebijakan privasi juga berisiko menjanjikan perlindungan yang tidak dilakukan aplikasi.

### 2. Chat dan konteks kesehatan dikirim ke penyedia LLM tanpa minimisasi menyeluruh

- **Lokasi:** `supabase/functions/chat/index.ts:120-128`, `148-160`, `168-180`, `218-227`.
- **Apa ini:** Edge Function mengirim pertanyaan untuk embedding, lalu mengirim pertanyaan, riwayat chat, konteks profil/skrining/nifas/bayi, dan potongan panduan ke endpoint LLM eksternal.
- **Masalah:** konteks profil menyertakan nama panggilan dan HPHT (`:97-104`); `sanitasiKonteks` hanya menyaring nama field tertentu dari detail skrining (`:79-85`). Teks pesan dan riwayat dikirim utuh, sehingga pengguna yang menuliskan nama lengkap, nomor telepon, alamat, atau pengenal lain akan meneruskannya ke penyedia eksternal. Tidak ada pemfilteran pengenal langsung pada teks bebas atau batas persetujuan/retensi yang tampak pada alur kode ini.
- **Perbaikan:** tetapkan penyedia, tujuan pemrosesan, retensi, dan dasar persetujuan terlebih dahulu. Kirim hanya konteks yang diperlukan; hindari nama/HPHT jika tidak dibutuhkan. Tambahkan minimisasi pengenal pada teks pesan/riwayat sebelum embedding dan completion, serta sampaikan dengan jelas bila pesan diproses penyedia pihak ketiga. Jangan menganggap prompt sistem sebagai kontrol privasi.
- **Jika dibiarkan:** identitas atau data kesehatan yang diketik pengguna dapat keluar dari batas penyimpanan Supabase dan diproses sesuai kebijakan penyedia model.

## Should fix

### 3. Endpoint chat tidak membatasi ukuran request atau laju pemanggilan

- **Lokasi:** `supabase/functions/chat/index.ts:131-160`, `120-128`, `218-229`.
- **Apa ini:** handler menerima body JSON dan memproses `message` serta riwayat tanpa batas panjang body/teks. Embedding memotong teks ke 2.000 karakter, tetapi prompt completion memakai `message` utuh; setiap permintaan non-sapaan juga dapat memicu embedding dan completion berbayar.
- **Masalah:** satu akun atau skrip dapat mengirim pesan sangat besar atau memanggil endpoint berulang. Ini menaikkan biaya, latensi, ukuran prompt, dan tekanan pada function/provider. RLS mengisolasi data tetapi tidak membatasi penggunaan endpoint eksternal.
- **Perbaikan:** pasang batas byte body sebelum `req.json()`, batas karakter pesan/riwayat yang sama untuk embedding dan completion, lalu rate limit/kuota per pengguna di server atau gateway. Tolak input di luar batas dengan respons 4xx dan uji perilaku batas serta payload malformed.
- **Jika dibiarkan:** penyalahgunaan atau klien bermasalah dapat menyebabkan lonjakan biaya dan degradasi chatbot bagi pengguna lain.

## Penilaian RBAC dan modularity

- **RBAC cloud:** migration `015_email_mfa.sql:213-251` menerapkan kebijakan owner dan klaim `app_mfa_verified` ke tabel pengguna/avatar. Migration awal memasang kebijakan `auth.uid()` (`001_init_siaga_bunda.sql:96-130`); birth plan, dose log, dan push subscription juga punya kebijakan owner. A/B RLS test tersedia (`app/scripts/check-rls-ab.mjs`, `supabase/tests/015_email_mfa_rls.sql`). Pemeriksaan ini mendukung pemisahan antar-akun untuk jalur yang ditinjau.
- **Hak istimewa tinggi:** service-role dipakai pada server untuk MFA, pengingat, dan hapus akun. Pemakaian tersebut memang mem-bypass RLS; dari kode yang dibaca, chat memakai anon key + JWT pengguna, sedangkan operasi admin hapus akun memvalidasi pengguna dan hanya menghapus UID pemanggil (`supabase/functions/delete-account/index.ts:30-38,64-66`). Jangan pernah memindahkan service-role key ke frontend.
- **Peran bidan:** tidak ada role bidan/tenaga kesehatan atau delegasi akses langsung di implementasi ini. Untuk cakupan yang tertulis sekarang, bidan menerima PDF yang dibagikan pengguna; tidak ada dasar untuk memberi akun bidan akses ke tabel. Bila akses bidan ditambahkan, buat grant per pasien yang eksplisit, dapat dicabut, dan diuji—jangan memperlebar policy `authenticated`.
- **Modularity:** aturan klinis dipisah dari UI; sinkronisasi, enkripsi lokal, MFA bersama, dan kebijakan chat punya modul tersendiri. `supabase/functions/chat/index.ts` masih memuat banyak tanggung jawab (otorisasi, pengambilan konteks, retrieval, prompt, streaming, filter output, dan simpan riwayat), tetapi audit ini tidak menganggap panjang file sebagai bug mandiri. Perbaikan modularitas yang paling bernilai adalah memisahkan minimisasi/penyusunan konteks dari transport LLM agar bisa diuji sendiri, sebagai bagian dari perbaikan temuan 2–3.
- **Batas enkripsi lokal:** kunci non-ekspor tersimpan di IndexedDB terpisah (`app/src/data/crypto.ts:25-63`), sehingga fitur ini memberi perlindungan lokal tertentu, bukan batas keamanan terhadap JavaScript pada origin yang sama, malware/perangkat terbuka, atau XSS. Jangan menyamakan enkripsi lokal ini dengan enkripsi cloud atau perlindungan dari sesi browser yang sudah kompromi.

## Verifikasi yang dijalankan

- `npm run build` di `app/` — **lulus** (`tsc -b` dan `vite build`).
- Build bukan uji keamanan runtime. Audit ini tidak menjalankan query terhadap proyek Supabase live atau menguji deployment/konfigurasi dashboard.

**Verdict:** isolasi baris cloud antar-akun terlihat kuat untuk model pasien-saja, tetapi jangan gunakan data kesehatan nyata sebelum model enkripsi cloud dan pengiriman data chatbot ke pihak ketiga ditetapkan; batasi juga input dan laju endpoint chat.

**Not checked:** konfigurasi aktual proyek Supabase live (grants/policies remote, Auth hook, secrets, gateway limits), kontrak/retensi penyedia LLM, kebijakan privasi, uji perangkat, dan pemeriksaan penetration test. Skrip RLS live tidak dijalankan agar audit tidak membuat atau mengubah data proyek.
