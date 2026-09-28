import { useState } from "react"
import { tanyaChatbot } from "@/services/chatService"
import { AVATAR, GELAR, NAMA, PLACEHOLDER, TYPING, sapaAcak } from "@/features/chatbot/personality"

// ponytail: S-09 — halaman Siba, Sahabat Bunda. Bubble hangat palet SIAGA (#6B8E73/#FFE2E2). FAB/panggil dari Beranda menyusul.

type Msg = { dari: "ibu" | "siba"; teks: string; offline?: boolean }

export default function ChatbotPage() {
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ dari: "siba", teks: sapaAcak() }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function kirim() {
    const t = input.trim()
    if (!t || loading) return
    setInput("")
    setMsgs((m) => [...m, { dari: "ibu", teks: t }])
    setLoading(true)
    try {
      const r = await tanyaChatbot(t)
      setMsgs((m) => [...m, { dari: "siba", teks: r.answer + (r.offline ? "\n\n(dikirim dalam mode offline)" : ""), offline: r.offline }])
      // TODO: jika r.escalate -> tampilkan overlay darurat + tombol S-08b (mirip hasil MERAH S-03g)
    } finally { setLoading(false) }
  }

  return (
    <div className="flex h-[70dvh] flex-col rounded-3xl bg-white p-3 ring-1 ring-[#FFE2E2]">
      <div className="flex items-center gap-2 border-b border-[#FFE2E2] pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFE2E2] text-lg">{AVATAR}</div>
        <div>
          <p className="text-sm font-bold text-[#3C4245]">{NAMA}</p>
          <p className="text-xs text-[#6C757D]">{GELAR} pendamping Bunda</p>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-1 pt-2">
        {msgs.map((m, i) => (
          <div key={i} className={m.dari === "ibu" ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[#6B8E73] px-3 py-2 text-sm text-white" : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-[#FFFDEC] px-3 py-2 text-sm text-[#3C4245] ring-1 ring-[#FFE2E2]"}>
            {m.teks}
          </div>
        ))}
        {loading && <div className="text-xs text-[#6C757D]">{TYPING}...</div>}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void kirim() }}
          placeholder={PLACEHOLDER} className="min-h-[44px] flex-1 rounded-2xl bg-[#FFFDEC] px-3 text-sm outline-none ring-1 ring-[#FFE2E2]" />
        <button onClick={() => void kirim()} disabled={loading} className="min-h-[44px] min-w-[44px] rounded-2xl bg-[#DB2777] px-4 text-sm font-bold text-white disabled:opacity-50">Kirim</button>
      </div>
    </div>
  )
}
