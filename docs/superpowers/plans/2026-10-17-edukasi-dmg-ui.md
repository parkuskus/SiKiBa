# Edukasi dan Penyempurnaan UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement materi S-06g/S-06h dan tiga revisi UI Beranda, diary, serta skrining diabetes gestasional.

**Architecture:** Tambahkan dua screen detail edukasi yang memakai `EdukasiDetailHeader`, aset S-06g/S-06h, dan navigasi katalog yang sudah ada. Perubahan diary hanya menghapus tampilan skala dan mempertahankan nilai data lama; DMG memakai helper IMT klinis yang ada, sambil tetap menyimpan `imtPre` sebagai nilai yang dikonsumsi aturan risiko.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Dexie, fungsi klinis lokal.

**Spec:** `docs/RENCANA_EDUKASI_S06G_S06H.md`, instruksi user 2026-10-17, `docs/DESIGN.md`.

## Global Constraints

- Screen baru mengikuti pola header sage `#4A6E54`, sheet `#FFFCF6`, Plus Jakarta Sans, dan radius konten 20–24 px.
- Setiap screen edukasi berdiri sendiri; navigasi kembali menuju katalog S-06.
- Gunakan copy S-06h yang diberikan pengguna dan isi IMD di rencana; jangan menciptakan klaim klinis baru.
- Ambang dan rekomendasi klinis yang ada tidak diubah; DMG tetap menggunakan `imtPre > 30`.
- IMT = BB (kg) ÷ [TB (m) × TB (m)]; gunakan `calcIMT(bbKg, tbCm)` yang tersedia.
- Record diary lama tidak dimigrasikan atau dihapus; field mood disimpan dengan nilai netral bawaan saat penyimpanan baru.
- `app/` build (`npm run build`) adalah gate verifikasi proyek; tidak ada test runner formal.
- Markdown screen plan dan `docs/DESIGN.md` menjadi acuan desain; Figma opsional dan tidak menjadi prasyarat implementasi.

## Review Focus

- Profil DMG lama hanya menyimpan `imtPre`, tanpa BB/TB; jangan menebak nilai antropometri. Form baru perlu BB/TB aktual sebelum menghitung atau mengirim hasil.
- BB/TB kosong, nol, negatif, atau tidak numerik tidak boleh menghasilkan IMT tak terhingga/NaN atau hasil skrining.
- Hasil IMT pembulatan harus tetap memakai helper `calcIMT`; kategori/ambang DMG tidak berubah.
- Skor diary lama tetap tersimpan, tetapi tidak lagi ditampilkan di form maupun riwayat.
- Konten darurat pada S-06h harus terlihat jelas dan tidak tersembunyi di akordeon; urutan kembali/bagikan tidak berubah.

---

### Task 1: Materi edukasi S-06g dan S-06h

**Files:**
- Create: `app/src/features/edukasi/ImdScreen.tsx`
- Create: `app/src/features/edukasi/TandaPersalinanScreen.tsx`
- Modify: `app/src/features/edukasi/EdukasiMenuScreen.tsx`
- Modify: `app/src/features/edukasi/EdukasiPage.tsx`
- Assets: `app/public/s-06/s-06g/*.webp`, `app/public/s-06/s-06h/*.webp`
- Update: `docs/BACKLOG.md`
- Test/check: `app/scripts/check-planned-ui-updates.mjs`

**Interfaces:**
- Screens consume `{ onBack: () => void }` and use shared `EdukasiDetailHeader`.
- `EdukasiPage` owns screen state and passes callbacks to catalog tiles.

- [x] Add Node assertions for catalog topics, detail routes, assets, and UI changes; verify they fail before implementation.
- [x] Implement IMD article sections, numbered steps, safety note, references, and return action from the plan.
- [x] Implement Tanda Persalinan article, three illustrated signs, visible urgent-care panel, preparation list, and supplied references.
- [x] Connect S-06g and S-06h catalog tiles and detail routes; preserve existing screen callbacks.
- [x] Run `node --experimental-strip-types scripts/check-planned-ui-updates.mjs` and `npm run build` from `app/`.

### Task 2: Beranda label kehamilan

**Files:**
- Modify: `app/src/features/beranda/components/ProfileCard.tsx`

- [x] Assert the pregnant profile card label is “Hamil Bersalin dan Keguguran”.
- [x] Replace only the pregnant-card “GPA” label; retain the stored values and postpartum card behavior.
- [x] Build passes; narrow-width wrapping remains for device QA.

### Task 3: Hapus skala diary dari UI

**Files:**
- Modify: `app/src/features/tracker/PengingatPage.tsx`
- Modify: `app/src/features/tracker/DiaryHistory.tsx`

- [x] Assert the diary form has no 1–5 controls/copy and history no longer renders scores.
- [x] Remove visible score controls and score display; retain `DiaryEntry.mood` and `submitDiary` compatibility by saving the neutral value for new entries.
- [x] Build passes; existing entries remain stored and their text remains available.

### Task 4: BB, TB, dan IMT otomatis di DMG

**Files:**
- Modify: `app/src/features/skrining/ibu-hamil/DmgScreen.tsx`
- Modify: `app/src/features/skrining/ibu-hamil/dmgForm.ts`
- Reuse: `app/src/clinical-rules/imtLila.ts`

- [x] Assert the UI uses `calcIMT`, rejects invalid dimensions, and DMG threshold remains `imtPre > 30`.
- [x] Replace manual IMT with BB/TB inputs and a read-only calculated IMT display.
- [x] Keep IMT blank and block invalid submission; do not infer BB/TB for old BMI-only records.
- [x] Submit calculated `imtPre` and persist BB/TB for new records.
- [x] Run `node --experimental-strip-types scripts/check-planned-ui-updates.mjs` and `npm run build` from `app/`.

## Plan self-review

- All four user requests map to separate tasks and file scopes above.
- Existing IMT helper covers the unit conversion and rounding; no new clinical threshold or dependency is required.
- Diary mood is a required persisted field, so only its UI representation is removed.
- The project has no test runner, so focused checks must use existing project check-script conventions or lightweight assertions without adding dependencies; the build remains the final gate.
- Markdown screen plan sudah disetujui pengguna sebagai acuan S-06g/S-06h; tidak perlu menunggu frame atau audit Figma.
