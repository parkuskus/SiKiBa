import { useEffect } from "react"
import { Check, TriangleAlert, OctagonAlert, Share2, RotateCcw, Home, MapPin, Siren } from "lucide-react"
import { Button } from "@/components/ui/button"

type Warna = "HIJAU" | "KUNING" | "MERAH"

type Props = {
  tipeLabel: string
  warna: Warna
  kategori: string
  skor?: number | string
  skorLabel?: string
  faktorRisiko: string[]
  faktorAman?: string[]
  rekomendasi: string[]
  urgensiLabel: string
  waktuISO: string
  mapsQuery?: string
  onUlangi: () => void
  onBeranda: () => void
  onBagikan: () => void
}

const status: Record<Warna, {
  title: string
  badge: string
  icon: typeof Check
  factorTitle: string
  factorCard: string
  factorDot: string
  number: string
}> = {
  HIJAU: {
    title: "Kondisi aman",
    badge: "AMAN",
    icon: Check,
    factorTitle: "Kondisi aman",
    factorCard: "bg-[#EDF6EF] ring-[#7ACB8A]/50",
    factorDot: "bg-[#2E7D32]",
    number: "bg-[#4A6E54]",
  },
  KUNING: {
    title: "Perlu perhatian",
    badge: "WASPADA",
    icon: TriangleAlert,
    factorTitle: "Faktor ditemukan",
    factorCard: "bg-[#FFF8EC] ring-[#F5C16C]",
    factorDot: "bg-[#B7791F]",
    number: "bg-[#4A6E54]",
  },
  MERAH: {
    title: "Perlu rujukan segera",
    badge: "BAHAYA",
    icon: OctagonAlert,
    factorTitle: "Tanda bahaya ditemukan",
    factorCard: "bg-[#FDECEC] ring-[#E57373]",
    factorDot: "bg-[#C62828]",
    number: "bg-[#C62828]",
  },
}

export default function SkriningResultScreen({
  tipeLabel,
  warna,
  kategori,
  skor,
  skorLabel,
  faktorRisiko,
  faktorAman = [],
  rekomendasi,
  urgensiLabel,
  waktuISO,
  mapsQuery,
  onUlangi,
  onBeranda,
  onBagikan,
}: Props) {
  const cfg = status[warna]
  const Icon = cfg.icon
  const factors = warna === "HIJAU"
    ? (faktorAman.length ? faktorAman : ["Tidak ada faktor risiko tambahan yang teridentifikasi."])
    : (faktorRisiko.length ? faktorRisiko : [warna === "MERAH" ? "Tanda bahaya memerlukan pemeriksaan segera." : "Hasil perlu dipantau lebih lanjut."])
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery || "puskesmas PONED terdekat")}`
  const checkedDate = new Date(waktuISO).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
  const score = skorLabel
    ? skorLabel.replace(/\s*·\s*/, " (") + (skorLabel.includes("·") ? ")" : "")
    : skor !== undefined ? `Skor ${skor} (${kategori})` : kategori

  useEffect(() => {
    if (warna !== "MERAH") return
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("SIAGA Bunda: perlu rujukan segera", { body: `${tipeLabel} — ${kategori}. Segera ke fasyankes.` })
      }
    } catch {}
  }, [warna, tipeLabel, kategori])

  return (
    <div className="-mx-4 -mt-5 flex min-h-[100dvh] flex-col bg-[#FFFCF6]">
      <header className="mx-auto flex w-full max-w-[480px] shrink-0 flex-col items-center rounded-b-[32px] bg-[#4A6E54] px-6 pb-6 pt-6 text-center text-white">
        <h1 className="!m-0 text-xl font-bold leading-tight">Hasil Skrining</h1>
        <div className="mt-2.5 grid size-[120px] place-content-center gap-1 rounded-full bg-white text-[#33443F]">
          <Icon className={`mx-auto size-8 ${warna === "HIJAU" ? "text-[#2E7D32]" : warna === "KUNING" ? "text-[#B7791F]" : "text-[#C62828]"}`} strokeWidth={2.2} />
          <span className={`text-xs font-extrabold ${warna === "HIJAU" ? "text-[#2E7D32]" : warna === "KUNING" ? "text-[#8A5B0A]" : "text-[#C62828]"}`}>{cfg.badge}</span>
        </div>
        <p className="mt-2 text-sm font-bold leading-normal">{score}</p>
        <p className="text-xs leading-normal text-white/90">{tipeLabel}</p>
      </header>

      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-3.5 px-6 pb-5 pt-5">
        <section className={`rounded-[24px] p-3.5 ring-1 ${cfg.factorCard}`}>
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">{cfg.factorTitle}</h2>
          <ul className="mt-2 space-y-1.5">
            {factors.map((factor) => (
              <li key={factor} className="flex gap-2 text-xs leading-relaxed text-[#33443F]">
                <span className={`mt-[5px] size-2 shrink-0 rounded-full ${cfg.factorDot}`} />
                <span className="min-w-0">{factor}</span>
              </li>
            ))}
          </ul>
          {warna !== "HIJAU" && faktorAman.length > 0 && (
            <p className="mt-2 border-t border-black/5 pt-2 text-xs leading-relaxed text-[#33443F]">{faktorAman.join(", ")}</p>
          )}
        </section>

        <section className="rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Langkah berikutnya</h2>
          <p className="mt-1 text-xs font-semibold text-[#33443F]">{urgensiLabel}</p>
          <ol className="mt-3 space-y-2.5">
            {rekomendasi.map((step, index) => (
              <li key={`${index}-${step}`} className="flex items-start gap-2.5">
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${cfg.number}`}>{index + 1}</span>
                <p className="min-w-0 flex-1 pt-1 text-xs leading-relaxed text-[#33443F]">{step}</p>
              </li>
            ))}
          </ol>

          {warna === "MERAH" && (
            <div className="mt-3 rounded-[18px] bg-[#FDECEC] p-3 ring-1 ring-[#E57373]">
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#8E1F1F]"><Siren className="size-4" /> Darurat, jangan tunda</p>
              <p className="mt-1 text-xs leading-relaxed text-[#6D2525]">Segera menuju IGD atau puskesmas PONED terdekat. Bawa KTP, buku KIA, dan hasil ini.</p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-[#C62828] px-2 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E1F1F]">
                  <MapPin className="size-3.5" /> Buka Peta
                </a>
                <button onClick={onBagikan} className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-white px-2 text-xs font-bold text-[#8E1F1F] ring-1 ring-[#E57373] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E1F1F]">
                  <Share2 className="size-3.5" /> Ke Bidan
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="px-1 text-xs text-[#6C757D]">Diperiksa {checkedDate}</p>
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="outline" onClick={onUlangi} className="min-h-[46px] rounded-full border-[#D9E7E2] bg-white text-[#33443F]">
            <RotateCcw className="size-4" /> Ulangi
          </Button>
          <Button onClick={onBeranda} className="min-h-[46px] rounded-full bg-[#4A6E54] font-bold text-white hover:bg-[#3D5C46]">
            <Home className="size-4" /> Beranda
          </Button>
        </div>
        <Button onClick={onBagikan} className="min-h-11 w-full rounded-full bg-[#FFE2E2] font-bold text-[#9D2553] hover:bg-[#FFCFCF]">
          <Share2 className="size-4" /> Bagikan ke Bidan
        </Button>
      </main>

      <div className="relative mx-auto mt-auto w-full max-w-[480px]">
        <img src="/illu/illu-11-florist-2.png" alt="" aria-hidden className="pointer-events-none w-full select-none object-cover" />
      </div>
    </div>
  )
}
