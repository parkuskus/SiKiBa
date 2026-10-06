// Shared by the PWA and scheduled Edge Function so dates and weekly schedules agree.
export type MedicineSchedule = {
  id: string; namaSuplemen: string; waktu: string; statusAktif: boolean;
  waktuList?: string[]; frekuensi?: string; hari?: number[];
  tanggalMulai?: string; tanggalSelesai?: string;
}

export function normalizeTime(time: string): string {
  const match = /^(\d{1,2})[.:](\d{2})(?::\d{2})?$/.exec(time)
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return ""
  return `${match[1].padStart(2, "0")}:${match[2]}`
}

export function localDateTime(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now)
  const part = (type: string) => parts.find((item) => item.type === type)!.value
  return { date: `${part("year")}-${part("month")}-${part("day")}`, time: `${part("hour")}:${part("minute")}` }
}

export function medicineTimes(medicine: MedicineSchedule, date: string): string[] {
  if (!medicine.statusAktif) return []
  if (medicine.tanggalMulai && date < medicine.tanggalMulai) return []
  if (medicine.tanggalSelesai && date > medicine.tanggalSelesai) return []
  if (medicine.frekuensi === "mingguan" && !medicine.hari?.includes(new Date(`${date}T00:00:00Z`).getUTCDay())) return []
  return [...new Set((medicine.waktuList?.length ? medicine.waktuList : [medicine.waktu]).map(normalizeTime).filter(Boolean))].sort()
}

export function daysUntil(today: string, date: string): number {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000)
}
