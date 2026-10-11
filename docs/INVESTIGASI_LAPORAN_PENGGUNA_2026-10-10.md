# Investigasi Laporan Pengguna

**Tanggal:** 10 Oktober 2026  
**Status:** Investigasi dan perbaikan peta, mode nifas, isian skrining, serta penyimpanan P4K sudah diterapkan di aplikasi.  
**Tujuan:** Merangkum temuan yang dapat dibuktikan, bagian yang masih perlu direproduksi atau dikonfirmasi, dan rancangan solusi sebelum implementasi.

**Dasar keputusan klinis:** Masukan pada daftar ini berasal dari pakar dan sudah diverifikasi. Frekuensi ANC dan makna BB sebelum hamil diperlakukan sebagai persyaratan yang disetujui; investigasi ini tidak meminta validasi klinis ulang.

## Ringkasan

| No. | Laporan                                                          | Temuan investigasi                                                                                                                                                                                                                                                                    | Prioritas                                |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | Estimasi dana P4K tidak tersimpan                                | Payload dan kolom cloud sudah memuat estimasi. UI lama hanya memberi status lokal, sementara sync cloud berjalan tanpa status. Jika konflik tampil, field dana tetap editable dan dapat tertimpa saat memilih versi. Snapshot agregat cloud menunjukkan satu record P4K tanpa estimasi dana. | Tinggi |
| 2   | BB faktor risiko perlu berlabel “BB sebelum hamil”               | Selesai: label, key data baru, dan validasi memakai BB sebelum hamil; detail lama dengan key `bbKg` tetap dipulihkan. Algoritma skor Poedji tidak berubah.                                                                                                                               | Selesai                                   |
| 3   | Berbagai form skrining menampilkan data dummy, bukan isian terakhir | Nilai awal contoh ditemukan di beberapa skrining hamil, nifas, dan bayi. Form menginisialisasi ulang nilai itu ketika dibuka dan tidak memuat detail skrining terakhir. Hasil langsung setelah submit tetap perlu direproduksi untuk memastikan apakah masalahnya juga terjadi pada tahap itu. | Tinggi |
| 4   | Jawaban chatbot tidak konsisten/rancu                            | Ada jalur LLM online dan FAQ berbasis pencocokan kata offline; aturan, cakupan, penandaan verifikasi, dan deteksi eskalasinya tidak sepenuhnya sama.                                                                                                                                  | Tinggi, karena konteks kesehatan         |
| 5   | Jadwal ANC tidak sesuai; ingin ubah tanggal dan tandai HPL merah | Generator saat ini memakai enam minggu tetap `[10, 12, 20, 28, 32, 36]`; kalender hanya bisa menandai selesai dan mengubah catatan. HPL belum diberikan ke kalender sebagai penanda.                                                                                                  | Tinggi, aturan jadwal perlu dikonfirmasi |
| 6   | Bagian Tonggak Perjalanan tidak diperlukan                       | Bagian tersebut adalah blok UI mandiri di halaman Pengingat; tidak menjadi sumber jadwal ANC atau HPL.                                                                                                                                                                                | Rendah                                   |
| 7   | Peta darurat membuka fasyankes yang tersimpan di profil          | Tombol peta tampil untuk semua hasil MERAH, tetapi hanya `tipeKey === "danger"` yang memakai query fasilitas terdekat. Hasil MERAH lain menerima nama fasyankes dari profil.                                                                                                          | Tinggi                                   |
| 8   | Perlu konfirmasi sebelum kembali dari mode nifas                 | Tombol langsung mengganti mode ke hamil dan menghapus tanggal lahir yang dipakai untuk menghitung hari nifas; belum ada dialog konfirmasi.                                                                                                                                            | Sedang                                   |
| 9   | Belum ada deskripsi masalah                                      | Tidak ada perilaku atau konteks yang dapat diinvestigasi dari butir ini.                                                                                                                                                                                                              | Perlu keterangan                         |

## 1. Estimasi dana persalinan P4K tidak tersimpan

### Yang ditemukan

- Input `estimasiDana` memperbarui draft dan menandai draft berubah. Autosave dijadwalkan setelah 450 ms tanpa perubahan (`app/src/features/beranda/BirthPlanScreen.tsx`).
- Simpan lokal menulis seluruh objek `BirthPlan` ke Dexie. Migration Supabase 009 memiliki kolom `estimasi_dana numeric` yang menerima `NULL` atau nilai nonnegatif (`birthPlanService.ts`, sekitar baris 99–103; `supabase/migrations/009_birth_plans.sql`).
- Payload `syncBirthPlan` sudah mengirim `estimasi_dana`, tetapi sebelum perbaikan dipanggil fire-and-forget. UI hanya menyatakan “Tersimpan di perangkat”, sehingga cloud gagal/menunggu terlihat seperti sudah tersimpan penuh (`app/src/data/sync.ts`).
- Snapshot agregat remote yang diperiksa 2026-10-10 menunjukkan satu record `birth_plans` dan tidak ada record dengan `estimasi_dana` terisi. Query ini hanya memeriksa jumlah, bukan membuka isi atau mengidentifikasi pemilik record.
- Alur konflik versi lokal/cloud membandingkan timestamp tanpa terlebih dahulu memeriksa kesamaan isi. Selain itu, input estimasi dana tidak dikunci saat konflik walaupun field lain dikunci. Autosave juga berhenti selama konflik. Jadi angka dapat diketik, tetapi memilih versi online dapat menimpa angka itu tanpa menyimpannya.
- Konversi nilai cloud sebelumnya hanya menerima `number`; nilai numeric yang dikembalikan sebagai string akan dianggap kosong.

### Kesimpulan sementara

Penyimpanan lokal menerima seluruh objek, dan payload sync memuat estimasi. Dua penyebab yang terverifikasi dari kode adalah tidak adanya status cloud yang akurat serta field estimasi yang tetap bisa diedit lalu tertimpa ketika konflik dipilih. Snapshot cloud membuktikan ada record tanpa estimasi, tetapi belum menghubungkan record itu dengan akun pengguna yang melaporkan masalah.

### Rancangan solusi

1. Uji nilai bukan nol, nol, kosong, offline/reconnect, konflik versi, tutup/buka, refresh, dan perangkat kedua.
2. Pertahankan simpan lokal lebih dulu, tetapi tampilkan status terpisah untuk tersimpan lokal, menunggu sinkronisasi, tersinkron, gagal, dan akun lokal saja.
3. Parse nilai numeric cloud dengan aman; pertahankan perbedaan antara kosong (`null`) dan nol (`0`).
4. Serialkan autosave per rencana agar request lama tidak menimpa edit terbaru. Pastikan tombol simpan/tutup menunggu commit lokal, bukan menunggu jaringan.
5. Jika ada konflik isi, tampilkan kedua nilai estimasi, kunci edit selama pemilihan, dan jangan hilangkan nilai tanpa keputusan eksplisit.

### Implementasi

- Penyimpanan Dexie sekarang diselesaikan sebelum proses sinkronisasi; upsert cloud terlebih dahulu masuk antrean Dexie yang durable, dan request cloud berjalan setelahnya. UI membedakan status lokal, antrean, berhasil, gagal, dan akun Dummy lokal.
- Retry tersedia saat sync gagal dan saat perangkat kembali online. Autosave cloud Birth Plan diserialkan agar versi lama tidak selesai setelah versi baru.
- Konflik tidak lagi dibuat hanya karena timestamp berbeda jika konten kedua versi sama. Jika isinya berbeda, nilai estimasi dana perangkat dan online ditampilkan; field dana ikut terkunci selama konflik.
- Nilai estimasi dari cloud menerima `number` atau numeric string yang valid; nol tetap berbeda dari kosong.
- `scripts/check-birth-plan.mjs` memeriksa parse nol/numeric/null serta perbandingan isi saat timestamp berbeda.
- Build dan skrip cek tersebut berhasil pada 2026-10-10. Perbandingan nilai lokal/cloud pada perangkat akun yang melaporkan masalah masih perlu QA browser.

### Kriteria penerimaan

- Jumlah yang disimpan tetap sama sesudah tutup/buka, refresh, dan pemulihan setelah offline.
- `0`, nilai positif, dan field kosong tetap memiliki makna yang berbeda.
- Status lokal dan cloud akurat; kegagalan sinkronisasi terlihat dan dapat dicoba lagi.

## 2. Label BB di Skrining Faktor Risiko

### Implementasi

Label, key detail, dan pesan validasi sudah diselaraskan. Pemulihan tetap mendukung key lama `bbKg`; skor Poedji tidak berubah.

## 3. Berbagai skrining menampilkan data dummy, bukan isian terakhir

### Yang ditemukan

- Nilai contoh ada di beberapa form kehamilan. `RiskFactorScreen` memulai usia 26 tahun dan UK 28 minggu; profil mengisi usia dan UK secara asinkron, tetapi detail skrining sebelumnya tidak dimuat (`RiskFactorScreen.tsx`, sekitar baris 77–115). `GiziScreen` memulai BB pra-hamil 55 kg, TB 160 cm, LILA 24 cm, BB sekarang 62 kg, dan UK 28 minggu (`GiziScreen.tsx`, sekitar baris 13–14). `DmgScreen` memulai usia 26 tahun, IMT 24, dan UK 26 minggu (`DmgScreen.tsx`, baris 9). `PreeklamsiaScreen` memulai tekanan darah 120/80 dan UK 28 minggu (`PreeklamsiaScreen.tsx`, sekitar baris 51–65).
- Nilai awal contoh juga ditemukan di form nifas dan bayi. `NifasScreen` memulai hari nifas 2, suhu 36,8, tekanan darah 120/80, dan nilai contoh lainnya. `LaktasiScreen` memulai usia bayi 3 hari, frekuensi menyusu 8 kali, dan kondisi normal/cukup. `IkterusScreen` memulai usia bayi 3 hari, zona 2, dan onset 36 jam. `HipotiroidScreen` memulai keadaan TSH belum dilakukan dan usia bayi 2 hari (`NifasScreen.tsx`, `LaktasiScreen.tsx`, `IkterusScreen.tsx`, dan `HipotiroidScreen.tsx`, bagian inisialisasi `useState`).
- Form-form tersebut memakai state awal lokal dan tidak memuat `detail` hasil terakhir berdasarkan `userId` dan tipe skrining ketika dibuka kembali. Dengan demikian, saat dibuka lagi, nilai dapat kembali ke contoh awal.
- Saat submit, fungsi form menyimpan `userId`, skor/kategori, detail jawaban, dan `createdAt` ke Dexie. Hasil yang dikirim ke layar hasil dihitung dari state form saat tombol ditekan. Daftar Skrining membaca data per `userId` dan memilih hasil terbaru per tipe; kartu Riwayat hanya menampilkan skor/kategori dan tanggal, bukan detail input (`SkriningPage.tsx`, sekitar baris 93–129; `HistoryScreen.tsx`, sekitar baris 59–67).
- Klarifikasi pengguna menetapkan bahwa “Skrining2” berarti **skrining-skrining secara umum**, bukan satu layar dengan ID Skrining2. Cakupannya adalah berbagai form skrining.

### Kesimpulan sementara

Sumber nilai dummy telah ditemukan pada berbagai form: masing-masing memulai dengan nilai contoh dan tidak menghidrasi isian terakhir. Ini menjelaskan mengapa form yang dibuka kembali dapat menunjukkan data contoh, bukan isian terakhir. Hasil langsung setelah submit semestinya dihitung dari state form yang baru dikirim. Jika data dummy muncul pada hasil langsung meskipun field sudah diubah, hal itu memerlukan reproduksi terpisah untuk memeriksa field yang tidak ikut terkirim atau detail yang tidak tersimpan.

### Rancangan solusi

1. Terapkan perbaikan lintas form skrining hamil, nifas, dan bayi, bukan hanya satu jenis skrining.
2. Hapus nilai contoh dari alur akun pengguna. Isi nilai dari profil hanya jika tersedia dan memang relevan; field klinis lain mulai kosong atau belum dipilih agar pengguna memasukkan kondisi aktual.
3. Saat form dibuka kembali, muat isian terakhir milik `userId` aktif dan tipe skrining yang sama dari detail Dexie. Jangan mengambil data pengguna lain atau seed fixture.
4. Pastikan layar hasil langsung berasal dari input/hasil submit yang sama dengan record yang ditulis dan Riwayat menunjukkan record terbaru.
5. Uji setiap form dengan nilai unik saat submit, buka kembali, refresh, pindah akun, dan kembali ke form; verifikasi hasil/detail serta isolasi per `userId`.

### Implementasi

- Semua form S-03a–S-05b sekarang memuat hasil tersimpan terbaru dengan pencarian Dexie yang dibatasi oleh `userId` dan tipe skrining. Form baru dimulai tanpa angka contoh; usia dan UK diisi dari profil jika tersedia.
- Nilai kategori/Ya-Tidak yang belum dijawab tampil tanpa pilihan aktif dan perlu dijawab sebelum submit jika merupakan input wajib. Jawaban EPDS dan nilai form sebelumnya dipulihkan dari `detail` tersimpan.
- Faktor Risiko kini juga menyimpan pilihan mentah pada submit baru. Record lama yang tidak merekam pilihan lengkap tetap dapat dibuka tanpa mengarang jawaban; layar memberi peringatan agar pengguna meninjau kembali.
- Uji isolasi pemilihan hasil terbaru tersedia di `scripts/check-screening-draft.mjs`. Build produksi dan skrip tersebut berhasil pada 2026-10-10.

## 4. Chatbot AI inkonsisten dan sebagian jawaban rancu

### Yang ditemukan

- Ada dua mesin jawaban. Online memanggil Supabase Edge Function/LLM dengan prompt, data skrining, profil terbatas, dan retrieval guideline; offline atau kegagalan online menggunakan FAQ lokal (`app/src/services/chatService.ts`, `supabase/functions/chat/index.ts`).
- FAQ offline memakai pencocokan substring berdasarkan kata kunci dan urutan array. Kata generik seperti “bayi”, “darah”, “sakit”, atau “menyusu” dapat memicu jawaban yang tidak sesuai konteks; hasil pertama yang cocok langsung dipakai (`app/src/services/chatService.ts`, sekitar baris 8–17; `personality.ts`, sekitar baris 29–71).
- Beberapa jawaban FAQ diberi `terverifikasiAhli: true` sebagai nilai statis; belum terlihat bukti review/versi pakar pada data FAQ itu sendiri. Online memberi label terverifikasi jika retrieval mengembalikan sumber, walaupun belum ada validasi bahwa jawaban benar-benar memakai kutipan itu (`chatService.ts`, baris 37; `personality.ts`).
- Kebijakan eskalasi tidak identik. Server memeriksa pola tanda bahaya pada pesan pengguna atau pertanyaan tentang hasil MERAH. Fallback lokal menentukan eskalasi dengan regex pada teks jawaban, yang tidak sama dengan aturan server (`chat/index.ts`, sekitar baris 65–66 dan 199–206; `chatService.ts`, baris 19 dan 29–42).
- Prompt mengatur gaya/cakupan, tetapi LLM tetap dapat menghasilkan variasi atau jawaban rancu. Filter sekarang menolak sebagian proses internal/metadata, bukan menguji kesesuaian jawaban dengan pedoman pakar yang sudah disetujui.
- Review klinis atas masukan pakar dianggap sudah selesai. Pekerjaan yang tersisa adalah menerapkan keputusan tersebut secara konsisten pada jalur online dan fallback, bukan meminta review klinis ulang.

### Rancangan solusi

1. Buat satu matriks perilaku untuk salam, edukasi umum, pertanyaan di luar cakupan, FAQ, tanda bahaya, hasil MERAH, offline, dan kegagalan server.
2. Samakan kontrak fallback dan online untuk eskalasi, sumber, serta status verifikasi; jangan menandai terverifikasi hanya karena ada sumber retrieval atau flag manual yang belum ditinjau.
3. Ganti pencocokan kata generik dengan aturan intents yang lebih spesifik dan urutkan tanda bahaya sebelum topik umum. Sediakan fallback aman saat maksud tidak jelas.
4. Tambahkan evaluasi percakapan tetap terhadap masukan/pedoman pakar yang sudah disetujui. Uji pasangan pertanyaan yang mirip tetapi konteks berbeda, termasuk “golongan darah”, keluhan bayi, dosis obat, kehamilan, nifas, dan tanda bahaya.
5. Terapkan batasan klinis dan rekomendasi yang telah diputuskan pakar secara identik di LLM dan fallback; jangan biarkan variasi model mengubah arahan tersebut.

## 5. Jadwal ANC, edit tanggal, dan tanda HPL

### Yang ditemukan

- Generator lama memakai enam offset tetap UK 10, 12, 20, 28, 32, dan 36 minggu, hanya dibuat ketika tidak ada jadwal lokal. Kalender tidak menerima tanggal HPL dan belum memiliki aksi ubah tanggal.
- Pengirim Web Push sudah membaca tanggal kunjungan ANC dari Supabase dan mengirim pengingat H-2/H-1 pukul 09.00. Agar tanggal baru berpengaruh pada push, perubahan tanggal perlu disinkronkan ke `anc_visits`.
- Aturan pakar terbaru menjadi acuan. “1 bulan” diimplementasikan sebagai satu bulan kalender; jadwal dimulai pada UK 1, pindah ke interval dua minggu pada UK 28 dan mingguan pada UK 37, lalu berakhir pada HPL yang ditandai merah.

### Rancangan solusi

Implementasi: generator jadwal berdasarkan HPHT dan aturan pakar, rekonsiliasi jadwal lama yang mempertahankan kunjungan selesai/terlewat, catatan, dan tanggal yang diedit; date picker untuk memindahkan jadwal; marker HPL merah; sinkronisasi metadata/jadwal ke push Supabase melalui migration 011–012. Push yang sudah aktif membaca tanggal ANC terbaru dan tetap memakai H-2/H-1 pukul 09.00.

### Kriteria penerimaan

- Skrip `scripts/check-anc-schedule.mjs` menguji pola mingguan, dua mingguan, bulanan, dan batas HPL.
- QA browser/perangkat untuk mengubah tanggal, mempertahankan jadwal lama, dan menerima push dari tanggal hasil edit masih perlu dilakukan.
- HPL tampil merah, termasuk ketika bertepatan dengan hari ini atau jadwal ANC.

## 6. Menghapus Tonggak Perjalanan

### Yang ditemukan

“Tonggak perjalanan” adalah satu bagian presentasi di `PengingatPage.tsx`: array `MILESTONES`, kalkulasi milestone yang sedang tampil, dan satu kartu render sekitar baris 22, 183–187, dan 274–295. Kode itu tidak menjadi sumber perhitungan UK/HPL, jadwal ANC, atau persentase profil; penghapusan dapat dibatasi pada blok UI serta state turunan yang hanya dipakai di sana.

### Implementasi

Bagian UI “Tonggak perjalanan”, daftar milestone, dan kalkulasi yang hanya dipakai bagian itu sudah dihapus. Ringkasan UK/HPL, progress, berat badan, dan jadwal ANC tetap ada.

## 7. Peta hasil darurat harus mencari fasilitas terdekat

### Yang ditemukan

- Tombol peta ditampilkan untuk semua hasil `MERAH` (`SkriningResultScreen.tsx`, sekitar baris 138–149).
- Pemanggil hanya memakai query “Puskesmas atau Praktik Mandiri Bidan (PMB) terdekat” jika `activeResult.tipeKey === "danger"`. Untuk tipe hasil MERAH lain, ia meneruskan `fasyankes` profil (`SkriningPage.tsx`, baris 287). Karena itu hasil MERAH Preeklamsia, Gizi, atau Faktor Risiko dapat membuka Maps dengan nama fasilitas awal, sesuai laporan.
- Dialog darurat chatbot sudah memakai query Puskesmas/PMB terdekat (`ChatbotPage.tsx`, baris 96 dan 191), sehingga sumber masalahnya spesifik pada `mapsQuery` hasil Skrining.

### Rancangan solusi

Gunakan query fasilitas terdekat untuk seluruh tombol **Buka Peta** pada hasil MERAH, tanpa bergantung pada tipe skrining atau data fasyankes profil. Pertahankan nama fasyankes sebagai kontak/tujuan rencana persalinan, bukan query default pencarian darurat. Uji setiap jenis hasil MERAH dan periksa parameter `query` pada URL Maps.

## 8. Konfirmasi sebelum kembali ke mode hamil

### Yang ditemukan

- Tombol “Kembali ke mode hamil” memanggil callback secara langsung (`ProfileCard.tsx`, sekitar baris 51).
- Callback segera memanggil `setIsPostpartum(false)` dan menghapus `siaga_birth_date` dari localStorage (`BerandaPage.tsx`, sekitar baris 164–169). Tidak ada dialog konfirmasi.
- Tanggal lahir juga dipakai untuk menentukan hari nifas di Beranda. Tindakan ini bukan sekadar perubahan tab; ada perubahan state dan tanggal yang mendasarinya.

### Rancangan solusi

Tampilkan dialog konfirmasi dengan aksi batal sebagai default aman dan tombol lanjut yang eksplisit. Hanya setelah konfirmasi ubah mode. Tentukan bersama pemilik produk apakah tanggal lahir tetap disimpan untuk riwayat/perhitungan, atau memang dihapus; jangan menghapus data tanggal secara diam-diam. Uji batal, konfirmasi, refresh, dan perpindahan akun.

## Butir 9

Belum ada keterangan masalah pada butir nomor 9. Perlu deskripsi gejala, langkah untuk memunculkannya, halaman yang terlibat, dan hasil yang diharapkan.

## Urutan implementasi yang disarankan

1. **Selesai pada 2026-10-10** — peta darurat untuk hasil MERAH dan konfirmasi kembali dari mode nifas.
2. **Selesai pada 2026-10-10** — nilai contoh berbagai form skrining diganti dengan isian kosong/profil, dan detail terakhir dipulihkan per pengguna serta tipe skrining.
3. **Berikutnya** — reproduksi estimasi dana P4K pada penyimpanan lokal dan cloud; perbaiki status sinkronisasi dan konflik bila gejala terkonfirmasi.
4. **Selesai implementasi pada 2026-10-10** — jadwal ANC pakar, edit tanggal, marker HPL merah, dan sinkronisasi push. QA perangkat/push masih perlu dilakukan.
5. **Berikutnya** — rapikan konsistensi chatbot terhadap pedoman pakar yang telah disetujui.
6. **Selesai pada 2026-10-10** — hapus Tonggak Perjalanan dan perbarui label BB sesuai persyaratan pakar.
7. Minta klarifikasi laporan nomor 9.

## Batas investigasi

P4K telah diperiksa dengan build, uji utilitas, dan snapshot agregat database. Jadwal ANC telah diuji dengan skrip pola tanggal dan migration 011–012 telah diterapkan. Belum dilakukan replay end-to-end pada browser/perangkat untuk konflik P4K atau penerimaan push ANC setelah tanggal diedit.
