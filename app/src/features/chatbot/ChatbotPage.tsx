import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowUp, Plus, Share2, X, MapPin, Siren, ShieldCheck } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { tanyaChatbot } from "@/services/chatService"
import { getCurrentUserId } from "@/data/currentUser"
import { shareViaWA } from "@/services/exportService"
import { AVATAR, GELAR, NAMA, PLACEHOLDER, TYPING, sapaAcak } from "@/features/chatbot/personality"

type Msg = { dari: "ibu" | "kira"; teks: string; verified?: boolean }

const TOPIK_CEPAT = ["Mual saat hamil", "Tanda bahaya", "Bayi kuning", "Rasa cemas"]

const markdownComponents = {
  p: ({ children }: { children?: ReactNode }) => <p className="m-0 whitespace-pre-wrap">{children}</p>,
  h1: ({ children }: { children?: ReactNode }) => <h3 className="mb-1 mt-3 text-base font-bold first:mt-0">{children}</h3>,
  h2: ({ children }: { children?: ReactNode }) => <h3 className="mb-1 mt-3 text-base font-bold first:mt-0">{children}</h3>,
  h3: ({ children }: { children?: ReactNode }) => <h3 className="mb-1 mt-2 text-sm font-bold first:mt-0">{children}</h3>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="my-1 list-disc space-y-1.5 pl-5">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="my-1 list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }: { children?: ReactNode }) => <em>{children}</em>,
  code: ({ children }: { children?: ReactNode }) => <code className="rounded bg-[#EAF4F0] px-1 py-0.5 font-mono text-[0.9em]">{children}</code>,
  a: ({ href, children }: { href?: string; children?: ReactNode }) =>
    href && /^https?:\/\//i.test(href)
      ? <a href={href} target="_blank" rel="noreferrer" className="font-medium text-[#4A6E54] underline underline-offset-2">{children}</a>
      : <>{children}</>,
}

function pisahkanSubjudul(teks: string): string {
  return teks
    .replace(/\n(?=\*\*[^*\n]+:\*\*\s*$)/gm, "\n\n")
    .replace(/^(\*\*[^*\n]+:\*\*)\n(?=\s*(?:[-*+]|\d+\.)\s)/gm, "$1\n\n")
    .replace(/\n(?=##?\s)/g, "\n\n")
}

export default function ChatbotPage({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ dari: "kira", teks: sapaAcak() }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine)
  const [emergency, setEmergency] = useState(false)
  const [shareError, setShareError] = useState(false)
  const messagesEnd = useRef<HTMLDivElement>(null)
  const composer = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [msgs, loading])

  async function kirim(text = input) {
    const pesan = text.trim()
    if (!pesan || loading) return
    setInput("")
    if (composer.current) composer.current.style.height = "48px"
    setMsgs((current) => [...current, { dari: "ibu", teks: pesan }])
    setLoading(true)
    try {
      const reply = await tanyaChatbot(pesan)
      setMsgs((current) => [...current, { dari: "kira", teks: reply.answer, verified: reply.verified }])
      if (reply.escalate) setEmergency(true)
    } catch {
      setMsgs((current) => [...current, { dari: "kira", teks: "Maaf Bunda, Kira belum bisa menjawab sekarang. Coba lagi sebentar lagi ya." }])
    } finally {
      setLoading(false)
    }
  }

  const mulaiBaru = () => {
    if (loading) return
    setMsgs([{ dari: "kira", teks: sapaAcak() }])
    setInput("")
    setEmergency(false)
    setShareError(false)
  }

  const bagikanKeBidan = async () => {
    setShareError(false)
    try {
      await shareViaWA(await getCurrentUserId())
    } catch {
      setShareError(true)
    }
  }

  const petaDarurat = "https://www.google.com/maps/search/?api=1&query=Puskesmas%20terdekat"

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#FFFCF6]">
      <header className="flex shrink-0 items-center gap-3 bg-[#4A6E54] px-4 py-3 text-white">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-white/40">
          <img src={AVATAR} alt="" aria-hidden="true" className="h-full w-full object-cover object-[50%_28%]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold leading-tight">{NAMA}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs leading-none text-white/90">
            <span className={`size-2 rounded-full ${online ? "bg-[#7ACB8A]" : "bg-[#F5C16C]"}`} />
            {online ? `${GELAR} · Online` : `${GELAR} · Offline`}
          </p>
        </div>
        <button onClick={mulaiBaru} disabled={loading} aria-label="Mulai obrolan baru" className="grid size-11 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/10 active:scale-95 disabled:opacity-50">
          <Plus className="size-5" />
        </button>
        <button onClick={onClose} aria-label="Tutup chat" className="grid size-11 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/10 active:scale-95">
          <X className="size-5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {msgs.map((message, index) => (
            <div key={`${index}-${message.dari}`} className={`flex items-start gap-2.5 ${message.dari === "ibu" ? "justify-end" : "justify-start"}`}>
              {message.dari === "kira" && <span aria-hidden className="mt-0.5 grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[#EAF4F0]"><img src={AVATAR} alt="" className="h-full w-full object-cover object-[50%_28%]" /></span>}
              <div className={`max-w-[90%] rounded-[20px] px-3.5 py-3 text-sm leading-relaxed ${message.dari === "ibu" ? "rounded-tr-[6px] bg-[#4A6E54] text-white" : "rounded-tl-[6px] bg-white text-[#1D2B29] ring-1 ring-[#D9E7E2] shadow-sm"}`}>
                {message.dari === "kira" ? (
                  <div className="space-y-1">
                    <ReactMarkdown components={markdownComponents}>{pisahkanSubjudul(message.teks)}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.teks}</p>
                )}
                {message.verified && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#EDF6EF] px-2 py-1 text-[11px] font-medium text-[#2E7D32]">
                    <ShieldCheck className="size-3.5" /> Jawaban Terverifikasi Ahli
                  </span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-2.5">
              <span aria-hidden className="mt-0.5 grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[#EAF4F0]"><img src={AVATAR} alt="" className="h-full w-full object-cover object-[50%_28%]" /></span>
              <div aria-live="polite" className="rounded-[20px] rounded-tl-[6px] bg-white px-3.5 py-3 text-xs text-[#33443F] ring-1 ring-[#D9E7E2]">
                {TYPING}
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>
      </div>

      {msgs.every((message) => message.dari === "kira") && !loading && (
        <div className="flex shrink-0 flex-wrap gap-2 px-3 pb-3">
          {TOPIK_CEPAT.map((topic) => (
            <button key={topic} type="button" onClick={() => void kirim(topic)} className="min-h-10 rounded-full bg-white px-3.5 text-xs font-semibold text-[#4A6E54] ring-1 ring-[#B8CFC3] transition-colors hover:bg-[#EAF4F0] active:scale-[0.98]">
              {topic}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={(event) => { event.preventDefault(); void kirim() }} className="flex shrink-0 items-center gap-2 border-t border-[#D9E7E2] bg-white px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <textarea
          ref={composer}
          rows={1}
          wrap="soft"
          value={input}
          onChange={(event) => {
            setInput(event.target.value)
            event.currentTarget.style.height = "auto"
            event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 128)}px`
          }}
          disabled={loading}
          aria-label="Pesan untuk Kira"
          placeholder={PLACEHOLDER}
          className="min-h-12 max-h-32 min-w-0 flex-1 resize-none overflow-y-auto rounded-[24px] border border-[#D9E7E2] bg-[#FFFCF6] px-4 py-3 text-sm leading-6 text-[#1D2B29] outline-none placeholder:text-[#6C757D] focus-visible:ring-2 focus-visible:ring-[#7AAE9A] disabled:opacity-60"
        />
        <button type="submit" disabled={loading || !input.trim()} aria-label="Kirim pesan" className="grid size-12 shrink-0 place-items-center rounded-full bg-[#4A6E54] text-white transition-colors hover:bg-[#3D5C46] active:scale-95 disabled:bg-[#D9E7E2] disabled:text-[#6C757D]">
          <ArrowUp className="size-5" />
        </button>
      </form>

      {emergency && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#1D2B29]/45 p-4" role="alertdialog" aria-modal="true" aria-labelledby="kira-emergency-title" aria-describedby="kira-emergency-description">
          <div className="w-full max-w-[360px] rounded-[24px] bg-white p-5 shadow-xl ring-1 ring-[#E57373]/40">
            <span className="grid size-12 place-items-center rounded-full bg-[#FDECEC] text-[#C62828]"><Siren className="size-6" /></span>
            <h2 id="kira-emergency-title" className="mt-3 text-lg font-bold text-[#1D2B29]">Segera cari bantuan</h2>
            <p id="kira-emergency-description" className="mt-1.5 text-sm leading-relaxed text-[#33443F]">Keluhan yang Bunda ceritakan bisa menjadi tanda bahaya. Segera hubungi bidan atau pergi ke IGD maupun puskesmas PONED terdekat.</p>
            {shareError && <p role="alert" className="mt-2 text-xs text-[#C62828]">Ringkasan belum dapat dibagikan. Coba lagi sebentar lagi.</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={petaDarurat} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#C62828] px-2 text-xs font-bold text-white"><MapPin className="size-3.5" /> Buka Peta</a>
              <button onClick={() => void bagikanKeBidan()} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#4A6E54] px-2 text-xs font-bold text-white"><Share2 className="size-3.5" /> Ke Bidan</button>
            </div>
            <button onClick={() => setEmergency(false)} className="mt-2 min-h-11 w-full rounded-full text-sm font-semibold text-[#4A6E54] hover:bg-[#EAF4F0]">Saya mengerti</button>
          </div>
        </div>
      )}
    </div>
  )
}
