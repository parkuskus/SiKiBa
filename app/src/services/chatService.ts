import { supabase } from "@/data/supabase"
import { FAQ, JAWABAN_BINGUNG, JAWABAN_KEAMANAN, JAWABAN_OFFLINE } from "@/features/chatbot/personality"

// ponytail: client tipis — online -> Edge Function `chat`, offline -> FAQ hangat lokal. API key tidak pernah di sini.

export type ChatReply = { answer: string; sources: string[]; escalate: boolean; offline: boolean; verified: boolean }

const normalisasiKata = (teks: string) => ` ${teks.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `

function jawabOffline(pesan: string): { answer: string; verified: boolean } {
  const p = normalisasiKata(pesan)
  for (const f of FAQ) {
    if (f.kunci.some((k) => p.includes(normalisasiKata(k)))) return { answer: f.jawab, verified: f.terverifikasiAhli === true }
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) return { answer: JAWABAN_OFFLINE, verified: false }
  return { answer: JAWABAN_BINGUNG, verified: false }
}

const perluEskalasi = (jawaban: string) => /fasyankes atau bidan sekarang/i.test(jawaban)
const berisiProsesInternal = /(?:^|\n)\s*(?:here['’]s a thinking process|let me think step by step|thinking process:|chain[- ]of[- ]thought|analyze user input:|identify the core question(?:\/intent)?:|check rules?\s*&\s*constraints:|(?:step|langkah)\s*\d+[.)]\s*(?:analyze|identify|check|analisis|periksa)|<think>|<analysis>)/i
const berisiLabelKeamanan = /^\s*(?:user safety\s*:|safety categories\s*:)/im

export async function tanyaChatbot(pesan: string): Promise<ChatReply> {
  const teks = pesan.trim()
  if (!teks) throw new Error("pesan kosong")
  // offline -> FAQ lokal, tidak pernah gagal
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const local = jawabOffline(teks)
    return { answer: local.answer, sources: [], escalate: perluEskalasi(local.answer), offline: true, verified: local.verified }
  }
  try {
    const { data, error } = await supabase.functions.invoke("chat", { body: { message: teks } })
    if (error) throw error
    const answer = typeof data?.answer === "string" ? data.answer.trim() : ""
    if (!answer || berisiProsesInternal.test(answer)) throw new Error("respons chatbot tidak layak ditampilkan")
    if (berisiLabelKeamanan.test(answer)) return { answer: JAWABAN_KEAMANAN, sources: [], escalate: false, offline: false, verified: false }
    return { answer, sources: (data.sources as string[]) ?? [], escalate: !!data.escalate, offline: false, verified: data.verified === true }
  } catch (e) {
    // online gagal (Edge Function belum deploy / belum login) -> fallback lokal biar UX tidak mati
    console.warn("[kira] invoke chat gagal, pakai FAQ lokal:", e)
    const local = jawabOffline(teks)
    return { answer: local.answer, sources: [], escalate: perluEskalasi(local.answer), offline: true, verified: local.verified }
  }
}
