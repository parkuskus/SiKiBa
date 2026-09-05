import { ClipboardList, Weight, Bell, BookOpen } from "lucide-react"

type Props = {
  onSkrining: () => void
  onCatatBB: () => void
  onReminder: () => void
  onEdukasi: () => void
}

// S-02b QuickAction — 4 aksi cepat
export default function QuickActionGrid({ onSkrining, onCatatBB, onReminder, onEdukasi }: Props) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <button onClick={onSkrining} className="flex flex-col items-center gap-2 rounded-[20px] bg-white px-2 py-4 ring-1 ring-black/[0.05] shadow-sm active:scale-[0.98] transition">
        <span className="grid size-10 place-items-center rounded-full bg-[#EAF6EF] text-[#5A8A7A] ring-1 ring-[#7AAE9A]/15"><ClipboardList className="size-5" /></span>
        <span className="text-[11px] font-semibold leading-tight text-[#1E2326] text-center">Skrining</span>
      </button>
      <button onClick={onCatatBB} className="flex flex-col items-center gap-2 rounded-[20px] bg-white px-2 py-4 ring-1 ring-black/[0.05] shadow-sm active:scale-[0.98] transition">
        <span className="grid size-10 place-items-center rounded-full bg-[#FFF8EC] text-[#8A6D00] ring-1 ring-[#F5C16C]/20"><Weight className="size-5" /></span>
        <span className="text-[11px] font-semibold leading-tight text-[#1E2326] text-center">Catat BB</span>
      </button>
      <button onClick={onReminder} className="flex flex-col items-center gap-2 rounded-[20px] bg-white px-2 py-4 ring-1 ring-black/[0.05] shadow-sm active:scale-[0.98] transition">
        <span className="grid size-10 place-items-center rounded-full bg-[#FFF1E8] text-[#A66A3C] ring-1 ring-[#EAD8C8]"><Bell className="size-5" /></span>
        <span className="text-[11px] font-semibold leading-tight text-[#1E2326] text-center">Reminder</span>
      </button>
      <button onClick={onEdukasi} className="flex flex-col items-center gap-2 rounded-[20px] bg-white px-2 py-4 ring-1 ring-black/[0.05] shadow-sm active:scale-[0.98] transition">
        <span className="grid size-10 place-items-center rounded-full bg-[#EAF0FF] text-[#4A6FA5] ring-1 ring-[#C8D6F0]"><BookOpen className="size-5" /></span>
        <span className="text-[11px] font-semibold leading-tight text-[#1E2326] text-center">Edukasi</span>
      </button>
    </div>
  )
}
