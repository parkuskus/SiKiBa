import type { WeightEntry } from "@/data/db"

// S-07: line chart BB — sumbu-x per tanggal (entri sehari menumpuk vertikal),
// titik baru hanya bila berat beda dari entri sebelumnya hari itu,
// segmen ke hari berikut berangkat dari nilai terbaru hari sebelumnya.
// Skala Y: garis grid kelipatan 5 dari (min−10) ke (maks+10), floor 0.
export default function WeightChart({
  entries,
  targetAbs,
}: {
  entries: WeightEntry[]
  targetAbs: number | null
}) {
  if (!entries.length) {
    return (
      <div className="grid h-[210px] place-items-center rounded-2xl bg-[#FFFCF6] ring-1 ring-[#EAE6E0]">
        <p className="max-w-[24ch] text-center text-xs leading-relaxed text-[#8A8F93]">Belum ada data berat. Tambah berat hari ini untuk melihat grafik.</p>
      </div>
    )
  }

  const sorted = [...entries].sort((a, b) => a.tanggal.localeCompare(b.tanggal) || (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
  const dates: string[] = [...new Set(sorted.map((e) => e.tanggal))]
  // titik per tanggal: buang duplikat berurutan yang nilainya sama
  const pts: { dateIdx: number; beratKg: number }[] = []
  for (const t of dates) {
    const day = sorted.filter((e) => e.tanggal === t)
    let prev: number | null = null
    for (const e of day) {
      if (prev === null || e.beratKg !== prev) {
        pts.push({ dateIdx: dates.indexOf(t), beratKg: e.beratKg })
        prev = e.beratKg
      }
    }
  }

  const W = 440
  const H = 210
  const padL = 38
  const padR = 24
  const padB = 24
  const padT = 20
  const vals = pts.map((p) => p.beratKg)
  const lo = Math.max(0, Math.min(...vals) - 15)
  const hi = Math.max(...vals) + 15
  const span = Math.max(hi - lo, 1)

  const ticks: number[] = []
  for (let v = Math.ceil(lo / 5) * 5; v <= hi; v += 5) ticks.push(v)

  const x = (di: number) => (dates.length === 1 ? (padL + W - padR) / 2 : padL + ((W - padL - padR - 4) * di) / (dates.length - 1))
  const y = (v: number) => padT + (1 - (v - lo) / span) * (H - padT - padB)
  const path = pts.map((p) => `${x(p.dateIdx)},${y(p.beratKg)}`).join(" ")
  const fmtDate = (t: string) => {
    const d = new Date(`${t}T00:00:00`)
    return isNaN(d.getTime()) ? t.slice(5) : `${d.getDate()} ${d.toLocaleDateString("id-ID", { month: "short" })}`
  }
  const targetY = targetAbs !== null ? Math.min(Math.max(y(targetAbs), padT), H - padB) : null

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[210px] w-full" role="img" aria-label="Grafik berat badan">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} stroke="#EAE6E0" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <text x={padL - 4} y={y(v) + 3} fontSize="9" fill="#8A8F93" textAnchor="end">{v} kg</text>
        </g>
      ))}
      {targetAbs !== null && targetY !== null && (
        <g>
          <line x1={padL} y1={targetY} x2={W - padR} y2={targetY} stroke="#EAB308" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <text x={padL} y={targetY - 4} fontSize="9" fontWeight="bold" fill="#8A6D00">Target</text>
        </g>
      )}
      <polyline points={path} fill="none" stroke="#7AAE9A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {pts.map((p, i) => (
        <circle key={i} cx={x(p.dateIdx)} cy={y(p.beratKg)} r={3.5} fill="#fff" stroke="#7AAE9A" strokeWidth="2" />
      ))}
      {dates.map((t) => (
        <text key={t} x={x(dates.indexOf(t))} y={H - 4} fontSize="9" fill="#6C757D" textAnchor="middle">{fmtDate(t)}</text>
      ))}
    </svg>
  )
}
