# Popup Kelengkapan Skrining Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pengguna sepuluh form skrining mengetahui seluruh data kosong/tidak valid, cara memperbaikinya, dan lokasi isian pertama, tanpa menerbitkan hasil parsial.

**Architecture:** Pakai `validateScreening` dan validasi batas submit yang sudah ada sebagai sumber aturan; jangan menambah ambang klinis. Buat satu bottom sheet aksesibel untuk daftar masalah, lalu tiap layar menyusun masukan validasinya dari state form tanpa mengubah kosong menjadi nol. Tampilan bintang hanya muncul sesudah percobaan lanjut/simpan yang gagal, lalu hilang ketika isian valid; sheet tidak menggantikan arahan darurat.

**Tech Stack:** React 19, TypeScript, Radix Dialog yang sudah terpasang, Tailwind v4, skrip pemeriksaan Node, Vite.

**Spec:** Persetujuan pengguna dalam percakapan ini (bottom sheet “Data belum lengkap”, daftar field dan cara memperbaiki, tombol “Lengkapi data” menuju isian pertama; tanda `*` merah pada isian bermasalah), serta `docs/superpowers/specs/2026-10-19-kritis-1-kelengkapan-skrining-design.md` untuk aturan keselamatan.

## Batasan

- Berlaku pada sepuluh form S-03a–f, S-04/04a, S-05a/b, termasuk tombol **Lanjut** pada form bertahap.
- Sheet menampilkan semua masalah yang relevan di langkah saat ini, bukan hanya error pertama; tiap baris memberi nama field dan tindakan/format yang dapat dilakukan. Jumlah daftar dibatasi secara visual dengan scroll bila panjang.
- Tombol **Lengkapi data** menutup sheet, membuka langkah yang memuat masalah pertama bila perlu, lalu menggulir dan memfokuskan field/kelompok pertanyaan itu. Jika data hanya tersedia di profil (HPHT), beri arahan ke Profil alih-alih berjanji memfokuskan input yang tidak ada.
- Bintang merah `*` hanya untuk field atau kelompok yang **sedang** kosong/tidak valid sesudah validasi dicoba; jangan menandai semua field wajib sebelum pengguna mencoba. Letakkan dekat label, sertakan `aria-invalid` dan penjelasan yang terkait untuk input; bintang bukan satu-satunya petunjuk.
- Error jaringan/penyimpanan tetap memakai pesan error terpisah, bukan dinyatakan sebagai input tidak valid. Overlay MERAH dapat ditampilkan walau sheet validasi belum ditutup; pertolongan darurat lebih penting.
- Tidak mengubah data tersimpan, kategori, aturan klinis, ambang, atau flow sinkronisasi. Jangan otomatis menganggap jawaban kosong “Tidak”. Salin teks sesuai EYD dan `docs/DESIGN.md`.

## Fokus pemeriksaan

- Kosong pada angka yang sah bernilai nol (hari nifas, skala nyeri, EPDS 0) tidak berubah menjadi angka nol diam-diam.
- Protein urine dan glikosuria yang belum diperiksa diarahkan ke pemeriksaan, bukan disuruh memilih “Tidak”.
- Pertanyaan kondisional seperti TD tinggi saat bengkak Ya hanya ditandai saat muncul.
- Form bertahap mengembalikan pengguna ke langkah yang benar tanpa kehilangan jawaban, termasuk kesalahan di langkah sebelumnya saat submit.
- Temuan MERAH parsial tetap menampilkan bantuan sekalipun ada kesalahan isian lain.

---

### Task 1: Bottom sheet dan model masalah

**Files:**
- Create: `app/src/features/skrining/components/ScreeningValidationSheet.tsx`
- Test: `app/scripts/check-screening-validation-ui.mjs`

**Interfaces:**
- `ScreeningValidationSheet({ issues, open, onOpenChange, onComplete }: { issues: { key: string; label: string; instruction: string }[]; open: boolean; onOpenChange: (open: boolean) => void; onComplete: () => void })`.
- Gunakan `Dialog`/`DialogContent` dari `app/src/components/ui/dialog.tsx` dengan posisi bawah dan `DialogTitle`/`DialogDescription` yang benar, area daftar dapat digulir, tombol utama minimal 44 px. Jangan tambah dependensi.

- [x] Tambahkan uji fungsi pembentuk daftar masalah dan angka kosong; komponen DOM belum diuji interaktif karena proyek belum memiliki runner DOM.
- [x] Jalankan tes dan pastikan gagal karena fitur belum ada.
- [x] Implementasikan sheet minimal dengan Dialog Radix yang sudah ada.
- [x] Jalankan ulang tes hingga lulus.

### Task 2: Hubungkan angka, pilihan, dan langkah pada enam skrining ibu hamil

**Files:**
- Modify: `app/src/features/skrining/ibu-hamil/{RiskFactorScreen,GiziScreen,DangerSignScreen,PreeklamsiaScreen,DmgScreen,MentalScreen}.tsx`
- Test: `app/scripts/check-screening-validation-ui.mjs` dan perluasan `app/scripts/check-screening-completeness.mjs` bila logika persiapan input ditarik ke fungsi murni.

**Interfaces:**
- Pada submit/lanjut, cek semua field terlihat melalui `validateScreening` atau validasi langkah yang selaras dengan batas submit; buat daftar `{key,label,instruction}`; untuk angka gunakan `NaN` jika string kosong sehingga `0` yang ditulis tetap sah.
- Pada form bertahap, simpan mapping key ke langkah 1/2/3 dan selector input/kelompok. Setelah sheet ditutup lewat aksi utama, ubah langkah bila perlu dan fokuskan target setelah render.
- Pada setiap field yang gagal, tunjukkan `*` merah yang terlihat serta nama error untuk pembaca layar; hitung ulang masalah sesudah edit sehingga tanda yang sudah benar hilang.

- [x] Tambahkan pemeriksaan angka kosong dan pemetaan petunjuk; pemeriksaan DOM setiap form masih berupa cek sambungan sumber, bukan uji interaksi browser.
- [x] Jalankan skrip untuk menyaksikan kegagalan implementasi sheet yang belum dipasang.
- [x] Implementasikan integrasi per form dan pertahankan kesalahan sinkronisasi sebagai error terpisah.
- [x] Jalankan ulang skrip dan build sementara.

### Task 3: Terapkan pada empat skrining nifas dan bayi serta dokumentasikan

**Files:**
- Modify: `app/src/features/skrining/nifas/{NifasScreen,LaktasiScreen}.tsx`, `app/src/features/skrining/bbl/{IkterusScreen,HipotiroidScreen}.tsx`
- Update: `docs/BACKLOG.md`
- Test: `app/scripts/check-screening-validation-ui.mjs`

**Interfaces:** Sama dengan Task 2; tanda untuk kelompok konfirmasi keluhan/gejala hanya ditampilkan jika konfirmasi memang dibutuhkan. Usia bayi, zona Kramer, dan TSH ditangani sesuai state `null` versus `false`.

- [x] Tambahkan kasus hari nifas kosong vs `0`, zona belum dipilih, dan TSH belum dijawab vs “Belum”; konfirmasi kelompok tetap diuji lewat skrip kelengkapan sebelumnya.
- [x] Jalankan tes untuk melihat kegagalan sambungan pada empat form.
- [x] Integrasikan empat form tanpa mengubah hasil tersimpan; catat progres dan batas QA di backlog.
- [x] Kedua skrip, `npm run build`, dan `git diff --check` lulus; pemeriksaan visual ponsel tidak tersedia dan masih perlu dilakukan.

## Catatan eksekusi

Metode yang disarankan: implementasi langsung dalam sesi ini dengan satu tinjauan akhir. Pekerjaan ini mengubah sepuluh layar; pengujian perangkat/aksesibilitas manual tetap harus dibedakan dari keberhasilan build.
