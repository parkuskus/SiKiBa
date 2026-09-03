import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitGizi } from "@/features/skrining/ibu-hamil/giziForm"

export default function GiziScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (r: any) => void }) {
  const [form, setForm] = useState({ bbPreKg: 55, tbCm: 160, lilaCm: 24, bbSekarangKg: 62, ukMinggu: 28 })
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fieldErrs, setFieldErrs] = useState<Record<string, string>>({})

  const handle = async () => {
    setErr(null)
    setFieldErrs({})
    setLoading(true)
    try {
      const res = await submitGizi({ userId: "demo-siti", bbPreKg: Number(form.bbPreKg), tbCm: Number(form.tbCm), lilaCm: Number(form.lilaCm), bbSekarangKg: Number(form.bbSekarangKg), ukMinggu: Number(form.ukMinggu) })
      onSuccess(res)
    } catch (e: unknown) {
      const err = e as { errs?: Record<string, string>; message?: string }
      if (err.errs) setFieldErrs(err.errs)
      else setErr(err.message ?? "Gagal menyimpan")
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
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Skrining Status Gizi</p>
            <p className="text-xs text-[#8A8F93]">Skrining untuk memantau gizi Bunda dan janin</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">BB sebelum hamil kg</Label>
            <Input type="number" value={form.bbPreKg} onChange={(e) => setForm((s) => ({ ...s, bbPreKg: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
            {fieldErrs.bbPreKg && <p className="text-xs text-[#E57373]">{fieldErrs.bbPreKg}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tinggi badan cm</Label>
            <Input type="number" value={form.tbCm} onChange={(e) => setForm((s) => ({ ...s, tbCm: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
            {fieldErrs.tbCm && <p className="text-xs text-[#E57373]">{fieldErrs.tbCm}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Lingkar lengan cm</Label>
            <Input type="number" value={form.lilaCm} onChange={(e) => setForm((s) => ({ ...s, lilaCm: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
            {fieldErrs.lilaCm && <p className="text-xs text-[#E57373]">{fieldErrs.lilaCm}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">BB sekarang kg</Label>
            <Input type="number" value={form.bbSekarangKg} onChange={(e) => setForm((s) => ({ ...s, bbSekarangKg: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
            {fieldErrs.bbSekarangKg && <p className="text-xs text-[#E57373]">{fieldErrs.bbSekarangKg}</p>}
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Usia kehamilan minggu</Label>
            <Input type="number" value={form.ukMinggu} onChange={(e) => setForm((s) => ({ ...s, ukMinggu: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
            {fieldErrs.ukMinggu && <p className="text-xs text-[#E57373]">{fieldErrs.ukMinggu}</p>}
          </div>
        </div>

        {err && <p className="text-xs text-[#E57373] text-center">{err}</p>}

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
