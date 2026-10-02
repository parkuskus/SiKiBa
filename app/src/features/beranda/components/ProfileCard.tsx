import { Baby, CalendarDays } from "lucide-react"

type Props = {
  isPostpartum: boolean
  hariNifas: number
  beratLahir: number | null
  panjangLahir: number | null
  uk: number
  progress: number
  countdown: number
  hplLabel: string
  gpa: string
  onShowBirth: () => void
  onBackToPregnant: () => void
}

// S-02a + progress — kartu pekan putih (di stage) + kartu progress mint
export default function ProfileCard({ isPostpartum, hariNifas, beratLahir, panjangLahir, uk, progress, countdown, hplLabel, gpa, onShowBirth, onBackToPregnant }: Props) {
  const trimester = uk < 14 ? 1 : uk < 28 ? 2 : 3
  if (isPostpartum) {
    const hariTersisa = Math.max(0, 42 - hariNifas)
    const progressNifas = Math.min(100, (hariNifas / 42) * 100)
    const ukuranBayi = beratLahir !== null && panjangLahir !== null
      ? `${(beratLahir / 1000).toFixed(1)} kg, ${panjangLahir} cm`
      : "Belum diisi"
    return (
      <div className="w-full space-y-3 rounded-[24px] bg-[#EAF4F0] p-4">
        <p className="text-xs font-bold tracking-[0.08em] text-[#4A6E54]">MASA NIFAS</p>
        <div className="flex items-center gap-2.5">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#4A6E54] ring-1 ring-[#D9E7E2]">
              <Baby className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight text-[#1D2B29]">Hari ke {hariNifas}, {hariTersisa} hari lagi</p>
              <p className="mt-0.5 text-xs font-medium text-[#33443F]">Masa nifas, pemulihan</p>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-[#4A6E54] transition-[width]" style={{ width: `${progressNifas}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 rounded-[18px] bg-white px-3 py-2.5">
              <p className="text-xs text-[#33443F]">GPA</p>
              <p className="mt-0.5 truncate text-[15px] font-semibold leading-tight text-[#1D2B29]">{gpa}</p>
            </div>
            <div className="min-w-0 rounded-[18px] bg-white px-3 py-2.5">
              <p className="text-xs text-[#33443F]">Bayi</p>
              <p className="mt-0.5 truncate text-[15px] font-semibold leading-tight text-[#1D2B29]">{ukuranBayi}</p>
            </div>
          </div>
          <p className="text-center text-xs leading-relaxed text-[#33443F]">Cek nifas dan bayi ada di Skrining.</p>
          <button onClick={onBackToPregnant} className="min-h-11 w-full rounded-[16px] bg-white px-3 text-sm font-semibold text-[#4A6E54] transition-colors hover:bg-[#F7FAF8] active:scale-[0.99]">Kembali ke mode hamil</button>
      </div>
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
