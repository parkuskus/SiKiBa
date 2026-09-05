import { useEffect, useState } from "react"
import { getCurrentProfile, getCurrentUserId } from "@/data/currentUser"
import { weeksFromHpht } from "@/clinical-rules/ukHpl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { submitRiskFactor } from "@/features/skrining/ibu-hamil/riskFactorForm"

type Result = { skor: number; kategori: string; warna: string; faktorRisiko: string[]; faktorAman: string[] }

type Paritas = "primi" | "multi" | "grande" | null
type Jarak = "lt2" | "gte2" | "belum" | null

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

function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="space-y-3">
      <RadioRow selected={value === true} label="Ya" onClick={() => onChange(true)} />
      <RadioRow selected={value === false} label="Tidak" onClick={() => onChange(false)} />
    </div>
  )
}

export default function RiskFactorScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (r: Result) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [usia, setUsia] = useState("26")
  const [ukMinggu, setUkMinggu] = useState("28")
  const [paritas, setParitas] = useState<Paritas>("multi")
  const [jarak, setJarak] = useState<Jarak>("belum")
  const [kompl, setKompl] = useState<string[]>([])
  const [kronik, setKronik] = useState<string[]>([])
  const [sistolik, setSistolik] = useState("")
  const [diastolik, setDiastolik] = useState("")
  const [tbCm, setTbCm] = useState("")
  const [bbKg, setBbKg] = useState("")
  const [gemeli, setGemeli] = useState(false)
  const [trb, setTrb] = useState(false)
  const [letak, setLetak] = useState(false)
  const [hidramnion, setHidramnion] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrs, setFieldErrs] = useState<Record<string, string>>({})

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

  const riwayatPE = kompl.includes("pe")

  const toggleKompl = (id: string) => {
    setKompl((prev) => {
      if (id === "tidak") return prev.includes("tidak") ? [] : ["tidak"]
      const withoutTidak = prev.filter((x) => x !== "tidak")
      return withoutTidak.includes(id) ? withoutTidak.filter((x) => x !== id) : [...withoutTidak, id]
    })
  }

  const toggleKronik = (id: string) => {
    setKronik((prev) => {
      if (id === "tidak") return prev.includes("tidak") ? [] : ["tidak"]
      const withoutTidak = prev.filter((x) => x !== "tidak")
      return withoutTidak.includes(id) ? withoutTidak.filter((x) => x !== id) : [...withoutTidak, id]
    })
  }

  const setPE = (v: boolean) => {
    setKompl((prev) => {
      const withoutTidak = prev.filter((x) => x !== "tidak" && x !== "pe")
      return v ? [...withoutTidak] .concat("pe") : withoutTidak
    })
  }

  const nextFrom1 = () => {
    setError(null)
    if (!usia || Number(usia) < 10 || Number(usia) > 60) return setError("Isi usia Bunda 10–60 tahun")
    if (!ukMinggu || Number(ukMinggu) < 0 || Number(ukMinggu) > 45) return setError("Isi usia kehamilan 0–45 minggu")
    if (!paritas) return setError("Pilih status paritas")
    if (!jarak) return setError("Pilih jarak kehamilan terakhir")
    setStep(2)
  }

  const handleSubmit = async () => {
    setError(null)
    setFieldErrs({})
    setSubmitting(true)
    try {
      const paritasNum = paritas === "primi" ? 0 : paritas === "grande" ? 4 : 1
      const res = await submitRiskFactor({
        userId: await getCurrentUserId(),
        usia: Number(usia),
        paritas: paritasNum,
        jarakTahun: jarak === "lt2" ? 1 : jarak === "gte2" ? 3 : undefined,
        ukMinggu: ukMinggu ? Number(ukMinggu) : undefined,
        sistolik: sistolik ? Number(sistolik) : undefined,
        diastolik: diastolik ? Number(diastolik) : undefined,
        tbCm: tbCm ? Number(tbCm) : undefined,
        bbKg: bbKg ? Number(bbKg) : undefined,
        trb: trb || undefined,
        riwayatKomplikasi: kompl.some((x) => ["perdarahan", "prematur", "lainnya", "sc"].includes(x)),
        riwayatSC: kompl.includes("sc"),
        riwayatPE,
        penyakitKronik: kronik.some((x) => x !== "tidak"),
        kehamilanGanda: gemeli,
        hidramnion,
        kelainanLetak: letak,
      })
      onSuccess(res)
    } catch (e: unknown) {
      const err = e as { errs?: Record<string, string>; message?: string }
      if (err.errs) setFieldErrs(err.errs)
      else setError(err.message ?? "Gagal menyimpan")
    } finally {
      setSubmitting(false)
    }
  }

  const pct = step === 1 ? 33 : step === 2 ? 67 : 100

  return (
    <div className="space-y-3">
      <div className="px-1">
        <div className="flex items-center justify-between text-xs text-[#6C757D]">
          <span>Langkah {step} dari 3</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#EAE6E0]">
          <div className="h-full rounded-full bg-[#1E2326] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="space-y-5 p-5">
          {step === 1 && (
            <>
              <h2 className="!m-0 text-[16px] font-bold tracking-tight text-[#1E2326]">Data Kehamilan</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-[#1E2326]">Usia ibu (tahun)</p>
                  <Input type="number" value={usia} onChange={(e) => setUsia(e.target.value)} className="rounded-full bg-white px-4" />
                  <p className="text-[11px] text-[#8A8F93]">Otomatis dari tanggal lahir</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-[#1E2326]">Usia kehamilan (minggu)</p>
                  <Input type="number" value={ukMinggu} onChange={(e) => setUkMinggu(e.target.value)} className="rounded-full bg-white px-4" />
                  <p className="text-[11px] text-[#8A8F93]">Otomatis dari HPHT</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1E2326]">Status Paritas</p>
                <RadioRow selected={paritas === "primi"} label="Primigravida (hamil pertama)" onClick={() => setParitas("primi")} />
                <RadioRow selected={paritas === "multi"} label="Multigravida (2–3 kali)" onClick={() => setParitas("multi")} />
                <RadioRow selected={paritas === "grande"} label="Grande multipara (≥4 kali)" onClick={() => setParitas("grande")} />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1E2326]">Jarak Kehamilan Terakhir</p>
                <RadioRow selected={jarak === "lt2"} label="<2 tahun" onClick={() => setJarak("lt2")} />
                <RadioRow selected={jarak === "gte2"} label="≥2 tahun" onClick={() => setJarak("gte2")} />
                <RadioRow selected={jarak === "belum"} label="Belum pernah hamil sebelumnya" onClick={() => setJarak("belum")} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="!m-0 text-[16px] font-bold tracking-tight text-[#1E2326]">Riwayat Kesehatan</h2>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1E2326]">Riwayat Komplikasi Obstetri</p>
                <CheckRow checked={kompl.includes("tidak")} label="Tidak ada" onToggle={() => toggleKompl("tidak")} />
                <CheckRow checked={kompl.includes("perdarahan")} label="Perdarahan kehamilan sebelumnya" onToggle={() => toggleKompl("perdarahan")} />
                <CheckRow checked={kompl.includes("pe")} label="Preeklamsia/eklamsia sebelumnya" onToggle={() => toggleKompl("pe")} />
                <CheckRow checked={kompl.includes("prematur")} label="Persalinan prematur" onToggle={() => toggleKompl("prematur")} />
                <CheckRow checked={kompl.includes("sc")} label="Riwayat operasi caesar" onToggle={() => toggleKompl("sc")} />
                <CheckRow checked={kompl.includes("lainnya")} label="Komplikasi obstetri lainnya" onToggle={() => toggleKompl("lainnya")} />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1E2326]">Riwayat Penyakit Kronik</p>
                <CheckRow checked={kronik.includes("tidak")} label="Tidak ada" onToggle={() => toggleKronik("tidak")} />
                <CheckRow checked={kronik.includes("hipertensi")} label="Hipertensi" onToggle={() => toggleKronik("hipertensi")} />
                <CheckRow checked={kronik.includes("dm")} label="Diabetes Mellitus" onToggle={() => toggleKronik("dm")} />
                <CheckRow checked={kronik.includes("jantung")} label="Penyakit jantung" onToggle={() => toggleKronik("jantung")} />
                <CheckRow checked={kronik.includes("ginjal")} label="Penyakit ginjal" onToggle={() => toggleKronik("ginjal")} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="!m-0 text-[16px] font-bold tracking-tight text-[#1E2326]">Pemeriksaan Fisik</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-[#1E2326]">TD Sistolik (mmHg)</p>
                  <Input type="number" value={sistolik} onChange={(e) => setSistolik(e.target.value)} className="rounded-full bg-white px-4" placeholder="" />
                  {fieldErrs.sistolik && <p className="text-xs text-[#E57373]">{fieldErrs.sistolik}</p>}
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-[#1E2326]">TD Diastolik (mmHg)</p>
                  <Input type="number" value={diastolik} onChange={(e) => setDiastolik(e.target.value)} className="rounded-full bg-white px-4" placeholder="" />
                  {fieldErrs.diastolik && <p className="text-xs text-[#E57373]">{fieldErrs.diastolik}</p>}
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-[#1E2326]">Tinggi badan (cm)</p>
                  <Input type="number" value={tbCm} onChange={(e) => setTbCm(e.target.value)} className="rounded-full bg-white px-4" placeholder="" />
                  {fieldErrs.tbCm && <p className="text-xs text-[#E57373]">{fieldErrs.tbCm}</p>}
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-[#1E2326]">Berat badan (kg)</p>
                  <Input type="number" value={bbKg} onChange={(e) => setBbKg(e.target.value)} className="rounded-full bg-white px-4" placeholder="" />
                  {fieldErrs.bbKg && <p className="text-xs text-[#E57373]">{fieldErrs.bbKg}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1E2326]">Riwayat Preeklamsia Sebelumnya</p>
                <YesNo value={riwayatPE} onChange={setPE} />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1E2326]">Kehamilan Multipel (Gemeli)</p>
                <YesNo value={gemeli} onChange={setGemeli} />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1E2326]">Teknik Reproduksi Berbantu</p>
                <YesNo value={trb} onChange={setTrb} />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1E2326]">Posisi Bayi Sungsang atau Lintang</p>
                <YesNo value={letak} onChange={setLetak} />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#1E2326]">Air Ketuban Banyak</p>
                <YesNo value={hidramnion} onChange={setHidramnion} />
              </div>
            </>
          )}

          {error && <p className="text-center text-xs text-[#E57373]">{error}</p>}

          <div className="flex gap-2 pt-1">
            {step === 1 ? (
              <>
                <Button variant="outline" className="flex-1 rounded-full" onClick={onBack}>Batal</Button>
                <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A]" onClick={nextFrom1}>Lanjut</Button>
              </>
            ) : step === 2 ? (
              <>
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(1)}>Kembali</Button>
                <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A]" onClick={() => setStep(3)}>Lanjut</Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(2)}>Kembali</Button>
                <Button className="flex-1 rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A]" disabled={submitting} onClick={handleSubmit}>
                  {submitting ? "Menyimpan" : "Lihat hasil"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
