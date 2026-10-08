import { useState } from "react"
import { ArrowLeft, Share2 } from "lucide-react"

type Props = {
  nomor: number
  label: string
  judul: string
  deskripsi: string
  onBack: () => void
  teksBagikan: string
}

export default function EdukasiDetailHeader({ nomor, label, judul, deskripsi, onBack, teksBagikan }: Props) {
  const [pesan, setPesan] = useState("")

  async function bagikan() {
    setPesan("")
    const url = new URL("?tab=edukasi", window.location.href).toString()
    try {
      if (navigator.share) {
        await navigator.share({ title: judul, text: teksBagikan, url })
        return
      }
      await navigator.clipboard.writeText(`${teksBagikan} ${url}`)
      setPesan("Tautan materi disalin.")
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      setPesan("Tautan belum dapat dibagikan. Coba lagi nanti.")
    }
  }

  return (
    <header className="rounded-b-[32px] bg-[#4A6E54] px-5 pb-8 pt-4 text-white">
      <div className="grid min-h-11 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3">
        <button type="button" onClick={() => { onBack(); window.scrollTo({ top: 0, behavior: "smooth" }) }} aria-label="Kembali ke materi edukasi" className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <div className="min-w-0 text-center">
          <p className="text-xs font-semibold leading-tight text-white/85">Materi {nomor}</p>
          <p className="mt-0.5 truncate text-sm font-bold leading-tight text-white">{label}</p>
        </div>
        <button type="button" onClick={() => void bagikan()} aria-label={`Bagikan materi ${label}`} className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <Share2 className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-6">
        <h1 className="!m-0 text-[30px] font-extrabold leading-[1.14] tracking-[-0.02em] text-white">{judul}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/95">{deskripsi}</p>
      </div>
      {pesan && <p role="status" className="mt-3 text-xs font-medium text-white">{pesan}</p>}
    </header>
  )
}
