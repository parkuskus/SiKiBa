import { useEffect, useState } from "react"
import { Check, Bell, CalendarDays, Scale } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { db } from "@/data/db"
import { getCurrentUserId, getCurrentProfile } from "@/data/currentUser"
import { submitWeight } from "@/features/tracker/weightForm"
import { upsertSupplement } from "@/features/tracker/supplementForm"
import { initANC, toggleANC } from "@/features/tracker/ancForm"
import { submitDiary } from "@/features/tracker/diaryForm"
import type { WeightEntry, ANCVisit, SupplementReminder } from "@/data/db"

const DEMO_HPHT = "2026-02-12"
const SUPLEMEN_DEFAULT = [
  { id: "Fe", nama: "Zat besi", jam: "19.00" },
  { id: "Folat", nama: "Asam folat", jam: "07.30" },
  { id: "Ca", nama: "Kalsium", jam: "12.00" },
]

export default function PengingatPage() {
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [anc, setAnc] = useState<ANCVisit[]>([])
  const [suplemen, setSuplemen] = useState<SupplementReminder[]>([])
  const [uid, setUid] = useState<string>("demo-siti")
  const [weightInput, setWeightInput] = useState("")
  const [weightErr, setWeightErr] = useState<string | null>(null)
  const [weightLoading, setWeightLoading] = useState(false)
  const [diaryText, setDiaryText] = useState("")
  const [diaryMood, setDiaryMood] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [diaryMsg, setDiaryMsg] = useState<string | null>(null)

  const load = async () => {
    const p = await getCurrentProfile()
    const h = p?.hpht ?? DEMO_HPHT
    const id = p?.id ?? (await getCurrentUserId())
    setUid(id)
    const w = await db.weightEntries.where("userId").equals(id).toArray()
    w.sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    setWeights(w)
    let a = await db.ancVisits.where("userId").equals(id).toArray()
    if (!a.length) {
      await initANC(id, h)
      a = await db.ancVisits.where("userId").equals(id).toArray()
    }
    a.sort((x, y) => x.tanggalTerjadwal.localeCompare(y.tanggalTerjadwal))
    setAnc(a)
    const s = await db.supplementReminders.where("userId").equals(id).toArray()
    if (!s.length) {
      for (const d of SUPLEMEN_DEFAULT) {
        await upsertSupplement({ userId: id, namaSuplemen: d.id, waktu: d.jam, statusAktif: d.id !== "Ca" })
      }
      const s2 = await db.supplementReminders.where("userId").equals(id).toArray()
      setSuplemen(s2)
    } else setSuplemen(s)
  }

  useEffect(() => {
    void load()
  }, [])

  const handleToggleSuplemen = async (nama: string, waktu: string, current: boolean) => {
    await upsertSupplement({ userId: uid, namaSuplemen: nama, waktu, statusAktif: !current })
    await load()
  }

  const handleAddWeight = async () => {
    setWeightErr(null)
    const v = Number(weightInput)
    if (!v || v < 20 || v > 250) {
      setWeightErr("Berat 20 sampai 250")
      return
    }
    setWeightLoading(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      await submitWeight({ userId: uid, bbKg: v, tanggal: today, bbPreKg: 55, tbCm: 160, ukMinggu: 28 })
      setWeightInput("")
      await load()
    } catch (e: unknown) {
      setWeightErr(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setWeightLoading(false)
    }
  }

  const handleToggleAnc = async (id: string, done: boolean) => {
    await toggleANC(id, !done)
    await load()
  }

  const handleDiary = async () => {
    if (!diaryText.trim()) return
    await submitDiary({ userId: uid, teks: diaryText.trim(), mood: diaryMood })
    setDiaryText("")
    setDiaryMsg("Tersimpan")
    setTimeout(() => setDiaryMsg(null), 1500)
  }

  const weightBars = weights.length ? weights.slice(-8) : []
  const fallbackBars = [58.2, 58.9, 59.4, 60.1, 60.8, 61.3, 61.9, 62.4]
  const bars = weightBars.length ? weightBars.map((w) => w.beratKg) : fallbackBars
  const lastWeight = weightBars.length ? weightBars[weightBars.length - 1].beratKg : 62.4
  const nextAnc = anc.find((a) => !a.statusSelesai)
  const doneAnc = anc.filter((a) => a.statusSelesai).length

  const supMap = new Map(suplemen.map((s) => [s.namaSuplemen, s]))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-[Poppins] text-[18px] font-semibold text-[#1E2326]">Pengingat</h2>
        <p className="text-sm text-[#8A8F93]">Pengingat suplemen dan jadwal periksa</p>
      </div>

      <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-[#1E2326]">Pengingat suplemen harian</p>
          <p className="text-xs text-[#8A8F93]">Atur jam minum vitamin</p>
          <div className="mt-3 space-y-2">
            {SUPLEMEN_DEFAULT.map((it) => {
              const row = supMap.get(it.id)
              const checked = row ? row.statusAktif : it.id !== "Ca"
              const waktu = row?.waktu ?? it.jam
              return (
                <div key={it.id} className="flex items-center justify-between rounded-2xl bg-[#FFFCF6] px-3 py-3 ring-1 ring-[#EAE6E0]">
                  <div>
                    <p className="text-sm font-medium text-[#1E2326] leading-none">
                      {it.nama} jam {waktu}
                    </p>
                    <p className="text-xs text-[#8A8F93]">Setiap hari</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleToggleSuplemen(it.id, waktu, checked)}
                    aria-pressed={checked}
                    className={`size-6 shrink-0 rounded-full grid place-items-center ring-1 transition-colors ${checked ? "bg-[#7AAE9A] text-white ring-[#7AAE9A]" : "bg-white text-transparent ring-[#EAE6E0]"}`}
                  >
                    <Check className="size-4" strokeWidth={3} />
                  </button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <div className="size-8 rounded-xl bg-[#EAF2EC] grid place-items-center text-[#7AAE9A] ring-1 ring-[#7AAE9A]/15">
                <Scale className="size-4" />
              </div>
              <p className="text-sm font-semibold text-[#1E2326] pt-1.5">Berat badan</p>
              <span className="ml-auto mt-1 rounded-full bg-[#EDF6EF] px-2 py-1 text-xs font-semibold text-[#2E7D32] ring-1 ring-[#7ACB8A]/15">Tersimpan lokal</span>
            </div>
            <div className="mt-6 flex items-end gap-1 h-[72px]">
              {bars.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-t-lg bg-[#7AAE9A]" style={{ height: `${Math.max(6, (v - 55) * 6)}px` }} />
                  <span className="text-[10px] text-[#9AA3A6]">M {21 + i}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-center text-[#8A8F93]">{lastWeight} kilogram tercatat</p>
            <div className="mt-3 flex gap-2">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Tambah berat hari ini kg</Label>
                <Input type="number" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} placeholder="62.4" className="rounded-xl bg-[#FFFCF6]" />
                {weightErr && <p className="text-xs text-[#E57373]">{weightErr}</p>}
              </div>
              <Button className="self-end rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white px-6" disabled={weightLoading} onClick={() => void handleAddWeight()}>
                {weightLoading ? "Menyimpan" : "Simpan"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-[#1E2326] flex items-center gap-2">
              <CalendarDays className="size-4 text-[#7AAE9A]" /> Jadwal periksa
            </p>
            <p className="text-xs text-[#8A8F93]">
              {nextAnc ? `Selanjutnya ${nextAnc.tanggalTerjadwal}` : "Semua selesai"} {doneAnc}/{anc.length} selesai
            </p>
            <div className="mt-3 space-y-2">
              {anc.slice(0, 6).map((a) => {
                const done = a.statusSelesai
                const isNext = !done && a.id === nextAnc?.id
                return (
                  <button
                    key={a.id}
                    onClick={() => void handleToggleAnc(a.id, done)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-[#FFFCF6] px-3 py-2.5 ring-1 ring-[#EAE6E0] text-left"
                  >
                    <span
                      className={`size-7 rounded-full grid place-items-center shrink-0 ${done ? "bg-[#EDF6EF] text-[#3D8B5E] ring-1 ring-[#7ACB8A]/20" : isNext ? "bg-[#FFF4E0] text-[#8A5A00] ring-1 ring-[#F5C16C]/20" : "bg-white text-[#8A8F93] ring-1 ring-[#EAE6E0]"}`}
                    >
                      {done ? <Check className="size-4" /> : isNext ? <Bell className="size-3.5" /> : <CalendarDays className="size-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1E2326] leading-none">{a.tanggalTerjadwal}</p>
                      <p className="text-xs text-[#8A8F93]">{done ? "Sudah selesai ketuk untuk batal" : isNext ? "Berikutnya ketuk jika sudah periksa" : "Terjadwal"}</p>
                    </div>
                  </button>
                )
              })}
              {!anc.length && <p className="text-xs text-[#8A8F93] text-center">Memuat jadwal</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-[#1E2326]">Diary harian</p>
            <p className="text-xs text-[#8A8F93]">Catat perasaan hari ini</p>
            <div className="mt-3 space-y-2">
              <textarea value={diaryText} onChange={(e) => setDiaryText(e.target.value)} placeholder="Tulis perasaan Bunda hari ini" className="min-h-[72px] w-full rounded-2xl bg-[#FFFCF6] p-3 text-sm ring-1 ring-[#EAE6E0] placeholder:text-[#9AA3A6] focus:outline-none focus:ring-[#7AAE9A]/30" />
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
    </div>
  )
}
