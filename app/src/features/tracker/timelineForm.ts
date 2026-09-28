import { calcHPL, weeksFromHpht, progressPercent } from '@/clinical-rules/ukHpl'

// S-07d: Timeline & Countdown — spec S-07d:449-455
export type Timeline = {
  hpl: string
  uk: number
  trimester: 1 | 2 | 3
  progress: number
  hariTersisa: number
  calendar40: { minggu: number; tanggal: string; isCurrent: boolean }[]
}

export function getTimeline(hpht: string, todayStr?: string): Timeline {
  const hpl = calcHPL(hpht)
  const uk = weeksFromHpht(hpht, todayStr)
  const progress = progressPercent(uk)
  const today = todayStr ? new Date(todayStr) : new Date()
  const hplDate = new Date(hpl)
  const hariTersisa = Math.max(0, Math.ceil((hplDate.getTime() - today.getTime()) / 86400000))
  const hp = new Date(hpht)
  const calendar40 = Array.from({ length: 40 }, (_, i) => {
    const d = new Date(hp); d.setDate(d.getDate() + (i + 1) * 7)
    return { minggu: i + 1, tanggal: d.toISOString().slice(0, 10), isCurrent: i + 1 === uk }
  })
  const trimester: 1 | 2 | 3 = uk < 14 ? 1 : uk < 28 ? 2 : 3
  return { hpl, uk, trimester, progress, hariTersisa, calendar40 }
}
