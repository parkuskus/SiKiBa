import { useEffect, useState } from "react"
import { Apple } from "lucide-react"
import { getCurrentProfile, getCurrentUserId } from "@/data/currentUser"
import { weeksFromHpht } from "@/clinical-rules/ukHpl"
import { calcIMT, kategoriIMT, kategoriLILA } from "@/clinical-rules/imtLila"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import SkriningFormShell from "@/features/skrining/components/SkriningFormShell"
import { submitGizi } from "@/features/skrining/ibu-hamil/giziForm"

export default function GiziScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (r: any) => void }) {
  const [form, setForm] = useState({ bbPreKg: 55, tbCm: 160, lilaCm: 24, bbSekarangKg: 62, ukMinggu: 28 })
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fieldErrs, setFieldErrs] = useState<Record<string, string>>({})

  useEffect(() => {
    void (async () => {
      const profile = await getCurrentProfile().catch(() => null)
      if (!profile?.hpht) return
      const uk = weeksFromHpht(profile.hpht)
      if (uk >= 0 && uk <= 45) setForm((current) => ({ ...current, ukMinggu: uk }))
    })()
  }, [])

  const imt = form.bbPreKg > 0 && form.tbCm > 0 ? calcIMT(form.bbPreKg, form.tbCm) : null
  const imtInfo = imt === null ? null : kategoriIMT(imt)
  const lila = form.lilaCm > 0 ? kategoriLILA(form.lilaCm) : null

  const handle = async () => {
    setErr(null)
    setFieldErrs({})
    setLoading(true)
    try {
      const res = await submitGizi({ userId: await getCurrentUserId(), bbPreKg: Number(form.bbPreKg), tbCm: Number(form.tbCm), lilaCm: Number(form.lilaCm), bbSekarangKg: Number(form.bbSekarangKg), ukMinggu: Number(form.ukMinggu) })
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
    <SkriningFormShell title="Status Gizi" subtitle="IMT LILA dan BB" onBack={onBack}>
      <div className="space-y-3.5">
        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Pengukuran</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { key: "bbPreKg", label: "BB awal kg", value: form.bbPreKg },
              { key: "tbCm", label: "Tinggi cm", value: form.tbCm },
              { key: "lilaCm", label: "LILA cm", value: form.lilaCm },
              { key: "bbSekarangKg", label: "BB kini kg", value: form.bbSekarangKg },
            ].map((field) => (
              <div key={field.key} className="rounded-[16px] bg-white px-3 py-2.5 ring-1 ring-[#D9E7E2]">
                <label className="block text-xs text-[#33443F]">{field.label}</label>
                <Input
                  type="number"
                  aria-label={field.label}
                  value={field.value}
                  onChange={(event) => setForm((current) => ({ ...current, [field.key]: Number(event.target.value) }))}
                  className="h-auto border-0 bg-transparent p-0 text-base font-bold text-[#DB2777] shadow-none focus-visible:ring-0"
                />
                {fieldErrs[field.key] && <p className="text-[11px] text-[#C62828]">{fieldErrs[field.key]}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-[72px] items-center gap-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-white text-[#2E7D32]"><Apple className="size-6" /></span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold leading-tight text-[#1D2B29]">
              {imtInfo ? `IMT ${imt?.toFixed(1)} ${imtInfo.kat}` : "IMT menunggu data"}
            </p>
            <p className="text-xs leading-normal text-[#33443F]">
              {imtInfo ? `Target tambah ${imtInfo.targetKg[0]} sampai ${imtInfo.targetKg[1]} kg` : "Isi berat awal dan tinggi badan"}
            </p>
          </div>
        </section>

        {err && <p role="alert" className="text-center text-xs text-[#C62828]">{err}</p>}
        <Button className="min-h-12 w-full rounded-full bg-[#4A6E54] text-base font-bold text-white hover:bg-[#3D5C46]" disabled={loading} onClick={handle}>
          {loading ? "Menyimpan" : "Simpan hasil"}
        </Button>
        <p className="text-xs leading-normal text-[#33443F]">LILA di bawah 23,5 cm tanda KEK{lila === "KEK" ? ". Ukuran saat ini di bawah batas." : ""}</p>
      </div>
    </SkriningFormShell>
  )
}
