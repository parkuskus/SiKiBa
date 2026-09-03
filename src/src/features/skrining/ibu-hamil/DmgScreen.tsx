import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitDMG } from "@/features/skrining/ibu-hamil/dmgForm"

export default function DmgScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (r: any) => void }) {
  const [form, setForm] = useState({ usia: 26, imtPre: 24, ukMinggu: 26, riwayatDMG: false, riwayatMakrosomia: false, riwayatDMKeluarga: false })
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    try {
      const res = await submitDMG({ userId: await getCurrentUserId(), usia: Number(form.usia), imtPre: Number(form.imtPre), ukMinggu: Number(form.ukMinggu), riwayatDMG: form.riwayatDMG, riwayatMakrosomia: form.riwayatMakrosomia, riwayatDMKeluarga: form.riwayatDMKeluarga })
      onSuccess(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div>
          <div>
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Skrining Diabetes Gestasional</p>
            <p className="text-xs text-[#8A8F93]">Skrining untuk cek risiko gula darah saat hamil</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Usia tahun</Label>
            <Input type="number" value={form.usia} onChange={(e) => setForm((s) => ({ ...s, usia: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">IMT sebelum hamil</Label>
            <Input type="number" value={form.imtPre} onChange={(e) => setForm((s) => ({ ...s, imtPre: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">UK minggu</Label>
            <Input type="number" value={form.ukMinggu} onChange={(e) => setForm((s) => ({ ...s, ukMinggu: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
        </div>

        <div className="space-y-2">
          {[
            { k: "riwayatDMG", l: "Pernah diabetes saat hamil sebelumnya" },
            { k: "riwayatMakrosomia", l: "Pernah bayi besar di atas 4 kg" },
            { k: "riwayatDMKeluarga", l: "Keluarga ada diabetes" },
          ].map((it) => (
            <label key={it.k} className="flex items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0] cursor-pointer">
              <span className="text-sm text-[#1E2326]">{it.l}</span>
              <input type="checkbox" checked={form[it.k as keyof typeof form] as boolean} onChange={(e) => setForm((s) => ({ ...s, [it.k]: e.target.checked }))} className="size-5 accent-[#7AAE9A]" />
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
