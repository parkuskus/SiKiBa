import { useState } from "react"
import { Bell, CalendarDays, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ANCVisit } from "@/data/db"

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
const fmtID = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`)
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

// S-07b: kalender bulanan — tanggal periksa warna beda, hari ini warna sendiri, geser bulan
export default function ANCCalendar({
  anc,
  onToggle,
  onSaveNote,
}: {
  anc: ANCVisit[]
  onToggle: (id: string, done: boolean) => void
  onSaveNote: (id: string, done: boolean, note: string) => void
}) {
  const today = new Date()
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState("")
  const [editing, setEditing] = useState(false)

  const todayISO = toISO(today)
  const visitMap = new Map(anc.map((a) => [a.tanggalTerjadwal, a]))
  const firstOffset = new Date(cursor.y, cursor.m, 1).getDay()
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
  const selVisit = selected ? visitMap.get(selected) : undefined

  const openDay = (iso: string) => {
    setSelected(iso)
    setEditing(false)
    setNoteDraft(visitMap.get(iso)?.catatan ?? "")
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#1E2326]">{monthLabel}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor((c) => ({ y: c.m === 0 ? c.y - 1 : c.y, m: c.m === 0 ? 11 : c.m - 1 }))} aria-label="Bulan lalu" className="grid size-8 place-items-center rounded-full bg-[#F7F2EB] text-[#6C757D]">‹</button>
          <button onClick={() => { const t = new Date(); setCursor({ y: t.getFullYear(), m: t.getMonth() }); setSelected(toISO(t)) }} className="rounded-full bg-[#F7F2EB] px-3 py-1.5 text-xs font-semibold text-[#6C757D]">Hari ini</button>
          <button onClick={() => setCursor((c) => ({ y: c.m === 11 ? c.y + 1 : c.y, m: c.m === 11 ? 0 : c.m + 1 }))} aria-label="Bulan depan" className="grid size-8 place-items-center rounded-full bg-[#F7F2EB] text-[#6C757D]">›</button>
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
          const isSel = iso === selected
          return (
            <button
              key={iso}
              onClick={() => openDay(iso)}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs transition-colors active:scale-[0.95] ${
                isToday
                  ? "bg-[#1E2326] font-bold text-white"
                  : visit
                    ? visit.statusSelesai
                      ? "bg-[#EDF6EF] font-semibold text-[#2E7D32] ring-1 ring-[#7ACB8A]"
                      : "bg-[#FFF8EC] font-semibold text-[#8A6D00] ring-1 ring-[#F5C16C]"
                    : "text-[#3C4245] hover:bg-[#FFFCF6]"
              } ${isSel && !isToday ? "ring-2 ring-[#7AAE9A]" : ""}`}
            >
              <span className="leading-none">{i + 1}</span>
              {visit && <span className={`size-1 rounded-full ${isToday ? "bg-white" : visit.statusSelesai ? "bg-[#2E7D32]" : "bg-[#8A6D00]"}`} />}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3 px-1 text-[11px] text-[#8A8F93]">
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#1E2326]" /> Hari ini</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#F5C16C]" /> Periksa</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#7ACB8A]" /> Selesai</span>
      </div>

      {selected && (
        <div className="rounded-2xl bg-[#FFFCF6] p-3 ring-1 ring-[#EAE6E0]">
          <p className="text-xs font-bold text-[#1E2326]">{fmtID(selected)}</p>
          {selVisit ? (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`grid size-7 shrink-0 place-items-center rounded-full ${selVisit.statusSelesai ? "bg-[#EDF6EF] text-[#3D8B5E] ring-1 ring-[#7ACB8A]/20" : "bg-[#FFF4E0] text-[#8A5A00] ring-1 ring-[#F5C16C]/20"}`}>
                  {selVisit.statusSelesai ? <Check className="size-4" /> : <Bell className="size-3.5" />}
                </span>
                <p className="flex-1 text-xs text-[#6C757D]">{selVisit.statusSelesai ? "Sudah periksa" : "Jadwal kontrol ANC"}{selVisit.catatan ? ` · ${selVisit.catatan}` : ""}</p>
                <Button size="sm" variant="outline" className="rounded-full bg-white text-xs" onClick={() => onToggle(selVisit.id, selVisit.statusSelesai)}>
                  {selVisit.statusSelesai ? "Batalkan" : "Selesai"}
                </Button>
              </div>
              {editing ? (
                <div className="flex gap-2">
                  <Input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Catatan kunjungan" className="h-9 flex-1 rounded-full bg-white px-3 text-xs" />
                  <Button size="sm" className="rounded-full bg-[#7AAE9A] hover:bg-[#6B9E8A] text-white" onClick={() => { onSaveNote(selVisit.id, selVisit.statusSelesai, noteDraft); setEditing(false) }}>Simpan</Button>
                </div>
              ) : (
                <button onClick={() => { setNoteDraft(selVisit.catatan ?? ""); setEditing(true) }} className="text-xs font-semibold text-[#7AAE9A]">
                  {selVisit.catatan ? "Ubah catatan" : "Tambah catatan"}
                </button>
              )}
            </div>
          ) : (
            <p className="mt-1 text-xs text-[#8A8F93]">Tidak ada jadwal periksa hari ini.</p>
          )}
        </div>
      )}
    </div>
  )
}
