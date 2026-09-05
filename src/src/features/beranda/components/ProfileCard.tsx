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

// S-02a ProfileCard — kartu profil hamil/nifas (judul di luar di BerandaPage)
export default function ProfileCard({ isPostpartum, uk, progress, countdown, hplLabel, gpa, onShowBirth, onBackToPregnant }: Props) {
  return (
    <Card className="rounded-[24px] border-0 bg-[#F0F5F1] ring-1 ring-[#EAE6E0] overflow-hidden">
      <CardContent className="p-4">
        {!isPostpartum ? (
          <>
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-white grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
                <CalendarDays className="size-4" />
              </div>
              <div>
                <p className="text-[15px] font-bold tracking-tight text-[#1E2326] leading-tight">Trimester {uk < 14 ? 1 : uk < 28 ? 2 : 3}, Minggu ke-{uk}</p>
                <p className="text-xs text-[#6C757D]">{uk} / 40 minggu · {progress}%</p>
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-white overflow-hidden ring-1 ring-black/5">
              <div className="h-full rounded-full bg-[#7AAE9A]" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-[#6C757D]">
              <span>{uk} dari 40 minggu</span>
              <span>{countdown} hari menuju perkiraan lahir</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                <p className="text-[11px] font-medium text-[#8A8F93]">GPA</p>
                <p className="text-sm font-semibold text-[#1E2326]">{gpa}</p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                <p className="text-[11px] font-medium text-[#8A8F93]">Perkiraan Lahir</p>
                <p className="text-sm font-semibold text-[#1E2326]">{hplLabel}</p>
              </div>
            </div>
            <button onClick={onShowBirth} className="mt-3 w-full text-center text-sm font-medium text-[#7AAE9A] underline decoration-[#7AAE9A]/25 underline-offset-4">
              Sudah melahirkan? Ketuk di sini
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-white grid place-items-center text-[#7AAE9A] ring-1 ring-[#EAE6E0]">
                <Baby className="size-4" />
              </div>
              <div>
                <p className="text-[20px] font-bold tracking-tight text-[#1E2326] leading-tight">Hari ke-2</p>
                <p className="text-xs text-[#6C757D]">Masa Nifas, perbanyak istirahat!</p>
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-white overflow-hidden ring-1 ring-black/5">
              <div className="h-full rounded-full bg-[#7AAE9A]" style={{ width: "5%" }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-[#6C757D]">
              <span>2 dari 42 hari</span>
              <span>40 hari lagi</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                <p className="text-[11px] font-medium text-[#8A8F93]">GPA</p>
                <p className="text-sm font-semibold text-[#1E2326]">{gpa}</p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#EAE6E0]">
                <p className="text-[11px] font-medium text-[#8A8F93]">Bayi</p>
                <p className="text-sm font-semibold text-[#1E2326]">3,2 kg, 49 cm</p>
              </div>
            </div>
            <p className="mt-3 text-center text-xs leading-relaxed text-[#6C757D]">Bayi lahir 30 Agustus, laki laki. Cek nifas dan bayi ada di menu Skrining.</p>
            <button onClick={onBackToPregnant} className="mt-2 w-full text-center text-xs font-semibold text-[#7AAE9A]">Kembali ke mode hamil</button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
