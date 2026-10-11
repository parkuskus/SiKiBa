# Investigasi Laporan Pengguna

**Tanggal:** 10 Oktober 2026  
**Status:** Investigasi selesai; perubahan untuk isian skrining terakhir sudah diterapkan di aplikasi.  
**Tujuan:** Merangkum temuan yang dapat dibuktikan, bagian yang masih perlu direproduksi atau dikonfirmasi, dan rancangan solusi sebelum implementasi.

**Dasar keputusan klinis:** Masukan pada daftar ini berasal dari pakar dan sudah diverifikasi. Frekuensi ANC dan makna BB sebelum hamil diperlakukan sebagai persyaratan yang disetujui; investigasi ini tidak meminta validasi klinis ulang.

## Ringkasan

| No. | Laporan                                                          | Temuan investigasi                                                                                                                                                                                                                                                                    | Prioritas                                |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | Estimasi dana P4K tidak tersimpan                                | Field sudah masuk model lokal dan payload cloud. Risiko yang ditemukan ada pada autosave berbasis jeda dan sinkronisasi cloud yang tidak ditunggu/ditampilkan; belum ada bukti bahwa field dana sendiri sengaja dikecualikan. Perlu reproduksi untuk membedakan data lokal dan cloud. | Tinggi                                   |
| 2   | BB faktor risiko perlu berlabel “BB sebelum hamil”               | Label saat ini hanya “Berat (kg)” pada bagian Pemeriksaan Fisik. Nilai disimpan sebagai `bbKg`, tidak dipakai dalam skor Poedji. Persyaratan pakar menetapkan bahwa nilai tersebut adalah BB sebelum hamil.                                                                           | Sedang                                   |
| 3   | Berbagai form skrining menampilkan data dummy, bukan isian terakhir | Nilai awal contoh ditemukan di beberapa skrining hamil, nifas, dan bayi. Form menginisialisasi ulang nilai itu ketika dibuka dan tidak memuat detail skrining terakhir. Hasil langsung setelah submit tetap perlu direproduksi untuk memastikan apakah masalahnya juga terjadi pada tahap itu. | Tinggi |
| 4   | Jawaban chatbot tidak konsisten/rancu                            | Ada jalur LLM online dan FAQ berbasis pencocokan kata offline; aturan, cakupan, penandaan verifikasi, dan deteksi eskalasinya tidak sepenuhnya sama.                                                                                                                                  | Tinggi, karena konteks kesehatan         |
| 5   | Jadwal ANC tidak sesuai; ingin ubah tanggal dan tandai HPL merah | Generator saat ini memakai enam minggu tetap `[10, 12, 20, 28, 32, 36]`; kalender hanya bisa menandai selesai dan mengubah catatan. HPL belum diberikan ke kalender sebagai penanda.                                                                                                  | Tinggi, aturan jadwal perlu dikonfirmasi |
| 6   | Bagian Tonggak Perjalanan tidak diperlukan                       | Bagian tersebut adalah blok UI mandiri di halaman Pengingat; tidak menjadi sumber jadwal ANC atau HPL.                                                                                                                                                                                | Rendah                                   |
| 7   | Peta darurat membuka fasyankes yang tersimpan di profil          | Tombol peta tampil untuk semua hasil MERAH, tetapi hanya `tipeKey === "danger"` yang memakai query fasilitas terdekat. Hasil MERAH lain menerima nama fasyankes dari profil.                                                                                                          | Tinggi                                   |
| 8   | Perlu konfirmasi sebelum kembali dari mode nifas                 | Tombol langsung mengganti mode ke hamil dan menghapus tanggal lahir yang dipakai untuk menghitung hari nifas; belum ada dialog konfirmasi.                                                                                                                                            | Sedang                                   |
| 9   | Belum ada deskripsi masalah                                      | Tidak ada perilaku atau konteks yang dapat diinvestigasi dari butir ini.                                                                                                                                                                                                              | Perlu keterangan                         |

## 1. Estimasi dana persalinan P4K tidak tersimpan

### Yang ditemukan

- Input `estimasiDana` memperbarui draft dan menandai draft berubah. Autosave dijadwalkan setelah 450 ms tanpa perubahan (`app/src/features/beranda/BirthPlanScreen.tsx`, sekitar baris 92–129 dan 280–288).
- Simpan lokal menulis seluruh objek `BirthPlan` ke Dexie. Migration Supabase 009 memiliki kolom `estimasi_dana numeric` yang menerima `NULL` atau nilai nonnegatif (`birthPlanService.ts`, sekitar baris 99–103; `supabase/migrations/009_birth_plans.sql`).
- Sinkronisasi cloud memasukkan `estimasi_dana`, tetapi dipanggil fire-and-forget. UI menyatakan “Tersimpan di perangkat”; status keberhasilan sinkronisasi cloud tidak ditampilkan (`app/src/data/sync.ts`, sekitar baris 172–189).
- Saat membuka ulang, data cloud dikonversi dengan syarat `typeof estimasi_dana === "number"`. Jika format nilai dari backend bukan number, nilai tampil kosong. Perilaku aktual perlu diperiksa dari hasil query produksi sebelum menetapkan ini sebagai akar masalah.
- Konflik versi lokal dan cloud meminta pengguna memilih satu versi penuh. Memilih versi cloud yang tidak memiliki estimasi dana dapat menggantikan nilai lokal yang lebih baru.

### Kesimpulan sementara

Belum ditemukan kesalahan yang secara khusus membuang `estimasiDana` pada penulisan lokal. Yang dapat dipastikan adalah indikator “tersimpan” berarti tersimpan di perangkat, bukan bukti bahwa cloud telah menerima nilai. Jika pengguna menutup PWA atau memeriksa perangkat lain, keterlambatan/gagal sinkronisasi, konflik versi, atau autosave 450 ms perlu dibedakan. Gejala belum direproduksi dengan akun dan langkah pengguna.

### Rancangan solusi

1. Reproduksi dengan angka bukan nol, misalnya `650000`, lalu tutup melalui tombol simpan, buka lagi, refresh, dan periksa dari perangkat kedua.
2. Catat nilai di empat titik: event input, objek draft, record Dexie, dan record Supabase. Uji juga nilai `0`, mengosongkan field, offline, dan buka konflik lokal/cloud.
3. Pertahankan penyimpanan lokal sebagai respons cepat. Tampilkan status terpisah untuk tersimpan lokal, menunggu sinkronisasi, dan tersinkron ke cloud; jangan menyebut tersimpan cloud jika request/antrean gagal.
4. Parse nilai numerik cloud secara eksplisit dan validasi `Number.isFinite`, sambil mempertahankan perbedaan antara kosong (`null`) dan nol (`0`).
5. Pastikan edit terakhir selalu di-flush saat tombol simpan/tutup ditekan; cegah autosave lama menandai draft yang lebih baru sebagai bersih.
6. Saat konflik, tampilkan perbandingan estimasi dana secara jelas dan jangan mengganti nilai diam-diam.

### Kriteria penerimaan

- Jumlah yang disimpan tetap sama sesudah tutup/buka, refresh, dan pemulihan setelah offline.
- `0`, nilai positif, dan field kosong tetap memiliki makna yang berbeda.
- Status lokal dan cloud akurat; kegagalan sinkronisasi terlihat dan dapat dicoba lagi.

## 2. Label BB di Skrining Faktor Risiko

### Yang ditemukan

- Pada `RiskFactorScreen.tsx`, field berada pada bagian “Pemeriksaan Fisik” dan diberi label “Berat (kg)” (`app/src/features/skrining/ibu-hamil/RiskFactorScreen.tsx`, sekitar baris 261–279).
- Nilai dikirim sebagai `bbKg` dan disimpan di `detail` oleh `riskFactorForm.ts`; pemanggilan `scorePoedji` tidak menggunakan `bbKg` untuk skor utama (`app/src/features/skrining/ibu-hamil/riskFactorForm.ts`, sekitar baris 20–25, 46–57, 87–96).
- Storyboard S-03a menyebut tinggi dan berat tanpa menjelaskan apakah BB yang dimaksud sebelum hamil atau saat ini. S-03b secara terpisah membedakan BB sebelum hamil dan BB saat ini (`docs/SiKiBa_Spesifikasi_Storyboard_Prototype.md`, S-03a dan S-03b).
- `docs/COPY.md` juga memakai istilah “BB sebelum hamil”. Masukan pakar menetapkan istilah tersebut untuk field S-03a.

### Kesimpulan sementara

Label sekarang memang kurang spesifik dan tidak sesuai dengan makna field yang sudah ditetapkan pakar. Nilai field tersebut adalah BB sebelum hamil, bukan berat saat pemeriksaan.

### Rancangan solusi

- Ganti label menjadi “BB sebelum hamil (kg)” dan selaraskan nama/arti field pada detail hasil, riwayat, serta pesan validasi.
- Jangan mengubah skor Poedji berdasarkan nilai BB; masukan pakar yang dicatat di sini meminta keterangan BB sebelum hamil, bukan perubahan algoritma skor.

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

- `generateANCJadwal` selalu membuat enam tanggal pada UK 10, 12, 20, 28, 32, dan 36 minggu dari HPHT (`app/src/features/tracker/ancForm.ts`, baris 5–14). Ini tidak sama dengan aturan pakar yang telah diverifikasi: UK 1–27 tiap 1 bulan, UK 28–36 tiap 2 minggu, dan UK mulai 37 tiap 1 minggu.
- `initANC` hanya dipanggil jika belum ada kunjungan lokal. Perubahan HPHT atau algoritma tidak otomatis membangun ulang jadwal yang sudah ada (`PengingatPage.tsx`, sekitar baris 107–112). Migrasi/perhitungan ulang jadwal lama perlu dirancang agar tanggal yang telah diselesaikan tidak hilang.
- Kalender ANC dapat menandai kunjungan selesai dan mengubah catatan. Tidak ada date picker atau aksi untuk memindahkan tanggal; tanggal menjadi key `visitMap` (`ANCCalendar.tsx`, sekitar baris 31–41 dan 93–120).
- Kalender menerima daftar kunjungan saja. HPL tidak dipasok sebagai tanggal kalender, dan tidak memiliki style merah. Hari ini memiliki prioritas style lebih tinggi daripada jadwal ANC (`ANCCalendar.tsx`, sekitar baris 61–82). HPL dapat dihitung dari `calcHPL` di `ukHpl.ts` tetapi belum digunakan sebagai marker ANC.
- Catatan storyboard lama menyebut minimal 6 kunjungan dan jadwal 2x T1/1x T2/3x T3 serta push H-3/H-1, sedangkan implementasi push saat ini mengirim H-2/H-1. Aturan pakar yang lebih baru menjadi acuan implementasi jadwal. “1 bulan” diterapkan sebagai penambahan satu bulan kalender dari tanggal kunjungan sebelumnya agar tidak bergeser menjadi interval empat minggu.

### Rancangan solusi

1. Implementasikan aturan pakar persis: UK 1–27 tiap satu bulan kalender, UK 28–36 tiap dua minggu, dan UK ≥37 tiap satu minggu.
2. Bentuk generator dari HPHT/UK dan tetapkan titik awal yang konsisten. Jadwal dimulai dari kunjungan berikutnya berdasarkan UK saat ini, bukan membuat kunjungan lampau. Pertahankan batas fase yang ditentukan pakar.
3. Sediakan aksi “Ubah tanggal” pada kunjungan yang belum/sudah diselesaikan sesuai keputusan produk. Simpan perubahan lokal dan sinkronkan cloud, jaga status selesai/catatan, dan hindari duplikasi tanggal.
4. Tandai tanggal HPL dengan warna merah dan legenda tersendiri. Jika HPL bertumpuk dengan jadwal ANC atau hari ini, tampilkan penanda gabungan tanpa kehilangan status kunjungan.
5. Selaraskan pengingat Web Push dengan tanggal kunjungan hasil generator. Pertahankan lead time push yang telah diputuskan produk; catatan storyboard lama H-3/H-1 dan implementasi H-2/H-1 berbeda, sehingga konfigurasi aktual perlu dicatat sebagai keputusan produk.
6. Rancang pembaruan jadwal yang sudah ada: pertahankan kunjungan historis/selesai dan tanggal yang diedit pengguna; jangan menghapusnya ketika HPHT atau generator berubah.

### Kriteria penerimaan

- Kasus batas UK 1, 27, 28, 36, 37, dan HPL menghasilkan frekuensi sesuai tabel yang disetujui.
- Tanggal dapat diedit, tetap ada sesudah refresh/sinkronisasi, dan push memakai tanggal baru.
- HPL selalu merah, termasuk jika bertepatan dengan jadwal ANC atau hari ini.

## 6. Menghapus Tonggak Perjalanan

### Yang ditemukan

“Tonggak perjalanan” adalah satu bagian presentasi di `PengingatPage.tsx`: array `MILESTONES`, kalkulasi milestone yang sedang tampil, dan satu kartu render sekitar baris 22, 183–187, dan 274–295. Kode itu tidak menjadi sumber perhitungan UK/HPL, jadwal ANC, atau persentase profil; penghapusan dapat dibatasi pada blok UI serta state turunan yang hanya dipakai di sana.

### Rancangan solusi

Hapus bagian “Tonggak perjalanan” dan kalkulasi/konstanta yang khusus dipakai olehnya. Pertahankan ringkasan UK/HPL yang memang dipakai di bagian lain Pengingat dan Beranda. Periksa jarak antarbagian setelah blok dihapus.

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
4. **Berikutnya** — implementasikan jadwal ANC pakar, edit tanggal, marker HPL merah, dan sinkronisasi push.
5. **Berikutnya** — rapikan konsistensi chatbot terhadap pedoman pakar yang telah disetujui.
6. **Berikutnya** — hapus Tonggak Perjalanan dan perbarui label BB sesuai persyaratan pakar.
7. Minta klarifikasi laporan nomor 9.

## Batas investigasi

Investigasi awal menelusuri kode dan dokumen lokal. Peta darurat, konfirmasi mode nifas, dan pemuatan isian skrining terakhir telah diimplementasikan; build dan pemeriksaan pemilihan draft per pengguna/tipe lulus. Belum dilakukan replay end-to-end pada perangkat dengan data pengguna yang mengalami laporan. Perilaku hasil langsung setelah submit dan masalah lain yang belum diimplementasikan tetap memerlukan QA terarah; keputusan klinis dari pakar tidak dibuka ulang.
