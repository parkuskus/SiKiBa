import { supabase } from "@/data/supabase"
import { FAQ, JAWABAN_BINGUNG, JAWABAN_LUAR_TOPIK, JAWABAN_OFFLINE, TOPIK_SIAGA } from "@/features/chatbot/personality"

// ponytail: client tipis — online -> Edge Function `chat`, offline -> FAQ hangat lokal. API key tidak pernah di sini.

export type ChatReply = { answer: string; sources: string[]; escalate: boolean; offline: boolean; verified: boolean }

function jawabOffline(pesan: string): { answer: string; verified: boolean } {
  const p = pesan.toLowerCase()
  for (const f of FAQ) if (f.kunci.some((k) => p.includes(k))) return { answer: f.jawab, verified: f.terverifikasiAhli === true }
  if (typeof navigator !== "undefined" && !navigator.onLine) return { answer: JAWABAN_OFFLINE, verified: false }
  return { answer: JAWABAN_BINGUNG, verified: false }
}

const perluEskalasi = (jawaban: string) => /fasyankes atau bidan sekarang/i.test(jawaban)
const berisiProsesInternal = /(?:^|\n)\s*(?:here['’]s a thinking process|thinking process:|chain.of.thought|analyze user input:|identify the core question|check rules?\s*&\s*constraints:|ringkasan skrining:|potongan guideline:|analisis internal:|analisis input:|langkah penalaran:|<think>|<analysis>)/i

export async function tanyaChatbot(pesan: string): Promise<ChatReply> {
  const teks = pesan.trim()
  if (!teks) throw new Error("pesan kosong")
  if (!TOPIK_SIAGA.test(teks)) return { answer: JAWABAN_LUAR_TOPIK, sources: [], escalate: false, offline: false, verified: false }
  if (/siapa\s+(?:nama|kamu)|nama(?:mu| anda)/i.test(teks)) {
    return { answer: "Aku Siba, teman digital Bunda di SIAGA Bunda. Aku bisa membantu menjawab pertanyaan seputar kehamilan, masa nifas, dan bayi baru lahir.", sources: [], escalate: false, offline: false, verified: false }
  }
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
    return { answer, sources: (data.sources as string[]) ?? [], escalate: !!data.escalate, offline: false, verified: data.verified === true }
  } catch (e) {
    // online gagal (Edge Function belum deploy / belum login) -> fallback lokal biar UX tidak mati
    console.warn("[siba] invoke chat gagal, pakai FAQ lokal:", e)
    const local = jawabOffline(teks)
    return { answer: local.answer, sources: [], escalate: perluEskalasi(local.answer), offline: true, verified: local.verified }
  }
}
