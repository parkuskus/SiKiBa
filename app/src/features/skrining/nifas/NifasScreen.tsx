import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitNifas } from "@/features/skrining/nifas/nifasForm"
import SkriningFormShell from "@/features/skrining/components/SkriningFormShell"

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
    <SkriningFormShell title="Masa Nifas" subtitle="Cek kesehatan ibu setelah melahirkan" onBack={onBack} illustration="/illu/illu-52-skrining-nifas.webp">
      <div className="space-y-3.5">
        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Pemantauan ibu</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { key: "hariKe", label: "Hari nifas (hari)", value: form.hariKe },
              { key: "suhu", label: "Suhu tubuh (°C)", value: form.suhu, step: "0.1" },
              { key: "sistolik", label: "Sistolik (mmHg)", value: form.sistolik },
              { key: "diastolik", label: "Diastolik (mmHg)", value: form.diastolik },
              { key: "nadi", label: "Nadi (kali per menit)", value: form.nadi },
              { key: "spo2", label: "SpO2 (%)", value: form.spo2 },
              { key: "perdarahanMl", label: "Perdarahan (mL)", value: form.perdarahanMl },
              { key: "nyeriSkala", label: "Skala nyeri (0–10)", value: form.nyeriSkala },
            ].map((field) => (
              <div key={field.key} className="rounded-[16px] bg-white px-3 py-2.5 ring-1 ring-[#D9E7E2]">
                <label className="block text-xs text-[#33443F]">{field.label}</label>
                <Input
                  type="number"
                  step={"step" in field ? field.step : undefined}
                  aria-label={field.label}
                  value={field.value}
                  onChange={(event) => setForm((current) => ({ ...current, [field.key]: Number(event.target.value) }))}
                  className="h-auto border-0 bg-transparent p-0 text-base font-bold text-[#DB2777] shadow-none focus-visible:ring-0"
                />
                {fieldErrs[field.key] && <p className="text-[11px] text-[#C62828]">{fieldErrs[field.key]}</p>}
                {["nadi", "spo2"].includes(field.key) && <span className="text-[11px] text-[#6C757D]">Opsional</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Produksi ASI</h2>
          <div className="grid grid-cols-3 gap-2">
            {(["ada", "sedikit", "tidak"] as const).map((value) => (
              <button key={value} type="button" aria-pressed={form.produksiASI === value} onClick={() => setForm((current) => ({ ...current, produksiASI: value }))} className={`min-h-11 rounded-[14px] px-2 text-xs font-semibold transition-colors ${form.produksiASI === value ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`}>
                {value === "ada" ? "Ada" : value === "sedikit" ? "Sedikit" : "Tidak ada"}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Suasana hati hari ini</h2>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" aria-label={`Suasana hati ${value}`} aria-pressed={form.mood === value} onClick={() => setForm((current) => ({ ...current, mood: value }))} className={`min-h-11 rounded-[14px] text-sm font-bold transition-colors ${form.mood === value ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`}>
                {value}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-[#33443F]"><span>Sangat buruk</span><span>Sangat baik</span></div>
        </section>

        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Keluhan lain</h2>
          {[
            { key: "lochiaBau", label: "Cairan nifas berbau tidak sedap" },
            { key: "nyeriUterus", label: "Nyeri tekan di perut bawah" },
            { key: "lukaBengkak", label: "Luka perineum atau bekas operasi bengkak atau bernanah" },
          ].map((item) => {
            const checked = form[item.key as keyof typeof form] as boolean
            return (
              <button key={item.key} type="button" aria-pressed={checked} onClick={() => setForm((current) => ({ ...current, [item.key]: !checked }))} className={`flex min-h-11 w-full items-center gap-3 rounded-[16px] px-3 text-left text-[13px] transition-colors ${checked ? "bg-[#4A6E54] font-semibold text-white" : "bg-white text-[#1D2B29] ring-1 ring-[#D9E7E2]"}`}>
                <span className={`grid size-5 shrink-0 place-items-center rounded-[6px] ring-1 ${checked ? "bg-white ring-white" : "bg-white ring-[#C2C8CB]"}`}>
                  {checked && <span className="size-2.5 rounded-[3px] bg-[#4A6E54]" />}
                </span>
                <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
              </button>
            )
          })}
        </section>

        {err && <p role="alert" className="text-center text-xs text-[#C62828]">{err}</p>}
        <Button className="min-h-12 w-full rounded-full bg-[#4A6E54] text-base font-bold text-white hover:bg-[#3D5C46]" disabled={loading} onClick={handle}>
          {loading ? "Menyimpan" : "Lihat hasil"}
        </Button>
      </div>
    </SkriningFormShell>
  )
}
