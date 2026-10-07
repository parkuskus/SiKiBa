# Ekstraksi Edukasi Prototype SiKiBa

Dokumen ini menjadi acuan penyusunan konten Edukasi SIAGA Bunda berdasarkan prototype SiKiBa dan spesifikasi storyboard. Urutan delapan layar mengikuti arahan pengguna serta kode S-06a sampai S-06h.

- Situs sumber: <https://sikibaskr.lovable.app/edukasi>.
- Tanggal ekstraksi: 7 Oktober 2026.
- Acuan kebutuhan: [SiKiBa_Spesifikasi_Storyboard_Prototype.md](SiKiBa_Spesifikasi_Storyboard_Prototype.md), Bagian V dan IX.
- Acuan materi pendamping: [KONTEN_EDUKASI.md](KONTEN_EDUKASI.md), hasil konversi `Materi SiKiBa.pdf`.
- Metode: halaman meminta sesi masuk; isi edukasi diekstrak dari data dan komponen JavaScript publik yang dimuat oleh situs, termasuk konten tab, bagian yang dapat dibuka, dan pemilih minggu. Interaksi setelah masuk tidak diuji.

Enam topik pertama menggunakan layar khusus. Keluhan Umum dan Birth Plan menggunakan template artikel. Ringkasan artikel dalam data utama tidak seluruhnya ditampilkan pada enam layar khusus tersebut. Transkripsi di bawah mengikuti konten layar aktif; ringkasan menu dan nama referensi diambil dari metadata masing-masing topik.

Teks pada bagian **isi sumber** dipertahankan, termasuk angka, dosis, istilah, dan gaya bahasa prototype. Catatan pemetaan merupakan hasil pembacaan spesifikasi. Label verifikasi dan nama bidan yang tertulis di prototype dicatat sebagai teks sumber, bukan bukti bahwa isi telah divalidasi untuk SIAGA Bunda.

## Peta klasifikasi dan urutan layar

| Urutan | Screen ID | Layar | Klasifikasi konten | Cakupan yang ditemukan di prototype |
| ---: | --- | --- | --- | --- |
| 1 | S-06a | Terjadinya Kehamilan (Fertilisasi) | Dasar terjadinya kehamilan | Lima tahap pembuahan, empat tanda awal, tips bidan, dan berbagi ke pasangan |
| 2 | S-06b | Perkembangan Janin per Minggu | Perkembangan berdasarkan usia kehamilan | 20 entri minggu genap dari 2 sampai 40; ukuran, berat, perkembangan, kondisi ibu, normal, tanda perlu diperiksa, dan tips |
| 3 | S-06c | Perkembangan plasenta, tali pusat, ketuban | Struktur pendukung kehamilan | Tiga tab; fungsi ketuban, pembuluh dan insersi tali pusat, permukaan dan fungsi plasenta |
| 4 | S-06d | Perubahan Fisiologi Kehamilan | Adaptasi tubuh ibu berdasarkan sistem organ | Sebelas sistem dalam tiga kelompok; pencarian gejala, penjelasan, label inti, dan sebagian tips |
| 5 | S-06e | Tanda Bahaya Kehamilan | Pengenalan gejala dan tindakan mencari pertolongan | 15 tanda dalam tiga kelompok; penjelasan tambahan dan video gerakan janin; tombol bantuan 119 |
| 6 | S-06f | Perubahan Psikologi Trimester 1–3 | Adaptasi emosi dan dukungan keluarga | Tiga trimester; perasaan, penyebab, dukungan pasangan, dan berbagi catatan emosi |
| 7 | S-06g | Keluhan Umum Kehamilan dan Cara Mengatasinya | Keluhan, penanganan mandiri, dan batas kewaspadaan | Enam keluhan, poin penting, tips, serta fakta dan mitos; belum ada penilaian keluhan interaktif |
| 8 | S-06h | Birth Plan dan Persiapan Persalinan (P4K) | Perencanaan persalinan dan pencegahan komplikasi | Tujuh komponen P4K, tujuh isi tas, tiga tanda persalinan, dan tips; belum berupa form rencana tersimpan |

Klasifikasi ini berada di dalam satu modul Edukasi S-06. Fisiologi dan keluhan umum saling berkaitan, tetapi fokusnya berbeda: fisiologi menjelaskan perubahan sistem tubuh, sedangkan keluhan menjelaskan pengalaman ibu, cara mengatasi, dan kapan perlu diperiksa. Edukasi tanda bahaya S-06e dihubungkan dengan skrining S-03c; edukasi psikologi S-06f dihubungkan dengan skrining mental S-03f.

## 1. Terjadinya Kehamilan (Fertilisasi) — S-06a

**URL sumber:** <https://sikibaskr.lovable.app/edukasi/fertilisasi>.

**Deskripsi menu:** Bagaimana sel telur dan sperma bertemu hingga terbentuk janin.

**Judul layar:** Bagaimana Kehamilan Terjadi?

**Struktur layar:** pengantar, lima tahap dengan tombol sebelumnya dan berikutnya, tanda awal yang dapat dipilih, pesan bidan, dan berbagi ke pasangan.

### Isi sumber

#### Pengantar

Pernah penasaran enggak, Bunda? Kok bisa ya dari 1 sel telur dan 1 sperma super, bisa berubah jadi calon si Kecil? Yuk, intip perjalanannya!

#### Perjalanan 5 Langkah — Proses Pembuahan Ajaib

1. **Ovulasi (Pelepasan Sel Telur)**
   - Sekitar hari ke-14 siklus 28 hari, indung telur melepaskan sel telur yang siap dibuahi. Inilah momen awal dari perjalanan ajaib calon si Kecil.
   - Tahukah Bunda? Masa subur utama, sel telur bertahan 12–24 jam.
2. **Perjalanan Sperma**
   - Ratusan juta sperma berenang menuju tuba falopi, tetapi hanya yang terkuat dan tercepat yang bisa mencapai sel telur.
   - Tahukah Bunda? Sperma tangguh bertahan 3–5 hari di dalam tubuh.
3. **Fertilisasi (Pertemuan Ajaib)**
   - Di tuba falopi, satu sperma berhasil menembus sel telur dan membentuk zigot dengan 46 kromosom — 23 dari Bunda, 23 dari Ayah.
   - Tahukah Bunda? Cuma 1 sperma pemenang yang masuk, jenis kelamin ditentukan di sini.
4. **Pembelahan Zigot**
   - Zigot mulai membelah dari 1 sel jadi 2, 4, 8, hingga membentuk morula dan blastokista saat bergerak menuju rahim.
   - Tahukah Bunda? Sel membelah dari 1 jadi 2, 4, 8 hingga blastokista.
5. **Implantasi (Menempel di Rahim)**
   - Blastokista menempel pada dinding rahim dan mulai memproduksi hCG. Hormon inilah yang membuat garis dua muncul di test pack.
   - Tahukah Bunda? Hormon hCG diproduksi, pemicu garis dua di testpack!

#### Tanda Awal Kehamilan

- Telat Menstruasi.
- Morning Sickness.
- Cepat Lelah.
- Flek Implantasi.

#### Pesan bidan

Bunda sayang, segera periksa ke bidan atau dokter setelah test pack positif untuk penetapan usia kehamilan dan memastikan janin berkembang dengan sehat. Jangan lupa mulai rutin konsumsi Asam Folat 400 mcg setiap hari ya!

Teks atribusi pada sumber: **Bidan Siti, S.Tr.Keb**, **Terverifikasi**, **Diverifikasi Bidan**, dan estimasi waktu baca dua menit.

#### Ajakan berbagi

Saling dukung bareng Ayah bikin promil & kehamilan lebih bahagia!

Tombol: **Bagikan Penjelasan Ini ke Ayah**.

### Pemetaan kebutuhan

Sesuai tema S-06a. Spesifikasi meminta artikel dan video embed; konten layar khusus yang ditemukan belum memuat tautan video fertilisasi. Materi PDF menyediakan video pendamping, tercantum pada bagian sumber media di akhir dokumen.

**Nama referensi pada metadata prototype:** Kemenkes RI — Buku KIA 2024; WHO Reproductive Health; FIGO 2020.

## 2. Perkembangan Janin per Minggu — S-06b

**URL sumber:** <https://sikibaskr.lovable.app/edukasi/perkembangan-janin>.

**Deskripsi menu:** Ikuti tumbuh kembang janin dari minggu 4 hingga minggu 40.

**Judul layar:** Perkembangan Si Kecil.

**Struktur layar:** pemilih trimester dan minggu, pembanding buah, panjang, berat, perkembangan janin, yang dirasakan ibu, normal, segera ke dokter, dan tips bidan.

Layar khusus sebenarnya menyediakan minggu **2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, dan 40**. Label kelompoknya adalah Trimester 1 (Mgg 2-12), Trimester 2 (Mgg 14-26), dan Trimester 3 (Mgg 28-40). Minggu awal yang dipilih adalah minggu 8; pemilihan awal belum menggunakan usia kehamilan profil pengguna.

### Isi sumber

#### Minggu 2 — Biji Wijen

- **Trimester:** 1.
- **Panjang:** ~0,1 mm. **Berat:** < 1 g.
- **Perkembangan:**
  - Sel telur matang dan siap dibuahi di masa subur.
  - Rahim Bunda sedang menyiapkan dinding yang tebal & hangat.
  - Jika pembuahan terjadi, zigot mulai terbentuk di tuba falopi.
- **Yang dirasakan Bunda:** Bunda mungkin belum merasakan apa-apa minggu ini. Sebagian Bunda merasakan kram ringan atau keputihan bening saat ovulasi — itu normal ya!
- **Normal:** Kram ringan satu sisi dan lendir serviks bening adalah tanda ovulasi.
- **Segera ke dokter:** Nyeri panggul hebat atau perdarahan di luar siklus perlu diperiksa.
- **Tips bidan:** Catat siklus haid Bunda di aplikasi biar masa subur gampang dilacak. Mulai minum asam folat 400 mcg sejak sekarang ya!

#### Minggu 4 — Biji Chia

- **Trimester:** 1.
- **Panjang:** ~2 mm. **Berat:** < 1 g.
- **Perkembangan:**
  - Embrio menempel kuat di dinding rahim (implantasi).
  - Terbentuk 3 lapisan calon organ: ektoderm, mesoderm, endoderm.
  - Plasenta awal mulai berkembang dan memproduksi hCG.
- **Yang dirasakan Bunda:** Ini minggu di mana Bunda biasanya sadar telat haid! Sebagian mulai merasa payudara lebih sensitif dan badan cepat lelah.
- **Normal:** Flek implantasi (bercak cokelat/pink 1-2 hari) dan kram ringan masih normal.
- **Segera ke dokter:** Perdarahan seperti haid atau lebih banyak, segera periksa ke bidan.
- **Tips bidan:** Sudah test pack positif? Yuk jadwalkan kunjungan ANC pertama sebelum usia kehamilan 12 minggu.

#### Minggu 6 — Kacang Hijau

- **Trimester:** 1.
- **Panjang:** ~5 mm. **Berat:** < 1 g.
- **Perkembangan:**
  - Jantung kecil mulai berdetak — calon kabar bahagia pertama!
  - Tabung saraf (calon otak & tulang belakang) mulai terbentuk.
  - Tunas lengan dan kaki mulai muncul seperti kuncup kecil.
- **Yang dirasakan Bunda:** Morning sickness mungkin mulai menyapa, Bunda. Payudara makin membesar dan Bunda jadi lebih sering buang air kecil.
- **Normal:** Mual, ngidam, dan sensitif bau adalah tanda hormon kehamilan bekerja baik.
- **Segera ke dokter:** Muntah terus sampai tidak bisa makan/minum sama sekali → segera periksa.
- **Tips bidan:** Sediakan biskuit kering di samping tempat tidur dan makan sedikit sebelum bangun untuk meredakan mual pagi.

#### Minggu 8 — Buah Rasberi

- **Trimester:** 1.
- **Panjang:** ~1,6 cm. **Berat:** ~1 g.
- **Perkembangan:**
  - Jari tangan & kaki yang imut mulai terbentuk kecil-kecil.
  - Kelopak mata dan bentuk ujung hidung mulai kelihatan.
  - Detak jantungnya sudah bisa didengar jelas lewat USG.
- **Yang dirasakan Bunda:** Rasa mual (morning sickness) mungkin lagi di puncaknya minggu ini, Bunda! Indra penciuman juga jadi jauh lebih sensitif dari biasanya.
- **Normal:** Flek ringan atau kram perut bawah karena rahim membesar.
- **Segera ke dokter:** Segera ke dokter jika kram terasa makin hebat atau keluar darah segar.
- **Tips bidan:** Mual itu wajar banget ya Bunda. Coba makan dalam porsi kecil tapi sering (5-6x sehari), dan jauhi dulu aroma makanan yang bikin enek. Tetap jaga hidrasi ya!

#### Minggu 10 — Stroberi

- **Trimester:** 1.
- **Panjang:** ~3 cm. **Berat:** ~4 g.
- **Perkembangan:**
  - Semua organ vital sudah terbentuk dan mulai bekerja.
  - Siku dan lutut mulai bisa ditekuk, kuku mungil mulai tumbuh.
  - Ekor embrio menghilang — penampilannya makin mirip bayi!
- **Yang dirasakan Bunda:** Perut bagian bawah mungkin mulai terasa penuh. Mood Bunda bisa naik-turun karena hormon — tarik napas, itu sangat wajar.
- **Normal:** Keputihan bening/tanpa bau meningkat — normal selama tidak gatal.
- **Segera ke dokter:** Nyeri perut satu sisi yang tajam perlu segera diperiksa.
- **Tips bidan:** Kenakan pakaian longgar dan bra yang nyaman. Jangan lupa catat semua keluhan untuk ditanyakan saat kontrol ANC.

#### Minggu 12 — Jeruk Nipis

- **Trimester:** 1.
- **Panjang:** ~5,4 cm. **Berat:** ~14 g.
- **Perkembangan:**
  - Semua organ utama sudah lengkap terbentuk!
  - Janin mulai bergerak lincah, walau Bunda belum merasakannya.
  - Sidik jari mungil mulai terbentuk di ujung jarinya.
- **Yang dirasakan Bunda:** Kabar baik: mual biasanya mulai berkurang di akhir trimester 1! Energi Bunda perlahan kembali dan nafsu makan membaik.
- **Normal:** Muncul garis gelap (linea nigra) di perut adalah perubahan kulit normal.
- **Segera ke dokter:** Perdarahan atau nyeri hebat tetap harus diperiksa di usia berapa pun.
- **Tips bidan:** Waktu yang pas untuk USG trimester 1 dan memastikan usia kehamilan. Bunda sudah kontrol ANC pertama belum?

#### Minggu 14 — Lemon

- **Trimester:** 2.
- **Panjang:** ~8,7 cm. **Berat:** ~43 g.
- **Perkembangan:**
  - Wajahnya makin jelas — alis dan rambut halus mulai tumbuh.
  - Janin sudah bisa menghisap jempolnya sendiri!
  - Ginjal mulai memproduksi urine dan hati mulai bekerja.
- **Yang dirasakan Bunda:** Selamat datang di trimester 2 — fase paling nyaman! Mual mereda, energi kembali, dan perut mungil mulai terlihat.
- **Normal:** Nyeri tumpul di sisi perut (ligamen) saat bergerak — normal karena rahim membesar.
- **Segera ke dokter:** Nyeri tajam terus-menerus atau flek perlu diperiksakan.
- **Tips bidan:** Saatnya mulai tidur menyamping (terutama ke kiri) untuk melancarkan aliran darah ke plasenta.

#### Minggu 16 — Alpukat

- **Trimester:** 2.
- **Panjang:** ~11,6 cm. **Berat:** ~100 g.
- **Perkembangan:**
  - Tulang-tulangnya mulai mengeras dari tulang rawan.
  - Matanya mulai bergerak perlahan di balik kelopak.
  - Telinga mulai berkembang — janin mulai bisa 'mendengar'.
- **Yang dirasakan Bunda:** Sebagian Bunda mulai merasakan 'kupu-kupu' halus di perut — bisa jadi gerakan pertama si Kecil! Nafsu makan biasanya meningkat.
- **Normal:** Hidung tersumbat/gusi berdarah ringan akibat hormon — normal dialami.
- **Segera ke dokter:** Sakit kepala hebat disertai pandangan kabur perlu diperiksa.
- **Tips bidan:** Penuhi zat besi & protein (hati ayam, ikan, telur, sayur hijau) untuk mencegah anemia. Minum tablet tambah darah ya!

#### Minggu 18 — Paprika

- **Trimester:** 2.
- **Panjang:** ~14 cm. **Berat:** ~190 g.
- **Perkembangan:**
  - Janin mulai mendengar detak jantung dan suara Bunda.
  - Ia sibuk menendang, memutar, dan berguling di dalam.
  - Saraf-saraf mulai dilapisi myelin agar sinyal lebih cepat.
- **Yang dirasakan Bunda:** Pusar mungkin mulai menonjol dan perut makin terlihat. Bunda mungkin mulai merasakan pegal di punggung bawah.
- **Normal:** Gatal ringan di kulit perut yang meregang — oleskan pelembap.
- **Segera ke dokter:** Gatal hebat di telapak tangan/kaki perlu konsultasi ke bidan.
- **Tips bidan:** Ajak si Kecil ngobrol atau putar musik lembut — pendengarannya mulai berkembang minggu ini!

#### Minggu 20 — Pisang

- **Trimester:** 2.
- **Panjang:** ~25 cm. **Berat:** ~300 g.
- **Perkembangan:**
  - Gerakan janin (quickening) mulai terasa jelas oleh Bunda.
  - Rambut halus (lanugo) menyelimuti tubuh mungilnya.
  - USG anomali (morfologi) paling pas dilakukan minggu ini.
- **Yang dirasakan Bunda:** Setengah perjalanan! Rahim sudah setinggi pusar. Bunda mungkin mulai merasakan kontraksi palsu (Braxton Hicks) yang ringan.
- **Normal:** Kontraksi palsu: perut mengencang sebentar lalu hilang dengan istirahat.
- **Segera ke dokter:** Kontraksi teratur makin kuat/sering sebelum 37 minggu → segera periksa.
- **Tips bidan:** Jadwalkan USG trimester 2 (minggu 18-22) untuk cek kelengkapan organ dan plasenta si Kecil ya Bunda.

#### Minggu 22 — Pepaya

- **Trimester:** 2.
- **Panjang:** ~27 cm. **Berat:** ~430 g.
- **Perkembangan:**
  - Alis dan bulu mata makin jelas, bibirnya makin tegas.
  - Refleks menggenggamnya mulai aktif — suka pegang tali pusar.
  - Ia bisa kaget mendengar suara keras dari luar perut.
- **Yang dirasakan Bunda:** Perut makin membesar dan Bunda mungkin mulai susah melihat kaki sendiri! Kram kaki di malam hari kadang mulai muncul.
- **Normal:** Kram kaki malam hari — regangkan betis dan cukupi kalsium.
- **Segera ke dokter:** Bengkak mendadak di wajah/tangan disertai pusing → periksa tekanan darah.
- **Tips bidan:** Rutin jalan kaki santai 20-30 menit dan lakukan senam hamil ringan untuk mengurangi pegal.

#### Minggu 24 — Jagung

- **Trimester:** 2.
- **Panjang:** ~30 cm. **Berat:** ~600 g.
- **Perkembangan:**
  - Paru-paru mulai membentuk kantung udara (alveolus).
  - Kulit masih tipis dan keriput, menunggu lemak bertambah.
  - Pola aktif-istirahatnya mulai terasa teratur.
- **Yang dirasakan Bunda:** Perut makin berat, Bunda mungkin mulai merasakan nyeri ulu hati (heartburn) setelah makan. Ini usia kehamilan penting untuk skrining gula darah.
- **Normal:** Heartburn setelah makan besar — makan porsi kecil lebih sering.
- **Segera ke dokter:** Pandangan kabur, nyeri ulu hati hebat, atau sakit kepala → periksa.
- **Tips bidan:** Usia 24-28 minggu adalah waktu skrining diabetes gestasional (TTGO). Coba modul Skrining DMG di aplikasi SiKiBa ya!

#### Minggu 26 — Selada

- **Trimester:** 2.
- **Panjang:** ~35 cm. **Berat:** ~760 g.
- **Perkembangan:**
  - Matanya mulai membuka dan menutup perlahan.
  - Detak jantungnya makin kuat — Ayah bisa dengar lewat perut!
  - Gelombang otaknya makin aktif merespons suara.
- **Yang dirasakan Bunda:** Trimester 2 hampir selesai! Bunda mungkin mulai sering ke kamar mandi lagi dan merasakan sesak ringan saat aktivitas.
- **Normal:** Sesak ringan saat aktif — normal karena rahim menekan diafragma.
- **Segera ke dokter:** Sesak berat disertai nyeri dada atau bibir kebiruan → segera ke IGD.
- **Tips bidan:** Sempatkan foto baby bump minggu ini — kenang-kenangan manis sebelum masuk trimester 3!

#### Minggu 28 — Terong

- **Trimester:** 3.
- **Panjang:** ~37 cm. **Berat:** ~1 kg.
- **Perkembangan:**
  - Mata sudah bisa membuka — janin mulai mengenal terang-gelap.
  - Tendangannya kuat & teratur — mulai hitung gerakan harian.
  - Otak berkembang pesat dan mulai bermimpi (REM sleep).
- **Yang dirasakan Bunda:** Selamat datang trimester 3, Bunda! Punggung makin pegal, tidur mulai kurang nyaman, dan kaki kadang bengkak sore hari.
- **Normal:** Kaki bengkak ringan sore hari yang hilang setelah istirahat — normal.
- **Segera ke dokter:** Gerakan janin < 10x dalam 2 jam atau bengkak mendadak → periksa segera.
- **Tips bidan:** Mulai hitung gerakan janin setiap hari: normalnya minimal 10 gerakan dalam 2 jam. Catat di aplikasi ya!

#### Minggu 30 — Kubis

- **Trimester:** 3.
- **Panjang:** ~40 cm. **Berat:** ~1,3 kg.
- **Perkembangan:**
  - Lemak mulai mengisi tubuhnya — kulit makin halus.
  - Ia punya jadwal tidur-bangun yang makin jelas.
  - Rahim makin penuh — ruang geraknya makin sempit.
- **Yang dirasakan Bunda:** Sesak napas dan heartburn bisa makin terasa karena perut makin besar. Bunda mungkin mulai sering terbangun malam untuk BAK.
- **Normal:** Sering BAK lagi karena kandung kemih tertekan kepala janin.
- **Segera ke dokter:** Nyeri/perih saat BAK disertai demam → curiga infeksi, periksa.
- **Tips bidan:** Kurangi minum menjelang tidur (tapi tetap cukupi 2 liter di siang hari) dan gunakan bantal penyangga saat tidur miring.

#### Minggu 32 — Kelapa

- **Trimester:** 3.
- **Panjang:** ~42 cm. **Berat:** ~1,7 kg.
- **Perkembangan:**
  - Tulang makin kuat, tapi tengkorak tetap lentur untuk lahir.
  - Sebagian besar janin mulai posisi kepala di bawah.
  - Ia berlatih mengisap dan menelan air ketuban.
- **Yang dirasakan Bunda:** Kontraksi palsu makin sering. Bunda mungkin mulai merasa gelisah menunggu hari kelahiran — itu sangat wajar.
- **Normal:** Kontraksi palsu hilang dengan ganti posisi/istirahat.
- **Segera ke dokter:** Kontraksi teratur tiap 10 menit atau ketuban merembes → ke faskes.
- **Tips bidan:** Mulai siapkan tas persalinan dan lengkapi Birth Plan (P4K) Bunda di menu Edukasi — penolong, tempat bersalin, dan transportasi.

#### Minggu 34 — Melon

- **Trimester:** 3.
- **Panjang:** ~45 cm. **Berat:** ~2,1 kg.
- **Perkembangan:**
  - Kuku jarinya sudah sampai ujung jari — siap digunting nanti!
  - Paru-paru hampir matang sempurna.
  - Lapisan lemaknya bikin pipi makin chubby.
- **Yang dirasakan Bunda:** Berat badan Bunda naik stabil sekitar 0,5 kg/minggu. Tangan kadang kesemutan (carpal tunnel) — umum di trimester akhir.
- **Normal:** Kesemutan ringan di tangan — hilang setelah lahiran.
- **Segera ke dokter:** Kesemutan disertai bengkak wajah & sakit kepala → cek tekanan darah.
- **Tips bidan:** Tas persalinan idealnya sudah siap minggu ini: buku KIA, KTP, kartu JKN, baju ibu & bayi. Cek checklist di menu Birth Plan!

#### Minggu 36 — Selada Romaine

- **Trimester:** 3.
- **Panjang:** ~47 cm. **Berat:** ~2,7 kg.
- **Perkembangan:**
  - Kepala mulai turun ke panggul (lightening).
  - Paru-paru hampir matang penuh.
  - Gerakannya berganti jadi 'dorongan' karena ruang sempit.
- **Yang dirasakan Bunda:** Bunda mungkin merasa napas lebih lega setelah kepala turun, tapi tekanan di panggul dan BAK makin sering.
- **Normal:** Tekanan dan nyeri tumpul di panggul — normal saat kepala turun.
- **Segera ke dokter:** Nyeri panggul hebat sampai sulit jalan perlu diperiksa.
- **Tips bidan:** Kontrol ANC kini dilakukan lebih sering (tiap 2 minggu lalu mingguan). Jangan sampai terlewat ya Bunda!

#### Minggu 38 — Labu Kuning

- **Trimester:** 3.
- **Panjang:** ~49 cm. **Berat:** ~3,1 kg.
- **Perkembangan:**
  - Si Kecil sudah aterm — siap lahir kapan saja!
  - Ususnya berisi mekonium (kotoran pertama bayi).
  - Lanugo (bulu halus) mulai rontok, kulit makin mulus.
- **Yang dirasakan Bunda:** Bunda mungkin merasakan kontraksi latihan makin intens. Waspadai tanda persalinan sungguhan: kontraksi teratur, lendir darah, atau ketuban pecah.
- **Normal:** Keluar lendir kental (bloody show) bisa jadi tanda persalinan dekat.
- **Segera ke dokter:** Ketuban pecah, perdarahan, atau gerakan janin berkurang → segera ke faskes!
- **Tips bidan:** Kenali tanda persalinan asli: kontraksi teratur makin kuat, lendir darah, ketuban pecah. Pastikan kontak bidan & transportasi siaga 24 jam.

#### Minggu 40 — Semangka Kecil

- **Trimester:** 3.
- **Panjang:** ~50 cm. **Berat:** ~3,4 kg.
- **Perkembangan:**
  - Hari perkiraan lahir (HPL) tiba — si Kecil siap menyapa dunia!
  - Semua organ matang dan siap berfungsi mandiri.
  - Vernix (krim pelindung kulit) masih melapisi tubuhnya.
- **Yang dirasakan Bunda:** Bunda sudah di garis akhir! Wajar jika cemas — ingat, hanya sedikit bayi lahir tepat di HPL. Persalinan normal terjadi 37-42 minggu.
- **Normal:** Lewat HPL beberapa hari masih normal dengan pemantauan bidan/dokter.
- **Segera ke dokter:** Gerakan janin berkurang, ketuban pecah hijau, atau perdarahan → IGD segera.
- **Tips bidan:** Tetap tenang dan pantau gerakan janin. Jika HPL lewat, bidan akan memantau lebih ketat. Semangat Bunda, sebentar lagi bertemu si Kecil!

Tombol lanjutan pada layar: **Lihat Panduan Mengatasi Mual**, menuju `/edukasi/keluhan`.

### Pemetaan kebutuhan

S-06b meminta usia kehamilan profil sebagai pilihan awal, navigasi manual, estimasi ukuran dan berat, perkembangan organ, serta tips yang relevan. Struktur isinya sudah mendekati kebutuhan. Cakupan situs masih tiap dua minggu, sehingga belum menyediakan entri individual untuk setiap minggu. Ajakan mencatat siklus dan gerakan janin adalah teks tips; keberadaan fitur pencatatannya tidak dibuktikan oleh halaman edukasi ini.

**Nama referensi pada metadata prototype:** Kemenkes RI — Buku KIA; ACOG Practice Bulletin; WHO Antenatal Care 2016.

## 3. Perkembangan plasenta, tali pusat, ketuban — S-06c

**URL sumber:** <https://sikibaskr.lovable.app/edukasi/plasenta>.

**Deskripsi menu:** Peran plasenta, tali pusat, dan cairan ketuban untuk janin.

**Judul layar:** Support System Si Kecil.

**Subjudul:** Mengenal Ketuban, Tali Pusat, & Plasenta (Materi Kebidanan).

**Struktur layar:** pengantar dan tab Air Ketuban, Tali Pusat, Plasenta. Tab Plasenta juga memiliki pilihan Permukaan Fetal dan Permukaan Maternal. Tab awal adalah Air Ketuban.

### Isi sumber

#### Pengantar

Tiga pendamping setia si Kecil selama di dalam kandungan: ketuban sebagai bantal pelindung, tali pusat sebagai jalur hidup, dan plasenta sebagai pabrik nutrisi.

#### Air Ketuban

- Warna: Pucat Jernih (99% Air).
- Puncak: ~1 Liter (Mgg 38).

**5 Fungsi Air Ketuban**

1. **Proteksi & Trauma:** Mencegah benturan langsung & perlekatan janin.
2. **Regulasi Suhu:** Menjaga suhu tetap stabil & melindungi dari perubahan panas/dingin.
3. **Ruang Gerak:** Bebas bergerak melatih otot & tulang tanpa terhimpit.
4. **Penyelamat Lahir:** Membantu pembukaan serviks & melumasi jalan lahir saat pecah.
5. **Pembersih:** Membersihkan jalan lahir saat inpartu berlangsung.

#### Tali Pusat

- Panjang: ~55 cm (Terpilin).
- Pelindung: Wharton's Jelly.

**3 Pembuluh Darah Tali Pusat**

- **1 Vena Umbilikalis:** Mengalirkan nutrisi & O2 masuk dari ibu ke janin.
- **2 Arteri Umbilikalis:** Membuang sisa metabolisme & CO2 keluar dari janin.

**Jenis Posisi Insersi Tali Pusat**

1. Sentralis — tali pusat menancap di tengah plasenta (normal).
2. Para sentralis — sedikit menyamping tengah, masih normal.
3. Lateralis — menancap di sisi plasenta.
4. Marginalis — menancap di tepi plasenta (battledore).
5. Velamentosa — pembuluh darah berjalan di selaput ketuban sebelum masuk plasenta (perlu pemantauan).

#### Plasenta

- Berat: ~500 gram (Cakram 15-20 cm).
- Matang: Hari ke-70 (Mgg 10).

**Permukaan Fetal:** Menghadap janin, halus keputihan, tertutup amnion, dan terlihat alur pembuluh darah.

**Permukaan Maternal:** Menghadap rahim, berwarna merah tua, dan terbagi celah-celah (kotiledon).

**4 Fungsi Utama Plasenta**

1. **Nutritif & Respirasi:** Penyalur makanan, O2, dan pembuang CO2/ekskresi janin.
2. **Imunitas & Barier:** Menyalurkan antibodi ibu & menyaring bakteri tertentu.
3. **Pabrik Hormon:** Menghasilkan Estrogen, Progesteron, hCG, HPL, HCT, HCCT.
4. **Sirkulasi:** Ruang intervillar terisi darah ibu untuk vaskularisasi janin.

#### Tips Bidan Minggu Ini

Kecukupan air ketuban, aliran darah tali pusat, dan posisi plasenta selalu dipantau lewat USG rutin. Jika ada rembesan cairan berlebih atau perdarahan tanpa rasa sakit, segera konsultasikan ke dokter/bidan ya Bunda!

Tombol **Tanya Bidan tentang Hasil USG** membuka WhatsApp dengan pesan berikut; tautannya tidak menetapkan nomor penerima.

> Halo Bidan, saya ingin bertanya tentang hasil USG ketuban, tali pusat, dan plasenta saya. Mohon penjelasannya, ya. Terima kasih. ❤️

### Pemetaan kebutuhan

Tema dan pembagian tiga struktur sesuai S-06c. Spesifikasi juga meminta kondisi yang membahayakan struktur tersebut. Layar aktif hanya memberi catatan velamentosa, rembesan cairan, dan perdarahan pada tips; pembahasan komplikasinya belum lengkap. Materi PDF menyediakan penjelasan perkembangan plasenta yang lebih panjang dan dapat digunakan untuk memperluas naskah.

**Nama referensi pada metadata prototype:** Kemenkes RI — Buku KIA 2024; WHO Recommendations on ANC; FIGO Placenta Guidelines.

## 4. Perubahan Fisiologi Kehamilan — S-06d

**URL sumber:** <https://sikibaskr.lovable.app/edukasi/fisiologi>.

**Deskripsi menu:** Perubahan tubuh ibu sebagai adaptasi terhadap kehamilan.

**Judul layar:** 11 Perubahan Tubuh.

**Pengantar:** Mengenal adaptasi ajaib tubuh Bunda selama kehamilan.

**Struktur layar:** pencarian gejala, tiga kelompok sistem tubuh, dan sebelas bagian yang dapat dibuka. Pencarian berlaku di semua kelompok, bukan hanya kelompok yang sedang dipilih.

### Isi sumber

#### Kelompok Organ & Sirkulasi

1. **Rahim & Area Intim**
   - Label inti: Tanda Chadwick; Keputihan Asam Laktat.
   - Rahim membesar hingga seukuran semangka. Warna vagina keunguan karena aliran darah naik (Tanda Chadwick). Keputihan kental normal untuk mencegah infeksi.
   - Tips: Pakai pakaian dalam katun yang menyerap keringat ya!
2. **Jantung & Pembuluh Darah**
   - Label inti: Detak +15 bpm; Cegah Tidur Terlentang.
   - Volume darah naik 50% dan detak jantung bertambah. Jangan tidur terlentang di Trimester 2-3 agar rahim tidak menekan pembuluh darah utama (Supine Hypotensive Syndrome).
   - Tips: Sangat disarankan tidur miring ke kiri!
3. **Darah Bunda (Hematologi)**
   - Label inti: Anemia Fisiologis; Butuh Zat Besi.
   - Cairan darah (plasma) bertambah lebih banyak dibanding sel darah merah, menyebabkan pengenceran darah alami (anemia fisiologis).
   - Tips: Rutin minum suplemen Penambah Darah & Asam Folat.
4. **Paru-Paru (Respirasi)**
   - Label inti: Diafragma Naik 4 cm; Napas Pendek.
   - Kebutuhan oksigen meningkat pesat. Diafragma terdorong ke atas oleh rahim yang membesar sehingga napas terasa lebih pendek.

#### Kelompok Pencernaan & Hormon

5. **Sistem Pencernaan**
   - Label inti: Sembelit / Konstipasi; Heartburn.
   - Hormon Progesteron memperlambat gerakan usus sehingga mudah sembelit. Usus buntu terdorong ke atas kanan dan refluks asam lambung lebih sering terjadi.
   - Tips: Perbanyak makan serat & minum air minimal 2,5 Liter/hari.
6. **Ginjal & Kandung Kemih**
   - Label inti: Beser / Sering Pipis; GFR Naik 50%.
   - Ginjal bekerja 50% lebih keras menyaring darah. Kandung kemih tertekan rahim yang membesar sehingga Bunda jadi sering buang air kecil.
   - Tips: Jangan pernah menahan pipis untuk cegah ISK!
7. **Metabolisme & Tiroid**
   - Label inti: Glukosa & Insulin; Risiko Diabetes Gestasional.
   - Hormon plasenta hPL mengubah metabolisme gula & lemak. Gula darah puasa lebih rendah sehingga Bunda cepat lapar dan mual di pagi hari.
8. **Payudara (Persiapan ASI)**
   - Label inti: Mammogenesis; Areola Gelap.
   - Terjadi pembesaran sel (hiperplasia & hipertrofi), pembuluh darah biru terlihat, areola menggelap, dan muncul kolostrum di akhir kehamilan.

#### Kelompok Kulit, Otot & Imun

9. **Otot, Tulang & Sendi**
   - Label inti: Nyeri Punggung; Postur Lordosis.
   - Hormon Relaksin melonggarkan sendi panggul untuk persiapan persalinan. Beban perut membuat tulang belakang melengkung ke belakang (lordosis) sehingga punggung mudah pegal.
   - Tips: Hindari high heels & duduk tegak dengan bantal penopang.
10. **Kulit & Rambut (Integumen)**
    - Label inti: Linea Nigra; Melasma; Stretch Mark.
    - Estrogen & Progesteron merangsang melanin, memicu garis gelap di perut (linea nigra), flek di wajah (melasma), stretch mark, & telapak tangan kemerahan (eritema palmar).
11. **Sistem Imun & Kekebalan**
    - Label inti: Adaptasi Imun; Waspada Infeksi.
    - Sistem imun beradaptasi agar tidak memusuhi janin, tapi membuat Bunda sedikit lebih rentan terhadap flu & ISK. Jaga nutrisi dan istirahat ya!

#### Tips dari Bidan

Perubahan pada 11 sistem organ ini adalah bukti betapa hebatnya tubuh Bunda beradaptasi demi si Kecil. Jika ada gejala yang dirasa sangat mengganggu, jangan ragu untuk berkonsultasi ya!

### Pemetaan kebutuhan

Sebelas sistem sesuai cakupan S-06d. Pengelompokan tiga kategori pada prototype merupakan alat navigasi, bukan tiga layar tambahan. Untuk pengembangan naskah, pertahankan sebelas subtopik: reproduksi, pencernaan, otot dan tulang, kulit, kekebalan, perkemihan, darah, jantung dan pembuluh darah, pernapasan, metabolisme, serta payudara. Rincian masing-masing sudah tersedia pada topik 4 materi PDF.

**Nama referensi pada metadata prototype:** Kemenkes RI — Pedoman ANC Terpadu; WHO Antenatal Care 2016; ACOG Committee Opinion.

## 5. Tanda Bahaya Kehamilan — S-06e

**URL sumber:** <https://sikibaskr.lovable.app/edukasi/tanda-bahaya>.

**Deskripsi menu:** Kenali gejala yang memerlukan tindakan medis segera.

**Struktur layar:** pesan darurat, pencarian gejala, tiga kelompok, dan 15 bagian gejala yang dapat dibuka. Gejala gerakan janin memiliki penjelasan, video, dan anjuran tambahan.

### Isi sumber

#### Pengantar dan bantuan

Jika Bunda mengalami salah satu gejala di bawah ini, SEGERA periksa ke Bidan atau Dokter!

Bagian darurat menampilkan **Hubungi Bidan / RS Terdekat**. Tombol **Panggil Bantuan** mengarah ke `tel:119`.

#### Kelompok Utama & Janin

| No. | Gejala | Deskripsi sumber | Label sumber |
| ---: | --- | --- | --- |
| 1 | Perdarahan Hebat | Basah >1 pembalut dalam 5 menit. | SEGERA |
| 2 | Gerakan Janin Berkurang | <10 kali dalam 12 jam atau tidak bergerak sama sekali. | Pantau Gerak |
| 3 | Nyeri Perut & Ulu Hati Hebat | Nyeri melilit tajam mendadak. | WASPADA |
| 4 | Cairan Jalan Lahir Berlebih/Berbau | Keluar cairan sangat banyak atau berbau busuk. | SEGERA |
| 5 | Gejala Preeklamsia | Sakit kepala berat + Pandangan kabur + Nyeri ulu hati. | DARURAT |

#### Kelompok Infeksi & Organ

| No. | Gejala | Deskripsi sumber | Label sumber |
| ---: | --- | --- | --- |
| 6 | Demam Tinggi | Suhu >38°C atau demam lebih dari 2 hari. | CEK SUHU |
| 7 | Napas Pendek & Batuk >2 Minggu | Sesak, napas terengah-engah, nyeri dada, atau batuk berdahak lama. | WASPADA |
| 8 | Jantung Berdebar | Berdebar keras atau terasa nyeri di dada. | PERIKSA |
| 9 | Risiko TB | Batuk >2 minggu atau kontak serumah dengan penderita TB. | SKRINING |
| 10 | Masalah Buang Air Kecil | Sakit/panas saat kencing, tidak bisa BAK, atau urin keluar tanpa disadari. | CEK |
| 11 | Keputihan & Area Kelamin | Keputihan berwarna/berbau/gatal, serta area kelamin bengkak, nyeri, atau ada luka. | PERIKSA |
| 12 | Diare Berulang | Diare terus-menerus berisiko dehidrasi. | HIDRASI |

#### Kelompok Jiwa, Payudara & Nifas

| No. | Gejala | Deskripsi sumber | Label sumber |
| ---: | --- | --- | --- |
| 13 | Kesehatan Jiwa | Sering menangis, merasa bersalah, cemas berlebih, insomnia berat, & sulit konsentrasi. | DUKUNGAN |
| 14 | Payudara Bengkak & Nyeri | Bengkak kemerahan, ada benjolan nyeri, atau kendala menyusui. | PERIKSA |
| 15 | Darah Nifas Berbau | Darah nifas berbau busuk, mengalir deras, atau disertai kram perut bawah. | SEGERA |

#### Penjelasan tambahan Gerakan Janin Berkurang

Gerakan janin yang terasa lebih sedikit atau berbeda dari pola biasanya dapat menandakan janin sedang beristirahat, namun juga bisa menjadi tanda awal gawat janin karena kurangnya oksigen atau masalah plasenta.

**Anjuran Tindakan**

1. Diamkan diri dalam posisi miring ke kiri dan hitung gerakan janin selama 2 jam.
2. Normalnya janin bergerak minimal 10 kali dalam 2 jam (kick count).
3. Jika gerakan tetap berkurang atau tidak terasa sama sekali, segera periksakan diri ke bidan atau faskes terdekat.

Video pada bagian ini: [gerakan-janin.mp4](https://sikibaskr.lovable.app/__l5e/assets-v1/b5e7733a-3139-426e-87ff-2661c685f59d/gerakan-janin.mp4).

#### Pesan umum di setiap gejala

Jika Bunda mengalami gejala ini, segera hubungi bidan atau fasilitas kesehatan terdekat. Jangan menunggu gejala memburuk.

#### Jangan menunda pemeriksaan

Kesehatan Bunda dan si Kecil adalah prioritas utama. Lebih baik periksa lebih awal untuk mencegah komplikasi.

### Pemetaan kebutuhan

S-06e adalah edukasi pengenalan gejala; checklist dan triage berada di S-03c. Konten situs mencampur kehamilan, kesehatan jiwa, laktasi, dan nifas. Untuk section khusus **Tanda Bahaya Kehamilan**, berikan penanda konteks yang jelas; materi nifas dapat dihubungkan dengan S-04 dan masalah menyusui dengan S-04a. Angka gerakan janin pada deskripsi dan anjuran sumber tidak konsisten, sebagaimana dicatat pada bagian penyelarasan.

**Nama referensi pada metadata prototype:** Kemenkes RI — Buku KIA 2024; WHO Managing Complications in Pregnancy; POGI.

## 6. Perubahan Psikologi Trimester 1–3 — S-06f

**URL sumber:** <https://sikibaskr.lovable.app/edukasi/psikologi>.

**Deskripsi menu:** Adaptasi emosi ibu di setiap trimester kehamilan.

**Judul layar:** Emosi Bunda.

**Subjudul:** Perubahan emosi & psikologis Bunda per trimester.

**Struktur layar:** pengantar, tab trimester, perasaan ibu, penyebab, dukungan keluarga, dan berbagi catatan ke pasangan.

### Isi sumber

#### Pengantar

Merasa cemas, bahagia, atau canggung itu wajar banget, Bunda. Emosi Bunda valid dan penting untuk dirawat! 🌸

#### Trimester 1 — Campur Aduk & Sensitif

**Apa yang Bunda Rasakan?**

- Fluktuasi emosi: bahagia, cemas, ragu, hingga takut akan kondisi kehamilan.
- Merasa lemas, mual, dan lebih protektif/fokus pada perubahan tubuh sendiri.

**Kenapa Begitu?**

- Melonjaknya hormon kehamilan secara mendadak + adaptasi fisik awal yang menguras energi.

**Dukungan dari Ayah & Keluarga**

Bunda sangat butuh ditemani, didengarkan tanpa dihakimi, dan dimengerti saat fisik terasa tidak nyaman.

#### Trimester 2 — Lega, Bahagia & Adaptasi Bentuk Tubuh

**Apa yang Bunda Rasakan?**

- Lebih bahagia & tenang karena mual berkurang.
- Makin terikat dengan janin karena sudah bisa merasakan gerakannya.
- Kadang kurang percaya diri karena perubahan bentuk tubuh dan BB yang naik.

**Kenapa Begitu?**

- Uterus membesar dan tubuh terus beradaptasi dengan bentuk barunya.

**Dukungan dari Ayah & Keluarga**

Beri Bunda pujian dan perhatian ekstra! Ingatkan Bunda bahwa tubuhnya sedang melakukan hal ajaib menciptakan kehidupan.

#### Trimester 3 — Cemas, Sensitif & Tidak Sabar

**Apa yang Bunda Rasakan?**

- Bahagia menanti persalinan, tapi juga cemas/khawatir menghadapi rasa sakit lahiran.
- Khawatir apakah sanggup menjalankan peran baru sebagai seorang ibu.
- Perut makin berat bikin tidur sulit dan emosi lebih sensitif.

**Kenapa Begitu?**

- Mendekati HPL (Hari Perkiraan Lahir) dan persiapan mental menyambut anggota keluarga baru.

**Dukungan dari Ayah & Keluarga**

Dampingi Bunda di setiap kontrol persalinan, bantu siapkan perlengkapan bayi, dan berikan ketenangan penuh.

#### Berbagi catatan emosi

Mau Ayah lebih paham kondisi emosi Bunda?

Bagikan catatan emosi ini agar Ayah bisa mendampingi Bunda dengan lebih tepat.

Tombol **Bagikan Catatan Emosi Ini ke Suami** membagikan trimester yang dipilih, label emosi, isi perasaan dan penyebab, serta dukungan keluarga. Jika fitur berbagi perangkat tidak tersedia, sumber menggunakan salin ke clipboard.

### Pemetaan kebutuhan

Pembagian per trimester sesuai S-06f. Layar khusus belum menampilkan tautan skrining mental S-03f yang diminta spesifikasi. Tambahkan bagian kapan memerlukan bantuan dan hubungan ke skrining mental pada naskah SIAGA Bunda, dengan rujukan yang disetujui pakar.

**Nama referensi pada metadata prototype:** Kemenkes RI — Pedoman Kesehatan Jiwa Ibu; WHO Maternal Mental Health; ACOG Perinatal Depression.

## 7. Keluhan Umum Kehamilan dan Cara Mengatasinya — S-06g

**URL sumber:** <https://sikibaskr.lovable.app/edukasi/keluhan>.

**Judul pada sumber:** Keluhan Umum Kehamilan & Cara Mengatasi.

**Deskripsi menu:** AI Assistant skrining keluhan: fisiologis atau perlu diwaspadai.

**Struktur layar yang ditemukan:** placeholder ilustrasi/video, ringkasan, enam bagian keluhan, poin penting, tips bidan, fakta dan mitos, nama referensi, serta navigasi artikel sebelumnya dan berikutnya. Tidak ditemukan input intensitas, durasi, frekuensi, hasil klasifikasi, atau pemanggilan AI pada komponen ini.

### Isi sumber

#### Ringkasan

Beberapa keluhan sering muncul selama kehamilan. Umumnya normal dan dapat diatasi dengan perubahan gaya hidup sederhana.

#### Mual & Muntah

- Makan porsi kecil tapi sering, hindari perut kosong.
- Konsumsi biskuit kering saat bangun tidur.
- Hindari makanan berminyak dan aroma menyengat.
- Coba jahe hangat atau vitamin B6 (dengan rekomendasi bidan).

#### Konstipasi

- Perbanyak serat: sayur, buah, gandum utuh.
- Minum air ≥ 2 liter/hari.
- Aktivitas ringan seperti jalan kaki.

#### Nyeri Punggung

- Gunakan sepatu datar dan nyaman.
- Hindari mengangkat beban berat.
- Kompres hangat dan lakukan senam hamil.

#### Kram Kaki

- Regangkan otot betis sebelum tidur.
- Cukup asupan kalsium dan magnesium.
- Kompres hangat dan pijat lembut.

#### Sering Berkemih

- Kurangi kafein.
- Jangan menahan kencing.
- Latih otot dasar panggul (senam Kegel).

#### Heartburn / Refluks

- Makan porsi kecil, hindari langsung berbaring setelah makan.
- Hindari makanan pedas dan asam.
- Tinggikan bantal saat tidur.

#### Poin Penting

- Keluhan yang tidak membaik atau memberat harus dikonsultasikan.
- Jangan konsumsi obat bebas tanpa persetujuan bidan/dokter.
- Perhatikan sinyal tubuh — istirahat cukup adalah bagian dari terapi.

#### Tips Bidan

- Catat keluhan yang muncul dan bawa saat kontrol ANC.
- Kombinasikan istirahat, nutrisi, dan aktivitas ringan.

#### Fakta vs Mitos

- **Fakta:** Mual muntah biasanya membaik setelah 12–16 minggu.
- **Mitos:** Mual muntah harus ditahan dan tidak boleh diobati sama sekali.

### Pemetaan kebutuhan

Spesifikasi S-06g meminta **25+ keluhan**, rincian intensitas, durasi dan frekuensi, penilaian Fisiologis/Waspadai/Patologis, penjelasan penyebab, penanganan, tanda kewaspadaan, serta akses fasyankes bila perlu. Situs ini baru memberikan artikel enam keluhan, sehingga label AI Assistant pada menu belum mewakili perilaku layar.

Materi PDF topik 8 memuat daftar A–Z, AA, dan BB, yakni **28 keluhan**. Daftar tersebut dapat menjadi cakupan pengembangan:

1. Kloasma dan hiperpigmentasi areola.
2. Edema.
3. Sering BAK atau nokturia.
4. Striae gravidarum.
5. Gatal-gatal.
6. Gusi berdarah.
7. Hemoroid.
8. Hidung tersumbat atau berdarah.
9. Insomnia.
10. Kelelahan.
11. Keputihan.
12. Keringat bertambah.
13. Konstipasi.
14. Kram kaki.
15. Mati rasa dan rasa perih pada jari tangan dan kaki.
16. Dispnea atau hiperventilasi.
17. Nyeri ligamentum rotundum.
18. Perut kembung.
19. Pusing atau sinkope.
20. Mual muntah.
21. Sakit punggung.
22. Spider nevi.
23. Varises.
24. Ptyalisme.
25. Sciatica.
26. Rambut rontok.
27. Palpitasi jantung.
28. Heartburn atau panas perut.

Daftar di atas adalah inventaris materi PDF, bukan keluhan tambahan yang ditemukan pada halaman situs. Naskah tiap keluhan dapat disusun dengan pola **pengertian, penyebab, kapan muncul, cara mengatasi, kapan perlu diperiksa, dan sumber**. Kriteria klasifikasi harus berasal dari aturan klinis yang divalidasi, bukan dari label artikel prototype.

**Referensi yang ditampilkan pada sumber:** Kemenkes RI — Buku KIA; WHO ANC 2016; ACOG Common Discomforts.

## 8. Birth Plan dan Persiapan Persalinan (P4K) — S-06h

**URL sumber:** <https://sikibaskr.lovable.app/edukasi/birth-plan>.

**Judul pada sumber:** Birth Plan & Persiapan Persalinan (P4K).

**Deskripsi menu:** Rencanakan persalinan aman bersama bidan dan keluarga.

**Struktur layar:** placeholder ilustrasi/video, ringkasan, tujuh komponen P4K, checklist tas persalinan, tanda persalinan, poin penting, tips, nama referensi, dan navigasi artikel. Komponen P4K ditampilkan sebagai daftar edukasi; checklist tas berupa kotak centang tanpa penyimpanan rencana atau progress P4K.

### Isi sumber

#### Ringkasan

Program Perencanaan Persalinan dan Pencegahan Komplikasi (P4K) adalah program Kemenkes untuk memastikan setiap ibu hamil siap menghadapi persalinan.

#### 7 Komponen P4K

Program Perencanaan Persalinan dan Pencegahan Komplikasi — Kemenkes RI.

1. **Data Ibu Hamil**
   - Nama, usia, HPHT, HPL.
   - Golongan darah ibu dan pendonor cadangan.
   - Riwayat kehamilan sebelumnya.
2. **Penolong Persalinan**
   - Nama bidan/dokter penolong.
   - Nomor telepon yang bisa dihubungi 24 jam.
3. **Tempat Persalinan**
   - Puskesmas / RS / klinik bersalin yang direncanakan.
   - Alamat lengkap dan rute tercepat.
4. **Pendamping Persalinan**
   - Suami sebagai pendamping utama.
   - Anggota keluarga cadangan.
5. **Transportasi**
   - Kendaraan siap 24 jam.
   - Nomor telepon supir/ambulans desa.
6. **Calon Pendonor Darah**
   - Minimal 2 orang dengan golongan darah cocok.
   - Nomor telepon aktif.
7. **Tabungan Persalinan / JKN**
   - Siapkan tabungan atau kepesertaan BPJS/JKN aktif.
   - Simpan salinan kartu identitas dan buku KIA.

#### Isi Tas Persalinan

Siapkan sejak usia kehamilan 34 minggu.

- Buku KIA & KTP + Kartu JKN.
- Baju ibu 3 stel + kain jarik + gurita.
- Pembalut nifas dan celana dalam katun.
- Perlengkapan bayi: baju, popok, bedong, topi, kaus tangan/kaki.
- Selimut bayi dan handuk lembut.
- Perlengkapan mandi ibu & bayi.
- Air minum dan camilan ringan.

#### Tanda Persalinan

- Kontraksi teratur, semakin sering dan kuat.
- Keluar lendir bercampur darah (bloody show).
- Ketuban pecah — segera ke fasilitas kesehatan.

#### Poin Penting

- Setiap kehamilan berisiko — perencanaan mengurangi risiko keterlambatan penanganan.
- P4K melibatkan ibu, suami, keluarga, bidan, dan lingkungan.
- Stiker P4K ditempel di rumah ibu hamil sebagai penanda.

#### Tips Bidan

- Diskusikan rencana persalinan sejak trimester 2.
- Latih pernapasan dan relaksasi untuk persalinan.
- Siapkan tas persalinan sejak usia kehamilan 34 minggu.

### Pemetaan kebutuhan

S-06h membutuhkan form nama penolong, tempat bersalin, pendamping, calon donor, transportasi, dana, nomor bidan/dokter, checklist perlengkapan, dan pemahaman tanda persalinan. Form tersebut perlu tersimpan, memiliki progress kelengkapan dan validasi, serta menghasilkan ringkasan untuk dibagikan atau dicetak. Prototype memberikan dasar materi, tetapi belum memenuhi bagian form dan ringkasan tersebut.

**Referensi yang ditampilkan pada sumber:** Kemenkes RI — Pedoman P4K; Buku KIA 2024; WHO Safe Childbirth Checklist.

## Penyelarasan dengan spesifikasi dan materi PDF

### Susunan section yang menjadi dasar penyusunan

| Layar | Susunan konten untuk naskah SIAGA Bunda | Hubungan ke fitur lain |
| --- | --- | --- |
| S-06a | Pengantar, ovulasi, perjalanan sperma, pembuahan, pembelahan, implantasi, tanda awal, langkah berikutnya, video dan sumber | Profil kehamilan dan pemeriksaan awal |
| S-06b | Trimester dan minggu, pembanding ukuran, estimasi panjang dan berat, perkembangan janin, perubahan ibu, tips, tanda kewaspadaan | Usia kehamilan profil, ANC, skrining yang relevan |
| S-06c | Plasenta, tali pusat, ketuban; pengertian, perkembangan, fungsi, kondisi yang perlu diwaspadai | Pemeriksaan USG dan edukasi tanda bahaya |
| S-06d | Sebelas sistem tubuh; perubahan yang terjadi, penyebab, keluhan terkait, tips kenyamanan | S-06g untuk penanganan keluhan dan S-06e untuk tanda bahaya |
| S-06e | Gejala, penjelasan, tindakan segera, akses bantuan; konteks kehamilan yang jelas | S-03c; materi nifas dan laktasi ke S-04 serta S-04a |
| S-06f | Tiap trimester; perasaan, penyebab, dukungan keluarga, langkah menjaga kesehatan mental, kapan perlu bantuan | S-03f dan diary S-07c |
| S-06g | 25+ keluhan; penyebab, detail keluhan, cara mengatasi, tanda kewaspadaan, hasil penilaian sesuai aturan tervalidasi | S-03c dan fasyankes bila diperlukan |
| S-06h | Materi P4K, form rencana persalinan, checklist perlengkapan, tanda persalinan, ringkasan dan progress | Beranda S-02 dan ekspor atau berbagi ringkasan |

### Perbedaan yang perlu diselesaikan saat menyusun naskah

1. **Perkembangan mingguan:** situs memuat 20 entri dua mingguan, sedangkan spesifikasi meminta konten per minggu dan pilihan awal sesuai profil. Minggu yang tidak tersedia perlu ditulis dari referensi; angka ukuran tidak boleh sekadar diinterpolasi dari prototype.
2. **Flek dan perdarahan:** minggu 4 dan 8 pada situs menyebut flek ringan sebagai normal. Spesifikasi S-03c dan SK04 memperlakukan perdarahan sebagai tanda bahaya. Naskah edukasi dan aturan skrining perlu diselaraskan oleh pakar.
3. **Gerakan janin:** deskripsi sumber menggunakan `<10 kali dalam 12 jam`, sedangkan penjelasan dan tipsnya menggunakan `10 kali dalam 2 jam`. Spesifikasi S-03c juga menggunakan rentang dua jam. Dokumen ekstraksi mempertahankan kedua teks sumber agar perbedaan tidak tersembunyi.
4. **Kehamilan dan nifas:** topik Tanda Bahaya memuat darah nifas dan kendala menyusui. Penempatan atau penandaan konteks perlu disesuaikan dengan judul layar kehamilan.
5. **Kesehatan mental:** psikologi layar khusus memuat adaptasi dan dukungan keluarga, tetapi belum memuat akses EPDS yang diminta S-06f. Konten tentang kondisi yang perlu bantuan juga perlu menjadi bagian naskah final.
6. **Keluhan umum:** enam artikel di situs belum memenuhi 25+ keluhan dan penilaian normal versus patologis pada spesifikasi. Materi PDF memberikan inventaris 28 keluhan untuk perluasan.
7. **P4K:** daftar edukasi dan checkbox tas belum menggantikan form, progress, validasi, penyimpanan, serta ringkasan berbagi yang diminta S-06h.
8. **Kebutuhan klinis dan rujukan:** nilai seperti dosis asam folat, estimasi pertumbuhan, saran hidrasi, kenaikan berat badan, batas aterm, dan klaim maturitas plasenta tetap merupakan transkripsi prototype. Nama referensi pada situs umumnya belum memiliki nomor dokumen, halaman, atau tautan spesifik; identitas sumber perlu dilengkapi saat finalisasi konten.
9. **Gaya bahasa:** prototype memakai bahasa percakapan, emoji, `&`, dan judul panjang. Naskah SIAGA Bunda mengikuti EYD serta ketentuan copy proyek; penyesuaian gaya dilakukan pada naskah turunan, bukan dengan mengubah isi ekstraksi secara diam-diam.

### Kedudukan materi lain dalam PDF

Delapan layar utama mengambil tema PDF 1–8, dengan **Keluhan Umum** ditempatkan sebelum **Birth Plan** sesuai urutan S-06g dan S-06h. Tema PDF lainnya dapat menjadi referensi konten pendukung dengan pemetaan berikut.

| Tema PDF | Hubungan dengan klasifikasi aplikasi |
| --- | --- |
| Latihan pernapasan, latihan fisik/yoga, dan pain relief | Konten pendukung S-06d, S-06g, dan S-06h sesuai bahasan |
| Tracker kenaikan berat badan | S-07, dengan edukasi pendukung gizi dan fisiologi |
| Reminder kunjungan ANC | S-07b, dengan tautan kontekstual dari perkembangan janin |
| Reminder suplemen | S-07a, dengan edukasi pendukung kebutuhan ibu |
| Mitos dan fakta | Bagian pendukung pada topik yang relevan |
| KB pascapersalinan | Materi persiapan persalinan atau edukasi nifas sesuai konteks; bukan topik kehamilan mingguan |
| Nutrisi dan hidrasi | Konten pendukung gizi, fisiologi, dan keluhan umum |
| Skrining postpartum depression | Materi kesehatan mental yang terkait dengan S-03f dan S-04 |

## Sumber media dan jejak ekstraksi

### Media yang ditemukan pada situs

| Layar | Media | Tautan atau status |
| --- | --- | --- |
| S-06e | Video gerakan janin | [gerakan-janin.mp4](https://sikibaskr.lovable.app/__l5e/assets-v1/b5e7733a-3139-426e-87ff-2661c685f59d/gerakan-janin.mp4) |
| S-06g | Slot ilustrasi/video | Placeholder pada template artikel; tidak ditemukan URL video yang terpasang |
| S-06h | Slot ilustrasi/video | Placeholder pada template artikel; tidak ditemukan URL video yang terpasang |

### Video pendamping dari materi PDF

Tautan berikut berasal dari `KONTEN_EDUKASI.md`, bukan hasil ekstraksi video pada situs.

| Materi | Tautan |
| --- | --- |
| Fertilisasi | <https://youtu.be/_5OvgQW6FG4?si=sl7BZofIK3tihY_T> |
| Perkembangan janin | <https://www.youtube.com/watch?v=8BH7WFmRs-E> |
| Melatih pernapasan selama kehamilan | <https://youtu.be/MDlrYbE71ak?si=dXDUNMv7sqJa3dxl> |

### Berkas publik yang digunakan

- [Menu dan metadata edukasi](https://sikibaskr.lovable.app/assets/index-DVOqX17Y.js): urutan delapan topik, judul, deskripsi, ringkasan, artikel Keluhan Umum, komponen P4K, checklist tas, nama referensi.
- [Komponen menu edukasi](https://sikibaskr.lovable.app/assets/edukasi.index-DtJSWF54.js): memastikan delapan topik digunakan sebagai tautan menu dalam urutan tersebut.
- [Komponen detail edukasi](https://sikibaskr.lovable.app/assets/edukasi._slug-yzBaOrod.js): lima tahap fertilisasi, 20 entri perkembangan janin, tiga tab struktur pendukung, sebelas sistem fisiologi, 15 tanda bahaya, tiga trimester psikologi, dan perilaku template artikel.

Nama berkas aset mengikuti versi situs saat ekstraksi dan dapat berubah ketika prototype diperbarui. Dokumen ini merekam isi versi yang diperiksa pada tanggal di atas.
