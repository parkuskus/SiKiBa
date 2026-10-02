import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitDMG } from "@/features/skrining/ibu-hamil/dmgForm"
import SkriningFormShell from "@/features/skrining/components/SkriningFormShell"

export default function DmgScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (r: any) => void }) {
  const [form, setForm] = useState({ usia: 26, imtPre: 24, ukMinggu: 26, riwayatDMG: false, riwayatMakrosomia: false, riwayatDMKeluarga: false, glikosuria: false, pcos: false, etnisRisiko: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handle = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await submitDMG({ userId: await getCurrentUserId(), usia: Number(form.usia), imtPre: Number(form.imtPre), ukMinggu: Number(form.ukMinggu), riwayatDMG: form.riwayatDMG, riwayatMakrosomia: form.riwayatMakrosomia, riwayatDMKeluarga: form.riwayatDMKeluarga, glikosuria: form.glikosuria, pcos: form.pcos, etnisRisiko: form.etnisRisiko })
      onSuccess(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SkriningFormShell title="Diabetes Gestasional" subtitle="Skrining risiko gula darah" onBack={onBack}>
      <div className="space-y-3.5">
        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Data Ibu</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { key: "usia", label: "Usia tahun", value: form.usia },
              { key: "imtPre", label: "IMT sebelum hamil", value: form.imtPre },
              { key: "ukMinggu", label: "Usia kehamilan minggu", value: form.ukMinggu },
            ].map((field) => (
              <div key={field.key} className="rounded-[16px] bg-white px-3 py-2.5 ring-1 ring-[#D9E7E2]">
                <label className="block text-xs text-[#33443F]">{field.label}</label>
                <Input type="number" aria-label={field.label} value={field.value} onChange={(event) => setForm((current) => ({ ...current, [field.key]: Number(event.target.value) }))} className="h-auto border-0 bg-transparent p-0 text-base font-bold text-[#DB2777] shadow-none focus-visible:ring-0" />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Faktor Risiko</h2>
          {[
            { key: "riwayatDMG", label: "Pernah diabetes saat hamil sebelumnya" },
            { key: "riwayatMakrosomia", label: "Riwayat melahirkan bayi besar di atas 4 kg (makrosomia)" },
            { key: "riwayatDMKeluarga", label: "Riwayat keluarga ada diabetes" },
            { key: "glikosuria", label: "Gula dalam pemeriksaan urine (glikosuria)" },
            { key: "pcos", label: "Riwayat PCOS (polisistik ovarium)" },
            { key: "etnisRisiko", label: "Etnis berisiko tinggi (Asia/Afrika)" },
          ].map((item) => {
            const checked = form[item.key as keyof typeof form] as boolean
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={checked}
                onClick={() => setForm((current) => ({ ...current, [item.key]: !checked }))}
                className={`flex min-h-11 w-full items-center gap-3 rounded-[16px] px-3 text-left text-[13px] transition-colors ${checked ? "bg-[#4A6E54] font-semibold text-white" : "bg-white text-[#1D2B29] ring-1 ring-[#D9E7E2]"}`}
              >
                <span className={`grid size-5 shrink-0 place-items-center rounded-[6px] ring-1 ${checked ? "bg-white ring-white" : "bg-white ring-[#C2C8CB]"}`}>
                  {checked && <span className="size-2.5 rounded-[3px] bg-[#4A6E54]" />}
                </span>
                <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
              </button>
            )
          })}
        </section>

        {error && <p role="alert" className="text-center text-xs text-[#C62828]">{error}</p>}
        <Button className="min-h-12 w-full rounded-full bg-[#4A6E54] text-base font-bold text-white hover:bg-[#3D5C46]" disabled={loading} onClick={handle}>
          {loading ? "Menyimpan" : "Lihat hasil"}
        </Button>
      </div>
    </SkriningFormShell>
  )
}
