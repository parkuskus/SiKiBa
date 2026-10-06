import { CalendarDays, Pill } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
  meds: { nama: string; waktu: string }[]
  nextAncLabel: string | null
  onOpen: () => void
}

// S-02d ReminderSnippet — kartu Hari ini + baris tile
export default function TodayReminderCard({ meds, nextAncLabel, onOpen }: Props) {
  if (!meds.length) return null
  return (
    <Card className="rounded-[24px] border-0 bg-[#EAF4F0] ring-0 shadow-sm overflow-hidden">
      <CardContent className="space-y-2.5">
        {meds.map((m) => (
            <button onClick={onOpen} key={`${m.nama}|${m.waktu}`} className="flex min-h-11 w-full items-center gap-3 text-left">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-[#1F7A6D]">
                <Pill className="size-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1D2B29] leading-tight truncate">{m.nama} pukul {m.waktu}</p>
                <p className="text-xs text-[#33443F] mt-0.5">Buka jadwal untuk mencatat status</p>
              </div>
            </button>
        ))}
        {nextAncLabel && <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-[#DB2777]">
            <CalendarDays className="size-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1D2B29] leading-tight truncate">{nextAncLabel}</p>
            <p className="text-xs text-[#33443F] mt-0.5">Siapkan berkas</p>
          </div>
        </div>}
      </CardContent>
    </Card>
  )
}
