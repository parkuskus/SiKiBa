# SiKiBa — SIAGA Bunda

PWA skrining kesehatan ibu hamil, ibu nifas & bayi baru lahir (PDUPT Poltekkes Bandung).

```
app/         Frontend Vite+React+TS (PWA). Jalankan dari sini: npm run dev
app/src/     Kode aplikasi (features/, clinical-rules/, data/, shared/)
supabase/    Migrations + Edge Functions (chat RAG and email MFA)
scripts/     Util Python (ingest-guideline.py → guideline_chunks)
docs/        Dokumentasi produk & arsitektur (di-track git)
assets/      File binary desain/PDF (lokal saja, di-ignore)
```

## Cara deploy

Frontend di-host di Cloudflare Pages. Database, autentikasi, dan Edge Function chatbot menggunakan Supabase dan dikelola terpisah.

- [Panduan rilis Android ke Google Play Store](docs/DEPLOY_PLAY_STORE.md)
- [Prompt ilustrasi dan layout header skrining](docs/SCREENING_HEADER_ILLUSTRATIONS.md)

### 1. Deploy frontend ke Cloudflare Pages

Hubungkan repository GitHub ini ke Cloudflare Pages, lalu atur:

- **Root directory:** `app`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Production branch:** branch rilis, biasanya `main`

Tambahkan environment variables berikut di **Settings → Environment variables → Production**:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-atau-publishable-key>
```

Jangan masukkan `service_role` key atau API key penyedia AI ke frontend. Setelah repository terhubung, push ke production branch akan memicu build dan deployment frontend otomatis. Push ke branch lain biasanya membuat Preview Deployment.

Verifikasi build lokal sebelum push:

```bash
cd app
npm ci
npm run build
```

### 2. Hubungkan Supabase CLI

Instalasi dan login Supabase CLI diperlukan untuk mengelola migration dan Edge Function dari terminal. Dari root repository:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
```

`<project-ref>` adalah bagian antara `https://` dan `.supabase.co` pada Project URL. Untuk database yang sudah ada, periksa status migration sebelum menerapkan perubahan:

```bash
npx supabase migration list
```

Bandingkan statusnya dengan file di `supabase/migrations/`. Migration `004_profile_email.sql` menambahkan kolom email profil dan mengisi email dari Supabase Auth untuk akun yang cocok. Setelah memastikan migration yang tertunda aman dan skemanya sesuai database, terapkan dengan:

```bash
npx supabase db push
```

Jangan menjalankan migration pada database production sebelum memeriksa perbedaan dan menyiapkan backup.

### 3. Deploy chatbot (opsional)

Simpan API key dan konfigurasi penyedia AI sebagai **Supabase Edge Function Secrets** melalui Supabase Dashboard, bukan di repository atau environment variables frontend. Setelah secret tersedia, deploy function dari root repository:

```bash
npx supabase functions deploy chat
```

Deploy ulang function hanya ketika kode di `supabase/functions/chat/` berubah. Perubahan frontend saja tidak memerlukan deploy ulang function atau database.

### 4. Aktifkan login sandi dan OTP email

Login akun menggunakan sandi Supabase Auth lalu OTP faktor kedua melalui Resend. Pendaftaran memakai OTP konfirmasi email Supabase. Di Supabase Dashboard aktifkan **Email signups** dan **Confirm email**, lalu atur Custom SMTP/template **Confirm signup** agar memakai `{{ .Token }}`. Recovery password harus diarahkan kembali ke domain aplikasi yang terdaftar pada **Authentication → URL Configuration**.

Sebelum mengaktifkan login di production:

1. Pastikan domain production frontend sudah final. Atur **Authentication → URL Configuration**: `Site URL` ke domain itu dan tambahkan origin production ke **Redirect URLs**. Recovery menggunakan origin aktif browser.
2. Tinjau migration `015_email_mfa.sql` dan siapkan backup serta maintenance window. Migration ini mengunci sesi lama sampai pengguna login ulang dan memperoleh klaim MFA.
3. Simpan `RESEND_API_KEY`, `RESEND_FROM_EMAIL` dari sender domain Resend yang terverifikasi, dan `MFA_OTP_HMAC_SECRET` acak minimal 32 karakter sebagai Supabase Edge Function Secrets. Jangan commit file env atau bagikan nilainya.
4. Deploy function `mfa-start`, `mfa-verify`, `mfa-revoke`, `chat`, dan `delete-account` sebelum migration. Pertahankan verifikasi JWT aktif pada semua function tersebut:

   ```bash
   npx supabase functions deploy mfa-start
   npx supabase functions deploy mfa-verify
   npx supabase functions deploy mfa-revoke
   npx supabase functions deploy chat
   npx supabase functions deploy delete-account
   ```

5. Dalam maintenance window, terapkan migration `015_email_mfa.sql`, lalu segera aktifkan **Authentication → Hooks → Custom Access Token** ke `public.custom_access_token_hook` (URI `pg-functions://postgres/public/custom_access_token_hook`). Jangan aktifkan hook sebelum function database tersedia.
6. Deploy frontend baru. Uji akun sintetis untuk signup, sandi salah/benar, OTP, refresh, recovery, logout, RLS, dan avatar sebelum membuka akses pengguna.

Jangan jalankan `npx supabase config push` hanya untuk mengaktifkan hook: konfigurasi lokal juga memuat perbedaan project lain yang dapat mengubah pengaturan Auth/SMTP/rate limit yang sudah berjalan. Terapkan hook khusus lewat Dashboard dan tinjau semua drift secara terpisah.

Sandi hanya dikelola Supabase Auth. Klaim MFA dan RLS deny-by-default melindungi tabel pengguna, avatar, chatbot, serta hapus akun. Pemulihan sandi tetap tanpa akses data sampai login sandi + OTP dilakukan kembali. OTP production belum siap sebelum sender, secret, hook, migration, dan pengiriman ke inbox uji terverifikasi.

### 5. Akun uji

#### Akun Dummy tanpa inbox email

Untuk menguji UI, skrining, tracker, notifikasi di lonceng, foto profil lokal, dan ekspor PDF, pilih **Masuk** lalu gunakan:

| Isian      | Nilai                                  |
| ---------- | -------------------------------------- |
| Email      | `dummy@siagabunda.test`                |
| Sandi demo | `SIAGA-Dummy-2026!`                    |
| Kode demo  | `246810`                               |
| Nama       | Dummy                                  |
| Usia       | 26 tahun                               |
| Kehamilan  | Sekitar 10 minggu ketika masuk, G1P0A0 |
| Fasyankes  | Puskesmas Uji SIAGA                    |
| Pendamping | Bidan Dummy                            |

Email ini khusus demo; tidak ada email atau request Auth yang dikirim. Profil lengkap dibuat otomatis pada perangkat, termasuk tanggal lahir, nomor telepon contoh, dan HPHT. Data Dummy terpisah dari akun riil dan tidak dikirim ke Supabase. Foto Dummy disimpan lokal, chatbot memakai FAQ, dan data testing tersimpan di perangkat masing-masing. **Push server dan upload foto cloud diuji memakai akun Supabase terverifikasi**, bukan kode demo. Sandi dan OTP tetap ini hanya untuk Dummy; akun lainnya memakai sandi Supabase Auth dan OTP email.

#### Akun Supabase untuk menguji layanan cloud

Pada proyek Supabase SIAGA Bunda yang tertaut, akun uji sudah dibuat:

- **Email:** `ksmaachmad@gmail.com`
- **Profil:** `Akun Uji Chatbot` dengan data sintetis, termasuk tanggal lahir dan HPHT `12 Februari 2026` (HPL `19 November 2026`)
- **Masuk:** akun ini hanya untuk pengujian. Jika belum memiliki sandi, gunakan **Lupa sandi?** untuk menetapkannya, lalu masuk dengan sandi dan OTP email. Jangan memakai password atau data kesehatan nyata.

Akun ini hanya untuk pengujian. Pastikan SMTP email Supabase dapat mengirim OTP ke alamat tersebut. Jangan masukkan informasi kesehatan nyata ke akun uji.

### Foto profil dan push pengingat

- **Foto profil:** buka **Saya**, ketuk foto/inisial dengan ikon kamera, pilih JPG/PNG/WebP maksimal 10 MB, lalu atur zoom serta posisi horizontal/vertikal. Foto hasil potongan 512×512 disimpan di bucket privat `profile-avatars`, direferensikan oleh `profiles.avatar_path`, dan di-cache di Dexie agar bisa tampil offline.
- **Lonceng Beranda:** menampilkan jadwal obat hari ini yang belum dicatat serta pemeriksaan berikutnya. Kartu Pengingat Harian disembunyikan jika tidak ada obat yang dijadwalkan atau semua dosis sudah dicatat.
- **Push:** buka **Saya → Notifikasi → Aktifkan notifikasi**. Akun Supabase terverifikasi didukung; browser harus memberikan izin. Service worker menerima push saat aplikasi tertutup. Akun Dummy bersifat lokal dan tidak memakai sesi Supabase atau push server.
- **Jadwal:** obat dikirim pada jam minum yang disimpan, sesuai periode dan hari pilihan; ANC dikirim **H-2 dan H-1 pukul 09.00**. Zona waktu mengikuti perangkat ketika mengaktifkan push. Dosis yang sudah diminum/terlewat dan ANC yang selesai tidak dikirim lagi.
- Backend memakai `dispatch-reminders`, `pg_cron` setiap menit, VAPID, dan Vault. Migration `007_avatar_push_reminders.sql` serta `008_schedule_reminder_push.sql` sudah diterapkan ke proyek yang tertaut pada 2026-10-06; Edge Function pengirim juga sudah di-deploy. Frontend terbaru tetap perlu di-deploy ke Cloudflare.
- Kunci VAPID publik sudah ada di client dan dapat di-override dengan `VITE_VAPID_PUBLIC_KEY`. Kunci privat hanya ada di Supabase Edge Secrets. Jangan menjalankan ulang `scripts/configure-push.mjs` pada proyek ini tanpa rencana rotasi karena langganan browser lama terikat pada kunci tersebut.
- Pada proyek Supabase lain, tinjau migration, ubah secret Vault `siaga_supabase_url` ke Project URL baru, provision pasangan VAPID, lalu deploy `npx supabase functions deploy dispatch-reminders --no-verify-jwt`. Flag itu diperlukan karena function memakai autentikasi secret Cron/Vault sendiri, **bukan endpoint publik tanpa autentikasi**. Jangan gunakan flag itu untuk chatbot `chat`.
- Push memerlukan koneksi dan browser/OS yang mendukung; jadwal pengiriman server tidak menjamin perangkat selalu menampilkan notifikasi tepat detik yang sama. Pada iPhone, gunakan PWA terpasang di layar utama pada versi iOS yang mendukung Web Push.

Pengecekan kecil logika kalender/zona waktu dan crop foto:

```bash
node --experimental-strip-types scripts/check-profile-reminders.mjs
```

### 6. Alur rilis

| Perubahan                  | Tindakan rilis                                              |
| -------------------------- | ----------------------------------------------------------- |
| UI atau logika frontend    | Push ke production branch; Cloudflare Pages deploy otomatis |
| Kode Edge Function chatbot | `npx supabase functions deploy chat`                        |
| Kode Edge Function MFA     | Deploy `mfa-start`, `mfa-verify`, dan `mfa-revoke`           |
| Skema atau policy database | Buat migration, tinjau, lalu `npx supabase db push`         |
| Secret chatbot/MFA         | Perbarui secret di Supabase Dashboard                       |

Setelah deployment, uji URL production, refresh halaman, koneksi database, mode offline, dan chatbot bila diaktifkan. Jangan gunakan data kesehatan sungguhan sampai SMTP, autentikasi email, dan kebijakan RLS diverifikasi. Aturan skrining klinis juga perlu divalidasi pakar sebelum digunakan dalam layanan nyata.
