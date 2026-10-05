import { supabase } from "@/data/supabase"
import { FAQ, JAWABAN_BINGUNG, JAWABAN_OFFLINE } from "@/features/chatbot/personality"

// ponytail: client tipis — online -> Edge Function `chat`, offline -> FAQ hangat lokal. API key tidak pernah di sini.

export type ChatReply = { answer: string; sources: string[]; escalate: boolean; offline: boolean }

function jawabOffline(pesan: string): string {
  const p = pesan.toLowerCase()
  for (const f of FAQ) if (f.kunci.some((k) => p.includes(k))) return f.jawab
  if (!navigator.onLine) return JAWABAN_OFFLINE
  return JAWABAN_BINGUNG
}

const perluEskalasi = (jawaban: string) => /fasyankes atau bidan sekarang/i.test(jawaban)
const berisiProsesInternal = /(?:^|\n)\s*(?:here['’]s a thinking process|thinking process:|chain.of.thought|analyze user input:|identify the core question|check rules?\s*&\s*constraints:|ringkasan skrining:|potongan guideline:)/i

export async function tanyaChatbot(pesan: string): Promise<ChatReply> {
  const teks = pesan.trim()
  if (!teks) throw new Error("pesan kosong")
  // offline -> FAQ lokal, tidak pernah gagal
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const j = jawabOffline(teks)
    return { answer: j, sources: [], escalate: perluEskalasi(j), offline: true }
  }
  try {
    const { data, error } = await supabase.functions.invoke("chat", { body: { message: teks } })
    if (error) throw error
    const answer = typeof data?.answer === "string" ? data.answer.trim() : ""
    if (!answer || berisiProsesInternal.test(answer)) throw new Error("respons chatbot tidak layak ditampilkan")
    return { answer, sources: (data.sources as string[]) ?? [], escalate: !!data.escalate, offline: false }
  } catch (e) {
    // online gagal (Edge Function belum deploy / belum login) -> fallback lokal biar UX tidak mati
    console.warn("[siba] invoke chat gagal, pakai FAQ lokal:", e)
    const j = jawabOffline(teks)
    return { answer: j, sources: [], escalate: perluEskalasi(j), offline: true }
  }
}
