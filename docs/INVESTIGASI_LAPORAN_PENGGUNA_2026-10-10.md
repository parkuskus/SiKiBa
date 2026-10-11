# Investigasi Laporan Pengguna

**Tanggal:** 10 Oktober 2026  
**Status:** Investigasi selesai; perbaikan P4K, ANC, skrining, peta/mode nifas, dan rekomendasi chatbot sudah diterapkan pada kode/aplikasi sesuai status tiap bagian.  
**Tujuan:** Merangkum temuan yang dapat dibuktikan, bagian yang masih perlu direproduksi atau dikonfirmasi, dan rancangan solusi sebelum implementasi.

**Pembaruan 11 Oktober 2026:** P4K, ANC, dan perbaikan chatbot sudah diimplementasikan; migration RAG 013 serta Edge Function `chat` versi 25 sudah diterapkan. Frontend baru masih perlu dirilis agar history, FAQ cepat, dan sumber RAG tampil di perangkat. Nomor 9 dikonfirmasi tidak ada.

**Dasar keputusan klinis:** Masukan pada daftar ini berasal dari pakar dan sudah diverifikasi. Frekuensi ANC dan makna BB sebelum hamil diperlakukan sebagai persyaratan yang disetujui; investigasi ini tidak meminta validasi klinis ulang.

## Ringkasan

| No. | Laporan                                                          | Temuan investigasi                                                                                                                                                                                                                                                                    | Prioritas                                |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | Estimasi dana P4K tidak tersimpan                                | Akar risiko ditemukan pada status sync yang tidak terlihat dan field dana yang masih dapat diedit saat konflik. Perbaikannya sudah diterapkan; snapshot cloud sebelumnya menunjukkan satu row tanpa estimasi. QA akun pelapor masih perlu dilakukan. | Selesai implementasi, QA menunggu |
| 2   | BB faktor risiko perlu berlabel “BB sebelum hamil”               | Selesai: label, key data baru, dan validasi memakai BB sebelum hamil; detail lama dengan key `bbKg` tetap dipulihkan. Algoritma skor Poedji tidak berubah.                                                                                                                               | Selesai                                   |
| 3   | Berbagai form skrining menampilkan data dummy, bukan isian terakhir | Nilai awal contoh ditemukan di beberapa skrining hamil, nifas, dan bayi. Form menginisialisasi ulang nilai itu ketika dibuka dan tidak memuat detail skrining terakhir. Hasil langsung setelah submit tetap perlu direproduksi untuk memastikan apakah masalahnya juga terjadi pada tahap itu. | Tinggi |
| 4   | Jawaban chatbot perlu lebih konsisten, cepat, dan relevan        | Perbaikan sudah diterapkan pada routing cepat, konteks percakapan, latency, dan retrieval hybrid. Edge Function versi 24 aktif; evaluasi jawaban/TTFR di perangkat masih perlu QA. | QA lanjutan |
| 5   | Jadwal ANC tidak sesuai; ingin ubah tanggal dan tandai HPL merah | Jadwal pakar, edit tanggal, HPL merah, dan sync push telah diimplementasikan; QA penerimaan push/tanggal edit pada perangkat masih menunggu.                                                                                                                                             | Implementasi selesai, QA menunggu        |
| 6   | Bagian Tonggak Perjalanan tidak diperlukan                       | Blok UI dan kalkulasi milestone khusus sudah dihapus; ringkasan UK/HPL tetap ada.                                                                                                                                                                                                       | Selesai                                  |
| 7   | Peta darurat membuka fasyankes yang tersimpan di profil          | Semua tombol peta hasil MERAH sekarang memakai query Puskesmas/PMB terdekat, tidak lagi memakai fasyankes profil.                                                                                                                                                                       | Selesai                                  |
| 8   | Perlu konfirmasi sebelum kembali dari mode nifas                 | Perubahan mode kini meminta konfirmasi; tanggal kelahiran tetap tersimpan.                                                                                                                                                                                                             | Selesai                                  |
| 9   | Tidak ada laporan tambahan                                      | Pengguna mengonfirmasi bahwa butir ini kosong; tidak ada tindakan lanjutan.                                                                                                                                                                                                           | — |

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

### Yang ditemukan sebelum perbaikan

- Ada dua mesin jawaban. Online memanggil Supabase Edge Function/LLM dengan prompt, data skrining, profil terbatas, dan retrieval guideline; offline atau kegagalan online menggunakan FAQ lokal (`app/src/services/chatService.ts`, `supabase/functions/chat/index.ts`).
- FAQ offline memakai pencocokan substring berdasarkan kata kunci dan urutan array. Kata generik seperti “bayi”, “darah”, “sakit”, atau “menyusu” dapat memicu jawaban yang tidak sesuai konteks; hasil pertama yang cocok langsung dipakai.
- Beberapa FAQ ditandai terverifikasi dengan flag statis. Jalur online menandai jawaban terverifikasi hanya karena retrieval mengembalikan sumber, tanpa relevance gate.
- Kebijakan eskalasi berbeda antara server yang memeriksa pesan/hasil MERAH dan fallback lokal yang memeriksa teks jawaban.
- Prompt mengatur gaya/cakupan, tetapi LLM tetap dapat menghasilkan variasi atau jawaban rancu. Filter sekarang menolak sebagian proses internal/metadata, bukan menguji kesesuaian jawaban dengan pedoman pakar yang sudah disetujui.
- Edge Function dahulu tidak menerima riwayat percakapan; pertanyaan lanjutan seperti “yang tadi?” kehilangan konteks.
- Alur lama menjalankan embedding setelah query konteks, lalu retrieval dan completion secara berurutan. `functions.invoke` tetap menunggu jawaban JSON penuh; belum ada streaming token.
- Retrieval awal mengambil top-5 cosine vector saja, tanpa relevance gate atau pencarian lexical. `sources` mengikuti top-5 meski konteks dipotong 4.000 karakter.
- Snapshot RAG Supabase yang diperiksa berisi **456 chunk, satu label sumber, dan halaman 1–113**. PDF `assets/Guideline Chatbot_SIAGA.pdf` memiliki 113 halaman dengan teks terdeteksi di seluruh halaman. Jadi, sumber satu dokumen ini sudah mencakup kehamilan, nifas/laktasi, dan bayi baru lahir; kualitas match belum tentu membaik hanya dengan menambah banyak dokumen.
- Uji vector-only awal memakai model embedding yang sama dengan Edge Function. Pertanyaan tentang perdarahan aktif pada ibu hamil menghasilkan top-5 halaman `67, 58, 10, 26, 72` dengan similarity sekitar `0,598–0,614`; bagian khusus perdarahan hamil halaman 4 terlewat. Setelah hybrid retrieval diterapkan, smoke test memasukkan halaman 4 ke top-5 dan mengembalikan halaman sasaran untuk tiga query contoh.
- `scripts/ingest-guideline.py` hanya membaca satu path PDF tetap dan memberi chunk berdasarkan panjang karakter 700 dengan overlap 100. Pemotongan karakter dapat membelah judul, langkah, atau tabel; metadata hanya label sumber dan nomor halaman.
- FAQ offline dan online sebelumnya tidak memiliki routing intent dan kontrak jawaban bersama.

### Saran perbaikan

#### Konsistensi dan relevansi

1. Tetapkan kontrak respons bersama untuk online dan offline: intent, jawaban, sumber, status verifikasi, dan eskalasi. FAQ harus memakai intent yang spesifik, bukan substring umum seperti “bayi”, “darah”, atau “sakit”.
2. Kirim beberapa pesan terakhir secara terbatas sebagai konteks percakapan. Jangan mengirim seluruh chat tanpa batas; data kesehatan dan konteks profil tetap dibatasi ke kebutuhan pertanyaan.
3. Gunakan hasil skrining/profil hanya ketika relevan. Untuk pertanyaan umum, jangan otomatis menambahkan skrining lama ke prompt.
4. Terapkan ambang similarity. Jika hasil retrieval lemah, jangan menempelkan sumber yang tidak relevan atau memberi label terverifikasi; jawab dengan informasi umum aman/fallback yang konsisten.
5. Bentuk set uji percakapan dengan pertanyaan pakar dan variasi parafrasa. Nilai relevansi jawaban, ketepatan sumber, konsistensi antar-mode, serta respons eskalasi.

#### TTFR lebih cepat

1. Ukur waktu tiap tahap dengan durasi: baca konteks, embedding, retrieval, request LLM, dan first token/first response. Tanpa data ini, optimasi provider atau model hanya tebakan.
2. Jalankan embedding query bersamaan dengan pembacaan konteks pengguna; keduanya tidak saling bergantung. Retrieval tetap menunggu embedding, lalu completion menunggu retrieval.
3. Untuk salam, pertanyaan penggunaan aplikasi, dan intent darurat yang jelas, gunakan respons deterministik cepat tanpa menunggu embedding/RAG/LLM.
4. Uji model/provider yang lebih cepat dan kurangi `max_tokens` sesuai batas jawaban produk. `temperature` saat ini sudah rendah, yaitu `0.2`.
5. Jika latency tetap tinggi, tambahkan streaming dari Edge Function sampai UI. Ini memerlukan jalur fetch/stream di client; `supabase.functions.invoke` sekarang menunggu payload JSON utuh.

#### Apakah perlu digest dokumen lain?

**Belum perlu menambah dokumen secara massal.** Korpus saat ini sudah memuat satu panduan 113 halaman dengan 456 chunk dan mencakup tiga kelompok utama. Uji awal justru memperlihatkan contoh pertanyaan yang tidak mengambil halaman relevan yang sudah ada. Langkah pertama adalah membangun set evaluasi dengan halaman jawaban yang diharapkan, memperbaiki pemotongan chunk dan ranking, serta menambah metadata/topik atau hybrid vector + lexical search. Jangan menetapkan batas similarity sebelum diuji pada set tersebut karena query yang salah peringkat di atas masih memiliki similarity sekitar 0,6. Tambahkan dokumen baru hanya untuk menutup gap cakupan yang terbukti, misalnya pedoman resmi/pakar tentang topik yang tidak ditemukan atau kurang detail di PDF sekarang. Pilih versi yang disetujui dan masih berlaku, catat sumber/halaman/tahun, dan jangan mengindeks storyboard, draft, atau sumber yang saling bertentangan sebagai panduan klinis.

Jika korpus diperluas, ubah ingest agar menerima beberapa PDF dengan label dan halaman masing-masing. Jangan memakai satu label tetap lalu menghapus semua chunk label tersebut, karena ingest ulang satu dokumen dapat mengganti sumber lain. Pertahankan dimensi embedding 1536 yang cocok dengan `vector(1536)` dan evaluasi ulang top-k setelah perubahan.

### Implementasi rekomendasi

- Kebijakan tanda bahaya dan eskalasi kini dibagi di `supabase/functions/_shared/chatPolicy.ts`, dipakai oleh Edge Function dan client. Salam, identitas Kira, tanda bahaya, dan FAQ yang cocok memberi jawaban cepat dan konsisten tanpa memanggil LLM. Kata kunci FAQ yang terlalu umum seperti `bayi`, `darah`, dan `sakit` dipersempit.
- Client mengirim hingga enam giliran percakapan sebelumnya, dibatasi 1.000 karakter per giliran. Edge Function memvalidasi role/content sebelum menambahkan riwayat itu ke prompt.
- Embedding pertanyaan kini berjalan bersamaan dengan query konteks akun. Jawaban LLM dibatasi menjadi 480 token; Edge Function mencatat durasi paralel, retrieval, completion, dan total tanpa mencatat teks/PII.
- RAG memakai pencarian hybrid cosine + lexical, mengurutkan kandidat dengan reciprocal-rank fusion, membatasi konteks pada chunk yang lolos relevance gate, dan hanya mengembalikan sumber yang dipakai di konteks. UI menampilkan label/halaman sumber dan badge terverifikasi hanya untuk jawaban dengan retrieval relevan atau FAQ ahli.
- Migration `013_chat_hybrid_retrieval.sql` diterapkan, fungsi `chat` di-deploy ulang ke versi 25, dan indeks IVFFlat dilepas agar korpus kecil saat ini mendapat ranking vector exact bersama indeks lexical GIN.
- Smoke retrieval memakai tiga query pakar dan berhasil menemukan halaman sasaran untuk perdarahan aktif, bayi kuning hari pertama, dan bendungan ASI. Skrip dapat dijalankan dengan `python scripts/check-chat-retrieval.py`; pemeriksaan aturan cepat/eskalasi ada di `scripts/check-chat-policy.mjs`.
- Streaming token belum diterapkan. Jalur saat ini masih memeriksa seluruh output LLM sebelum ditampilkan untuk mencegah proses internal/metadata bocor; metrik durasi yang dicatat akan menentukan apakah streaming aman dan masih diperlukan.

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

## Urutan implementasi yang disarankan

1. **Selesai pada 2026-10-10** — peta darurat untuk hasil MERAH dan konfirmasi kembali dari mode nifas.
2. **Selesai pada 2026-10-10** — nilai contoh berbagai form skrining diganti dengan isian kosong/profil, dan detail terakhir dipulihkan per pengguna serta tipe skrining.
3. **Selesai implementasi pada 2026-10-10** — status simpan lokal/cloud, antre durable, retry, dan resolusi konflik P4K. QA browser pada akun pelapor masih menunggu.
4. **Selesai implementasi pada 2026-10-10** — jadwal ANC pakar, edit tanggal, marker HPL merah, dan sinkronisasi push. QA perangkat/push masih perlu dilakukan.
5. **Selesai implementasi pada 2026-10-11** — jawaban cepat/FAQ konsisten, konteks multi-giliran, retrieval hybrid, sumber yang ditampilkan, dan metrik TTFR. QA percakapan langsung serta evaluasi latency end-to-end masih perlu dilanjutkan.
6. **Selesai pada 2026-10-10** — hapus Tonggak Perjalanan dan perbarui label BB sesuai persyaratan pakar.

## Batas investigasi

P4K telah diperiksa dengan build, uji utilitas, dan snapshot agregat database. Jadwal ANC diuji dengan skrip pola tanggal; migration 011–012 diterapkan. RAG diuji dengan tiga query sumber dan migration 013 diterapkan. Belum dilakukan QA end-to-end pada perangkat untuk konflik P4K, push ANC setelah tanggal diedit, variasi jawaban LLM, dan TTFR nyata pengguna.
