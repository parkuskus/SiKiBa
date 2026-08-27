import { db } from '@/data/db'
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
  await db.weightEntries.put({ id: crypto.randomUUID(), userId: input.userId, tanggal: input.tanggal, beratKg: input.bbKg })
  // juga simpan ringkas ke screeningResults untuk histori S-03g
  await db.screeningResults.put({ id: crypto.randomUUID(), userId: input.userId, tipe: 'weight', skor: kenaikan, kategori: trajectory === 'Normal' ? 'HIJAU' : trajectory === 'Kurang' ? 'KUNING' : 'MERAH', detail: { ...input, imt, targetKg, kenaikan, trajectory }, createdAt: new Date().toISOString() })
  return { imt, targetKg, kenaikan, trajectory }
}
