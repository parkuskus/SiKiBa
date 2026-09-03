import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { submitDangerSign } from "@/features/skrining/ibu-hamil/dangerSignForm"

export default function DangerSignScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (r: any) => void }) {
  const [form, setForm] = useState({
    perdarahan: false,
    nyeriKepalaHebat: false,
    pandanganKabur: false,
    nyeriAbdomenHebat: false,
    bengkakWajahTangan: false,
    gerakanJaninBerkurang: false,
    demamTinggi: false,
    ketubanPecah: false,
    sesakNapas: false,
  })
  const [loading, setLoading] = useState(false)

  const toggle = (k: string) => setForm((s) => ({ ...s, [k]: !s[k as keyof typeof s] }))

  const handle = async () => {
    setLoading(true)
    try {
      const res = await submitDangerSign({ userId: "demo-siti", ...form })
      onSuccess(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="size-8 rounded-full bg-[#FFFCF6] ring-1 ring-[#EAE6E0] grid place-items-center text-[#7AAE9A]">
            <ChevronRight className="size-4 rotate-180" />
          </button>
          <div>
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Skrining Tanda Bahaya</p>
            <p className="text-xs text-[#8A8F93]">Skrining untuk mengenali tanda yang perlu segera diperiksa</p>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { k: "perdarahan", l: "Perdarahan per vagina" },
            { k: "nyeriKepalaHebat", l: "Nyeri kepala hebat" },
            { k: "pandanganKabur", l: "Pandangan kabur" },
            { k: "nyeriAbdomenHebat", l: "Nyeri perut hebat" },
            { k: "bengkakWajahTangan", l: "Bengkak wajah dan tangan" },
            { k: "gerakanJaninBerkurang", l: "Gerakan janin berkurang" },
            { k: "demamTinggi", l: "Demam tinggi di atas 38°C" },
            { k: "ketubanPecah", l: "Ketuban pecah" },
            { k: "sesakNapas", l: "Sesak napas mendadak" },
          ].map((it) => (
            <label key={it.k} className="flex items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0] cursor-pointer">
              <span className="text-sm text-[#1E2326]">{it.l}</span>
              <input type="checkbox" checked={form[it.k as keyof typeof form] as boolean} onChange={() => toggle(it.k)} className="size-5 accent-[#7AAE9A]" />
            </label>
          ))}
        </div>

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
