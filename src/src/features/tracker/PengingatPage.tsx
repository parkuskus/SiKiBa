import { useEffect, useState } from "react"
import { CalendarDays, Scale } from "lucide-react"
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

const QUOTES = [
  "Setiap minggu membawa Bunda lebih dekat dengan si kecil.",
  "Tubuh Bunda sedang melakukan hal luar biasa.",
  "Istirahat cukup, makan bergizi, hati tenang.",
  "Si kecil tumbuh sehat karena Bunda peduli.",
  "Satu hari lagi penuh berkah untuk Bunda dan buah hati.",
  "Jaga kontrol rutin, jangan lewatkan jadwal ANC.",
  "Kasih sayang Bunda adalah awal terbaik si kecil.",
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
  const quote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length]

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
    <div className="space-y-4">
      <div>
        <h2 className="text-[18px] font-semibold text-[#1E2326]">Pengingat</h2>
        <p className="text-sm text-[#8A8F93]">Pengingat suplemen dan jadwal periksa</p>
      </div>

      {/* S-07d Timeline kehamilan */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="!m-0 text-[15px] font-bold tracking-tight text-[#1E2326]">Timeline Kehamilan</h2>
        </div>
        <Card className="rounded-[24px] border-0 bg-[#F0F5F1] ring-1 ring-[#EAE6E0] overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-end gap-2">
              <p className="text-[32px] font-extrabold leading-none tracking-tight text-[#1E2326]">{tl.hariTersisa}</p>
              <p className="pb-1 text-xs font-medium leading-tight text-[#3C4245]">hari menuju<br />perkiraan lahir</p>
              <p className="ml-auto pb-1 text-right text-xs font-medium text-[#3C4245]">{hplLabel}<br />Minggu ke-{tl.uk} · T{tl.trimester}</p>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-black/5">
              <div className="h-full rounded-full bg-[#7AAE9A]" style={{ width: `${tl.progress}%` }} />
            </div>
            <p className="mt-2 text-center text-xs italic leading-relaxed text-[#6C757D]">“{quote}”</p>
            <div className="mt-3 grid grid-cols-10 gap-1">
              {tl.calendar40.map((c) => (
                <div
                  key={c.minggu}
                  title={`Minggu ${c.minggu}`}
                  className={`grid h-7 place-items-center rounded-lg text-[9px] font-semibold ${c.isCurrent ? "bg-[#1E2326] text-white ring-1 ring-[#1E2326]" : c.minggu < tl.uk ? "bg-[#7AAE9A] text-white" : "bg-white text-[#8A8F93] ring-1 ring-[#EAE6E0]"}`}
                >
                  {c.minggu}
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5">
              {MILESTONES.map((m) => {
                const done = m.w < tl.uk
                const current = m.w === tl.uk
                return (
                  <div key={m.w} className="flex items-center gap-2.5">
                    <span className={`size-2 shrink-0 rounded-full ${done ? "bg-[#7AAE9A]" : current ? "bg-[#1E2326]" : "bg-[#EAE6E0]"}`} />
                    <p className={`text-xs ${done || current ? "font-semibold text-[#1E2326]" : "text-[#8A8F93]"}`}>Minggu {m.w} — {m.t}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <SupplementSection onAdd={() => setShowMedForm(true)} />

      <div className="grid gap-4">
        <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <div className="size-8 rounded-xl bg-[#EAF2EC] grid place-items-center text-[#7AAE9A] ring-1 ring-[#7AAE9A]/15">
                <Scale className="size-4" />
              </div>
              <p className="text-sm font-semibold text-[#1E2326] pt-1.5">Berat badan</p>
              <button onClick={() => setShowWeightHistory(true)} className="ml-auto mt-1 rounded-full bg-[#F7F2EB] px-2.5 py-1 text-xs font-semibold text-[#7AAE9A] ring-1 ring-[#EAE6E0] active:scale-[0.98] transition">Riwayat</button>
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
                  <Input type="number" value={targetDraft} onChange={(e) => setTargetDraft(e.target.value)} placeholder="Target kg" className="h-12 flex-1 rounded-2xl bg-[#FFFCF6] px-4" />
                  <Button className="rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white px-6" onClick={handleSaveTarget}>Simpan</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-2xl bg-[#FFFCF6] px-4 py-3 ring-1 ring-[#EAE6E0]">
                  <p className="text-xs text-[#6C757D]">Target {targetManual !== null ? "manual" : "otomatis IOM"}: <span className="font-bold text-[#1E2326]">{targetAbs !== null ? `${targetAbs} kg` : "-"}</span></p>
                  <button onClick={() => { setTargetDraft(targetManual !== null ? String(targetManual) : targetAbs !== null ? String(targetAbs) : ""); setEditingTarget(true) }} className="text-xs font-semibold text-[#7AAE9A]">Ubah</button>
                </div>
              )}
            </div>
            <Button className="mt-3 w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white py-6 text-sm font-semibold" onClick={() => setShowWeightSheet(true)}>
              Tambah berat
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-[#1E2326] flex items-center gap-2">
              <CalendarDays className="size-4 text-[#7AAE9A]" /> Jadwal periksa
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

        <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1E2326]">Diary harian</p>
                <p className="text-xs text-[#8A8F93]">Tulis diary baru di sini</p>
              </div>
              <button onClick={() => setShowDiaryHistory(true)} className="rounded-full bg-[#F7F2EB] px-3.5 py-1.5 text-xs font-semibold text-[#7AAE9A] ring-1 ring-[#EAE6E0] active:scale-[0.98] transition">Riwayat</button>
            </div>
            <div className="mt-3 space-y-2">
              <Input value={diaryTitle} onChange={(e) => setDiaryTitle(e.target.value)} placeholder="Judul diary" className="h-12 rounded-2xl bg-[#FFFCF6] px-4 placeholder:text-xs" />
              <textarea value={diaryText} onChange={(e) => setDiaryText(e.target.value)} placeholder="Tulis isi diary Bunda hari ini" className="min-h-[72px] w-full rounded-2xl bg-[#FFFCF6] p-3 text-sm ring-1 ring-[#EAE6E0] placeholder:text-[#9AA3A6] focus:outline-none focus:ring-[#7AAE9A]/30" />
              <div className="flex gap-1.5">
                {([1, 2, 3, 4, 5] as const).map((v) => (
                  <button key={v} onClick={() => setDiaryMood(v)} className={`flex-1 rounded-full py-2 text-xs font-semibold ring-1 transition-colors ${diaryMood === v ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-[#8A8F93] ring-[#EAE6E0]"}`}>
                    {v}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#8A8F93]">1 tidak baik sampai 5 sangat baik</p>
              {diaryMsg && <p className="text-xs text-[#2E7D32] text-center">{diaryMsg}</p>}
              <Button className="w-full rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white" onClick={() => void handleDiary()}>
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
  )
}
