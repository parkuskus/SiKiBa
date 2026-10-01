import { Baby, CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
  isPostpartum: boolean
  uk: number
  progress: number
  countdown: number
  hplLabel: string
  gpa: string
  onShowBirth: () => void
  onBackToPregnant: () => void
}

// S-02a + progress — kartu pekan putih (di stage) + kartu progress mint
export default function ProfileCard({ isPostpartum, uk, progress, countdown, hplLabel, gpa, onShowBirth, onBackToPregnant }: Props) {
  const trimester = uk < 14 ? 1 : uk < 28 ? 2 : 3
  if (isPostpartum) {
    return (
      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <p className="text-[11px] font-bold tracking-[0.08em] text-[#4A6E54]">MASA NIFAS</p>
          <div className="mt-2 flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-white grid place-items-center text-[#4A6E54] ring-1 ring-[#D9E7E2]">
              <Baby className="size-4" />
            </div>
            <div>
              <p className="text-[16px] font-bold tracking-tight text-[#1D2B29] leading-tight">Hari ke 2, 40 hari lagi</p>
              <p className="text-xs font-medium text-[#33443F]">Masa nifas · pemulihan</p>
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-[#EAF4F0] overflow-hidden">
            <div className="h-full rounded-full bg-[#4A6E54]" style={{ width: "5%" }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#EAF4F0] px-3 py-2.5">
              <p className="text-[11px] font-medium text-[#33443F]">GPA</p>
              <p className="text-sm font-semibold text-[#1D2B29]">{gpa}</p>
            </div>
            <div className="rounded-2xl bg-[#EAF4F0] px-3 py-2.5">
              <p className="text-[11px] font-medium text-[#33443F]">Bayi</p>
              <p className="text-sm font-semibold text-[#1D2B29]">3,2 kg, 49 cm</p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs leading-relaxed text-[#33443F]">Cek nifas dan bayi ada di menu Skrining.</p>
          <button onClick={onBackToPregnant} className="mt-2 w-full text-center text-xs font-semibold text-[#4A6E54]">Kembali ke mode hamil</button>
        </CardContent>
      </Card>
    )
  }
  return (
    <>
      <div className="w-full rounded-[24px] bg-[#EAF4F0] p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[#1D2B29]">Hamil Pekan Ke-{uk}</p>
          <p className="text-xs font-bold text-[#9D2553]">Trimester Ke-{trimester}</p>
        </div>
        <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-[#4A6E54]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-medium text-[#33443F]">
          <span>{uk} dari 40 minggu</span>
          <span>{countdown} hari menuju perkiraan lahir</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white px-3 py-2.5">
            <p className="flex items-center gap-1 text-[11px] font-medium text-[#33443F]"><CalendarDays className="size-3" /> GPA</p>
            <p className="text-sm font-semibold text-[#1D2B29]">{gpa}</p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2.5">
            <p className="text-[11px] font-medium text-[#33443F]">Perkiraan Lahir</p>
            <p className="text-sm font-semibold text-[#1D2B29]">{hplLabel}</p>
          </div>
        </div>
        <button onClick={onShowBirth} className="mt-3 w-full rounded-2xl bg-white px-3 py-2.5 text-center text-xs font-semibold text-[#33443F]">
          Sudah melahirkan? Ketuk di sini
        </button>
      </div>
    </>
  )
}
