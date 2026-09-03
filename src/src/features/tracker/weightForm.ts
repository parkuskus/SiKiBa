import { db } from '@/data/db'
import { syncScreening, syncWeight } from '@/data/sync'
import { calcIMT, kategoriIMT } from '@/clinical-rules/imtLila'

// S-07: BBTracker — spec S-07:416-418
export type WeightInput = { userId: string; bbKg: number; tanggal: string; bbPreKg: number; tbCm: number; ukMinggu: number }

export async function submitWeight(input: WeightInput) {
  if (!input.userId) throw new Error('userId wajib')
  if (input.bbKg < 20 || input.bbKg > 250) throw new Error('BB 20-250')
  const imt = calcIMT(input.bbPreKg, input.tbCm)
  const { targetKg } = kategoriIMT(imt)
  const kenaikan = Math.round((input.bbKg - input.bbPreKg) * 10) / 10
  const targetProp = ((targetKg[0] + targetKg[1]) / 2) * (input.ukMinggu / 40)
  const trajectory: 'Normal' | 'Kurang' | 'Lebih' = kenaikan < targetProp - 1 ? 'Kurang' : kenaikan > targetProp + 2 ? 'Lebih' : 'Normal'
  const wId = globalThis.crypto?.randomUUID?.() ?? ("demo-" + Date.now() + "-" + Math.random().toString(36).slice(2,8))
  const wRow = { id: wId, userId: input.userId, tanggal: input.tanggal, beratKg: input.bbKg }
  await db.weightEntries.put(wRow)
  syncWeight(wRow)
  // juga simpan ringkas ke screeningResults untuk histori S-03g
  const sRow = { id: globalThis.crypto?.randomUUID?.() ?? ("demo-" + Date.now() + "-" + Math.random().toString(36).slice(2,8)), userId: input.userId, tipe: 'weight', skor: kenaikan, kategori: trajectory === 'Normal' ? 'HIJAU' : trajectory === 'Kurang' ? 'KUNING' : 'MERAH', detail: { ...input, imt, targetKg, kenaikan, trajectory }, createdAt: new Date().toISOString() } as const
  await db.screeningResults.put(sRow as never)
  syncScreening(sRow as never)
  return { imt, targetKg, kenaikan, trajectory }
}
