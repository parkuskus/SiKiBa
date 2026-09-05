import { Check, TriangleAlert, OctagonAlert, ArrowLeft, Share2, RotateCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Warna = "HIJAU" | "KUNING" | "MERAH"

type Props = {
  tipeLabel: string // e.g. "Faktor Risiko Kehamilan"
  warna: Warna
  kategori: string // e.g. "KRR", "KRS", "KRT" atau "Risiko Rendah" / "HIJAU"
  skor?: number | string
  skorLabel?: string // e.g. "Skor 2"
  faktorRisiko: string[]
  faktorAman?: string[] // kondisi normal / reassurance
  rekomendasi: string[] // numbered steps
  urgensiLabel: string // "Pantau mandiri" | "Kunjungi bidan" | "Segera ke IGD"
  waktuISO: string
  onUlangi: () => void
  onBeranda: () => void
  onBagikan: () => void
  onBack: () => void
}

const warnaConfig: Record<Warna, { bg: string; ring: string; iconBg: string; iconColor: string; title: string; desc: string }> = {
  HIJAU: {
    bg: "bg-[#EDF6EF]",
    ring: "ring-[#7ACB8A]/25",
    iconBg: "bg-[#1B8B4D]",
    iconColor: "text-white",
    title: "Kondisi aman",
    desc: "Semua parameter dalam batas normal. Lanjutkan pemantauan rutin.",
  },
  KUNING: {
    bg: "bg-[#FFF8EC]",
    ring: "ring-[#F5C16C]/25",
    iconBg: "bg-[#B7791F]",
    iconColor: "text-white",
    title: "Perlu perhatian",
    desc: "Ada faktor yang perlu dipantau lebih ketat. Hubungi bidan dalam 24 jam.",
  },
  MERAH: {
    bg: "bg-[#FDECEC]",
    ring: "ring-[#E57373]/20",
    iconBg: "bg-[#C62828]",
    iconColor: "text-white",
    title: "Perlu rujukan segera",
    desc: "Ditemukan tanda risiko tinggi. Segera ke fasilitas kesehatan.",
  },
}

export default function SkriningResultScreen({ tipeLabel, warna, kategori, skor, skorLabel, faktorRisiko, faktorAman = [], rekomendasi, urgensiLabel, waktuISO, onUlangi, onBeranda, onBagikan, onBack }: Props) {
  const cfg = warnaConfig[warna]
  const waktu = new Date(waktuISO).toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <div className="min-w-0">
          <p className="text-l font-medium  text-[#8A8F93] leading-none">Hasil Skrining</p>
          <h1 className="!m-0 text-[15px] font-bold tracking-tight text-[#1E2326] leading-tight text-wrap-balance">{tipeLabel}</h1>
        </div>
      </div>

      {/* Hero — status besar, bukan ghost-card side-stripe */}
      <div className={`rounded-[24px] p-5 ring-1 ${cfg.bg} ${cfg.ring}`}>
        <div className="flex gap-4">
          <div className={`grid size-12 shrink-0 place-items-center rounded-full ${cfg.iconBg} ${cfg.iconColor} shadow-sm`}>
            {warna === "HIJAU" ? <Check className="size-6" strokeWidth={2.5} /> : warna === "KUNING" ? <TriangleAlert className="size-6" strokeWidth={2} /> : <OctagonAlert className="size-6" strokeWidth={2} />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="!m-0 mt-1 text-[20px] font-extrabold tracking-tight text-[#1E2326] leading-none text-wrap-balance">{cfg.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#3C4245] text-wrap-pretty">{cfg.desc}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {skor !== undefined && (
                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1E2326] ring-1 ring-black/5">
                  {skorLabel?? `Skor ${skor}`}
                </span>
              )}
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${warna === "HIJAU" ? "bg-white text-[#2E7D32] ring-[#7ACB8A]/20" : warna === "KUNING" ? "bg-white text-[#8A6D00] ring-[#F5C16C]/25" : "bg-white text-[#C62828] ring-[#E57373]/20"}`}>
                {urgensiLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan faktor — bukan identical card grid, tapi list berirama */}
      <div className="grid gap-3">
        {/* Faktor risiko */}
        <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <h3 className="!m-0 text-lg font-bold tracking-tight text-[#1E2326]">Faktor yang teridentifikasi</h3>
              <span className="ml-auto text-xs font-medium text-[#8A8F93]">{faktorRisiko.length ? `${faktorRisiko.length} item` : ""}</span>
            </div>
            {faktorRisiko.length ? (
              <ul className="mt-3 space-y-2 pl-4">
                {faktorRisiko.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm leading-relaxed text-[#2E3436]">
                    <span className={`mt-[7px] size-1.5 shrink-0 rounded-full ${warna === "MERAH" ? "bg-[#E57373]" : warna === "KUNING" ? "bg-[#F5C16C]" : "bg-[#7ACB8A]"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-[#6C757D]">Tidak ada faktor risiko tambahan terdeteksi pada skrining ini.</p>
            )}
          </CardContent>
        </Card>

        {/* Kondisi normal / reassurance — hanya tampil jika ada */}
        {faktorAman.length > 0 && (
          <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <h3 className="!m-0 text-lg font-bold tracking-tight text-[#1E2326]">Kondisi normal</h3>
              </div>
              <ul className="mt-3 space-y-2 pl-4">
                {faktorAman.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm leading-relaxed text-[#2E3436]">
                    <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#7ACB8A]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Langkah tindak lanjut — numbered, bukan card grid */}
      <Card className="rounded-[20px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <h3 className="!m-0 text-lg font-bold tracking-tight text-[#1E2326]">Langkah Tindak Lanjut</h3>
          <p className="mt-1 text-xs font-medium text-[#6C757D]">{warna === "MERAH" ? "Lakukan segera, jangan tunda." : warna === "KUNING" ? "Lakukan dalam 24 jam." : "Lanjutkan pemantauan rutin."}</p>
          <ol className="mt-4 space-y-3">
            {rekomendasi.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#1E2326] text-xs font-bold text-white leading-none">{i + 1}</span>
                <p className="flex-1 pt-0.5 text-sm leading-relaxed text-[#2E3436] text-wrap-pretty">{step}</p>
              </li>
            ))}
          </ol>

          {warna === "MERAH" && (
            <div className="mt-4 rounded-2xl bg-[#FDECEC] p-3 ring-1 ring-[#E57373]/15">
              <p className="text-xs font-bold text-[#C62828]">Butuh bantuan cepat?</p>
              <p className="mt-1 text-xs leading-relaxed text-[#8A2A2A]">Hubungi bidan pendamping dan buka peta fasyankes terdekat dari menu bantuan. Bawa kartu skrining ini saat rujukan.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meta */}
      <p className="px-1 py-1 text-xs text-[#8A8F93]">Disimpan {waktu}</p>

      {/* Actions — hierarki jelas: primary Bagikan, secondary Ulangi/Beranda */}
      <div className="space-y-2 pt-1">
        <Button onClick={onBagikan} className="w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white py-6 text-sm font-semibold shadow-sm active:scale-[0.99] transition">
          <Share2 className="size-4" /> Bagikan ke bidan
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onUlangi} className="rounded-full bg-white py-6 ring-1 ring-[#EAE6E0] text-[#1E2326] font-semibold active:scale-[0.99] transition">
            <RotateCcw className="size-4" /> Ulangi
          </Button>
          <Button variant="outline" onClick={onBeranda} className="rounded-full bg-white py-6 ring-1 ring-[#EAE6E0] text-[#1E2326] font-semibold active:scale-[0.99] transition">
            <Home className="size-4" /> Beranda
          </Button>
        </div>
      </div>
    </div>
  )
}
