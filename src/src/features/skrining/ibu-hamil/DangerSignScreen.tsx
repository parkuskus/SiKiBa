import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { submitDangerSign } from "@/features/skrining/ibu-hamil/dangerSignForm"

const GEJALA: { k: string; l: string; hint?: string }[] = [
  { k: "perdarahan", l: "Perdarahan per vagina" },
  { k: "pandanganKabur", l: "Pandangan kabur atau berkunang" },
  { k: "nyeriAbdomenHebat", l: "Nyeri perut hebat menetap" },
  { k: "bengkakWajahTangan", l: "Bengkak wajah dan tangan" },
  { k: "gerakanJaninBerkurang", l: "Gerakan janin berkurang", hint: "Kurang dari 10 kali dalam 2 jam" },
  { k: "demamTinggi", l: "Demam tinggi", hint: "Suhu di atas 38°C" },
  { k: "ketubanPecah", l: "Ketuban pecah", hint: "Cairan merembes sebelum waktunya" },
  { k: "sesakNapas", l: "Sesak napas mendadak" },
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
  const [nyeriSkala, setNyeriSkala] = useState<number | null>(null)
  const [tdTinggi, setTdTinggi] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (k: string) => {
    setForm((s) => {
      const next = { ...s, [k]: !s[k] }
      if (k === "bengkakWajahTangan" && s[k]) setTdTinggi(false)
      return next
    })
  }

  const handle = async () => {
    setError(null)
    if (nyeriSkala === null) return setError("Pilih skala nyeri kepala")
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
    <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
      <CardContent className="space-y-5 p-5">
        <div>
          <p className="text-[16px] font-bold tracking-tight text-[#1E2326]">Tanda Bahaya Kehamilan</p>
          <p className="mt-1 text-xs leading-relaxed text-[#8A8F93]">Centang yang Bunda rasakan saat ini. Kosongkan bila tidak ada.</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#1E2326]">Nyeri kepala (skala 0–5)</p>
          <div className="grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setNyeriSkala(v)}
                className={`rounded-full py-2.5 text-sm font-semibold ring-1 transition-colors active:scale-[0.98] ${nyeriSkala === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#1E2326]">Gejala lain</p>
          {GEJALA.map((it) => {
            const checked = !!form[it.k]
            return (
              <div key={it.k}>
                <button
                  type="button"
                  onClick={() => toggle(it.k)}
                  className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-sm ring-1 transition-colors active:scale-[0.99] ${checked ? "bg-[#7AAE9A] font-semibold text-white ring-[#7AAE9A]" : "bg-white text-[#1E2326] ring-[#EAE6E0] hover:bg-[#FFFCF6]"}`}
                >
                  <span className={`grid size-4 shrink-0 place-items-center rounded-[5px] ring-1 ${checked ? "bg-white ring-white" : "bg-white ring-[#C2C8CB]"}`}>
                    {checked && (
                      <svg viewBox="0 0 10 8" className="size-2.5 fill-none stroke-[#1E2326] stroke-2">
                        <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="leading-tight">
                    {it.l}
                    {it.hint && <span className={`block text-[11px] font-normal ${checked ? "text-white/85" : "text-[#8A8F93]"}`}>{it.hint}</span>}
                  </span>
                </button>
                {it.k === "bengkakWajahTangan" && checked && (
                  <div className="ml-4 mt-2 space-y-2 rounded-2xl bg-[#FFFCF6] p-3 ring-1 ring-[#EAE6E0]">
                    <p className="text-xs font-semibold text-[#1E2326]">Tekanan darah ≥140/90?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setTdTinggi(true)} className={`rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${tdTinggi ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>Ya</button>
                      <button type="button" onClick={() => setTdTinggi(false)} className={`rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${!tdTinggi ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>Tidak</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {error && <p className="text-center text-xs text-[#E57373]">{error}</p>}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full" onClick={onBack}>Batal</Button>
          <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A]" disabled={loading} onClick={handle}>
            {loading ? "Menyimpan" : "Lihat hasil"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
