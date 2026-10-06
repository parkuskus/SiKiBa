# Panduan Rilis SIAGA Bunda ke Google Play Store

Panduan ini menjelaskan cara merilis PWA SIAGA Bunda sebagai aplikasi Android melalui **Trusted Web Activity (TWA)**. TWA membuka PWA production dalam Chrome tanpa bilah browser ketika Android telah memverifikasi bahwa aplikasi dan domain saling terhubung. Paket Android dibuat dengan **Bubblewrap**.

## Status dan estimasi

- Situs production: `https://siagabunda.riset-19e.workers.dev/`
- Manifest production: `https://siagabunda.riset-19e.workers.dev/manifest.webmanifest`
- Situs sudah HTTPS dan mendaftarkan service worker. Pemeriksaan live sebelumnya menemukan manifest masih versi lama dan `/.well-known/assetlinks.json` belum berisi Digital Asset Links yang valid. Deploy versi PWA terbaru dan siapkan file verifikasi domain sebelum TWA bisa diuji tanpa toolbar.
- Belum ada proyek Android/Bubblewrap atau konfigurasi signing di repository.

Perkiraan kasar, bukan jaminan:

| Kondisi | Perkiraan kalender |
| --- | --- |
| Akun organisasi Play Console aktif, PWA siap, assetlinks dan materi listing tersedia | sekitar **1–2 minggu** untuk packaging, pengujian, listing, dan review awal |
| Akun Play Console baru atau perlu perbaikan keamanan, kebijakan privasi, deklarasi kesehatan, dan QA | sekitar **3–6 minggu atau lebih** |
| Akun personal baru yang terkena syarat closed test | tambahkan sedikitnya **14 hari** closed test dengan **12 tester** yang tetap ikut selama periode yang diwajibkan, sebelum mengajukan akses production |
| Validasi klinis atau Ethical Clearance belum selesai | tidak dapat diperkirakan; bisa menambah beberapa minggu hingga beberapa bulan |

Google Play dapat memperpanjang review atau meminta perubahan. Durasi di atas mengasumsikan developer dapat segera mengerjakan packaging dan tester/stakeholder tersedia.

## Mekanisme rilis

1. Deploy PWA production dan pastikan manifest, ikon, service worker, login, API, serta navigasi berfungsi pada URL final.
2. Buat aplikasi TWA dari URL manifest menggunakan Bubblewrap. Tetapkan package name permanen, misalnya `id.ac.poltekkesbandung.siagabunda` setelah mendapat persetujuan institusi.
3. Buat signing key dan build Android App Bundle (`.aab`). Simpan keystore serta password dengan aman.
4. Buat dan pasang `assetlinks.json` di `/.well-known/assetlinks.json` untuk memverifikasi package name dan sertifikat signing.
5. Uji TWA di perangkat Android. Jika verifikasi domain gagal, konten bisa terbuka dengan toolbar browser.
6. Buat aplikasi di Play Console, lengkapi listing, deklarasi, Data safety dan uji melalui internal/closed testing.
7. Kirim `.aab` ke track production setelah lulus review dan testing yang diwajibkan akun.

## 1. Selesaikan prasyarat PWA dan situs

- Deploy build terbaru dari `app/` ke URL production final.
- Pastikan manifest memiliki nama aplikasi, `start_url`, `scope`, `display: standalone`, dan ikon PNG yang valid pada ukuran 192×192 serta 512×512. Buka manifest dan setiap URL ikon langsung untuk memastikan tidak diarahkan ke halaman SPA.
- Pastikan service worker aktif, halaman aplikasi dapat dimuat dan digunakan, dan seluruh navigasi penting berada dalam scope TWA.
- Uji melalui Chrome Android. Boleh gunakan [PWABuilder](https://www.pwabuilder.com/) atau validator TWA untuk menemukan masalah manifest/PWA.
- Pastikan Worker Cloudflare menyajikan path `/.well-known/assetlinks.json` sebagai file JSON langsung, bukan fallback `index.html`. File ini perlu `Content-Type: application/json` dan dapat diakses tanpa login.

## 2. Siapkan Play Console dan identitas aplikasi

- Daftarkan developer account Play Console. Pilih kepemilikan institusi bila aplikasi diterbitkan Poltekkes; siapkan verifikasi identitas organisasi dan kontak yang diminta Google.
- Sepakati package name secara permanen sebelum membuat app pertama. Package name bersifat unik dan tidak dapat dipakai ulang setelah terdaftar.
- Siapkan email dukungan, website/kebijakan privasi publik, ikon aplikasi, screenshot aktual, deskripsi, kategori, dan informasi penerbit.
- Akun personal yang dibuat setelah 13 November 2023 memiliki persyaratan testing sebelum mendapat akses production. Periksa halaman Play Console untuk aturan yang sedang berlaku; kebijakan yang berlaku saat panduan ini ditulis mensyaratkan closed test dengan 12 tester selama 14 hari.

## 3. Pasang Bubblewrap dan buat proyek TWA

Bubblewrap membutuhkan Node.js, JDK 17, Android SDK/build tools, dan koneksi ke URL manifest production. Kerjakan dari komputer build Android. Bubblewrap dapat dijalankan di Windows, tetapi Android SDK/Java harus sudah terpasang dan dikonfigurasi.

```bash
npm install --global @bubblewrap/cli
bubblewrap doctor
bubblewrap validate --url=https://siagabunda.riset-19e.workers.dev/
bubblewrap init --manifest=https://siagabunda.riset-19e.workers.dev/manifest.webmanifest
```

Saat inisialisasi:

- Masukkan package name yang sudah disepakati, misalnya `id.ac.poltekkesbandung.siagabunda`.
- Periksa nama aplikasi, URL start, scope, warna, ikon dan orientasi.
- Buat atau pilih keystore upload key. Untuk rilis pertama, simpan backup keystore dan password di tempat aman yang dikelola institusi. Jangan commit ke git atau membagikannya di chat.
- Tinjau `twa-manifest.json` hasil Bubblewrap sebelum build.

Build menghasilkan APK bertanda tangan untuk uji perangkat dan AAB untuk Play Console. Pasang APK ke perangkat untuk pengujian:

```bash
bubblewrap build
bubblewrap install
```

Perintah build menghasilkan artefak Android termasuk AAB untuk Play Console. Ikuti output CLI untuk lokasi file dan gunakan `.aab` untuk upload ke Play Store.

## 4. Pasang Digital Asset Links

TWA membutuhkan file berikut pada domain yang sama dengan aplikasi:

```text
https://siagabunda.riset-19e.workers.dev/.well-known/assetlinks.json
```

Struktur umumnya seperti ini. Ganti package name dan fingerprint dengan nilai nyata dari signing key/Play Console:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "id.ac.poltekkesbandung.siagabunda",
      "sha256_cert_fingerprints": ["AA:BB:CC:...:ZZ"]
    }
  }
]
```

Untuk menguji build lokal, fingerprint bisa diambil dari sertifikat yang menandatangani build tersebut. Untuk aplikasi yang menggunakan **Play App Signing**, gunakan fingerprint **App signing key certificate** dari Play Console pada file production `assetlinks.json`. Sertifikat upload key dan app signing key bisa berbeda. Jika aplikasi dipasang dari Play Store tetapi assetlinks hanya berisi fingerprint upload key, verifikasi domain akan gagal.

Setelah upload key tersedia, aktifkan Play App Signing di Play Console, lalu pasang fingerprint app signing yang diberikan Google. Jika build lokal juga perlu tetap diverifikasi, file JSON dapat memuat lebih dari satu fingerprint.

Verifikasi dengan membuka URL assetlinks di browser. Respons harus berupa array JSON persis seperti di atas, bukan halaman SIAGA Bunda atau error. Setelah deploy, uji lagi dengan aplikasi yang diinstal dari track Play testing.

## 5. Uji aplikasi Android

Uji AAB/build dari perangkat sungguhan sebelum production:

- Launch TWA, splash screen, tombol kembali, orientasi, status bar dan tautan eksternal.
- Login/daftar OTP dan akses backend production.
- Skrining, hasil MERAH, pengingat, tracker dan penyimpanan offline.
- Sinkronisasi Dexie–Supabase saat koneksi terputus dan tersambung kembali.
- Ekspor PDF, dialog berbagi, dan fallback saat aplikasi tujuan tidak tersedia.
- Instal melalui Play testing track untuk memastikan Digital Asset Links benar pada sertifikat Play App Signing.
- Perangkat Android dengan ukuran layar berbeda dan versi OS yang didukung.

## 6. Siapkan kepatuhan Google Play

Selesaikan sebelum meminta production review:

- Buat kebijakan privasi yang menjelaskan data identitas/kesehatan, tujuan, pemrosesan Supabase, penyimpanan lokal, retensi, berbagi, keamanan, serta permintaan penghapusan.
- Selesaikan penghapusan akun dan data cloud dari aplikasi. UI saat ini perlu diperiksa karena alur hapus yang ada belum menghapus akun Auth/data cloud secara menyeluruh.
- Enkripsi data kesehatan yang direncanakan dalam arsitektur masih stub di `app/src/data/crypto.ts`; selesaikan desain dan implementasinya sebelum penggunaan publik.
- Isi **Data safety** sesuai perilaku aktual aplikasi dan seluruh SDK/backend. Data kesehatan, identitas, email, chat, serta sinkronisasi cloud perlu dievaluasi satu per satu.
- Isi **Health apps declaration** dan deklarasi lain yang diminta Play Console. Klaim klinis harus memiliki sumber/metodologi yang dapat dijelaskan; jangan menyebut hasil skrining sebagai diagnosis. Selesaikan validasi pakar dan Ethical Clearance untuk penelitian sebelum uji coba yang terkait.
- Sediakan kontak dukungan dan instruksi login reviewer/akun demo dengan backend tetap aktif selama proses review.
- Pastikan aplikasi memberikan manfaat dan pengalaman yang layak sebagai aplikasi, bukan sekadar halaman web kosong atau tidak berfungsi. TWA boleh menampilkan PWA, tetapi Play tetap meninjau kualitas, fungsi, privasi dan kebijakan aplikasi.

## 7. Upload dan rilis

1. Di Play Console pilih **Create app**, isi nama, bahasa, app/game, free/paid, email dukungan, dan deklarasi awal.
2. Lengkapi store listing: deskripsi singkat/panjang, ikon, screenshot, kategori, rating konten, kontak, dan URL privasi.
3. Lengkapi App content, Data safety, Health apps declaration, target audience, akses reviewer dan deklarasi yang relevan.
4. Unggah `.aab` ke **Internal testing** terlebih dahulu. Perbaiki temuan pre-launch report dan uji proses instalasi dari Play.
5. Lanjutkan ke Closed testing. Jika akun personal baru terkena persyaratan Google, penuhi jumlah tester dan durasi yang tampil di Console sebelum meminta production access.
6. Buat Production release, tinjau negara/perangkat yang didukung dan staged rollout, lalu kirim untuk review.
7. Pantau **Publishing overview** dan email Play Console. Tanggapi penolakan atau permintaan perubahan, build ulang dengan `versionCode` lebih tinggi, kemudian kirim ulang.

## Checklist

- [ ] Build PWA terbaru sudah ada di URL production dan PWA/manifest/ikon valid.
- [ ] Package name permanen sudah disetujui institusi.
- [ ] Akun Play Console dan verifikasi penerbit siap.
- [ ] Bubblewrap, Java dan Android SDK siap; TWA dibangun dari manifest live.
- [ ] Keystore upload key disimpan dan dicadangkan dengan aman.
- [ ] `assetlinks.json` production berisi app signing SHA-256 fingerprint dari Play Console.
- [ ] AAB diuji melalui Play testing track pada perangkat sungguhan.
- [ ] Keamanan data, penghapusan akun/data cloud dan privacy policy siap.
- [ ] Data safety dan Health apps declaration sesuai dengan implementasi.
- [ ] Validasi klinis, review pakar dan Ethical Clearance yang dibutuhkan selesai.
- [ ] Store listing, screenshot, dukungan reviewer, serta kontak dukungan final.
- [ ] Persyaratan closed test akun developer telah dipenuhi bila berlaku.

## Referensi resmi

- [Trusted Web Activity Android](https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities)
- [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)
- [TWA Quick Start](https://developer.chrome.com/docs/android/trusted-web-activity/quick-start/)
- [Buat dan siapkan aplikasi di Play Console](https://support.google.com/googleplay/android-developer/answer/9859152)
- [Persyaratan pengujian akun personal baru](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Health Content and Services policy](https://support.google.com/googleplay/android-developer/answer/14738291)
