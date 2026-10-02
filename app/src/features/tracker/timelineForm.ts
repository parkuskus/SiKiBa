import { calcHPL, weeksFromHpht, trimester } from '@/clinical-rules/ukHpl'

// S-07d: Timeline & Countdown — spec S-07d:449-455
export type Timeline = {
  hpl: string
  uk: number
  hariTersisa: number
  trimester: 1 | 2 | 3
}

export function getTimeline(hpht: string, todayStr?: string): Timeline {
  const hpl = calcHPL(hpht)
  const uk = weeksFromHpht(hpht, todayStr)
  const today = todayStr ? new Date(todayStr) : new Date()
  const hplDate = new Date(hpl)
  const hariTersisa = Math.max(0, Math.ceil((hplDate.getTime() - today.getTime()) / 86400000))
  return { hpl, uk, trimester: trimester(uk), hariTersisa }
}
