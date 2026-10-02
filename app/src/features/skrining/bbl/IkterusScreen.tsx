import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitIkterus } from "@/features/skrining/bbl/ikterusForm"
import SkriningFormShell from "@/features/skrining/components/SkriningFormShell"

type Result = { status: string; kategori: "HIJAU" | "KUNING" | "MERAH"; warna: string; faktorRisiko: string[]; faktorAman: string[] }

const choiceClass = (selected: boolean) => `min-h-11 rounded-[14px] px-2.5 text-xs font-semibold transition-colors ${selected ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`

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
    <SkriningFormShell title="Ikterus Neonatal" subtitle="Cek kuning pada bayi" onBack={onBack}>
      <div className="space-y-3.5">
        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Waktu dan usia bayi</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[16px] bg-white px-3 py-2.5 ring-1 ring-[#D9E7E2]">
              <label className="block text-xs text-[#33443F]">Usia bayi hari</label>
              <Input type="number" aria-label="Usia bayi hari" value={form.usiaBayiHari} onChange={(event) => setForm((current) => ({ ...current, usiaBayiHari: Number(event.target.value) }))} className="h-auto border-0 bg-transparent p-0 text-base font-bold text-[#DB2777] shadow-none focus-visible:ring-0" />
            </div>
            <div className="rounded-[16px] bg-white px-3 py-2.5 ring-1 ring-[#D9E7E2]">
              <label className="block text-xs text-[#33443F]">Kuning muncul jam ke</label>
              <Input type="number" aria-label="Kuning muncul pada jam ke" value={form.onsetJam} onChange={(event) => setForm((current) => ({ ...current, onsetJam: Number(event.target.value) }))} className="h-auto border-0 bg-transparent p-0 text-base font-bold text-[#DB2777] shadow-none focus-visible:ring-0" />
            </div>
          </div>
        </section>

        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Zona Kramer</h2>
          <div className="grid grid-cols-5 gap-2">
            {([1, 2, 3, 4, 5] as const).map((zone) => (
              <button key={zone} type="button" aria-pressed={form.zona === zone} onClick={() => setForm((current) => ({ ...current, zona: zone }))} className={choiceClass(form.zona === zone)}>
                {zone}
              </button>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-[#33443F]">1 kepala dan leher, 2 dada, 3 perut, 4 tangan dan kaki, 5 telapak</p>
        </section>

        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Kondisi bayi</h2>
          <div className="grid grid-cols-3 gap-2">
            {(["aktif", "mengantuk", "tidak mau minum"] as const).map((activity) => (
              <button key={activity} type="button" aria-pressed={form.aktivitas === activity} onClick={() => setForm((current) => ({ ...current, aktivitas: activity }))} className={choiceClass(form.aktivitas === activity)}>
                {activity === "aktif" ? "Aktif" : activity === "mengantuk" ? "Mengantuk" : "Tidak mau minum"}
              </button>
            ))}
          </div>
          {[
            { key: "fesesDempul", label: "Feses pucat dempul" },
            { key: "prematur", label: "Bayi prematur" },
          ].map((item) => {
            const checked = form[item.key as "fesesDempul" | "prematur"]
            return (
              <button key={item.key} type="button" aria-pressed={checked} onClick={() => setForm((current) => ({ ...current, [item.key]: !checked }))} className={`flex min-h-11 w-full items-center gap-3 rounded-[16px] px-3 text-left text-[13px] transition-colors ${checked ? "bg-[#4A6E54] font-semibold text-white" : "bg-white text-[#1D2B29] ring-1 ring-[#D9E7E2]"}`}>
                <span className={`grid size-5 shrink-0 place-items-center rounded-[6px] ring-1 ${checked ? "bg-white ring-white" : "bg-white ring-[#C2C8CB]"}`}>
                  {checked && <span className="size-2.5 rounded-[3px] bg-[#4A6E54]" />}
                </span>
                {item.label}
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
