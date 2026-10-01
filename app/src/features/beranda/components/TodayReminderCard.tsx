import { CalendarDays, Pill } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
  meds: { nama: string; waktu: string }[]
  nextAncLabel: string | null
}

// S-02d ReminderSnippet — kartu Hari ini + baris tile
export default function TodayReminderCard({ meds, nextAncLabel }: Props) {
  return (
    <Card className="rounded-[24px] border-0 bg-[#EAF4F0] ring-0 shadow-sm overflow-hidden">
      <CardContent className="py-1 space-y-2.5">
        <p className="text-[15px] font-bold text-[#1D2B29]">Hari ini</p>
        {meds.length ? (
          meds.map((m) => (
            <div key={`${m.nama}|${m.waktu}`} className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-[#1F7A6D]">
                <Pill className="size-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1D2B29] leading-tight truncate">{m.nama} {m.waktu} diminum</p>
                <p className="text-xs text-[#33443F] mt-0.5">Ketuk saat sudah minum</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-3 mt-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-[#1F7A6D]">
              <Pill className="size-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#1D2B29] leading-tight">Belum ada pengingat obat</p>
              <p className="text-xs text-[#33443F] mt-0.5">Tambah di menu Reminder</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-[#DB2777]">
            <CalendarDays className="size-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1D2B29] leading-tight truncate">{nextAncLabel ?? "Belum ada jadwal ANC"}</p>
            <p className="text-xs text-[#33443F] mt-0.5">{nextAncLabel ? "Siapkan berkas" : "Atur di menu Reminder"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
