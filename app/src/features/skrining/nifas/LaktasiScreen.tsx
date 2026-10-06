import { useState } from "react"
import { getCurrentUserId } from "@/data/currentUser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitLaktasi } from "@/features/skrining/nifas/laktasiForm"
import SkriningFormShell from "@/features/skrining/components/SkriningFormShell"

type Result = { warna: "HIJAU" | "KUNING" | "MERAH"; kategori: string; masalah?: string; faktorRisiko: string[]; faktorAman: string[] }

const choiceClass = (selected: boolean) => `min-h-11 rounded-[14px] px-2.5 text-xs font-semibold transition-colors ${selected ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`

export default function LaktasiScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (r: Result) => void
}) {
  const [form, setForm] = useState({
    usiaBayiHari: 3,
    frekuensiMenyusuPerHari: 8,
    durasiMenyusuMenit: 15,
    kondisiPuting: "normal" as "normal" | "nyeri" | "luka" | "masuk",
    kondisiPayudara: "normal" as "normal" | "bengkak" | "keras" | "merah",
    volumeASI: "cukup" as "cukup" | "sedikit" | "tidak ada",
    bbBayiTren: "naik" as "naik" | "stagnan" | "turun",
    bakPerHari: 6,
    urin: "jernih" as "jernih" | "kuning" | "gelap",
    demam: false,
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handle = async () => {
    setErr(null)
    setLoading(true)
    try {
      const res = await submitLaktasi({
        userId: await getCurrentUserId(),
        usiaBayiHari: Number(form.usiaBayiHari),
        frekuensiMenyusuPerHari: Number(form.frekuensiMenyusuPerHari),
        durasiMenyusuMenit: form.durasiMenyusuMenit ? Number(form.durasiMenyusuMenit) : undefined,
        kondisiPuting: form.kondisiPuting,
        kondisiPayudara: form.kondisiPayudara,
        volumeASI: form.volumeASI,
        bbBayiTren: form.bbBayiTren,
        bakPerHari: Number(form.bakPerHari),
        urin: form.urin,
        demam: form.demam,
      })
      onSuccess(res as Result)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SkriningFormShell title="Laktasi dan Menyusui" subtitle="Cek kecukupan ASI dan kondisi bayi" onBack={onBack} illustration="/illu/illu-53-skrining-laktasi.png">
      <div className="space-y-3.5">
        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Pola menyusu</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { key: "usiaBayiHari", label: "Usia bayi hari", value: form.usiaBayiHari },
              { key: "frekuensiMenyusuPerHari", label: "Menyusu per hari", value: form.frekuensiMenyusuPerHari },
              { key: "durasiMenyusuMenit", label: "Durasi per sesi menit", value: form.durasiMenyusuMenit },
              { key: "bakPerHari", label: "BAK bayi per hari", value: form.bakPerHari },
            ].map((field) => (
              <div key={field.key} className="rounded-[16px] bg-white px-3 py-2.5 ring-1 ring-[#D9E7E2]">
                <label className="block text-xs text-[#33443F]">{field.label}</label>
                <Input type="number" aria-label={field.label} value={field.value} onChange={(event) => setForm((current) => ({ ...current, [field.key]: Number(event.target.value) }))} className="h-auto border-0 bg-transparent p-0 text-base font-bold text-[#DB2777] shadow-none focus-visible:ring-0" />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Kondisi ibu</h2>
          <button type="button" aria-pressed={form.demam} onClick={() => setForm((current) => ({ ...current, demam: !current.demam }))} className={`flex min-h-11 w-full items-center gap-3 rounded-[16px] px-3 text-left text-[13px] transition-colors ${form.demam ? "bg-[#4A6E54] font-semibold text-white" : "bg-white text-[#1D2B29] ring-1 ring-[#D9E7E2]"}`}>
            <span className={`grid size-5 shrink-0 place-items-center rounded-[6px] ring-1 ${form.demam ? "bg-white ring-white" : "bg-white ring-[#C2C8CB]"}`}>{form.demam && <span className="size-2.5 rounded-[3px] bg-[#4A6E54]" />}</span>
            Demam pada ibu
          </button>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#33443F]">Kondisi puting</p>
            <div className="grid grid-cols-2 gap-2">
              {(["normal", "nyeri", "luka", "masuk"] as const).map((value) => (
                <button key={value} type="button" aria-pressed={form.kondisiPuting === value} onClick={() => setForm((current) => ({ ...current, kondisiPuting: value }))} className={choiceClass(form.kondisiPuting === value)}>
                  {value === "normal" ? "Normal" : value === "nyeri" ? "Nyeri" : value === "luka" ? "Luka" : "Masuk"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#33443F]">Kondisi payudara</p>
            <div className="grid grid-cols-2 gap-2">
              {(["normal", "bengkak", "keras", "merah"] as const).map((value) => (
                <button key={value} type="button" aria-pressed={form.kondisiPayudara === value} onClick={() => setForm((current) => ({ ...current, kondisiPayudara: value }))} className={choiceClass(form.kondisiPayudara === value)}>
                  {value === "normal" ? "Normal" : value === "bengkak" ? "Bengkak" : value === "keras" ? "Keras" : "Merah"}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
          <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Kecukupan ASI</h2>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#33443F]">Volume ASI</p>
            <div className="grid grid-cols-3 gap-2">
              {(["cukup", "sedikit", "tidak ada"] as const).map((value) => (
                <button key={value} type="button" aria-pressed={form.volumeASI === value} onClick={() => setForm((current) => ({ ...current, volumeASI: value }))} className={choiceClass(form.volumeASI === value)}>
                  {value === "cukup" ? "Cukup" : value === "sedikit" ? "Sedikit" : "Tidak ada"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#33443F]">Tren berat bayi</p>
            <div className="grid grid-cols-3 gap-2">
              {(["naik", "stagnan", "turun"] as const).map((value) => (
                <button key={value} type="button" aria-pressed={form.bbBayiTren === value} onClick={() => setForm((current) => ({ ...current, bbBayiTren: value }))} className={choiceClass(form.bbBayiTren === value)}>
                  {value === "naik" ? "Naik" : value === "stagnan" ? "Tetap" : "Turun"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#33443F]">Warna urin bayi</p>
            <div className="grid grid-cols-3 gap-2">
              {(["jernih", "kuning", "gelap"] as const).map((value) => (
                <button key={value} type="button" aria-pressed={form.urin === value} onClick={() => setForm((current) => ({ ...current, urin: value }))} className={choiceClass(form.urin === value)}>
                  {value === "jernih" ? "Jernih" : value === "kuning" ? "Kuning" : "Gelap pekat"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {err && <p role="alert" className="text-center text-xs text-[#C62828]">{err}</p>}
        <Button className="min-h-12 w-full rounded-full bg-[#4A6E54] text-base font-bold text-white hover:bg-[#3D5C46]" disabled={loading} onClick={handle}>
          {loading ? "Menyimpan" : "Lihat hasil"}
        </Button>
      </div>
    </SkriningFormShell>
  )
}
