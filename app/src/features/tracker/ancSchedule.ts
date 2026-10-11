import { calcHPL } from "../../clinical-rules/ukHpl.ts"
import type { ANCVisit } from "../../data/db"

export type ScheduledANC = { tanggalTerjadwal: string; mingguTerjadwal: number }

const UTC_DAY = 86400000

function toUTC(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function toISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(iso: string, days: number) {
  const date = toUTC(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return toISO(date)
}

function addCalendarMonth(iso: string) {
  const date = toUTC(iso)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + 1)
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
  date.setUTCDate(Math.min(day, lastDay))
  return toISO(date)
}

function gestationalWeek(hpht: string, visitDate: string) {
  return Math.floor((toUTC(visitDate).getTime() - toUTC(hpht).getTime()) / (7 * UTC_DAY))
}

export function generateANCJadwal(hpht: string): ScheduledANC[] {
  const hpl = calcHPL(hpht)
  const first = addDays(hpht, 7)
  const week28 = addDays(hpht, 28 * 7)
  const week37 = addDays(hpht, 37 * 7)
  const visits: ScheduledANC[] = []
  const addVisit = (date: string) => {
    if (date <= hpl && !visits.some((visit) => visit.tanggalTerjadwal === date)) {
      visits.push({ tanggalTerjadwal: date, mingguTerjadwal: gestationalWeek(hpht, date) })
    }
  }

  let date = first
  addVisit(date)
  while (date < week28) {
    const nextMonth = addCalendarMonth(date)
    const next = nextMonth >= week28 ? week28 : nextMonth
    if (next <= date || next > hpl) break
    addVisit(next)
    date = next
  }

  if (week28 <= hpl) addVisit(week28)
  date = week28
  while (date < week37) {
    const nextFortnight = addDays(date, 14)
    const next = nextFortnight >= week37 ? week37 : nextFortnight
    if (next <= date || next > hpl) break
    addVisit(next)
    date = next
  }

  if (week37 <= hpl) addVisit(week37)
  date = week37
  while (date < hpl) {
    const next = addDays(date, 7)
    if (next > hpl) break
    addVisit(next)
    date = next
  }

  return visits
}

export function reconcileANCRecords(
  existing: ANCVisit[],
  userId: string,
  schedule: ScheduledANC[],
  today: string,
  createId: () => string,
) {
  const used = new Set<string>()
  const upsert: ANCVisit[] = []

  for (const target of schedule) {
    const previous = existing.find((visit) => !used.has(visit.id) && visit.mingguTerjadwal === target.mingguTerjadwal)
      ?? existing.find((visit) => !used.has(visit.id) && !visit.mingguTerjadwal && visit.tanggalTerjadwal === target.tanggalTerjadwal)
    if (previous) {
      const keepDate = previous.tanggalDiedit || previous.statusSelesai || previous.tanggalTerjadwal < today
      const next: ANCVisit = {
        ...previous,
        mingguTerjadwal: target.mingguTerjadwal,
        tanggalDiedit: previous.tanggalDiedit ?? false,
        ...(keepDate ? {} : { tanggalTerjadwal: target.tanggalTerjadwal }),
      }
      used.add(previous.id)
      if (!sameANCVisit(previous, next)) upsert.push(next)
    } else if (target.tanggalTerjadwal >= today) {
      const next: ANCVisit = {
        id: createId(), userId, tanggalTerjadwal: target.tanggalTerjadwal,
        statusSelesai: false, mingguTerjadwal: target.mingguTerjadwal, tanggalDiedit: false,
      }
      upsert.push(next)
      used.add(next.id)
    }
  }

  const preserve = existing.filter((visit) => !used.has(visit.id)
    && (visit.statusSelesai || visit.tanggalDiedit || Boolean(visit.catatan) || visit.tanggalTerjadwal < today))
  const deleteIds = existing.filter((visit) => !used.has(visit.id) && !preserve.some((kept) => kept.id === visit.id)).map((visit) => visit.id)
  const preservedIds = existing.filter((visit) => used.has(visit.id) || preserve.some((kept) => kept.id === visit.id)).map((visit) => visit.id)
  return { upsert: [...upsert, ...preserve], deleteIds, preservedIds }
}

export function sameANCVisit(a: ANCVisit, b: ANCVisit) {
  return a.tanggalTerjadwal === b.tanggalTerjadwal && a.statusSelesai === b.statusSelesai
    && a.catatan === b.catatan && a.mingguTerjadwal === b.mingguTerjadwal && a.tanggalDiedit === b.tanggalDiedit
}
