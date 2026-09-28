import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitNifas } from "@/features/skrining/nifas/nifasForm"

type NifasResult = { kategori: "HIJAU" | "KUNING" | "MERAH"; warna: string; meows: string; faktorRisiko: string[]; faktorAman: string[] }

export default function NifasScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (r: NifasResult) => void
}) {
  const [form, setForm] = useState({
    hariKe: 2,
    suhu: 36.8,
    sistolik: 120,
    diastolik: 80,
    nadi: 80,
    spo2: 98,
    perdarahanMl: 100,
    lochiaBau: false,
    nyeriUterus: false,
    lukaBengkak: false,
    nyeriSkala: 2,
    produksiASI: "ada" as "ada" | "sedikit" | "tidak",
    mood: 4,
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [fieldErrs, setFieldErrs] = useState<Record<string, string>>({})

  const handle = async () => {
    setErr(null)
    setFieldErrs({})
    setLoading(true)
    try {
      const res = await submitNifas({
        userId: await getCurrentUserId(),
        hariKe: Number(form.hariKe),
        suhu: Number(form.suhu),
        sistolik: Number(form.sistolik),
        diastolik: Number(form.diastolik),
        nadi: form.nadi ? Number(form.nadi) : undefined,
        spo2: form.spo2 ? Number(form.spo2) : undefined,
        perdarahanMl: form.perdarahanMl ? Number(form.perdarahanMl) : undefined,
        lochiaBau: form.lochiaBau,
        nyeriUterus: form.nyeriUterus,
        lukaBengkak: form.lukaBengkak,
        nyeriSkala: Number(form.nyeriSkala),
        produksiASI: form.produksiASI,
        mood: Number(form.mood),
      })
      onSuccess(res as NifasResult)
    } catch (e: unknown) {
      const errObj = e as { errs?: Record<string, string>; message?: string }
      if (errObj.errs) setFieldErrs(errObj.errs)
      else setErr(errObj.message ?? "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
      <CardContent className="space-y-5 p-5">
        <div>
          <p className="text-[16px] font-bold tracking-tight text-[#1E2326]">Skrining Masa Nifas</p>
          <p className="mt-1 text-xs leading-relaxed text-[#8A8F93]">Cek harian 0 sampai 42 hari setelah lahiran</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Hari ke nifas</Label>
            <Input type="number" value={form.hariKe} onChange={(e) => setForm((s) => ({ ...s, hariKe: Number(e.target.value) }))} className="rounded-full bg-white px-4" />
            {fieldErrs.hariKe && <p className="text-xs text-[#E57373]">{fieldErrs.hariKe}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Suhu tubuh derajat</Label>
            <Input type="number" step="0.1" value={form.suhu} onChange={(e) => setForm((s) => ({ ...s, suhu: Number(e.target.value) }))} className="rounded-full bg-white px-4" />
            {fieldErrs.suhu && <p className="text-xs text-[#E57373]">{fieldErrs.suhu}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Sistolik mmHg</Label>
            <Input type="number" value={form.sistolik} onChange={(e) => setForm((s) => ({ ...s, sistolik: Number(e.target.value) }))} className="rounded-full bg-white px-4" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Diastolik mmHg</Label>
            <Input type="number" value={form.diastolik} onChange={(e) => setForm((s) => ({ ...s, diastolik: Number(e.target.value) }))} className="rounded-full bg-white px-4" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nadi per menit</Label>
            <Input type="number" value={form.nadi} onChange={(e) => setForm((s) => ({ ...s, nadi: Number(e.target.value) }))} className="rounded-full bg-white px-4" placeholder="Opsional" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">SpO2 persen</Label>
            <Input type="number" value={form.spo2} onChange={(e) => setForm((s) => ({ ...s, spo2: Number(e.target.value) }))} className="rounded-full bg-white px-4" placeholder="Opsional" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Perdarahan ml</Label>
            <Input type="number" value={form.perdarahanMl} onChange={(e) => setForm((s) => ({ ...s, perdarahanMl: Number(e.target.value) }))} className="rounded-full bg-white px-4" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Skala nyeri 0–10</Label>
            <Input type="number" value={form.nyeriSkala} onChange={(e) => setForm((s) => ({ ...s, nyeriSkala: Number(e.target.value) }))} className="rounded-full bg-white px-4" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#1E2326]">Produksi ASI</p>
          <div className="flex gap-1.5">
            {(["ada", "sedikit", "tidak"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setForm((s) => ({ ...s, produksiASI: v }))}
                className={`flex-1 rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${form.produksiASI === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}
              >
                {v === "ada" ? "Ada" : v === "sedikit" ? "Sedikit" : "Tidak ada"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#1E2326]">Suasana hati hari ini</p>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setForm((s) => ({ ...s, mood: v }))}
                className={`rounded-full py-2 text-sm font-semibold ring-1 transition-colors ${form.mood === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#8A8F93]">1 sangat buruk sampai 5 sangat baik</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#1E2326]">Keluhan lain</p>
          {[
            { k: "lochiaBau", l: "Cairan nifas berbau tidak sedap" },
            { k: "nyeriUterus", l: "Nyeri tekan di perut bawah" },
            { k: "lukaBengkak", l: "Luka perineum atau bekas operasi bengkak atau bernanah" },
          ].map((it) => {
            const checked = form[it.k as keyof typeof form] as boolean
            return (
              <button
                key={it.k}
                type="button"
                onClick={() => setForm((s) => ({ ...s, [it.k]: !checked }))}
                className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-sm ring-1 transition-colors active:scale-[0.99] ${checked ? "bg-[#7AAE9A] font-semibold text-white ring-[#7AAE9A]" : "bg-white text-[#1E2326] ring-[#EAE6E0] hover:bg-[#FFFCF6]"}`}
              >
                <span className={`grid size-4 shrink-0 place-items-center rounded-[5px] ring-1 ${checked ? "bg-white ring-white" : "bg-white ring-[#C2C8CB]"}`}>
                  {checked && (
                    <svg viewBox="0 0 10 8" className="size-2.5 fill-none stroke-[#1E2326] stroke-2">
                      <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="leading-tight">{it.l}</span>
              </button>
            )
          })}
        </div>

        {err && <p className="text-center text-xs text-[#E57373]">{err}</p>}

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
