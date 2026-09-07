import { db } from '@/data/db'
import { syncScreening, syncWeight } from '@/data/sync'
import { calcIMT, kategoriIMT } from '@/clinical-rules/imtLila'

// S-07: BBTracker — spec S-07:416-418
export type WeightInput = { userId: string; bbKg: number; tanggal: string; bbPreKg: number; tbCm: number; ukMinggu: number; createdAt?: string }
export type WeightCtx = { bbPreKg: number; tbCm: number; ukMinggu: number }

function hitung(bbKg: number, bbPreKg: number, tbCm: number, ukMinggu: number) {
  const imt = calcIMT(bbPreKg, tbCm)
  const { targetKg } = kategoriIMT(imt)
  const kenaikan = Math.round((bbKg - bbPreKg) * 10) / 10
  const targetProp = ((targetKg[0] + targetKg[1]) / 2) * (ukMinggu / 40)
  const trajectory: 'Normal' | 'Kurang' | 'Lebih' = kenaikan < targetProp - 1 ? 'Kurang' : kenaikan > targetProp + 2 ? 'Lebih' : 'Normal'
  return { imt, targetKg, kenaikan, trajectory }
}

export async function submitWeight(input: WeightInput) {
  if (!input.userId) throw new Error('userId wajib')
  if (input.bbKg < 20 || input.bbKg > 250) throw new Error('BB 20-250')
  const { imt, targetKg, kenaikan, trajectory } = hitung(input.bbKg, input.bbPreKg, input.tbCm, input.ukMinggu)
  const wId = globalThis.crypto?.randomUUID?.() ?? ("demo-" + Date.now() + "-" + Math.random().toString(36).slice(2,8))
  const wRow = { id: wId, userId: input.userId, tanggal: input.tanggal, beratKg: input.bbKg, createdAt: input.createdAt ?? new Date().toISOString() }
  await db.weightEntries.put(wRow)
  syncWeight(wRow)
  await rebuildWeightMirror(input.userId, input.tanggal, { bbPreKg: input.bbPreKg, tbCm: input.tbCm, ukMinggu: input.ukMinggu })
  return { imt, targetKg, kenaikan, trajectory }
}

// satu mirror per tanggal dari entri terbaru (selaras aturan chart S-07)
export async function rebuildWeightMirror(userId: string, tanggal: string, ctx: WeightCtx) {
  const lama = await db.screeningResults.where('userId').equals(userId).toArray()
  await Promise.all(lama.filter((r) => r.tipe === 'weight' && (r.detail as { tanggal?: string })?.tanggal === tanggal).map((r) => db.screeningResults.delete(r.id)))
  const hariIni = await db.weightEntries.where('userId').equals(userId).toArray()
  const list = hariIni.filter((w) => w.tanggal === tanggal).sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
  if (!list.length) return
  const latest = list[list.length - 1]
  const { imt, targetKg, kenaikan, trajectory } = hitung(latest.beratKg, ctx.bbPreKg, ctx.tbCm, ctx.ukMinggu)
  const sRow = { id: globalThis.crypto?.randomUUID?.() ?? ("demo-" + Date.now() + "-" + Math.random().toString(36).slice(2,8)), userId, tipe: 'weight', skor: kenaikan, kategori: trajectory === 'Normal' ? 'HIJAU' : trajectory === 'Kurang' ? 'KUNING' : 'MERAH', detail: { tanggal, bbKg: latest.beratKg, bbPreKg: ctx.bbPreKg, tbCm: ctx.tbCm, ukMinggu: ctx.ukMinggu, imt, targetKg, kenaikan, trajectory }, createdAt: new Date().toISOString() } as const
  await db.screeningResults.put(sRow as never)
  syncScreening(sRow as never)
}

export async function updateWeightEntry(id: string, patch: { bbKg: number; tanggal: string; createdAt: string }, ctx: WeightCtx & { userId: string }) {
  if (patch.bbKg < 20 || patch.bbKg > 250) throw new Error('BB 20-250')
  const row = await db.weightEntries.get(id)
  if (!row) throw new Error('entri tidak ada')
  const tanggalLama = row.tanggal
  await db.weightEntries.put({ ...row, beratKg: patch.bbKg, tanggal: patch.tanggal, createdAt: patch.createdAt })
  await rebuildWeightMirror(ctx.userId, tanggalLama, ctx)
  if (patch.tanggal !== tanggalLama) await rebuildWeightMirror(ctx.userId, patch.tanggal, ctx)
}

export async function deleteWeightEntry(id: string, ctx?: WeightCtx & { userId: string }) {
  const row = await db.weightEntries.get(id)
  if (!row) return
  await db.weightEntries.delete(id)
  if (ctx) await rebuildWeightMirror(ctx.userId, row.tanggal, ctx)
  else {
    const sisa = await db.screeningResults.where('userId').equals(row.userId).toArray()
    await Promise.all(sisa.filter((r) => r.tipe === 'weight' && (r.detail as { tanggal?: string })?.tanggal === row.tanggal).map((r) => db.screeningResults.delete(r.id)))
  }
}
