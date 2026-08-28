import { db } from '@/data/db'
import { syncAnc } from '@/data/sync'
import { calcHPL } from '@/clinical-rules/ukHpl'

// S-07b: ANC 6 kunjungan Kemenkes 2020 — spec S-07b:434-435
// 2x T1 (<14w), 1x T2 (14-27), 3x T3 (>=28) — generasi otomatis dari HPHT

export function generateANCJadwal(hpht: string): string[] {
  const base = new Date(hpht)
  // T1: week 10 & 12, T2: week 20, T3: week 28, 32, 36 (proporsional 40w)
  const weeks = [10, 12, 20, 28, 32, 36]
  return weeks.map((w) => {
    const d = new Date(base); d.setDate(d.getDate() + w * 7); return d.toISOString().slice(0, 10)
  })
}

export async function initANC(userId: string, hpht: string) {
  const jadwal = generateANCJadwal(hpht)
  for (const tgl of jadwal) {
    const row = { id: crypto.randomUUID(), userId, tanggalTerjadwal: tgl, statusSelesai: false }
    await db.ancVisits.put(row)
    syncAnc(row)
  }
  return { hpl: calcHPL(hpht), jadwal }
}

export async function toggleANC(visitId: string, selesai: boolean, catatan?: string) {
  const v = await db.ancVisits.get(visitId)
  if (!v) throw new Error('kunjungan tidak ada')
  v.statusSelesai = selesai; if (catatan !== undefined) v.catatan = catatan
  await db.ancVisits.put(v)
  syncAnc(v)
}
