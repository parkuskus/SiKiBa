# Kritis-1 Kelengkapan Skrining Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cegah hasil skrining lengkap saat data penentu risiko kosong, sambil mempertahankan respons darurat dan menandai riwayat yang belum terbukti lengkap.

**Architecture:** Gunakan validasi pada batas sepuluh fungsi `submit*` sesuai matriks skrining, sinkronkan pemeriksaan UI tanpa mengubah ambang klinis. Evaluasi kelengkapan riwayat sebagai label turunan tanpa menulis ulang hasil lama atau mengubah skema. Pisahkan status pemeriksaan dari jawaban negatif pada tempat yang sekarang memakai default `false`/`0`.

**Tech Stack:** React 19, TypeScript, Dexie, Supabase, Node assertion scripts, Vite.

**Spec:** `docs/superpowers/specs/2026-10-19-kritis-1-kelengkapan-skrining-design.md`; `docs/SiKiBa_Spesifikasi_Storyboard_Prototype.md` S-03a–f, S-04/04a, S-05a/b.

## Global Constraints

- Jangan ubah ambang atau kategori klinis tanpa persetujuan pakar; hasil MERAH tidak dapat dihapus atau diturunkan urgensinya.
- Nilai kosong, null, NaN, false, dan nol berbeda; riwayat lama tidak dihapus atau dihitung ulang.
- Pertahankan perilaku offline/sync untuk hasil lengkap; jangan menyimpan hasil parsial sebagai hasil final.
- UI berbahasa Indonesia sesuai `docs/DESIGN.md`; Figma tidak wajib.
- `npm run build` dari `app/` adalah gerbang akhir, bukan bukti validasi klinis.

## Review Focus

- Form diisi `0` hasil `Number("")` tidak boleh lolos; tes form gizi/nifas/BBL dan validasi submit.
- Butir Ya/Tidak yang belum dijawab tidak sama dengan `false`; tes DMG/preeklamsia/hipotiroid.
- Butir EPDS ke-10 positif pada form parsial harus menawarkan pertolongan segera tanpa hasil final.
- Hasil lama tanpa penanda validasi di `detail`, terutama MERAH, tidak pernah hilang/menjadi hijau karena label “Perlu pemeriksaan ulang”.
- Keluar-masuk offline atau buka detail lama tidak boleh menulis ulang hasil atau menghilangkan riwayat.

---

### Task 1: Peta kelengkapan dan pembuktian bug

**Files:**
- Test: `app/scripts/check-screening-completeness.mjs` (baru; assert `node --experimental-strip-types`).
- Audit: sepuluh form `app/src/features/skrining/{ibu-hamil,nifas,bbl}/*Form.ts`, layar pasangannya, aturan klinis, dan layar riwayat/status.

**Interfaces:**
- Menghasilkan daftar kasus per tipe dan fungsi penentu kelengkapan yang dapat dipakai oleh form dan pembaca riwayat; tidak mengubah data dahulu.

- [ ] Susun tes reproduksi yang gagal untuk submit kosong/parsial/NaN, positif bahaya parsial, dan hasil lama yang tidak lengkap; pastikan tiap kegagalan terjadi pada perilaku sebenarnya, bukan hanya pencarian teks.
- [ ] Catat mana input spesifikasi yang saat ini benar-benar memengaruhi skor, termasuk kondisi yang tidak berlaku, agar tidak menambah ambang/penanda klinis baru.
- [ ] Uji script dan simpan hasil merah sebagai bukti titik kerusakan sebelum perubahan produksi.

### Task 2: Validasi input pada batas submit

**Files:**
- Modify: `app/src/features/skrining/ibu-hamil/{riskFactorForm,giziForm,dangerSignForm,preeklamsiaForm,dmgForm,mentalForm}.ts`.
- Modify: `app/src/features/skrining/nifas/{nifasForm,laktasiForm}.ts`.
- Modify: `app/src/features/skrining/bbl/{ikterusForm,hipotiroidForm}.ts`.
- Test: `app/scripts/check-screening-completeness.mjs`.

**Interfaces:**
- Setiap `submit*` menolak field wajib hilang/invalid **sebelum** menghitung kategori atau menulis Dexie. Variasi field kondisional diambil dari matriks spec, bukan semua boolean otomatis wajib.

- [ ] Perluas kasus merah per kelompok: angka kosong/NaN, boolean undefined, kategori di luar daftar, EPDS kurang dari 10 item/invalid, kondisi yang tidak berlaku tetap lulus.
- [ ] Perbaiki validasi submit sesedikit mungkin tanpa mengubah rumus dan uji ulang hasil valid terdahulu.
- [ ] Pastikan tidak ada catatan Dexie/sync untuk kiriman yang ditolak.

### Task 3: UI form dan arahan bahaya parsial

**Files:**
- Modify: sepuluh `*Screen.tsx` pasangan Task 2 hanya bila validasi UI saat ini menghapus semantik kosong (khususnya default `false`, `Number("")`, atau pemulihan record lama).
- Inspect: `app/src/shared/components/EmergencyOverlay.tsx` dan alur S-03c, EPDS, nifas, ikterus.
- Test: `app/scripts/check-screening-completeness.mjs`.

**Interfaces:**
- Belum dijawab disimpan sebagai null/kosong dalam state; error menyebut field yang harus dilengkapi. Temuan yang menurut aturan yang ada tergolong MERAH membuka arahan yang sudah ada meski data lain belum lengkap; berbagi tidak boleh mengambil riwayat lama, dan tindakan saat offline tetap dapat dibaca; tidak menulis hasil lengkap lebih dulu.

- [ ] Tes kegagalan untuk bentuk form parsial dan tombol hasil; tes bahwa tanda bahaya tidak tersembunyi di balik validasi.
- [ ] Perbarui state dan pemeriksaan form tanpa mengubah jawaban valid atau mengarang hasil negatif.
- [ ] Verifikasi tab/refresh/riwayat draf tidak mengubah data yang disimpan sebelumnya.

### Task 4: Label turunan pada riwayat dan status

**Files:**
- Create: `app/src/features/skrining/screeningCompleteness.ts` untuk pemeriksaan detail tersimpan berdasarkan tipe (digunakan bersama oleh riwayat dan status); tes dari Task 1.
- Modify: `app/src/features/profil/HistoryScreen.tsx`, `app/src/features/skrining/SkriningPage.tsx`, dan pemakai hasil riwayat lain jika ditemukan.
- Update: `docs/BACKLOG.md` dan `docs/EVALUASI_AHLI_MEDIA_DEASY_2026-10-18.md` dengan status serta batas validasi pakar.

**Interfaces:**
- `needsRepeat(result: ScreeningResult): boolean` mengecek penanda validasi pada `detail` tanpa mutasi record; hasil baru diberi penanda hanya setelah validasi sukses. Status per tipe menerima label “Perlu pemeriksaan ulang”. MERAH tetap MERAH, terkunci, dan bisa dilihat.

- [ ] Tes hasil lama tanpa detail, hasil detail parsial, hasil lengkap, dan hasil MERAH parsial yang tetap terkunci.
- [ ] Tampilkan label turunan pada riwayat dan menu skrining; jangan mengubah kategori tersimpan atau melakukan migrasi cloud.
- [ ] Jalankan `node --experimental-strip-types scripts/check-screening-completeness.mjs` dan `npm run build` dari `app/`; uji `git diff --check` serta telaah regresi form/riwayat.

## Catatan implementasi, 19 Oktober 2026

Pengaman 10 fungsi submit, UI masukan kritis, arahan MERAH parsial, dan label turunan riwayat telah diterapkan. `app/scripts/check-screening-completeness.mjs` memeriksa matriks validasi serta aturan parsial tertentu; pemeriksaan sumber memastikan semua batas submit menggunakan validasi, tetapi **belum** mensimulasikan Dexie/sinkronisasi, navigasi browser, atau refresh/offline. Kelulusan build bukan kelulusan klinis. Checklist asli di atas tidak ditandai selesai untuk aspek yang belum dibuktikan tersebut.

## Catatan persetujuan

Rencana ini adalah rancangan implementasi, **belum** mencatat perbaikan sebagai selesai. Definisi kecukupan tiap skrining harus dicocokkan dengan ahli kebidanan sebelum hasil digunakan pada peserta penelitian dengan data nyata.
