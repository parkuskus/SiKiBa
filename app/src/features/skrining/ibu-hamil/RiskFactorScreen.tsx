import { useEffect, useState } from "react"
import { getCurrentProfile, getCurrentUserId } from "@/data/currentUser"
import { weeksFromHpht } from "@/clinical-rules/ukHpl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitRiskFactor } from "@/features/skrining/ibu-hamil/riskFactorForm"
import SkriningFormShell from "@/features/skrining/components/SkriningFormShell"

type Result = { skor: number; kategori: string; warna: string; faktorRisiko: string[]; faktorAman: string[] }

type Paritas = "primi" | "multi" | "grande" | null
type Jarak = "lt2" | "gte2" | "belum" | null

function RadioRow({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 w-full items-center gap-3 rounded-[16px] px-3 text-left text-sm ring-1 transition-colors active:scale-[0.99] ${
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
      className={`flex min-h-11 w-full items-center gap-3 rounded-[16px] px-3 text-left text-sm ring-1 transition-colors active:scale-[0.99] ${
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
    <div className="flex shrink-0 gap-1.5">
      {[true, false].map((choice) => (
        <button
          key={String(choice)}
          type="button"
          aria-pressed={value === choice}
          onClick={() => onChange(choice)}
          className={`min-h-11 min-w-11 rounded-[14px] px-2.5 text-xs font-semibold transition-colors ${value === choice ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`}
        >
          {choice ? "Ya" : "Tidak"}
        </button>
      ))}
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
  const back = () => step === 1 ? onBack() : setStep((step - 1) as 1 | 2 | 3)

  return (
    <SkriningFormShell title="Faktor Risiko" subtitle="Skor Poedji Rochjati" onBack={back} illustration="/illu/illu-46-skrining-risiko.png">
      <div className="space-y-3.5">
        <div className="px-1">
          <div className="flex items-center justify-between text-xs text-[#33443F]">
            <span>Langkah {step} dari 3</span>
            <span className="font-semibold text-[#DB2777]">{pct} persen</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#FFE2E2]">
            <div className="h-full rounded-full bg-[#4A6E54] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {step === 1 && (
          <section className="space-y-3.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
            <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Data Kehamilan</h2>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-[16px] bg-white px-3 py-2.5 ring-1 ring-[#D9E7E2]">
                <label className="block text-xs text-[#33443F]">Usia ibu</label>
                <div className="flex items-center gap-1">
                  <Input type="number" aria-label="Usia ibu dalam tahun" value={usia} onChange={(e) => setUsia(e.target.value)} className="h-auto border-0 bg-transparent p-0 text-base font-bold text-[#DB2777] shadow-none focus-visible:ring-0" />
                  <span className="text-sm font-bold text-[#DB2777]">th</span>
                </div>
              </div>
              <div className="rounded-[16px] bg-white px-3 py-2.5 ring-1 ring-[#D9E7E2]">
                <label className="block text-xs text-[#33443F]">UK pekan</label>
                <div className="flex items-center gap-1">
                  <Input type="number" aria-label="Usia kehamilan dalam minggu" value={ukMinggu} onChange={(e) => setUkMinggu(e.target.value)} className="h-auto border-0 bg-transparent p-0 text-base font-bold text-[#DB2777] shadow-none focus-visible:ring-0" />
                  <span className="text-sm font-bold text-[#DB2777]">mg</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#33443F]">Otomatis dari profil dan HPHT</p>

            <div className="space-y-2.5">
              <p className="text-[13px] font-bold text-[#1D2B29]">Status Paritas</p>
              <RadioRow selected={paritas === "primi"} label="Hamil pertama" onClick={() => setParitas("primi")} />
              <RadioRow selected={paritas === "multi"} label="Hamil ke 2 sampai 3" onClick={() => setParitas("multi")} />
              <RadioRow selected={paritas === "grande"} label="Hamil ke 4 atau lebih" onClick={() => setParitas("grande")} />
            </div>

            <div className="space-y-2.5">
              <p className="text-[13px] font-bold text-[#1D2B29]">Jarak Hamil Terakhir</p>
              <RadioRow selected={jarak === "lt2"} label="Kurang dari 2 tahun" onClick={() => setJarak("lt2")} />
              <RadioRow selected={jarak === "gte2"} label="2 tahun atau lebih" onClick={() => setJarak("gte2")} />
              <RadioRow selected={jarak === "belum"} label="Belum pernah hamil sebelumnya" onClick={() => setJarak("belum")} />
            </div>
          </section>
        )}

        {step === 2 && (
          <div className="space-y-3.5">
            <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
              <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Riwayat Komplikasi</h2>
              <CheckRow checked={kompl.includes("tidak")} label="Tidak ada" onToggle={() => toggleKompl("tidak")} />
              <CheckRow checked={kompl.includes("perdarahan")} label="Perdarahan hamil lalu" onToggle={() => toggleKompl("perdarahan")} />
              <CheckRow checked={kompl.includes("pe")} label="Preeklamsia lalu" onToggle={() => toggleKompl("pe")} />
              <CheckRow checked={kompl.includes("prematur")} label="Lahir prematur" onToggle={() => toggleKompl("prematur")} />
              <CheckRow checked={kompl.includes("sc")} label="Operasi caesar" onToggle={() => toggleKompl("sc")} />
              <CheckRow checked={kompl.includes("lainnya")} label="Komplikasi obstetri lainnya" onToggle={() => toggleKompl("lainnya")} />
            </section>
            <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
              <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Penyakit Kronik</h2>
              <div className="grid grid-cols-6 gap-2">
                <button type="button" onClick={() => toggleKronik("tidak")} className={`col-span-3 min-h-11 rounded-[14px] px-2 text-xs font-semibold ${kronik.includes("tidak") ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`}>Tidak ada</button>
                <button type="button" onClick={() => toggleKronik("hipertensi")} className={`col-span-3 min-h-11 rounded-[14px] px-2 text-xs font-semibold ${kronik.includes("hipertensi") ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`}>Hipertensi</button>
                {[["dm", "Diabetes"], ["jantung", "Jantung"], ["ginjal", "Ginjal"]].map(([key, label]) => (
                  <button key={key} type="button" onClick={() => toggleKronik(key)} className={`col-span-2 min-h-11 rounded-[14px] px-2 text-xs font-semibold ${kronik.includes(key) ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`}>{label}</button>
                ))}
              </div>
            </section>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3.5">
            <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
              <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Pemeriksaan Fisik</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Sistolik", value: sistolik, set: setSistolik, unit: "mmHg", key: "sistolik" },
                  { label: "Diastolik", value: diastolik, set: setDiastolik, unit: "mmHg", key: "diastolik" },
                  { label: "Tinggi cm", value: tbCm, set: setTbCm, unit: "cm", key: "tbCm" },
                  { label: "Berat kg", value: bbKg, set: setBbKg, unit: "kg", key: "bbKg" },
                ].map((field) => (
                  <div key={field.key} className="rounded-[16px] bg-white px-3 py-2.5 ring-1 ring-[#D9E7E2]">
                    <label className="block text-xs text-[#33443F]">{field.label}</label>
                    <div className="flex items-center gap-1">
                      <Input type="number" aria-label={`${field.label} ${field.unit}`} value={field.value} onChange={(e) => field.set(e.target.value)} className="h-auto border-0 bg-transparent p-0 text-base font-bold text-[#DB2777] shadow-none focus-visible:ring-0" />
                    </div>
                    {fieldErrs[field.key] && <p className="text-[11px] text-[#E57373]">{fieldErrs[field.key]}</p>}
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-2.5 rounded-[24px] bg-[#EAF4F0] p-3.5">
              <h2 className="!m-0 text-sm font-bold text-[#1D2B29]">Kondisi khusus</h2>
              {[
                { label: "Preeklamsia lalu", value: riwayatPE, set: setPE },
                { label: "Hamil kembar", value: gemeli, set: setGemeli },
                { label: "Teknik reproduksi berbantu", value: trb, set: setTrb },
                { label: "Bayi sungsang", value: letak, set: setLetak },
                { label: "Ketuban banyak", value: hidramnion, set: setHidramnion },
              ].map((item) => (
                <div key={item.label} className="flex min-h-11 items-center justify-between gap-2">
                  <span className="min-w-0 text-xs text-[#33443F]">{item.label}</span>
                  <YesNo value={item.value} onChange={item.set} />
                </div>
              ))}
            </section>
          </div>
        )}

        {error && <p role="alert" className="text-center text-xs text-[#C62828]">{error}</p>}
        <div className="mt-1 flex gap-2">
          {step > 1 && <Button variant="outline" className="min-h-[46px] flex-1 rounded-full border-[#D9E7E2] bg-white text-[#33443F]" onClick={() => setStep((step - 1) as 1 | 2 | 3)}>Kembali</Button>}
          {step === 1 && <Button variant="outline" className="min-h-[46px] flex-1 rounded-full border-[#D9E7E2] bg-white text-[#33443F]" onClick={onBack}>Batal</Button>}
          {step < 3 ? (
            <Button className="min-h-[46px] flex-1 rounded-full bg-[#4A6E54] font-bold text-white hover:bg-[#3D5C46]" onClick={step === 1 ? nextFrom1 : () => setStep(3)}>
              Lanjut
            </Button>
          ) : (
            <Button className="min-h-[46px] flex-1 rounded-full bg-[#4A6E54] font-bold text-white hover:bg-[#3D5C46]" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Menyimpan" : "Lihat hasil"}
            </Button>
          )}
        </div>
      </div>
    </SkriningFormShell>
  )
}
