import { useId } from "react"
import { MapPin, Share2, Siren } from "lucide-react"

type Props = {
  description: string
  mapsQuery: string
  onShare: () => void
  onDismiss: () => void
  shareError?: string
}

export default function EmergencyOverlay({ description, mapsQuery, onShare, onDismiss, shareError }: Props) {
  const id = useId()
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-[#1D2B29]/45 p-4" role="alertdialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
      <div className="w-full max-w-[360px] rounded-[24px] bg-white p-5 shadow-xl ring-1 ring-[#E57373]/40">
        <span className="grid size-12 place-items-center rounded-full bg-[#FDECEC] text-[#C62828]"><Siren className="size-6" /></span>
        <h2 id={`${id}-title`} className="mt-3 text-lg font-bold text-[#1D2B29]">Segera cari bantuan</h2>
        <p id={`${id}-description`} className="mt-1.5 text-sm leading-relaxed text-[#33443F]">{description}</p>
        {shareError && <p role="alert" className="mt-2 text-xs text-[#C62828]">{shareError}</p>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#C62828] px-2 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E1F1F]">
            <MapPin className="size-3.5" /> Buka Peta
          </a>
          <button onClick={onShare} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#4A6E54] px-2 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]">
            <Share2 className="size-3.5" /> Ke Bidan
          </button>
        </div>
        <button onClick={onDismiss} className="mt-2 min-h-11 w-full rounded-full text-sm font-semibold text-[#4A6E54] hover:bg-[#EAF4F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]">Saya mengerti</button>
      </div>
    </div>
  )
}
