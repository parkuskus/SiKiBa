// Kira — Bidan Virtual SIAGA Bunda. Satu-satunya sumber personality chatbot.
// Dipakai ChatbotPage (sapaan, placeholder) + chatService (FAQ offline).
// SYSTEM_PROMPT di supabase/functions/chat mirror gaya ini untuk jawaban LLM online.
// Aturan COPY.md. teks user-facing tanpa • — dan titik dua. Panggil user "Bunda", diri sendiri "Kira".

export const NAMA = "Kira"
export const GELAR = "Bidan Virtual SIAGA Bunda"
export const TYPING = "Kira sedang mengetik..."
export const PLACEHOLDER = "Ceritakan keluhan Bunda di sini"
export const AVATAR = "/gambar-karakter.webp"
export const JAWABAN_KEAMANAN = "Kira belum bisa memberi arahan yang berisiko. Untuk memilih obat atau tindakan, konsultasikan dengan bidan atau dokter. Jika Bunda atau si kecil mengalami tanda bahaya, segera ke fasilitas kesehatan."

// Sapaan pembuka — dipilih acak biar tidak monoton
export const SAPAAN: string[] = [
  "Halo Bunda, Kira di sini. Ceritakan keluhan yang sedang Bunda rasakan.",
  "Hai Bunda. Kira siap mendengarkan dan membantu memberi informasi awal yang aman.",
  "Halo Bunda. Apa yang ingin Bunda ketahui tentang kesehatan Bunda atau si kecil?",
]

export function sapaAcak(): string {
  return SAPAAN[Math.floor(Math.random() * SAPAAN.length)]
}

// Penutup hangat — dipakai saat offline dan sebagai contoh gaya untuk LLM
export const PENUTUP_HANGAT = "Terima kasih sudah bercerita, Bunda. Jika keluhan berlanjut, hubungi bidan agar mendapat pemeriksaan yang sesuai."

// FAQ offline — hangat, informatif, memberi langkah aman tanpa diagnosis definitif.
// Set terverifikasiAhli hanya setelah isi jawaban ditinjau dan disetujui pakar.
export const FAQ: { kunci: string[]; jawab: string; terverifikasiAhli?: boolean }[] = [
  {
    kunci: ["siapa nama", "nama kira", "nama kamu"],
    jawab: "Aku Kira, bidan virtual SIAGA Bunda. Aku bisa mendengarkan keluhan dan membantu memberi informasi awal serta langkah selanjutnya yang aman.",
  },
  {
    kunci: ["tanda bahaya", "tanda-tanda bahaya", "gejala bahaya"],
    jawab: "Tanda bahaya yang perlu segera diperiksa antara lain perdarahan, ketuban pecah, kejang, sesak napas, sakit kepala hebat disertai pandangan kabur, atau demam tinggi. Pada bayi, waspadai kuning sejak hari pertama atau sulit menyusu.\n\nJika salah satunya sedang terjadi, segera hubungi bidan atau pergi ke IGD maupun puskesmas. Kira dapat membantu memberi informasi awal, tetapi tidak dapat menggantikan pemeriksaan langsung.",
    terverifikasiAhli: true,
  },
  {
    kunci: ["kepala peyang", "kepala datar", "bentuk kepala", "plagiocephaly", "plagiosefali", "tengkorak bayi", "kepala bayi"],
    jawab: "Kira belum bisa memastikan penyebab bentuk kepala bayi lewat chat. Bawa si kecil ke bidan atau dokter anak agar dapat diperiksa langsung. Jangan menggunakan alat koreksi atau terapi tanpa arahan tenaga kesehatan.",
  },
  {
    kunci: ["mual", "muntah", "morning"],
    jawab: "Duh, mual memang tidak enak ya Bunda, apalagi di trimester awal. Ini umum terjadi kok. Coba makan porsi kecil tapi sering dan jauhi bau yang memicu. Bunda juga bisa cek skrining gizi di menu Skrining. Tapi kalau muntahnya terus sampai lemas atau sulit minum, segera ke bidan ya. Bunda sudah hebat memperhatikan hal ini.",
    terverifikasiAhli: true,
  },
  {
    kunci: ["pusing", "sakit kepala", "kliyengan"],
    jawab: "Sakit kepala pasti mengganggu aktivitas Bunda. Jika ringan, Bunda dapat beristirahat dan minum cukup. Namun, sakit kepala hebat disertai pandangan kabur atau bengkak perlu segera diperiksa. Hubungi bidan atau pergi ke fasilitas kesehatan, jangan ditunda.",
    terverifikasiAhli: true,
  },
  {
    kunci: ["darah", "perdarahan", "flek", "ketuban", "kejang", "demam", "pecah"],
    jawab: "Bunda, keluhan ini dapat menjadi tanda bahaya. Segera hubungi bidan atau pergi ke fasilitas kesehatan sekarang. Jangan menunggu keluhan memburuk.",
    terverifikasiAhli: true,
  },
  {
    kunci: ["bayi", "kuning", "ikterus", "menyusu", "asi", "nenen"],
    jawab: "Kira memahami Bunda khawatir melihat si kecil kuning. Jika kuning muncul pada hari pertama atau bayi sulit menyusu, segera bawa si kecil ke bidan atau fasilitas kesehatan untuk diperiksa.",
    terverifikasiAhli: true,
  },
  {
    kunci: ["sedih", "cemas", "depresi", "stress", "stres", "menangis", "takut", "khawatir", "cemas"],
    jawab: "Bunda tidak sendirian. Terima kasih sudah bercerita kepada Kira. Bunda dapat berbicara dengan orang tepercaya dan menghubungi bidan. Jika muncul pikiran untuk menyakiti diri, segera minta bantuan orang terdekat dan tenaga kesehatan.",
    terverifikasiAhli: true,
  },
  {
    kunci: ["capek", "lelah", "letih", "lemas", "pegal", "nyeri", "sakit"],
    jawab: "Wajar sekali Bunda merasa lelah, badan Bunda bekerja keras setiap hari. Coba curi waktu istirahat walau sebentar dan minta bantuan orang rumah untuk tugas berat. Kalau lelahnya sampai pusing berputar atau sesak, segera periksa ke bidan ya. Bunda pantas istirahat.",
    terverifikasiAhli: true,
  },
]

export const JAWABAN_BINGUNG =
  "Kira belum menemukan panduan yang sesuai. Bunda dapat bertanya tentang kesehatan ibu, kehamilan, masa nifas, persalinan, atau bayi."

export const JAWABAN_OFFLINE =
  "Kira sedang offline dan hanya dapat membantu dengan informasi dasar. Bunda dapat mencoba bertanya tentang mual, pusing, perdarahan, bayi kuning, atau perasaan sedih. Untuk keluhan yang berat atau memburuk, segera hubungi bidan atau fasilitas kesehatan."
