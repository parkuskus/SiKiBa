import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitIkterus } from "@/features/skrining/bbl/ikterusForm"

type Result = { status: string; kategori: "HIJAU" | "KUNING" | "MERAH"; warna: string; faktorRisiko: string[]; faktorAman: string[] }

export default function IkterusScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (r: Result) => void
}) {
  const [form, setForm] = useState({
    usiaBayiHari: 3,
    zona: 2 as 1 | 2 | 3 | 4 | 5,
    onsetJam: 36,
    fesesDempul: false,
    aktivitas: "aktif" as "aktif" | "mengantuk" | "tidak mau minum",
    prematur: false,
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handle = async () => {
    setErr(null)
    setLoading(true)
    try {
      const res = await submitIkterus({
        userId: await getCurrentUserId(),
        usiaBayiHari: Number(form.usiaBayiHari),
        zona: form.zona,
        onsetJam: Number(form.onsetJam),
        fesesDempul: form.fesesDempul,
        aktivitas: form.aktivitas,
        prematur: form.prematur,
      })
      onSuccess(res as Result)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div>
          <div>
            <p className="text-sm font-semibold text-[#1E2326] leading-none">Skrining Ikterus Neonatal</p>
            <p className="text-xs text-[#8A8F93]">Cek kuning pada bayi dengan zona Kramer</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Usia bayi hari</Label>
            <Input type="number" value={form.usiaBayiHari} onChange={(e) => setForm((s) => ({ ...s, usiaBayiHari: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Kuning muncul jam ke</Label>
            <Input type="number" value={form.onsetJam} onChange={(e) => setForm((s) => ({ ...s, onsetJam: Number(e.target.value) }))} className="rounded-xl bg-[#FFFCF6]" placeholder="<24 patologis" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Zona Kramer</Label>
          <div className="flex gap-1.5">
            {([1, 2, 3, 4, 5] as const).map((v) => (
              <button key={v} onClick={() => setForm((s) => ({ ...s, zona: v }))} className={`flex-1 rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${form.zona === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>
                {v}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#8A8F93] leading-tight">1 kepala leher 2 dada 3 perut 4 tangan kaki 5 telapak</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Aktivitas bayi</Label>
          <div className="flex gap-1.5">
            {(["aktif", "mengantuk", "tidak mau minum"] as const).map((v) => (
              <button key={v} onClick={() => setForm((s) => ({ ...s, aktivitas: v }))} className={`flex-1 rounded-full py-2 text-[11px] font-semibold ring-1 transition-colors ${form.aktivitas === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>
                {v === "aktif" ? "Aktif" : v === "mengantuk" ? "Mengantuk" : "Tidak mau minum"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Keluhan lain</Label>
          <label className="flex items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0] cursor-pointer">
            <span className="text-sm text-[#1E2326] leading-tight">Feses pucat dempul</span>
            <input type="checkbox" checked={form.fesesDempul} onChange={(e) => setForm((s) => ({ ...s, fesesDempul: e.target.checked }))} className="size-5 accent-[#7AAE9A]" />
          </label>
          <label className="flex items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0] cursor-pointer">
            <span className="text-sm text-[#1E2326] leading-tight">Bayi prematur</span>
            <input type="checkbox" checked={form.prematur} onChange={(e) => setForm((s) => ({ ...s, prematur: e.target.checked }))} className="size-5 accent-[#7AAE9A]" />
          </label>
        </div>

        {err && <p className="text-xs text-[#E57373] text-center">{err}</p>}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-full" onClick={onBack}>
            Batal
          </Button>
          <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white" disabled={loading} onClick={handle}>
            {loading ? "Menyimpan" : "Lihat hasil"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
