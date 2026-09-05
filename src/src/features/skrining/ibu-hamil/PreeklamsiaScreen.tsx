import { useEffect, useState } from "react"
import { getCurrentProfile, getCurrentUserId } from "@/data/currentUser"
import { weeksFromHpht } from "@/clinical-rules/ukHpl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { submitPreeklamsia } from "@/features/skrining/ibu-hamil/preeklamsiaForm"

type PECheck = "pe" | "ht" | "ginjal" | "dm" | "autoimun" | "keluarga"

function CheckRow({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-sm ring-1 transition-colors active:scale-[0.99] ${
        checked ? "bg-[#7AAE9A] font-semibold text-white ring-[#7AAE9A]" : "bg-white text-[#1E2326] ring-[#EAE6E0] hover:bg-[#FFFCF6]"
      }`}
    >
      <span className={`grid size-4 shrink-0 place-items-center rounded-[5px] ring-1 ${checked ? "bg-white ring-white" : "bg-white ring-[#C2C8CB]"}`}>
        {checked && (
          <svg viewBox="0 0 10 8" className="size-2.5 fill-none stroke-[#1E2326] stroke-2">
            <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="leading-tight">{label}</span>
    </button>
  )
}

function RadioRow({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-sm ring-1 transition-colors active:scale-[0.99] ${
        selected ? "bg-[#7AAE9A] font-semibold text-white ring-[#7AAE9A]" : "bg-white text-[#1E2326] ring-[#EAE6E0] hover:bg-[#FFFCF6]"
      }`}
    >
      <span className={`grid size-4 shrink-0 place-items-center rounded-full ring-1 ${selected ? "bg-white ring-white" : "bg-white ring-[#C2C8CB]"}`}>
        {selected && <span className="size-2 rounded-full bg-[#1E2326]" />}
      </span>
      <span className="leading-tight">{label}</span>
    </button>
  )
}

export default function PreeklamsiaScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (r: any) => void }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [sistolik, setSistolik] = useState("120")
  const [diastolik, setDiastolik] = useState("80")
  const [ukMinggu, setUkMinggu] = useState("28")
  const [proteinuria, setProteinuria] = useState(false)
  const [riwayat, setRiwayat] = useState<PECheck[]>([])
  const [gemeli, setGemeli] = useState(false)
  const [anakPertama, setAnakPertama] = useState(false)
  const [imtPre, setImtPre] = useState("")
  const [usia, setUsia] = useState("")
  const [jarak, setJarak] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [fieldErrs, setFieldErrs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const toggleRiwayat = (id: PECheck) => {
    setRiwayat((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  // auto usia dari tanggal lahir & UK dari HPHT bila profil ada
  useEffect(() => {
    void (async () => {
      try {
        const p = await getCurrentProfile()
        if (!p) return
        if (p.tanggal_lahir) {
          const birth = new Date(p.tanggal_lahir)
          const now = new Date()
          let age = now.getFullYear() - birth.getFullYear()
          const m = now.getMonth() - birth.getMonth()
          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
          if (age >= 10 && age <= 60) setUsia(String(age))
        }
        if (p.hpht) {
          const uk = weeksFromHpht(p.hpht)
          if (uk >= 0 && uk <= 45) setUkMinggu(String(uk))
        }
      } catch {}
    })()
  }, [])

  const nextFrom1 = () => {
    setErr(null)
    if (!sistolik || Number(sistolik) < 70 || Number(sistolik) > 250) return setErr("Isi sistolik 70–250 mmHg")
    if (!diastolik || Number(diastolik) < 40 || Number(diastolik) > 150) return setErr("Isi diastolik 40–150 mmHg")
    if (!ukMinggu || Number(ukMinggu) < 0 || Number(ukMinggu) > 45) return setErr("Isi usia kehamilan 0–45 minggu")
    setStep(2)
  }

  const handle = async () => {
    setErr(null)
    setFieldErrs({})
    setLoading(true)
    try {
      const res = await submitPreeklamsia({
        userId: await getCurrentUserId(),
        sistolik: Number(sistolik),
        diastolik: Number(diastolik),
        ukMinggu: Number(ukMinggu),
        proteinuria,
        riwayatPE: riwayat.includes("pe"),
        htKronik: riwayat.includes("ht"),
        ginjalKronik: riwayat.includes("ginjal"),
        diabetesMelitus: riwayat.includes("dm"),
        autoimun: riwayat.includes("autoimun"),
        riwayatKeluargaPE: riwayat.includes("keluarga"),
        kehamilanGanda: gemeli,
        nullipara: anakPertama,
        imtPre: imtPre ? Number(imtPre) : undefined,
        usia: usia ? Number(usia) : undefined,
        jarakTahun: jarak ? Number(jarak) : undefined,
      })
      onSuccess(res)
    } catch (e: unknown) {
      const errObj = e as { errs?: Record<string, string>; message?: string }
      if (errObj.errs) setFieldErrs(errObj.errs)
      else setErr(errObj.message ?? "Gagal")
    } finally {
      setLoading(false)
    }
  }

  const pct = step === 1 ? 50 : 100

  return (
    <div className="space-y-3">
      <div className="px-1">
        <div className="flex items-center justify-between text-xs text-[#6C757D]">
          <span>Langkah {step} dari 2</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EAE6E0]">
          <div className="h-full rounded-full bg-[#1E2326] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="space-y-6 p-5">
          {step === 1 && (
            <>
              <h2 className="!m-0 text-[20px] font-bold tracking-tight text-[#1E2326]">Tekanan Darah & Data Kehamilan</h2>
              <div className="grid mt-3 grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-[#1E2326]">TD Sistolik (mmHg)</p>
                  <Input type="number" value={sistolik} onChange={(e) => setSistolik(e.target.value)} className="rounded-full bg-white px-4" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-[#1E2326]">TD Diastolik (mmHg)</p>
                  <Input type="number" value={diastolik} onChange={(e) => setDiastolik(e.target.value)} className="rounded-full bg-white px-4" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-[#1E2326]">Usia kehamilan (minggu)</p>
                  <Input type="number" value={ukMinggu} onChange={(e) => setUkMinggu(e.target.value)} className="rounded-full bg-white px-4" />
                  <p className="text-[11px] text-[#8A8F93]">Otomatis dari HPHT</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-[#1E2326]">Usia ibu (tahun)</p>
                  <Input type="number" value={usia} onChange={(e) => setUsia(e.target.value)} className="rounded-full bg-white px-4 placeholder:text-[11px]" placeholder="Opsional" />
                  <p className="text-[11px] text-[#8A8F93]">Otomatis dari tanggal lahir</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-[#1E2326]">IMT pra-hamil</p>
                <Input type="number" value={imtPre} onChange={(e) => setImtPre(e.target.value)} className="rounded-full bg-white px-4 placeholder:text-[11px]" placeholder="Opsional" />
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-[#1E2326]">Jarak dengan kehamilan lalu (tahun)</p>
                <Input type="number" value={jarak} onChange={(e) => setJarak(e.target.value)} className="rounded-full bg-white px-4 placeholder:text-[11px]" placeholder="Opsional" />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#1E2326]">Protein urine positif (dipstik)</p>
                <RadioRow selected={proteinuria === true} label="Ya" onClick={() => setProteinuria(true)} />
                <RadioRow selected={proteinuria === false} label="Tidak" onClick={() => setProteinuria(false)} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="!m-0 text-[20px] font-bold tracking-tight text-[#1E2326]">Faktor Risiko</h2>
              <div className="space-y-3 mt-2">
                <p className="text-sm font-medium text-[#1E2326]">Riwayat dan penyakit penyerta</p>
                <CheckRow checked={riwayat.includes("pe")} label="Pernah preeklamsia sebelumnya" onToggle={() => toggleRiwayat("pe")} />
                <CheckRow checked={riwayat.includes("ht")} label="Hipertensi kronik" onToggle={() => toggleRiwayat("ht")} />
                <CheckRow checked={riwayat.includes("ginjal")} label="Penyakit ginjal" onToggle={() => toggleRiwayat("ginjal")} />
                <CheckRow checked={riwayat.includes("dm")} label="Diabetes melitus" onToggle={() => toggleRiwayat("dm")} />
                <CheckRow checked={riwayat.includes("autoimun")} label="Autoimun (APS/SLE)" onToggle={() => toggleRiwayat("autoimun")} />
                <CheckRow checked={riwayat.includes("keluarga")} label="Keluarga ada preeklamsia" onToggle={() => toggleRiwayat("keluarga")} />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#1E2326]">Kondisi kehamilan ini</p>
                <CheckRow checked={gemeli} label="Hamil kembar" onToggle={() => setGemeli((v) => !v)} />
                <CheckRow checked={anakPertama} label="Anak pertama (nullipara)" onToggle={() => setAnakPertama((v) => !v)} />
              </div>

              {Object.keys(fieldErrs).length > 0 && <p className="text-center text-xs text-[#E57373]">{Object.values(fieldErrs)[0]}</p>}
            </>
          )}

          {err && <p className="text-center text-xs text-[#E57373]">{err}</p>}

          <div className="flex gap-2 pt-1">
            {step === 1 ? (
              <>
                <Button variant="outline" className="flex-1 rounded-full" onClick={onBack}>Batal</Button>
                <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A]" onClick={nextFrom1}>Lanjut</Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(1)}>Kembali</Button>
                <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A]" disabled={loading} onClick={handle}>
                  {loading ? "Menyimpan" : "Lihat hasil"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
