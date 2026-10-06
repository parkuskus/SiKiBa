# SiKiBa — SIAGA Bunda
PWA skrining kesehatan ibu hamil, ibu nifas & bayi baru lahir (PDUPT Poltekkes Bandung).

```
app/         Frontend Vite+React+TS (PWA). Jalankan dari sini: npm run dev
app/src/     Kode aplikasi (features/, clinical-rules/, data/, shared/)
supabase/    Migrations + Edge Functions (chat RAG)
scripts/     Util Python (ingest-guideline.py → guideline_chunks)
docs/        Dokumentasi produk & arsitektur (di-track git)
assets/      File binary desain/PDF (lokal saja, di-ignore)
```

## Cara deploy

Frontend di-host di Cloudflare Pages. Database, autentikasi, dan Edge Function chatbot menggunakan Supabase dan dikelola terpisah.

- [Panduan rilis Android ke Google Play Store](docs/DEPLOY_PLAY_STORE.md)

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

### 4. Aktifkan OTP email

Di Supabase Dashboard, aktifkan **Authentication → Sign In / Providers → Email**, **Allow new users to sign up**, dan **Confirm email**. Aktifkan Custom SMTP untuk pengiriman produksi. Pada **Authentication → Emails**, gunakan `{{ .Token }}` pada template **Confirm signup** untuk pengguna baru dan **Magic link or OTP** untuk pengguna yang masuk. Template HTML tersedia di `docs/email-template-confirm-signup.html` dan `docs/email-template-otp.html`. Subject yang disarankan adalah `Kode daftar SIAGA Bunda` dan `Kode masuk SIAGA Bunda`. Aplikasi memverifikasi kode dengan Supabase Auth, membuat profil memakai ID Auth pengguna, dan tidak menimpa profil jika email sudah terdaftar. Pendaftaran akun baru memerlukan koneksi internet agar email OTP dapat dikirim.

### 5. Akun uji chatbot

Pada proyek Supabase SIAGA Bunda yang tertaut, akun uji sudah dibuat:

- **Email:** `ksmaachmad@gmail.com`
- **Profil:** `Akun Uji Chatbot` dengan data sintetis, termasuk tanggal lahir dan HPHT `12 Februari 2026` (HPL `19 November 2026`)
- **Masuk:** pilih Masuk Akun, masukkan email di atas, lalu gunakan OTP yang dikirim ke inbox. Tidak ada password atau kode OTP tetap.

Akun ini hanya untuk pengujian. Pastikan SMTP email Supabase dapat mengirim OTP ke alamat tersebut. Jangan masukkan informasi kesehatan nyata ke akun uji.

### 6. Alur rilis

| Perubahan | Tindakan rilis |
| --- | --- |
| UI atau logika frontend | Push ke production branch; Cloudflare Pages deploy otomatis |
| Kode Edge Function chatbot | `npx supabase functions deploy chat` |
| Skema atau policy database | Buat migration, tinjau, lalu `npx supabase db push` |
| Secret chatbot | Perbarui secret di Supabase Dashboard |

Setelah deployment, uji URL production, refresh halaman, koneksi database, mode offline, dan chatbot bila diaktifkan. Jangan gunakan data kesehatan sungguhan sampai SMTP, autentikasi email, dan kebijakan RLS diverifikasi. Aturan skrining klinis juga perlu divalidasi pakar sebelum digunakan dalam layanan nyata.
