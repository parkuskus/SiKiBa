import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { ArrowLeft, Backpack, ChevronRight, CircleAlert, ClipboardList, Download, HeartPulse, Save, Share2, Wallet, X } from "lucide-react"
import type { BirthPlan } from "@/data/db"
import { generateBirthPlanPDF, shareBirthPlanPDF } from "@/services/exportService"
import { CHECKLIST_PERLENGKAPAN, getBirthPlan, pilihVersiRencana, rencanaKosong, simpanLokalDanSinkronkan, TANDA_PERSALINAN } from "./birthPlanService"

type Props = { userId: string; readOnly?: boolean; onClose: () => void }
type Missing = { label: string; target: string }

function hitungProgress(plan: BirthPlan) {
  const fields = [plan.penolong, plan.tempatBersalin, plan.pendamping, plan.hpBidanSiaga, plan.donor1Nama, plan.donor1GolonganDarah, plan.donor2Nama, plan.donor2GolonganDarah, plan.transportasi]
  const inputsComplete = fields.filter((value) => Boolean(value.trim())).length + Number(plan.danaDikonfirmasi && plan.estimasiDana !== null)
  const checklistComplete = Object.values(plan.checklistPerlengkapan).filter(Boolean).length
  const signsComplete = Object.values(plan.tandaPersalinanDipahami).filter(Boolean).length
  return { complete: inputsComplete + checklistComplete + signsComplete, percent: Math.round(((inputsComplete + checklistComplete + signsComplete) / 25) * 100), checklistComplete, signsComplete }
}

function daftarKekurangan(plan: BirthPlan): Missing[] {
  const missing: Missing[] = []
  const fields: [keyof BirthPlan, string, string][] = [
    ["penolong", "Penolong persalinan", "penolong"],
    ["tempatBersalin", "Tempat bersalin", "tempatBersalin"],
    ["pendamping", "Pendamping persalinan", "pendamping"],
    ["hpBidanSiaga", "Nomor HP bidan atau dokter siaga", "hpBidanSiaga"],
    ["donor1Nama", "Nama calon donor darah pertama", "donor1Nama"],
    ["donor1GolonganDarah", "Golongan darah donor pertama", "donor1GolonganDarah"],
    ["donor2Nama", "Nama calon donor darah kedua", "donor2Nama"],
    ["donor2GolonganDarah", "Golongan darah donor kedua", "donor2GolonganDarah"],
    ["transportasi", "Transportasi rujukan", "transportasi"],
  ]
  for (const [key, label, target] of fields) if (!String(plan[key] ?? "").trim()) missing.push({ label, target })
  if (!plan.danaDikonfirmasi || plan.estimasiDana === null) missing.push({ label: "Estimasi dana persalinan", target: "estimasiDana" })
  const { checklistComplete, signsComplete } = hitungProgress(plan)
  if (checklistComplete < CHECKLIST_PERLENGKAPAN.length) missing.push({ label: `Perlengkapan ibu dan bayi (${checklistComplete} dari 10 siap)`, target: "checklistPerlengkapan" })
  if (signsComplete < TANDA_PERSALINAN.length) missing.push({ label: `Tanda persalinan (${signsComplete} dari 5 dipahami)`, target: "tandaPersalinanDipahami" })
  return missing
}

function StepCard({ nomor, judul, icon, children, id }: { nomor: number; judul: string; icon: ReactNode; children: ReactNode; id: string }) {
  return (
    <section id={id} className="scroll-mt-20 rounded-[24px] bg-white p-4 ring-1 ring-[#D9E7E2]">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#EAF4F0] text-[#4A6E54]">{icon}</span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#536961]">Langkah {nomor}</p>
          <h2 className="text-base font-extrabold leading-tight text-[#1D2B29]">{judul}</h2>
        </div>
      </div>
      {children}
    </section>
  )
}

function TextField({ id, label, value, placeholder, onChange, readOnly, type = "text" }: { id: string; label: string; value: string; placeholder: string; onChange: (value: string) => void; readOnly: boolean; type?: string }) {
  return (
    <label id={`${id}-field`} className="block min-w-0">
      <span className="mb-1.5 block text-sm font-medium text-[#33443F]">{label}</span>
      {readOnly ? (
        <span className="flex min-h-12 items-center rounded-[16px] bg-[#FFFCF6] px-3.5 text-sm text-[#33443F] ring-1 ring-[#E7DED1]">{value || "Belum diisi"}</span>
      ) : (
        <input id={id} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-[16px] border border-[#E7DED1] bg-[#FFFCF6] px-3.5 text-sm text-[#1D2B29] outline-none placeholder:text-[#66736F] focus-visible:ring-2 focus-visible:ring-[#4A6E54]" />
      )}
    </label>
  )
}

function Checklist({ items, values, onChange, readOnly }: { items: readonly (readonly [string, string])[]; values: Record<string, boolean>; onChange: (key: string, value: boolean) => void; readOnly: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
      {items.map(([key, label]) => (
        <label key={key} className={`flex min-h-11 items-center gap-2.5 rounded-[16px] border border-[#E7DED1] bg-[#FFFCF6] px-3 py-2 text-sm leading-snug text-[#33443F] ${readOnly ? "cursor-default" : "cursor-pointer"}`}>
          <input type="checkbox" checked={Boolean(values[key])} disabled={readOnly} onChange={(event) => onChange(key, event.target.checked)} className="size-[18px] shrink-0 accent-[#4A6E54] disabled:opacity-100" />
          <span>{label}</span>
        </label>
      ))}
    </div>
  )
}

export default function BirthPlanScreen({ userId, readOnly = false, onClose }: Props) {
  const [draft, setDraft] = useState(() => rencanaKosong(userId))
  const [memuat, setMemuat] = useState(true)
  const [tersimpan, setTersimpan] = useState(false)
  const [menyimpan, setMenyimpan] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [conflict, setConflict] = useState<{ device: BirthPlan; cloud: BirthPlan }>()
  const [error, setError] = useState("")
  const [exporting, setExporting] = useState(false)
  const progress = useMemo(() => hitungProgress(draft), [draft])
  const missing = useMemo(() => daftarKekurangan(draft), [draft])

  const simpan = useCallback(async (): Promise<boolean> => {
    if (readOnly || !dirty) return true
    setMenyimpan(true)
    try {
      await simpanLokalDanSinkronkan(draft)
      setTersimpan(true)
      setDirty(false)
      return true
    } catch {
      setError("Rencana belum dapat disimpan. Coba lagi.")
      return false
    } finally {
      setMenyimpan(false)
    }
  }, [dirty, draft, readOnly])

  useEffect(() => {
    let active = true
    void getBirthPlan(userId).then((result) => {
      if (!active) return
      if (result.plan) setDraft(result.plan)
      setConflict(result.conflict)
      setMemuat(false)
    })
    return () => { active = false }
  }, [userId])

  useEffect(() => {
    if (readOnly || memuat || conflict || !dirty) return
    const timer = window.setTimeout(() => { void simpan() }, 450)
    return () => window.clearTimeout(timer)
  }, [draft, readOnly, memuat, conflict, dirty, simpan])

  function ubah(perubahan: Partial<BirthPlan>) {
    setDraft((current) => ({ ...current, ...perubahan, updatedAt: new Date().toISOString() }))
    setDirty(true)
    setTersimpan(false)
    setError("")
  }

  async function tutup() {
    if (await simpan()) onClose()
  }

  async function bagikan() {
    if (dirty && !(await simpan())) return
    setExporting(true)
    setError("")
    try {
      await shareBirthPlanPDF(draft)
    } catch {
      setError("PDF belum dapat dibuat. Pastikan data tersimpan, lalu coba lagi.")
    } finally {
      setExporting(false)
    }
  }

  async function unduh() {
    if (dirty && !(await simpan())) return
    setExporting(true)
    setError("")
    try {
      const blob = await generateBirthPlanPDF(draft)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "Rencana-Persalinan-SIAGA-Bunda.pdf"
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      setError("PDF belum dapat dibuat. Pastikan data tersimpan, lalu coba lagi.")
    } finally {
      setExporting(false)
    }
  }

  async function pilihKonflik(versi: "device" | "cloud") {
    if (!conflict) return
    const pilihan = versi === "device" ? conflict.device : conflict.cloud
    await pilihVersiRencana(pilihan)
    setDraft(pilihan)
    setConflict(undefined)
    setDirty(false)
  }

  function checklist(field: "checklistPerlengkapan" | "tandaPersalinanDipahami", key: string, checked: boolean) {
    ubah({ [field]: { ...draft[field], [key]: checked } })
  }

  return (
    <div className="-mx-4 -mt-5 min-h-[100dvh] bg-[#FFFCF6]">
      <header className="sticky top-0 z-20 flex min-h-[68px] items-center gap-3 border-b border-[#E8EFEB] bg-white px-4 py-3">
        <button type="button" onClick={() => void tutup()} aria-label="Kembali" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F4F0E8] text-[#536961] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="!m-0 min-w-0 flex-1 text-base font-extrabold leading-tight text-[#1D2B29]">Birth Plan dan Persiapan Persalinan (P4K)</h1>
        <button type="button" onClick={() => void tutup()} aria-label="Tutup rencana persalinan" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F4F0E8] text-[#536961] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]">
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <main className="space-y-5 px-4 pb-8 pt-5">
        {memuat ? (
          <div aria-live="polite" className="rounded-[22px] bg-white p-5 text-sm text-[#536961] ring-1 ring-[#D9E7E2]">Memuat rencana persalinan…</div>
        ) : (
          <>
            <section className="rounded-[24px] bg-white p-5 shadow-[0_2px_6px_rgba(38,53,47,0.08)] ring-1 ring-[#E7DED1]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-[#1D2B29]">Rencana Persalinan Saya</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#536961]">Isi bertahap. Perubahan tersimpan otomatis di perangkat.</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${progress.complete === 25 ? "bg-[#EAF4F0] text-[#315D40]" : "bg-[#EEF2F4] text-[#53616A]"}`}>
                  {progress.complete === 25 ? "Lengkap" : "Belum lengkap"}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#536961]">
                <span>Kelengkapan P4K</span><span className="text-sm text-[#1D2B29]">{progress.percent}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#E7ECE9]" role="progressbar" aria-label="Kelengkapan P4K" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}>
                <div className="h-full rounded-full bg-[#7AAE9A] transition-[width]" style={{ width: `${progress.percent}%` }} />
              </div>
              <p className="mt-2 text-xs text-[#536961]">{progress.complete} dari 25 butir sudah dilengkapi</p>
              {readOnly && <p className="mt-3 rounded-[14px] bg-[#EAF4F0] px-3 py-2 text-xs font-medium text-[#315D40]">Tampilan ini hanya untuk melihat. Ubah rencana melalui kartu di Beranda saat mode kehamilan.</p>}
              {!readOnly && (menyimpan || tersimpan) && <p role="status" className="mt-3 text-xs font-medium text-[#315D40]">{menyimpan ? "Menyimpan rencana…" : "Tersimpan di perangkat"}</p>}
            </section>

            {conflict && !readOnly && (
              <section className="rounded-[20px] border border-[#E6B45E] bg-[#FFF0C2] p-4" aria-labelledby="conflict-title">
                <h2 id="conflict-title" className="font-bold text-[#704500]">Ada dua versi rencana</h2>
                <p className="mt-1 text-sm leading-relaxed text-[#704500]">Pilih data perangkat ini atau data yang tersimpan online. Pilihan lain akan digantikan.</p>
                <div className="mt-3 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
                  <button type="button" onClick={() => void pilihKonflik("device")} className="min-h-11 rounded-full bg-white px-3 text-xs font-bold text-[#704500] ring-1 ring-[#E6B45E]">Gunakan versi perangkat</button>
                  <button type="button" onClick={() => void pilihKonflik("cloud")} className="min-h-11 rounded-full bg-[#4A6E54] px-3 text-xs font-bold text-white">Gunakan versi online</button>
                </div>
              </section>
            )}

            {!readOnly && missing.length > 0 && (
              <section className="rounded-[22px] border border-[#E6B45E] bg-[#FFF0C2] p-4 text-[#704500]">
                <h2 className="flex items-center gap-2 text-base font-extrabold"><CircleAlert className="size-5" aria-hidden="true" /> Masih perlu dilengkapi</h2>
                <ul className="mt-2 space-y-1.5">
                  {missing.map((item) => (
                    <li key={item.target}>
                      <button type="button" onClick={() => document.getElementById(item.target)?.scrollIntoView({ behavior: "smooth", block: "center" })} className="flex min-h-7 items-start gap-2 text-left text-sm leading-relaxed focus-visible:outline-none focus-visible:underline">
                        <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[#9A5B00]" /><span>{item.label}</span><ChevronRight className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <StepCard nomor={1} judul="Informasi Persalinan" id="informasiPersalinan" icon={<ClipboardList className="size-5" />}>
              <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                <TextField id="penolong" label="Nama penolong persalinan" value={draft.penolong} placeholder="Bidan atau dokter" readOnly={readOnly || Boolean(conflict)} onChange={(value) => ubah({ penolong: value })} />
                <TextField id="tempatBersalin" label="Tempat akan bersalin" value={draft.tempatBersalin} placeholder="Puskesmas, RS, atau klinik" readOnly={readOnly || Boolean(conflict)} onChange={(value) => ubah({ tempatBersalin: value })} />
                <TextField id="pendamping" label="Pendamping persalinan" value={draft.pendamping} placeholder="Suami atau keluarga" readOnly={readOnly || Boolean(conflict)} onChange={(value) => ubah({ pendamping: value })} />
                <TextField id="hpBidanSiaga" label="Nomor HP bidan atau dokter siaga" value={draft.hpBidanSiaga} placeholder="08xxxxxxxxxx" readOnly={readOnly || Boolean(conflict)} onChange={(value) => ubah({ hpBidanSiaga: value })} type="tel" />
              </div>
            </StepCard>

            <StepCard nomor={2} judul="Persiapan Darurat" id="persiapanDarurat" icon={<HeartPulse className="size-5" />}>
              <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
                {([1, 2] as const).map((nomor) => {
                  const namaKey = nomor === 1 ? "donor1Nama" : "donor2Nama"
                  const darahKey = nomor === 1 ? "donor1GolonganDarah" : "donor2GolonganDarah"
                  return (
                    <div key={nomor} className="space-y-3">
                      <TextField id={namaKey} label={`Calon donor darah ${nomor}`} value={draft[namaKey]} placeholder="Nama lengkap" readOnly={readOnly || Boolean(conflict)} onChange={(value) => ubah({ [namaKey]: value })} />
                      <label id={`${darahKey}-field`} className="block">
                        <span className="mb-1.5 block text-sm font-medium text-[#33443F]">Golongan darah donor {nomor}</span>
                        {readOnly ? <span className="flex min-h-12 items-center rounded-[16px] bg-[#FFFCF6] px-3.5 text-sm text-[#33443F] ring-1 ring-[#E7DED1]">{draft[darahKey] || "Belum diisi"}</span> : (
                          <select id={darahKey} value={draft[darahKey]} onChange={(event) => ubah({ [darahKey]: event.target.value as BirthPlan[typeof darahKey] })} className="min-h-12 w-full rounded-[16px] border border-[#E7DED1] bg-[#FFFCF6] px-3.5 text-sm text-[#1D2B29] outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54]">
                            <option value="">Pilih golongan darah</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
                          </select>
                        )}
                      </label>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4">
                <TextField id="transportasi" label="Transportasi yang telah disiapkan" value={draft.transportasi} placeholder="Mobil keluarga, ambulans desa, atau kendaraan siaga" readOnly={readOnly || Boolean(conflict)} onChange={(value) => ubah({ transportasi: value })} />
                <p className="mt-2 text-xs leading-relaxed text-[#536961]">Pastikan transportasi dapat dihubungi saat dibutuhkan.</p>
              </div>
            </StepCard>

            <StepCard nomor={3} judul="Persiapan Biaya" id="persiapanBiaya" icon={<Wallet className="size-5" />}>
              <label id="estimasiDana-field" className="block">
                <span className="mb-1.5 block text-sm font-medium text-[#33443F]">Estimasi dana persalinan (Rp)</span>
                {readOnly ? <span className="flex min-h-12 items-center rounded-[16px] bg-[#FFFCF6] px-3.5 text-sm text-[#33443F] ring-1 ring-[#E7DED1]">{draft.estimasiDana === null ? "Belum diisi" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(draft.estimasiDana)}</span> : (
                  <input id="estimasiDana" type="number" min="0" step="1000" value={draft.estimasiDana ?? ""} placeholder="0" onChange={(event) => { const value = event.target.value; ubah({ estimasiDana: value === "" ? null : Math.max(0, Number(value)), danaDikonfirmasi: value !== "" }) }} className="min-h-12 w-full rounded-[16px] border border-[#E7DED1] bg-[#FFFCF6] px-3.5 text-sm text-[#1D2B29] outline-none placeholder:text-[#66736F] focus-visible:ring-2 focus-visible:ring-[#4A6E54]" />
                )}
              </label>
              <p className="mt-2 text-xs text-[#536961]">Termasuk biaya rujukan dan kebutuhan tak terduga.</p>
            </StepCard>

            <StepCard nomor={4} judul="Checklist Perlengkapan Ibu dan Bayi" id="checklistPerlengkapan" icon={<Backpack className="size-5" />}>
              <p className="mb-3 text-xs text-[#536961]">{progress.checklistComplete} dari 10 perlengkapan siap</p>
              <Checklist items={CHECKLIST_PERLENGKAPAN} values={draft.checklistPerlengkapan} readOnly={readOnly || Boolean(conflict)} onChange={(key, checked) => checklist("checklistPerlengkapan", key, checked)} />
            </StepCard>

            <StepCard nomor={5} judul="Tanda Persalinan yang Dipahami" id="tandaPersalinanDipahami" icon={<CircleAlert className="size-5" />}>
              <Checklist items={TANDA_PERSALINAN} values={draft.tandaPersalinanDipahami} readOnly={readOnly || Boolean(conflict)} onChange={(key, checked) => checklist("tandaPersalinanDipahami", key, checked)} />
              <div className="mt-4 rounded-[18px] border border-[#E57373] bg-[#FDE7E5] p-3.5 text-[#922D2A]">
                <h3 className="flex items-center gap-2 text-sm font-bold"><CircleAlert className="size-4" aria-hidden="true" /> Segera ke fasilitas kesehatan bila</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
                  <li>Ketuban pecah.</li><li>Kontraksi terasa teratur dan makin kuat.</li><li>Terjadi perdarahan dari jalan lahir.</li><li>Gerakan janin berkurang atau tidak terasa.</li><li>Bunda mengalami sakit kepala berat, pandangan kabur, atau kejang.</li>
                </ul>
                <p className="mt-2 text-xs leading-relaxed">Hubungi bidan atau fasilitas kesehatan untuk arahan segera.</p>
              </div>
            </StepCard>

            <section className="rounded-[22px] bg-white p-4 ring-1 ring-[#D9E7E2]">
              <h2 className="text-base font-extrabold text-[#1D2B29]">Ringkasan Rencana Persalinan</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  ["Tempat bersalin", draft.tempatBersalin], ["Penolong", draft.penolong], ["Pendamping", draft.pendamping], ["HP siaga", draft.hpBidanSiaga],
                  ["Donor 1", [draft.donor1Nama, draft.donor1GolonganDarah].filter(Boolean).join(" · ")], ["Donor 2", [draft.donor2Nama, draft.donor2GolonganDarah].filter(Boolean).join(" · ")],
                  ["Transportasi", draft.transportasi], ["Estimasi dana", draft.estimasiDana === null ? "" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(draft.estimasiDana)],
                ].map(([label, value]) => <div key={label} className="min-h-[58px] rounded-[14px] bg-[#DDEAF0] px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#536961]">{label}</p><p className="mt-0.5 break-words text-xs font-medium text-[#1D2B29]">{value || "Belum diisi"}</p></div>)}
              </div>
            </section>

            {error && <p role="alert" className="rounded-[14px] bg-[#FDE7E5] px-3.5 py-3 text-sm text-[#922D2A]">{error}</p>}

            <div className="grid grid-cols-1 gap-2 pb-4">
              {!readOnly && <button type="button" onClick={() => void tutup()} disabled={menyimpan || Boolean(conflict)} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#5D876B] px-4 text-sm font-bold text-white transition-colors hover:bg-[#4A6E54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D2B29] disabled:opacity-60"><Save className="size-4" aria-hidden="true" /> Simpan dan kembali ke Beranda</button>}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => void unduh()} disabled={exporting || Boolean(conflict)} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#1D2B29] bg-white px-3 text-xs font-bold text-[#1D2B29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6E54] disabled:opacity-60"><Download className="size-4" aria-hidden="true" /> Unduh PDF</button>
                <button type="button" onClick={() => void bagikan()} disabled={exporting || Boolean(conflict)} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#4A6E54] px-3 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D2B29] disabled:opacity-60"><Share2 className="size-4" aria-hidden="true" /> Bagikan PDF</button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
