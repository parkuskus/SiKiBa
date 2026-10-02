import { useEffect, useState } from "react"
import { CalendarDays, Check, Clock3, Scale } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { db } from "@/data/db"
import { getCurrentUserId, getCurrentProfile } from "@/data/currentUser"
import { initANC, toggleANC } from "@/features/tracker/ancForm"
import { submitDiary } from "@/features/tracker/diaryForm"
import { getTimeline } from "@/features/tracker/timelineForm"
import { weeksFromHpht } from "@/clinical-rules/ukHpl"
import { calcIMT, kategoriIMT } from "@/clinical-rules/imtLila"
import SupplementSection from "@/features/tracker/SupplementSection"
import ANCCalendar from "@/features/tracker/ANCCalendar"
import WeightChart from "@/features/tracker/WeightChart"
import WeightFormSheet from "@/features/tracker/WeightFormSheet"
import WeightHistory from "@/features/tracker/WeightHistory"
import DiaryHistory from "@/features/tracker/DiaryHistory"
import MedForm from "@/features/tracker/MedForm"
import type { WeightEntry, ANCVisit, DiaryEntry } from "@/data/db"

const MILESTONES = [
  { w: 12, t: "Organ penting terbentuk" },
  { w: 20, t: "Gerakan terasa, kontrol ANC" },
  { w: 24, t: "Batas viabilitas janin" },
  { w: 28, t: "Masuk trimester 3" },
  { w: 37, t: "Cukup bulan" },
  { w: 40, t: "Hari perkiraan lahir" },
]

const DEMO_HPHT = "2026-02-12"
const SUPLEMEN_DEFAULT = [
  { id: "Fe", nama: "Zat besi", jam: "19.00" },
  { id: "Folat", nama: "Asam folat", jam: "07.30" },
  { id: "Ca", nama: "Kalsium", jam: "12.00" },
]

export default function PengingatPage() {
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [anc, setAnc] = useState<ANCVisit[]>([])
  const [uid, setUid] = useState<string>("demo-siti")
  const [hpht, setHpht] = useState<string>(DEMO_HPHT)
  const [bbPre, setBbPre] = useState<number>(55)
  const [tbCm, setTbCm] = useState<number>(160)
  const [startInfo, setStartInfo] = useState<string | null>(null)
  const [bbStatus, setBbStatus] = useState<{ kenaikan: number; trajectory: string } | null>(null)
  const [showWeightSheet, setShowWeightSheet] = useState(false)
  const [showWeightHistory, setShowWeightHistory] = useState(false)
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null)
  const [targetManual, setTargetManual] = useState<number | null>(() => {
    try {
      const v = localStorage.getItem("siaga_bb_target")
      return v ? Number(v) : null
    } catch {
      return null
    }
  })
  const [editingTarget, setEditingTarget] = useState(false)
  const [targetDraft, setTargetDraft] = useState("")
  const [diaryTitle, setDiaryTitle] = useState("")
  const [diaryText, setDiaryText] = useState("")
  const [diaryMood, setDiaryMood] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [diaryMsg, setDiaryMsg] = useState<string | null>(null)
  const [diaryList, setDiaryList] = useState<DiaryEntry[]>([])
  const [showDiaryHistory, setShowDiaryHistory] = useState(false)

  const load = async () => {
    const p = await getCurrentProfile()
    const h = p?.hpht ?? DEMO_HPHT
    const id = p?.id ?? (await getCurrentUserId())
    setUid(id)
    setHpht(h)
    // BB pre & TB dari skrining gizi terakhir; tanpa itu pakai data paling lama
    let bbPreLok = 55
    let tbLok = 160
    let dariGizi = false
    try {
      const gizi = await db.screeningResults.where("userId").equals(id).filter((r) => r.tipe === "imt_lila").toArray()
      gizi.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      const d = gizi[0]?.detail as { bbPreKg?: number; tbCm?: number } | undefined
      if (d?.bbPreKg) { bbPreLok = d.bbPreKg; dariGizi = true }
      if (d?.tbCm) tbLok = d.tbCm
    } catch {}
    const w = await db.weightEntries.where("userId").equals(id).toArray()
    w.sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    if (!dariGizi && w.length) bbPreLok = w[0].beratKg
    setBbPre(bbPreLok)
    setTbCm(tbLok)
    setWeights(w)
    if (dariGizi) setStartInfo(`Acuan awal: BB pra-hamil ${bbPreLok} kg (skrining gizi)`)
    else if (w.length) {
      const t = new Date(`${w[0].tanggal}T00:00:00`)
      const tLabel = isNaN(t.getTime()) ? w[0].tanggal : t.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
      setStartInfo(`Berat awal otomatis dari data paling lama: ${w[0].beratKg} kg (${tLabel})`)
    } else setStartInfo(null)
    // status trajectory dari entri terakhir
    if (w.length) {
      try {
        const ukNow = weeksFromHpht(h)
        const imt = calcIMT(bbPreLok, tbLok)
        const { targetKg } = kategoriIMT(imt)
        const kenaikan = Math.round((w[w.length - 1].beratKg - bbPreLok) * 10) / 10
        const targetProp = ((targetKg[0] + targetKg[1]) / 2) * (ukNow / 40)
        setBbStatus({ kenaikan, trajectory: kenaikan < targetProp - 1 ? "Kurang" : kenaikan > targetProp + 2 ? "Lebih" : "Normal" })
      } catch {}
    } else setBbStatus(null)
    let a = await db.ancVisits.where("userId").equals(id).toArray()
    if (!a.length) {
      await initANC(id, h)
      a = await db.ancVisits.where("userId").equals(id).toArray()
    }
    a.sort((x, y) => x.tanggalTerjadwal.localeCompare(y.tanggalTerjadwal))
    setAnc(a)
    const d = await db.diaryEntries.where("userId").equals(id).toArray()
    d.sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    setDiaryList(d)
  }

  useEffect(() => {
    void load()
  }, [])

  const handleSaveTarget = () => {
    const v = Number(targetDraft)
    if (!v || v < 20 || v > 250) return
    try {
      localStorage.setItem("siaga_bb_target", String(v))
    } catch {}
    setTargetManual(v)
    setEditingTarget(false)
  }

  const handleToggleAnc = async (id: string, done: boolean) => {
    await toggleANC(id, !done)
    await load()
  }

  const handleSaveAncNote = async (id: string, done: boolean, note: string) => {
    await toggleANC(id, done, note.trim() || undefined)
    await load()
  }

  const ancCountdown = (tgl: string) => {
    const diff = Math.ceil((new Date(tgl).getTime() - new Date(new Date().toISOString().slice(0, 10)).getTime()) / 86400000)
    if (diff < 0) return "terlewat"
    if (diff === 0) return "hari ini"
    return `${diff} hari lagi`
  }

  const handleDiary = async () => {
    if (!diaryText.trim()) return
    await submitDiary({ userId: uid, teks: diaryText.trim(), mood: diaryMood, judul: diaryTitle.trim() || undefined })
    setDiaryTitle("")
    setDiaryText("")
    setDiaryMsg("Tersimpan")
    setTimeout(() => setDiaryMsg(null), 1500)
    await load()
  }

  const weightBars = weights.length ? weights.slice(-8) : []
  const lastWeight = weightBars.length ? weightBars[weightBars.length - 1].beratKg : null
  // garis target: manual bila pengguna mengubah, sonst IOM proporsional UK kini
  const targetAbs = (() => {
    if (targetManual !== null && targetManual >= 20 && targetManual <= 250) return targetManual
    try {
      const ukNow = weeksFromHpht(hpht)
      const { targetKg } = kategoriIMT(calcIMT(bbPre, tbCm))
      return Math.round((bbPre + ((targetKg[0] + targetKg[1]) / 2) * (ukNow / 40)) * 10) / 10
    } catch {
      return null
    }
  })()
  const nextAnc = anc.find((a) => !a.statusSelesai)
  const doneAnc = anc.filter((a) => a.statusSelesai).length

  const [showMedForm, setShowMedForm] = useState(false)

  const tl = getTimeline(hpht)
  const hplLabel = new Date(tl.hpl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  const currentWeek = Number.isFinite(tl.uk) ? Math.min(40, Math.max(0, tl.uk)) : 0
  const progress = Math.min(100, Math.max(0, currentWeek / 40 * 100))
  const nextMilestoneIndex = MILESTONES.findIndex((milestone) => milestone.w >= currentWeek)
  const milestoneAnchor = nextMilestoneIndex < 0 ? MILESTONES.length - 2 : nextMilestoneIndex
  const milestoneStart = Math.max(0, milestoneAnchor - 1)
  const visibleMilestones = MILESTONES.slice(milestoneStart, milestoneStart + 3)
  const trimesterLabel = `Trimester ${tl.trimester}`

  // layar tambah obat penuh (bukan bagian section)
  if (showMedForm) {
    return <MedForm onBack={() => setShowMedForm(false)} onDone={() => setShowMedForm(false)} />
  }

  // layar riwayat diary penuh
  if (showDiaryHistory) {
    return <DiaryHistory entries={diaryList} onBack={() => setShowDiaryHistory(false)} />
  }

  // layar riwayat berat penuh (+ sheet edit ikut dirender di sini)
  if (showWeightHistory) {
    return (
      <div className="space-y-4">
        <WeightHistory
          entries={weights}
          onBack={() => { setShowWeightHistory(false); setEditingWeight(null) }}
          onEdit={(e) => setEditingWeight(e)}
        />
        {editingWeight && (
          <WeightFormSheet
            bbPre={bbPre}
            tbCm={tbCm}
            ukMinggu={weeksFromHpht(hpht)}
            userId={uid}
            initialKg={lastWeight}
            entry={editingWeight}
            onClose={() => setEditingWeight(null)}
            onSaved={() => { setEditingWeight(null); void load() }}
            onDeleted={() => { setEditingWeight(null); void load() }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="-mx-4 -mt-5">
      <header className="rounded-b-[32px] bg-[#4A6E54] px-6 pb-6 pt-7 text-white">
        <h1 className="!m-0 text-xl font-bold leading-tight">Ingat</h1>
        <p className="mt-1 text-xs leading-relaxed text-white/90">Perjalanan kehamilan, jadwal, dan catatan Bunda</p>
      </header>

      <div className="space-y-5 px-4 pb-6 pt-5">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              <h2 className="!m-0 text-[15px] font-bold text-[#1D2B29]">Perjalanan kehamilan</h2>
              <p className="mt-0.5 text-xs text-[#536961]">Minggu berjalan dan tonggak terdekat</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#EAF4F0] px-3 py-1.5 text-xs font-bold text-[#4A6E54]">{trimesterLabel}</span>
          </div>

          <div className="rounded-[24px] bg-[#EAF4F0] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[#536961]">Usia kehamilan</p>
                <p className="mt-1 text-[24px] font-bold leading-tight tracking-tight text-[#1D2B29]">Minggu ke-{currentWeek}</p>
              </div>
              <span className="rounded-[14px] bg-white px-3 py-2 text-right ring-1 ring-[#D9E7E2]">
                <span className="block text-[11px] text-[#536961]">Menuju HPL</span>
                <span className="block text-sm font-bold text-[#4A6E54]">{tl.hariTersisa} hari</span>
              </span>
            </div>

            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between text-xs text-[#33443F]">
                <span>Perjalanan 40 minggu</span>
                <span className="font-semibold">{Math.round(progress)} persen</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[#4A6E54] transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-[#D9E7E2] pt-3 text-sm">
              <CalendarDays className="size-4 shrink-0 text-[#4A6E54]" />
              <span className="text-xs text-[#536961]">Perkiraan lahir</span>
              <span className="ml-auto text-sm font-semibold text-[#1D2B29]">{hplLabel}</span>
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#D9E7E2]">
            <h3 className="!m-0 text-sm font-bold text-[#1D2B29]">Tonggak perjalanan</h3>
            <div className="mt-2 divide-y divide-[#E8EFEB]">
              {visibleMilestones.map((milestone, index) => {
                const passed = milestone.w < currentWeek
                const current = milestone.w === currentWeek
                const next = !passed && !current && !visibleMilestones.slice(0, index).some((item) => item.w >= currentWeek)
                return (
                  <div key={milestone.w} className="flex items-center gap-3 py-2.5 first:pt-1 last:pb-1">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full ${passed ? "bg-[#EDF6EF] text-[#2E7D32]" : current ? "bg-[#4A6E54] text-white" : "bg-[#F7FAF8] text-[#789087] ring-1 ring-[#D9E7E2]"}`}>
                      {passed ? <Check className="size-4" strokeWidth={2.5} /> : <span className="text-xs font-bold">{milestone.w}</span>}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#1D2B29]">Minggu {milestone.w}</p>
                      <p className="text-xs leading-snug text-[#536961]">{milestone.t}</p>
                    </div>
                    {(current || next) && <span className="shrink-0 text-[11px] font-semibold text-[#4A6E54]">{current ? "Sekarang" : "Berikutnya"}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <SupplementSection onAdd={() => setShowMedForm(true)} />

        <div className="grid gap-4">
          <Card className="rounded-[24px] border-0 bg-[#EAF4F0] ring-0 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <div className="size-9 rounded-[14px] bg-white grid place-items-center text-[#4A6E54] ring-1 ring-[#D9E7E2]">
                <Scale className="size-4" />
              </div>
              <p className="text-sm font-semibold text-[#1E2326] pt-1.5">Berat badan</p>
              <button onClick={() => setShowWeightHistory(true)} className="ml-auto mt-1 min-h-10 rounded-full bg-white px-3 text-xs font-semibold text-[#4A6E54] ring-1 ring-[#D9E7E2] active:scale-[0.98] transition">Riwayat</button>
            </div>
            <div className="mt-4 -mx-4">
              <WeightChart entries={weightBars} targetAbs={targetAbs} />
            </div>
            {startInfo && <p className="mt-1 text-center text-[11px] text-[#8A8F93]">{startInfo}</p>}
            <p className="mt-3 text-xs text-center text-[#8A8F93]">
              {lastWeight !== null ? `${lastWeight} kg tercatat` : "Belum ada data"}
              {bbStatus ? ` · naik ${bbStatus.kenaikan} kg (${bbStatus.trajectory})` : ""}
            </p>
            {bbStatus && bbStatus.trajectory !== "Normal" && (
              <p className={`mt-1 text-center text-xs font-semibold ${bbStatus.trajectory === "Kurang" ? "text-[#8A6D00]" : "text-[#C62828]"}`}>
                {bbStatus.trajectory === "Kurang" ? "Kenaikan kurang dari target — konsultasi gizi" : "Kenaikan melebihi target — atur pola makan"}
              </p>
            )}
            <div className="mt-3">
              {editingTarget ? (
                <div className="flex gap-2">
                  <Input type="number" value={targetDraft} onChange={(e) => setTargetDraft(e.target.value)} placeholder="Target kg" className="h-12 flex-1 rounded-[14px] border-[#D9E7E2] bg-white px-4" />
                  <Button className="min-h-11 rounded-full bg-[#4A6E54] px-6 text-white hover:bg-[#3D5C46]" onClick={handleSaveTarget}>Simpan</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-[16px] bg-white px-3 py-2.5 ring-1 ring-[#D9E7E2]">
                  <p className="text-xs text-[#536961]">Target {targetManual !== null ? "manual" : "IOM"} <span className="font-bold text-[#1D2B29]">{targetAbs !== null ? `${targetAbs} kg` : "-"}</span></p>
                  <button onClick={() => { setTargetDraft(targetManual !== null ? String(targetManual) : targetAbs !== null ? String(targetAbs) : ""); setEditingTarget(true) }} className="min-h-10 px-2 text-xs font-semibold text-[#4A6E54]">Ubah</button>
                </div>
              )}
            </div>
            <Button className="mt-3 min-h-12 w-full rounded-full bg-[#4A6E54] text-sm font-bold text-white hover:bg-[#3D5C46]" onClick={() => setShowWeightSheet(true)}>
              Tambah berat
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-0 bg-[#EAF4F0] ring-0 shadow-none">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-[#1E2326] flex items-center gap-2">
              <CalendarDays className="size-4 text-[#4A6E54]" /> Jadwal periksa
            </p>
            <p className="text-xs text-[#8A8F93]">
              {nextAnc ? `Selanjutnya ${nextAnc.tanggalTerjadwal} (${ancCountdown(nextAnc.tanggalTerjadwal)})` : "Semua selesai"} {doneAnc}/{anc.length} selesai
            </p>
            {!anc.length ? (
              <p className="mt-3 text-center text-xs text-[#8A8F93]">Memuat jadwal</p>
            ) : (
              <ANCCalendar
                anc={anc}
                onToggle={(id, done) => void handleToggleAnc(id, done)}
                onSaveNote={(id, done, note) => void handleSaveAncNote(id, done, note)}
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-0 bg-[#EAF4F0] ring-0 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1E2326]">Diary harian</p>
                <p className="text-xs text-[#8A8F93]">Tulis diary baru di sini</p>
              </div>
              <button onClick={() => setShowDiaryHistory(true)} className="min-h-10 rounded-full bg-white px-3.5 text-xs font-semibold text-[#4A6E54] ring-1 ring-[#D9E7E2] active:scale-[0.98] transition">Riwayat</button>
            </div>
            <div className="mt-3 space-y-2">
              <Input value={diaryTitle} onChange={(e) => setDiaryTitle(e.target.value)} placeholder="Judul diary" className="h-11 rounded-[14px] border-[#D9E7E2] bg-white px-4 placeholder:text-xs" />
              <textarea value={diaryText} onChange={(e) => setDiaryText(e.target.value)} placeholder="Tulis isi diary Bunda hari ini" className="min-h-[88px] w-full rounded-[14px] bg-white p-3 text-sm ring-1 ring-[#D9E7E2] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#7AAE9A]/40" />
              <div className="flex gap-1.5">
                {([1, 2, 3, 4, 5] as const).map((v) => (
                  <button key={v} onClick={() => setDiaryMood(v)} className={`min-h-11 flex-1 rounded-[14px] text-xs font-semibold transition-colors ${diaryMood === v ? "bg-[#4A6E54] text-white" : "bg-white text-[#33443F] ring-1 ring-[#D9E7E2]"}`}>
                    {v}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#536961]">1 tidak baik sampai 5 sangat baik</p>
              {diaryMsg && <p className="text-xs text-[#2E7D32] text-center">{diaryMsg}</p>}
              <Button className="min-h-11 w-full rounded-full bg-[#4A6E54] font-semibold text-white hover:bg-[#3D5C46]" onClick={() => void handleDiary()}>
                Simpan diary
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

      {(showWeightSheet || editingWeight) && (
        <WeightFormSheet
          bbPre={bbPre}
          tbCm={tbCm}
          ukMinggu={weeksFromHpht(hpht)}
          userId={uid}
          initialKg={lastWeight}
          entry={editingWeight ?? undefined}
          onClose={() => { setShowWeightSheet(false); setEditingWeight(null) }}
          onSaved={() => { setShowWeightSheet(false); setEditingWeight(null); void load() }}
          onDeleted={() => { setShowWeightSheet(false); setEditingWeight(null); void load() }}
        />
      )}
    </div>
    </div>
  )
}
