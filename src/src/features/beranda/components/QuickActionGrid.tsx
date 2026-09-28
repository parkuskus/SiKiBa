import { ClipboardList, Weight, Bell, BookOpen } from "lucide-react"

type Props = {
  onSkrining: () => void
  onCatatBB: () => void
  onReminder: () => void
  onEdukasi: () => void
}

// S-02b QuickAction — 4 tile warna + label 12px
const tile = "grid size-16 place-items-center rounded-[20px] transition active:scale-[0.98]"
export default function QuickActionGrid({ onSkrining, onCatatBB, onReminder, onEdukasi }: Props) {
  const items = [
    { label: "Skrining", onClick: onSkrining, icon: <ClipboardList className="size-7" />, tileBg: "bg-[#FFE2E2]", iconColor: "text-[#DB2777]" },
    { label: "Catat BB", onClick: onCatatBB, icon: <Weight className="size-7" />, tileBg: "bg-[#FFF1E8]", iconColor: "text-[#9A5B00]" },
    { label: "Reminder", onClick: onReminder, icon: <Bell className="size-7" />, tileBg: "bg-[#DFF0EA]", iconColor: "text-[#16685C]" },
    { label: "Edukasi", onClick: onEdukasi, icon: <BookOpen className="size-7" />, tileBg: "bg-[#E2EFEA]", iconColor: "text-[#DB2777]" },
  ]
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((it) => (
        <button key={it.label} onClick={it.onClick} className="flex flex-col items-center gap-1.5">
          <span className={`${tile} ${it.tileBg} ${it.iconColor}`}>{it.icon}</span>
          <span className="text-xs font-medium leading-tight text-[#33443F] text-center">{it.label}</span>
        </button>
      ))}
    </div>
  )
}
