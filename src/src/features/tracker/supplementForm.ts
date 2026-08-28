import { db } from '@/data/db'
import { syncSupplement } from '@/data/sync'

// S-07a: Suplemen — spec S-07a:425-427
export type SupplementInput = { userId: string; namaSuplemen: 'Fe' | 'Folat' | 'Ca' | string; waktu: string; statusAktif: boolean }

export async function upsertSupplement(input: SupplementInput) {
  if (!input.userId) throw new Error('userId wajib')
  const row = { id: `${input.userId}-${input.namaSuplemen}`, userId: input.userId, namaSuplemen: input.namaSuplemen, waktu: input.waktu, statusAktif: input.statusAktif, riwayatKepatuhan: [] }
  await db.supplementReminders.put(row)
  syncSupplement(row)
}

export async function logKepatuhan(userId: string, namaSuplemen: string, diminum: boolean) {
  const r = await db.supplementReminders.get(`${userId}-${namaSuplemen}`)
  if (!r) throw new Error('suplemen belum ada')
  r.riwayatKepatuhan.push(diminum ? 1 : 0)
  if (r.riwayatKepatuhan.length > 30) r.riwayatKepatuhan = r.riwayatKepatuhan.slice(-30)
  await db.supplementReminders.put(r)
  syncSupplement(r)
  const adherence = r.riwayatKepatuhan.length ? Math.round((r.riwayatKepatuhan.reduce((a, b) => a + b, 0) / r.riwayatKepatuhan.length) * 100) : 0
  return { adherence }
}
