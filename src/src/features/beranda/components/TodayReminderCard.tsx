import { CalendarDays, Bell, Pill } from "lucide-react"
import { Card } from "@/components/ui/card"

type Props = {
  supJam: string | null
  nextAncLabel: string | null
}

// S-02d ReminderSnippet — daftar reminder harian (ANC + suplemen + minum air)
export default function TodayReminderCard({ supJam, nextAncLabel }: Props) {
  return (
    <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
      <div className="divide-y divide-[#F0F0F0]">
        {nextAncLabel ? (
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="size-10 rounded-full bg-[#E6F0FF] grid place-items-center text-[#4A6FA5] shrink-0">
              <CalendarDays className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1E2326] leading-none">Jadwal ANC</p>
              <p className="text-xs text-[#8A8F93] mt-1 truncate">{nextAncLabel}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="size-10 rounded-full bg-[#E6F0FF] grid place-items-center text-[#4A6FA5] shrink-0">
              <CalendarDays className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1E2326] leading-none">Jadwal ANC</p>
              <p className="text-xs text-[#8A8F93] mt-1">Belum ada jadwal — atur di Reminder</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="size-10 rounded-full bg-[#E6F3EC] grid place-items-center text-[#5A8A7A] shrink-0">
            <Pill className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Konsumsi Suplemen</p>
            <p className="text-xs text-[#8A8F93] mt-1">Tablet Fe · jam {supJam ?? "19.00"} · setelah makan malam</p>
          </div>
          <span className="rounded-full bg-[#EAF2EC] px-2.5 py-1 text-xs font-semibold text-[#5A8A7A]">Aktif</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="size-10 rounded-full bg-[#FFF8EC] grid place-items-center text-[#8A6D00] shrink-0">
            <Bell className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Minum Air</p>
            <p className="text-xs text-[#8A8F93] mt-1">Target 8 gelas hari ini</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
