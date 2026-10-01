import { ShieldCheck, TriangleAlert, OctagonAlert, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
  label: string
  dateLabel: string
  kategori?: string
  onLihat: () => void
}

// S-02c LastSkrCard — warna ikut kategori hasil terakhir
export default function LastCheckCard({ label, dateLabel, kategori, onLihat }: Props) {
  const tone =
    kategori === "MERAH"
      ? { card: "bg-[#FDECEC] ring-[#E57373]/30", iconBg: "bg-[#E57373]", icon: <OctagonAlert className="size-5 text-white" /> }
      : kategori === "KUNING"
        ? { card: "bg-[#FFF8EC] ring-[#F5C16C]/40", iconBg: "bg-[#F5C16C]", icon: <TriangleAlert className="size-5 text-white" /> }
        : { card: "bg-[#EDF6EF] ring-[#7ACB8A]/25", iconBg: "bg-[#7ACB8A]", icon: <ShieldCheck className="size-5 text-white" /> }
  return (
    <Card className={`rounded-[24px] border-0 ${tone.card} ring-1 shadow-sm overflow-hidden`}>
      <CardContent className="flex gap-3 items-center">
        <div className={`size-11 rounded-full ${tone.iconBg} grid place-items-center shrink-0`}>
          {tone.icon}
        </div>
        <button onClick={onLihat} className="min-w-0 flex-1 text-left">
          <p className="text-sm font-bold text-[#1D2B29] leading-tight truncate">{label}</p>
          <p className="text-xs text-[#33443F]">Tanggal terakhir skrining: {dateLabel}</p>
        </button>
        <ChevronRight className="size-5 text-[#1D2B29] shrink-0" />
      </CardContent>
    </Card>
  )
}
