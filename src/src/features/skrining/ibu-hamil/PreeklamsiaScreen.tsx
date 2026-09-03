import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitPreeklamsia } from "@/features/skrining/ibu-hamil/preeklamsiaForm"

export default function PreeklamsiaScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (r: any) => void }) {
  const [form, setForm] = useState({ sistolik: 120, diastolik: 80, proteinuria: false, ukMinggu: 28 })
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setErr(null)
    setLoading(true)
    try {
      const res = await submitPreeklamsia({ userId: "demo-siti", sistolik: Number(form.sistolik), diastolik: Number(form.diastolik), ukMinggu: Number(form.ukMinggu), proteinuria: form.proteinuria })
      onSuccess(res)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal"
      setErr(msg)
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
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Skrining Preeklamsia</p>
            <p className="text-xs text-[#8A8F93]">Skrining untuk deteksi dini tekanan darah tinggi</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Sistolik mmHg</Label>
            <Input type="number" value={form.sistolik} onChange={(e) => setForm((s) => ({ ...s, sistolik: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Diastolik mmHg</Label>
            <Input type="number" value={form.diastolik} onChange={(e) => setForm((s) => ({ ...s, diastolik: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Usia kehamilan minggu</Label>
            <Input type="number" value={form.ukMinggu} onChange={(e) => setForm((s) => ({ ...s, ukMinggu: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
        </div>

        <label className="flex items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0] cursor-pointer">
          <span className="text-sm text-[#1E2326]">Protein urine positif</span>
          <input type="checkbox" checked={form.proteinuria} onChange={(e) => setForm((s) => ({ ...s, proteinuria: e.target.checked }))} className="size-5 accent-[#7AAE9A]" />
        </label>

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
