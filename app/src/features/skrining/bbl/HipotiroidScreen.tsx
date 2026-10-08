import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitHipotiroid } from "@/features/skrining/bbl/hipotiroidForm"
import SkriningFormShell from "@/features/skrining/components/SkriningFormShell"

type Result = { kategori: "HIJAU" | "KUNING" | "MERAH"; warna: string; faktorRisiko: string[]; faktorAman: string[] }

const choiceClass = (selected: boolean) => `min-h-11 rounded-[14px] px-3 text-xs font-semibold transition-colors ${selected ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`

export default function HipotiroidScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (r: Result) => void
}) {
  const [form, setForm] = useState({
    sudahTSH: false,
    usiaBayiHari: 2,
    gejala: {
      ikterusLama: false,
      konstipasi: false,
      tangisanSerak: false,
      aktivitasKurang: false,
      lidahBesar: false,
    },
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handle = async () => {
    setErr(null)
    setLoading(true)
    try {
      const res = await submitHipotiroid({
        userId: await getCurrentUserId(),
        sudahTSH: form.sudahTSH,
        usiaBayiHari: form.sudahTSH ? undefined : Number(form.usiaBayiHari),
        gejala: form.gejala,
      })
      onSuccess(res as Result)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SkriningFormShell title="Hipotiroid Kongenital" subtitle="Cek TSH dan gejala pada bayi" onBack={onBack} illustration="/illu/illu-55-skrining-hipotiroid.webp">
      <div className="space-y-3.5">
        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Pemeriksaan TSH</h2>
          <p className="text-xs leading-relaxed text-[#33443F]">Tes skrining bayi baru lahir ideal dilakukan pada usia 2 sampai 3 hari.</p>
          <div className="grid grid-cols-2 gap-2">
            {[{ value: true, label: "Sudah" }, { value: false, label: "Belum" }].map((option) => (
              <button key={String(option.value)} type="button" aria-pressed={form.sudahTSH === option.value} onClick={() => setForm((current) => ({ ...current, sudahTSH: option.value }))} className={choiceClass(form.sudahTSH === option.value)}>
                {option.label}
              </button>
            ))}
          </div>
          {!form.sudahTSH && (
            <div className="rounded-[16px] bg-white px-3 py-2.5 ring-1 ring-[#D9E7E2]">
              <label className="block text-xs text-[#33443F]">Usia bayi hari</label>
              <Input type="number" aria-label="Usia bayi dalam hari" value={form.usiaBayiHari} onChange={(event) => setForm((current) => ({ ...current, usiaBayiHari: Number(event.target.value) }))} className="h-auto border-0 bg-transparent p-0 text-base font-bold text-[#DB2777] shadow-none focus-visible:ring-0" />
            </div>
          )}
        </section>

        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Gejala yang mungkin ada</h2>
          {[
            { key: "ikterusLama", label: "Kuning lebih dari 2 minggu" },
            { key: "konstipasi", label: "Sembelit" },
            { key: "tangisanSerak", label: "Tangisan serak" },
            { key: "aktivitasKurang", label: "Aktivitas kurang" },
            { key: "lidahBesar", label: "Lidah besar" },
          ].map((item) => {
            const checked = form.gejala[item.key as keyof typeof form.gejala]
            return (
              <button key={item.key} type="button" aria-pressed={checked} onClick={() => setForm((current) => ({ ...current, gejala: { ...current.gejala, [item.key]: !checked } }))} className={`flex min-h-11 w-full items-center gap-3 rounded-[16px] px-3 text-left text-[13px] transition-colors ${checked ? "bg-[#4A6E54] font-semibold text-white" : "bg-white text-[#1D2B29] ring-1 ring-[#D9E7E2]"}`}>
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
