# Kritis-2 — audit alur hasil skrining

Status: pengaman penjelasan awal terpasang; kategori dan arahan klinis **belum disetujui bidan/SpOG**. Tabel ini memetakan jalur yang harus diuji dengan kasus batas dan contoh kasus pakar, bukan menyatakan hasilnya valid secara klinis.

Semua jenis melewati `app/src/features/skrining/screeningCompleteness.ts` sebelum penyimpanan. Perhitungan/penyimpanan terdapat di berkas form di bawah; penyajian hasil berada di `app/src/features/skrining/SkriningPage.tsx` dan `components/SkriningResultScreen.tsx`. Ekspor menampilkan ringkasan tersimpan di `app/src/services/exportService.ts`.

| Jenis | Masukan dan penentu kategori saat ini | Yang masih perlu dikonfirmasi pakar |
| --- | --- | --- |
| Faktor Risiko | Usia, paritas, jarak, riwayat dan kondisi kehamilan → `clinical-rules/poedjiRochjati.ts` → `ibu-hamil/riskFactorForm.ts` | Kesesuaian skor, alasan setiap faktor dan tindak lanjut tiap kategori. |
| Status Gizi | BB sebelum/sekarang, tinggi, LILA, usia kehamilan → `clinical-rules/imtLila.ts` → `ibu-hamil/giziForm.ts` | Rumus target per minggu, ambang “kurang/lebih”, pemetaan ketiganya ke kategori, serta tindak lanjut. “Lebih” dengan kategori tersimpan HIJAU kini diberi **Tinjau BB** di hasil, menu, riwayat, dan PDF tanpa mengubah kategori medis tersimpan. |
| Tanda Bahaya | Jawaban keluhan → `ibu-hamil/dangerSignForm.ts` | Alasan per tanda bahaya, prioritas pertolongan dan cakupan pemeriksaan. |
| Preeklamsia | TD, MAP, protein urine dan faktor risiko → `clinical-rules/mapCalculator.ts` → `ibu-hamil/preeklamsiaForm.ts` | Ketepatan kategori dan pesan aspirin/rujukan. |
| Diabetes Gestasional | Riwayat, ukuran tubuh, hasil urine dan usia kehamilan → `ibu-hamil/dmgForm.ts` | Kategori risiko vs diagnosis, kebutuhan TTGO serta tindak lanjut. |
| Kesehatan Mental | 10 jawaban EPDS → `clinical-rules/epds.ts` → `ibu-hamil/mentalForm.ts` | Penjelasan skor, peran jawaban nomor 10 dan bantuan yang sesuai. |
| Masa Nifas | Tanda vital dan keluhan → `clinical-rules/meows.ts` → `nifas/nifasForm.ts` | Alasan kategori gabungan, gejala yang memerlukan pertolongan segera. |
| Laktasi | Menyusu, BAK, BB bayi, payudara dan urine → `nifas/laktasiForm.ts` | Prioritas tiap indikator dan rekomendasi sesuai usia bayi. |
| Ikterus | Zona, waktu muncul, aktivitas dan kondisi bayi → `clinical-rules/kramerZone.ts` → `bbl/ikterusForm.ts` | Keterbatasan penilaian visual dan tindak lanjut tiap hasil. |
| Hipotiroid | Status TSH, usia bayi dan gejala → `bbl/hipotiroidForm.ts` | Pembedaan pemeriksaan TSH yang sudah dilakukan dari hasil laboratorium yang belum dikonfirmasi. |

## Uji penerimaan sebelum data nyata

1. Bidan/SpOG menyetujui matriks masukan, kasus batas, kategori, tanda bahaya dan redaksi tindak lanjut untuk sepuluh jenis. Jangan mengganti ambang atau menganggap label “Tinjau BB” sebagai kategori klinis baru sebelum persetujuan tersebut.
2. Periksa hasil baru dan riwayat lama, termasuk hasil MERAH, pada ponsel, setelah refresh, saat offline dan saat berbagi PDF. Pastikan kategori tersimpan tidak diubah diam-diam serta penanda data yang belum diperiksa tidak disamakan dengan normal.
3. Uji pemahaman pengguna: pengguna mampu menyebutkan apa yang dinilai, mengapa hasil muncul, apa yang belum dinilai dan langkah berikutnya.
