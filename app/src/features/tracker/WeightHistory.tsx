import { useMemo, useState } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { WeightEntry } from "@/data/db"

type Props = {
  entries: WeightEntry[]
  onBack: () => void
  onEdit: (e: WeightEntry) => void
}

const fmtDay = (t: string) => {
  const d = new Date(`${t}T00:00:00`)
  return isNaN(d.getTime()) ? t : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}
const fmtMonth = (y: number, m: number) => new Date(y, m, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
const mondayOf = (t: string) => {
  const d = new Date(`${t}T00:00:00`)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d
}
const fmtRange = (a: Date, b: Date) => {
  const sameMonth = a.getMonth() === b.getMonth()
  const f = (d: Date, withMonth: boolean) => `${d.getDate()}${withMonth ? ` ${d.toLocaleDateString("id-ID", { month: "short" })}` : ""}`
  return `${f(a, !sameMonth)}–${f(b, true)} ${b.getFullYear()}`
}

// S-07: riwayat BB tab Minggu/Bulan — ketuk entri untuk ubah (error checking)
export default function WeightHistory({ entries, onBack, onEdit }: Props) {
  const [tab, setTab] = useState<"minggu" | "bulan">("minggu")

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.tanggal.localeCompare(b.tanggal) || (a.createdAt ?? "").localeCompare(b.createdAt ?? "")),
    [entries],
  )
  const deltaOf = useMemo(() => {
    const map = new Map<string, number | null>()
    sorted.forEach((e, i) => {
      map.set(e.id, i === 0 ? null : Math.round((e.beratKg - sorted[i - 1].beratKg) * 10) / 10)
    })
    return map
  }, [sorted])

  const groups = useMemo(() => {
    const map = new Map<string, { title: string; items: WeightEntry[] }>()
    for (const e of [...sorted].reverse()) {
      const d = new Date(`${e.tanggal}T00:00:00`)
      const key = tab === "minggu" ? mondayOf(e.tanggal).toISOString().slice(0, 10) : `${d.getFullYear()}-${d.getMonth()}`
      const title =
        tab === "minggu"
          ? (() => {
              const mon = mondayOf(e.tanggal)
              const sun = new Date(mon)
              sun.setDate(sun.getDate() + 6)
              return `Minggu ${fmtRange(mon, sun)}`
            })()
          : fmtMonth(d.getFullYear(), d.getMonth())
      if (!map.has(key)) map.set(key, { title, items: [] })
      map.get(key)!.items.push(e)
    }
    return [...map.values()]
  }, [sorted, tab])

  const jamOf = (e: WeightEntry) => e.createdAt?.slice(11, 16) || ""

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <button onClick={onBack} aria-label="Kembali" className="grid size-9 place-items-center rounded-full bg-white ring-1 ring-[#EAE6E0] text-[#6C757D] active:scale-[0.98] transition">
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="!m-0 text-[16px] font-bold tracking-tight text-[#1E2326]">Riwayat Berat</h1>
      </div>

      <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-full bg-white p-1 ring-1 ring-[#EAE6E0]">
        {(["minggu", "bulan"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-colors ${tab === t ? "bg-[#7AAE9A] text-white" : "text-[#8A8F93]"}`}
          >
            {tab === t && <Check className="size-4" strokeWidth={3} />}
            {t === "minggu" ? "Minggu" : "Bulan"}
          </button>
        ))}
      </div>

      {groups.length ? (
        groups.map((g) => {
          const vals = g.items.map((e) => e.beratKg)
          const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
          return (
            <section key={g.title} className="space-y-2">
              <div className="px-1">
                <p className="text-[15px] font-bold tracking-tight text-[#1E2326]">{g.title}</p>
                <p className="text-xs text-[#8A8F93]">{g.items.length} entri · Rata-rata {avg} kg · {Math.min(...vals)}–{Math.max(...vals)} kg</p>
              </div>
              <Card className="rounded-[24px] border-0 bg-white ring-1 ring-black/[0.05] overflow-hidden shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y divide-[#F0F0F0]">
                    {g.items.map((e) => {
                      const delta = deltaOf.get(e.id)
                      return (
                        <button key={e.id} onClick={() => onEdit(e)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-[#FFFCF6] transition-colors">
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs text-[#6C757D]">{fmtDay(e.tanggal)}{jamOf(e) ? ` ${jamOf(e)}` : ""}</span>
                            <span className="mt-0.5 block text-[17px] font-bold tracking-tight text-[#1E2326]">{e.beratKg} kg</span>
                          </span>
                          {delta !== null && delta !== undefined && (
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${delta > 0 ? "bg-[#EDF6EF] text-[#2E7D32] ring-[#7ACB8A]/20" : delta < 0 ? "bg-[#FFF8EC] text-[#8A6D00] ring-[#F5C16C]/25" : "bg-[#F1EFE9] text-[#8A8F93] ring-[#EAE6E0]"}`}>
                              {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "±0"} kg
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>
          )
        })
      ) : (
        <p className="p-6 text-center text-sm text-[#8A8F93]">Belum ada data berat.</p>
      )}
    </div>
  )
}
