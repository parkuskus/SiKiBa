import { useState } from "react"
import { Activity, Baby, Droplets, Eye, Hand, Thermometer, Wind, Waves, Zap, type LucideIcon } from "lucide-react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { submitDangerSign } from "@/features/skrining/ibu-hamil/dangerSignForm"
import SkriningFormShell from "@/features/skrining/components/SkriningFormShell"

const GEJALA: { k: string; l: string; Icon: LucideIcon; tint?: boolean; hint?: string }[] = [
  { k: "perdarahan", l: "Perdarahan per vagina", Icon: Droplets, tint: true },
  { k: "nyeriKepalaHebat", l: "Nyeri kepala hebat", Icon: Zap },
  { k: "pandanganKabur", l: "Pandangan kabur", Icon: Eye },
  { k: "demamTinggi", l: "Demam di atas 38°C", Icon: Thermometer, hint: "Suhu tubuh lebih dari 38°C" },
  { k: "ketubanPecah", l: "Ketuban pecah dini", Icon: Waves, hint: "Cairan merembes sebelum waktunya" },
  { k: "nyeriAbdomenHebat", l: "Nyeri perut hebat menetap", Icon: Activity },
  { k: "bengkakWajahTangan", l: "Bengkak wajah dan tangan", Icon: Hand },
  { k: "gerakanJaninBerkurang", l: "Gerakan janin berkurang", Icon: Baby, hint: "Kurang dari 10 kali dalam 2 jam" },
  { k: "sesakNapas", l: "Sesak napas mendadak", Icon: Wind },
]

export default function DangerSignScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (r: any) => void }) {
  const [form, setForm] = useState<Record<string, boolean>>({
    perdarahan: false,
    pandanganKabur: false,
    nyeriAbdomenHebat: false,
    bengkakWajahTangan: false,
    gerakanJaninBerkurang: false,
    demamTinggi: false,
    ketubanPecah: false,
    sesakNapas: false,
  })
  const [nyeriSkala, setNyeriSkala] = useState(0)
  const [tdTinggi, setTdTinggi] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (k: string) => {
    if (k === "nyeriKepalaHebat") {
      setNyeriSkala((current) => current >= 4 ? 0 : 4)
      return
    }
    setForm((s) => {
      const next = { ...s, [k]: !s[k] }
      if (k === "bengkakWajahTangan" && s[k]) setTdTinggi(false)
      return next
    })
  }

  const handle = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await submitDangerSign({
        userId: await getCurrentUserId(),
        ...form,
        nyeriKepalaHebat: nyeriSkala >= 4,
        nyeriKepalaSkala: nyeriSkala,
        tdTinggi: form.bengkakWajahTangan ? tdTinggi : undefined,
      } as never)
      onSuccess(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SkriningFormShell title="Tanda Bahaya" subtitle="Cek mandiri tanda bahaya" onBack={onBack}>
      <div className="space-y-2.5">
        <p className="px-1 text-[13px] text-[#33443F]">Tandai gejala yang Bunda rasakan</p>
        {GEJALA.map((item, index) => {
          const checked = item.k === "nyeriKepalaHebat" ? nyeriSkala >= 4 : !!form[item.k]
          const Icon = item.Icon
          return (
            <div key={item.k}>
              <div className="flex min-h-16 items-center gap-2.5 rounded-[20px] bg-[#EAF4F0] px-2.5 py-2">
                <span className={`grid size-10 shrink-0 place-items-center rounded-[14px] ${item.tint ? "bg-[#FFE2E2] text-[#DB2777]" : "bg-white text-[#7AAE9A]"}`}>
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold leading-tight text-[#1D2B29]">{item.l}</span>
                  {item.hint && <span className="mt-0.5 block text-[11px] leading-tight text-[#33443F]">{item.hint}</span>}
                </span>
                <div className="flex shrink-0 gap-1.5">
                  {[true, false].map((choice) => (
                    <button
                      key={String(choice)}
                      type="button"
                      aria-pressed={checked === choice}
                      onClick={() => checked !== choice && toggle(item.k)}
                      className={`min-h-11 min-w-11 rounded-[14px] px-2 text-xs font-semibold transition-colors active:scale-95 ${checked === choice ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`}
                    >
                      {choice ? "Ya" : "Tidak"}
                    </button>
                  ))}
                </div>
              </div>
              {item.k === "bengkakWajahTangan" && checked && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-[18px] bg-white p-3 ring-1 ring-[#D9E7E2]">
                  <p className="text-xs font-semibold text-[#1D2B29]">Tekanan darah 140/90 atau lebih?</p>
                  <div className="flex gap-1.5">
                    {[true, false].map((choice) => (
                      <button key={String(choice)} type="button" aria-pressed={tdTinggi === choice} onClick={() => setTdTinggi(choice)} className={`min-h-11 min-w-11 rounded-[14px] px-2 text-xs font-semibold ${tdTinggi === choice ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`}>
                        {choice ? "Ya" : "Tidak"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {index === 4 && <p className="py-1 text-xs text-[#33443F]">Masih ada 4 gejala lain di bawah</p>}
            </div>
          )
        })}
        {error && <p role="alert" className="text-center text-xs text-[#C62828]">{error}</p>}
        <Button className="min-h-12 w-full rounded-full bg-[#4A6E54] text-base font-bold text-white hover:bg-[#3D5C46]" disabled={loading} onClick={handle}>
          {loading ? "Menyimpan" : "Lihat hasil"}
        </Button>
        <p className="pb-1 text-xs text-[#33443F]">Satu tanda Ya langsung status bahaya</p>
      </div>
    </SkriningFormShell>
  )
}
