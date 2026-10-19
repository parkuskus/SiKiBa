import { useState } from "react"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import type { ANCVisit } from "@/data/db"
import type { SyncOutcome } from "@/data/sync"

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
const fmtID = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

// S-07b: kalender bulanan — tanggal periksa warna beda, hari ini warna sendiri, geser bulan
export default function ANCCalendar({
  anc,
  hplDate,
  onToggle,
  onSaveNote,
  onMoveDate,
}: {
  anc: ANCVisit[]
  hplDate: string
  onToggle: (id: string, done: boolean) => void
  onSaveNote: (id: string, done: boolean, note: string) => void
  onMoveDate: (id: string, date: string) => Promise<SyncOutcome>
}) {
  const today = new Date()
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState("")
  const [editing, setEditing] = useState(false)
  const [dateDraft, setDateDraft] = useState("")
  const [editingDate, setEditingDate] = useState(false)
  const [savingDate, setSavingDate] = useState(false)
  const [dateError, setDateError] = useState("")
  const [dateNotice, setDateNotice] = useState("")

  const todayISO = toISO(today)
  const visitMap = new Map(anc.map((a) => [a.tanggalTerjadwal, a]))
  const firstOffset = new Date(cursor.y, cursor.m, 1).getDay()
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
  const selVisit = selected ? visitMap.get(selected) : undefined

  const openDay = (iso: string) => {
    setSelected(iso)
    setEditing(false)
    setEditingDate(false)
    setDateError("")
    setDateNotice("")
    setDateDraft(visitMap.get(iso)?.tanggalTerjadwal ?? iso)
    setNoteDraft(visitMap.get(iso)?.catatan ?? "")
  }

  const saveDate = async () => {
    if (!selVisit || !dateDraft || savingDate) return
    if (dateDraft === selVisit.tanggalTerjadwal) {
      setEditingDate(false)
      return
    }
    setSavingDate(true)
    setDateError("")
    try {
      const syncStatus = await onMoveDate(selVisit.id, dateDraft)
      setSelected(dateDraft)
      setEditingDate(false)
      setDateNotice(syncStatus === "queued"
        ? "Tanggal tersimpan di perangkat dan menunggu sinkronisasi."
        : syncStatus === "failed"
          ? "Tanggal tersimpan di perangkat, tetapi sinkronisasi gagal."
          : syncStatus === "skipped"
            ? "Tanggal tersimpan di perangkat."
            : "Tanggal tersimpan dan tersinkron.")
    } catch (error) {
      setDateError(error instanceof Error ? error.message : "Tanggal belum dapat diubah. Coba lagi.")
    } finally {
      setSavingDate(false)
    }
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#1D2B29]">{monthLabel}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor((c) => ({ y: c.m === 0 ? c.y - 1 : c.y, m: c.m === 0 ? 11 : c.m - 1 }))} aria-label="Bulan lalu" className="grid size-11 place-items-center rounded-full bg-white text-[#4A6E54] ring-1 ring-[#D9E7E2]">‹</button>
          <button onClick={() => { const t = new Date(); setCursor({ y: t.getFullYear(), m: t.getMonth() }); setSelected(toISO(t)) }} className="min-h-11 rounded-full bg-white px-3 text-xs font-semibold text-[#4A6E54] ring-1 ring-[#D9E7E2]">Hari ini</button>
          <button onClick={() => setCursor((c) => ({ y: c.m === 11 ? c.y + 1 : c.y, m: c.m === 11 ? 0 : c.m + 1 }))} aria-label="Bulan depan" className="grid size-11 place-items-center rounded-full bg-white text-[#4A6E54] ring-1 ring-[#D9E7E2]">›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {HARI.map((h) => (
          <p key={h} className="py-1 text-center text-[10px] font-bold text-[#8A8F93]">{h}</p>
        ))}
        {Array.from({ length: firstOffset }).map((_, i) => (
          <span key={`b${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const iso = toISO(new Date(cursor.y, cursor.m, i + 1))
          const visit = visitMap.get(iso)
          const isToday = iso === todayISO
          const isHpl = iso === hplDate
          const isSel = iso === selected
          return (
            <button
              key={iso}
              onClick={() => openDay(iso)}
              className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[14px] py-1 text-xs transition-colors active:scale-[0.95] ${
                isHpl
                  ? "bg-[#C62828] font-bold text-white"
                  : isToday
                  ? "bg-[#4A6E54] font-bold text-white"
                  : visit
                    ? visit.statusSelesai
                      ? "bg-[#EDF6EF] font-semibold text-[#2E7D32] ring-1 ring-[#7ACB8A]"
                      : "bg-[#FFF8EC] font-semibold text-[#8A6D00] ring-1 ring-[#F5C16C]"
                    : "text-[#3C4245] hover:bg-[#FFFCF6]"
              } ${isSel && !isToday ? "ring-2 ring-[#7AAE9A]" : ""}`}
            >
              <span className="leading-none">{i + 1}</span>
              {visit && <span className={`size-1 rounded-full ${isHpl || isToday ? "bg-white" : visit.statusSelesai ? "bg-[#2E7D32]" : "bg-[#8A6D00]"}`} />}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3 px-1 text-[11px] text-[#536961]">
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#4A6E54]" /> Hari ini</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#F5C16C]" /> Periksa</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#7ACB8A]" /> Selesai</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#C62828]" /> HPL</span>
      </div>

      {selected && (
        <div className="rounded-[18px] bg-white p-3 ring-1 ring-[#D9E7E2]">
          <p className="text-xs font-bold text-[#1D2B29]">{fmtID(selected)}</p>
          {selected === hplDate && <p className="mt-1 text-xs font-bold text-[#C62828]">Hari Perkiraan Lahir</p>}
          {selVisit ? (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`grid size-7 shrink-0 place-items-center rounded-full ${selVisit.statusSelesai ? "bg-[#EDF6EF] text-[#3D8B5E] ring-1 ring-[#7ACB8A]/20" : "bg-[#FFF4E0] text-[#8A5A00] ring-1 ring-[#F5C16C]/20"}`}>
                  {selVisit.statusSelesai ? <Check className="size-4" /> : <Bell className="size-3.5" />}
                </span>
                <p className="flex-1 text-xs text-[#6C757D]">{selVisit.statusSelesai ? "Sudah periksa" : "Jadwal kontrol ANC"}{selVisit.catatan ? ` · ${selVisit.catatan}` : ""}</p>
              <Button size="sm" variant="outline" className="min-h-11 rounded-full border-[#D9E7E2] bg-white text-xs text-[#33443F]" onClick={() => onToggle(selVisit.id, selVisit.statusSelesai)}>
                  {selVisit.statusSelesai ? "Batalkan" : "Selesai"}
                </Button>
              </div>
              {editingDate ? (
                <div className="space-y-2">
                  <DateInput value={dateDraft} onChange={setDateDraft} aria-label="Tanggal pemeriksaan baru" className="min-h-11 rounded-[14px] bg-[#FFFCF6] px-3" />
                  {dateError && <p role="alert" className="text-xs text-[#C62828]">{dateError}</p>}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" disabled={savingDate} className="min-h-11 flex-1 rounded-full" onClick={() => { setEditingDate(false); setDateError("") }}>Batal</Button>
                    <Button type="button" disabled={savingDate || !dateDraft} className="min-h-11 flex-1 rounded-full bg-[#4A6E54] text-white hover:bg-[#3D5C46]" onClick={() => void saveDate()}>{savingDate ? "Menyimpan" : "Simpan tanggal"}</Button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => { setDateDraft(selVisit.tanggalTerjadwal); setEditing(false); setEditingDate(true) }} className="min-h-11 text-xs font-semibold text-[#4A6E54]">Ubah tanggal</button>
              )}
              {dateNotice && <p role="status" className="text-xs text-[#536961]">{dateNotice}</p>}
              {editing ? (
                <div className="flex gap-2">
                  <Input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Catatan kunjungan" className="h-11 flex-1 rounded-full border-[#D9E7E2] bg-[#FFFCF6] px-3 text-xs" />
                  <Button className="min-h-11 rounded-full bg-[#4A6E54] text-white hover:bg-[#3D5C46]" onClick={() => { onSaveNote(selVisit.id, selVisit.statusSelesai, noteDraft); setEditing(false) }}>Simpan</Button>
                </div>
              ) : (
                <button onClick={() => { setNoteDraft(selVisit.catatan ?? ""); setEditing(true) }} className="min-h-11 text-xs font-semibold text-[#4A6E54]">
                  {selVisit.catatan ? "Ubah catatan" : "Tambah catatan"}
                </button>
              )}
            </div>
          ) : (
            <p className="mt-1 text-xs text-[#8A8F93]">Tidak ada jadwal periksa pada tanggal ini.</p>
          )}
        </div>
      )}
    </div>
  )
}
