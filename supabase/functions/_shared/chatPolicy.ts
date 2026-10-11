export const JAWABAN_DARURAT = "Keluhan ini dapat menjadi tanda bahaya. Segera hubungi bidan atau pergi ke IGD maupun puskesmas PONED terdekat. Jangan menunda mencari pertolongan."

const TANDA_BAHAYA = /perdarahan|keluar darah|flek banyak|ketuban.{0,12}(?:pecah|rembes|bocor)|kejang|sesak napas|sulit bernapas|pingsan|(?:nyeri|sakit) kepala hebat|pandangan.{0,12}kabur|kabur.{0,12}pandangan|(?:nyeri|sakit) perut hebat|demam tinggi|bayi.{0,40}(?:kuning.{0,25}(?:hari pertama|baru lahir|24 jam|\bjam pertama\b)|(?:tidak mau|malas|sulit).{0,12}(?:menyusu|minum)|sangat lemas)/i
const TANYA_HASIL_MERAH = /(?:hasil|skor|kategori|skrining).{0,30}merah|merah.{0,30}(?:hasil|skor|kategori|skrining)/i

function isEmergencyReport(message: string) {
  const text = message.trim()
  const educationalQuestion = /^(?:apa itu|apa saja|apa yang dimaksud|sebutkan|jelaskan|arti|maksud|tanda bahaya|gejala bahaya|apakah\b|bagaimana cara mengenali)\b/i.test(text)
  const personalContext = /\b(?:saya|aku|bunda saya|ibu saya|bayi saya|anak saya|si kecil saya|saat ini|mengalami|merasakan|keluar darah|ketuban pecah|tidak merasakan gerakan)\b/i.test(text)
  if (educationalQuestion && !personalContext) return false
  return TANDA_BAHAYA.test(text)
}

export function shouldEscalate(message: string, hasRedResult = false) {
  return isEmergencyReport(message) || (hasRedResult && TANYA_HASIL_MERAH.test(message))
}

export function quickChatReply(message: string): { answer: string; verified: boolean; escalate: boolean } | null {
  const text = message.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
  if (!text) return null
  if (shouldEscalate(message)) return { answer: JAWABAN_DARURAT, verified: false, escalate: true }
  if (/^(halo|hai|hi|assalamualaikum|assalamu alaikum|selamat pagi|selamat siang|selamat sore|selamat malam)$/.test(text)) {
    return { answer: "Halo Bunda. Kira siap membantu informasi kesehatan ibu dan bayi.", verified: false, escalate: false }
  }
  if (/^(siapa nama kamu|siapa namamu|nama kamu siapa|siapa kamu)$/.test(text)) {
    return { answer: "Aku Kira, bidan virtual SIAGA Bunda. Aku membantu memberi informasi awal dan langkah selanjutnya yang aman.", verified: false, escalate: false }
  }
  return null
}

export function retrievalTerms(message: string): string[] {
  const stopWords = new Set([
    "yang", "dan", "atau", "apa", "untuk", "saya", "aku", "bunda", "ibu", "hamil", "bayi",
    "dengan", "dari", "pada", "ini", "itu", "bila", "jika", "saat", "sejak", "sedang",
    "mengalami", "merasakan", "terasa", "terjadi", "dilakukan", "bagaimana", "kapan", "kenapa", "apakah",
    "bisa", "tolong", "sekarang", "harus", "tidak", "bukan", "belum", "ada", "sudah",
    "lebih", "kurang", "karena", "dalam", "oleh", "keluar", "muncul", "menjadi", "terus",
  ])
  return [...new Set(message.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/)
    .filter((term) => term.length >= 3 && !stopWords.has(term)))].slice(0, 10)
}
