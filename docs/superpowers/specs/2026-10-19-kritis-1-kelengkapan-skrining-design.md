# Kritis-1: Kelengkapan Data Skrining

## Tujuan dan batasan

Mencegah kategori risiko baru dari data penentu yang belum diperiksa, tanpa menyembunyikan tanda bahaya yang sudah dilaporkan. Acuan input dan rumus adalah `docs/SiKiBa_Spesifikasi_Storyboard_Prototype.md` bagian S-03a–f, S-04/04a, S-05a/b; ambang klinis dan kategori yang ada **tidak diubah**. Semua keputusan baru tentang syarat cukupnya data adalah keputusan pengamanan produk dari spesifikasi tersebut, **bukan validasi klinis**. Ahli kebidanan tetap harus meninjau sebelum uji dengan data kesehatan nyata.

## Semantik masukan

| Keadaan | Artinya | Perlakuan |
| --- | --- | --- |
| Kosong / `null` / `undefined` / string kosong / `NaN` | Belum diisi atau belum diperiksa | Jangan diperlakukan sebagai `0`, “Tidak”, negatif, atau normal; hasil lengkap ditahan. |
| `false` atau “Tidak” yang dipilih eksplisit | Gejala/riwayat tidak ada menurut jawaban pengguna | Sah sebagai jawaban negatif; berbeda dari tidak pernah ditanya. |
| `0` | Angka nol yang diisi eksplisit | Sah hanya jika rentang dan konteks mengizinkan, mis. skor EPDS 0 atau hari nifas 0; bukan pengganti input kosong. |
| Nilai normal | Angka/temuan terukur yang memenuhi aturan yang telah ada | Klaim normal hanya untuk indikator yang diperiksa. |
| Tidak berlaku | Pertanyaan bergantung kondisi yang tidak terpenuhi | Tidak perlu diisi; simpan keadaan pemicu yang membuktikan tidak berlaku. |

## Matriks kelengkapan untuk hasil lengkap

Rujukan angka setelah ID mengacu pada bagian spesifikasi. Daftar ini menyebut **data yang dipakai kode saat ini untuk menilai risiko**; ketidaksesuaian antara input tambahan di spesifikasi dan implementasi menjadi temuan validasi terpisah, bukan alasan menciptakan ambang pada Kritis-1.

| Skrining | Data minimum sebelum kategori lengkap | Kondisi khusus / tidak berlaku | Referensi |
| --- | --- | --- | --- |
| Faktor risiko | Usia, usia kehamilan, paritas, jarak kehamilan (jawaban “belum” bila belum pernah), riwayat komplikasi, penyakit kronik, PE, gemeli, letak, hidramnion; data TD/BB/TB jika ditanyakan sebagai hasil pemeriksaan tetap dibedakan dari kosong. | Jarak angka tidak berlaku untuk kehamilan pertama. TRB adalah informasi tambahan, tidak masuk skor sekarang. Jangan menyebut riwayat aman jika tidak dijawab. | S-03a, SK01. |
| Gizi | BB sebelum hamil, TB, LILA, BB sekarang, usia kehamilan. | Tidak ada nilai kosong yang berarti normal. | S-03b, SK03. |
| Tanda bahaya | Jawaban Ya/Tidak eksplisit untuk tiap gejala yang ditampilkan dan skala nyeri kepala bila ditanyakan. | TD tinggi hanya diminta jika bengkak dijawab Ya. Gejala bahaya Ya tetap memicu pesan pertolongan segera meski formulir belum lengkap, tetapi **tidak** terbit kategori hasil skrining lengkap. | S-03c, SK04. |
| Preeklamsia | Sistolik, diastolik, usia kehamilan, hasil pemeriksaan protein urine, serta riwayat risiko yang benar-benar ditanyakan. | “Protein urine belum diperiksa” bukan negatif; jangan isi `false` otomatis. IMT/usia/jarak bila tidak diketahui bukan nilai 0 untuk faktor moderat dan tidak boleh menimbulkan klaim “tidak ada faktor risiko NICE”. | S-03d, SK02. |
| DMG | Usia, BB/TB sebelum hamil untuk IMT, usia kehamilan, serta jawaban eksplisit tentang riwayat DMG/makrosomia/DM keluarga, PCOS, etnis; glikosuria harus dapat dinyatakan **belum diperiksa**, bukan otomatis negatif. | Butir riwayat yang tidak berlaku harus ditandai eksplisit; bukan dianggap negatif hanya karena belum disentuh. | S-03e. |
| EPDS | Tepat 10 jawaban berupa bilangan bulat 0–3, termasuk butir ke-10. | Jawaban kosong tidak bernilai 0; jika jawaban butir ke-10 menunjukkan bahaya, tampilkan jalur bantuan segera tanpa menunggu total skor lengkap. | S-03f, SK05. |
| Nifas | Hari nifas, suhu, sistolik/diastolik, dan kondisi yang ditanyakan pada form tentang perdarahan, infeksi, luka, nyeri, ASI, suasana hati. | Tidak ada pemeriksaan luka jika memang tidak ada luka, tetapi ketidakberlakuannya perlu eksplisit. Nilai 0 untuk hari nifas sah, bukan pengganti kosong. | S-04, SK06. |
| Laktasi | Usia bayi, frekuensi/durasi menyusu bila dinilai, kondisi puting/payudara, ASI, tren BB bayi, frekuensi BAK, urin, demam bila ditanyakan. | Tren BB “belum diketahui” tidak boleh dianggap “tidak naik”; untuk hasil lengkap minta data yang dipakai dalam rumus kecukupan. | S-04a. |
| Ikterus | Usia bayi, zona Kramer, waktu mulai kuning, aktivitas, prematuritas, feses dempul jika ditanyakan. | Bila kuning belum diamati, jangan menerka zona. Gejala bahaya yang telah dipilih tetap menampilkan anjuran mencari bantuan. | S-05a. |
| Hipotiroid | Jawaban TSH Ya/Tidak eksplisit, usia bayi untuk jadwal, gejala yang ditanyakan. | Belum TSH adalah jawaban “Tidak” dan **bukan** “belum dijawab”; tes TSH “Ya” tidak membuktikan hasil negatif/normal. Jangan menulis “tanpa gejala” jika gejala belum dijawab. | S-05b. |

## Alur yang disetujui pengguna

- Form kosong/parsial **tidak** menghasilkan kategori Hijau/Kuning/Merah baru, dan tidak menulis hasil skrining ke riwayat/cloud. Nilai yang sudah dipilih tetap di form selama sesi; draf tersimpan hanya jika mekanisme draf aman sudah ada, tanpa menambah penyimpanan baru untuk Kritis-1.
- Bila tanda bahaya positif yang **sudah tergolong MERAH menurut aturan yang ada** dijawab di form yang belum lengkap, tampilkan arahan darurat segera; gejala lain tetap memperoleh petunjuk tindak lanjut sesuai kategori yang sudah ada, bukan otomatis menjadi MERAH. Jangan memalsukan hasil lengkap atau menghambat bantuan hanya demi menuntaskan form. Aksi berbagi pada kondisi parsial harus berbagi pesan tentang gejala yang baru dilaporkan dan status **belum lengkap**, bukan mengekspor riwayat skrining lama. Tanpa koneksi, tampilkan pesan bantuan dan langkah mencari pertolongan tanpa menggantungkan keselamatan pada WhatsApp/peta.
- Validasi minimum harus terjadi **di batas setiap fungsi submit** dan di UI; UI menunjukkan field yang kurang. Input dari pemanggil lain tidak boleh melewati validasi dengan TypeScript cast.
- Hasil lama: **jangan hapus, mutasi, atau hitung ulang kategori lama**. Karena `false` lama bisa berarti default tanpa pernah ditanya, jangan mengklaim kelengkapan hanya dari bentuk detail. Simpan penanda versi validasi **pada detail hasil baru yang telah melewati validasi**; hasil tanpa penanda diberi label **“Perlu pemeriksaan ulang”**, meski tampak lengkap. Khusus MERAH, pertahankan warna/peringatan dan larangan hapus, tambahkan label tersebut tanpa menurunkan urgensi. Ini label tampilan turunan; bukan migrasi atau penggantian kategori lama.
- Hasil baru dengan nilai valid dan lengkap tetap mengikuti perilaku penyimpanan, sinkronisasi, dan kategori yang ada. Tidak ada migrasi tabel/cloud hanya untuk label turunan.

## Yang tidak dikerjakan sekarang

Tidak mengubah ambang klinis, menyelesaikan Kritis-2/3, menambah diagnosis, menulis ulang modul edukasi, atau mengasumsikan semua isian tambahan spesifikasi otomatis wajib untuk algoritma yang belum memakainya. Temuan ketidaksesuaian spesifikasi–kode dicatat untuk peninjauan klinis.
