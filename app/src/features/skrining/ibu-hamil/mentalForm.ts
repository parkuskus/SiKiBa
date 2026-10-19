import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'
import { scoreEPDS } from '@/clinical-rules/epds'
import { validateScreening } from '../screeningCompleteness'

// S-03f: MentalScreen — wrap EPDS Tabel 1 (S-03f:242)
export type MentalInput = { userId: string; answers: number[] } // 10 item 0-3

export async function submitMental(input: MentalInput) {
  const errs = validateScreening('epds', input as unknown as Record<string, unknown>)
  if (Object.keys(errs).length) throw Object.assign(new Error(Object.values(errs)[0]), { errs })
  const { total, kategori, item10 } = scoreEPDS(input.answers)
  const row = { id: globalThis.crypto?.randomUUID?.() ?? ("demo-" + Date.now() + "-" + Math.random().toString(36).slice(2,8)), userId: input.userId, tipe: 'epds', skor: total, kategori, detail: { ...input, item10, validasiKelengkapan: 1 }, createdAt: new Date().toISOString() }
  await db.screeningResults.put(row)
  syncScreening(row as never)
  return { total, kategori, item10 }
}
