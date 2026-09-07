import { CalendarDays } from "lucide-react"
import { Card } from "@/components/ui/card"

type Props = {
  meds: { nama: string; waktu: string }[]
  nextAncLabel: string | null
}

// S-02d ReminderSnippet — hanya data asli: ANC + obat pengguna (default kosong)
export default function TodayReminderCard({ meds, nextAncLabel }: Props) {
  return (
    <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
      <div className="divide-y divide-[#F0F0F0]">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="size-10 rounded-full bg-[#E6F0FF] grid place-items-center text-[#4A6FA5] shrink-0">
            <CalendarDays className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Jadwal ANC</p>
            <p className="text-xs text-[#8A8F93] mt-1 truncate">{nextAncLabel ?? "Belum ada jadwal — atur di Reminder"}</p>
          </div>
        </div>
        {meds.length ? (
          meds.map((m) => (
            <div key={`${m.nama}|${m.waktu}`} className="flex items-center gap-3 px-4 py-3.5">
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#EAF2EC]">
                <img src="/illu/illu-obat.svg" alt="Obat" className="size-7 object-contain" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1E2326] leading-none truncate">{m.nama}</p>
                <p className="text-xs text-[#8A8F93] mt-1">Jam {m.waktu}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#F7F2EB]">
              <img src="/illu/illu-obat.svg" alt="Obat" className="size-7 object-contain opacity-60" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1E2326] leading-none">Belum ada pengingat obat</p>
              <p className="text-xs text-[#8A8F93] mt-1">Tambah di menu Reminder</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
