import { db } from '@/data/db'
import { scoreEPDS } from '@/clinical-rules/epds'

// S-03f: MentalScreen — wrap EPDS Tabel 1 (S-03f:242)
export type MentalInput = { userId: string; answers: number[] } // 10 item 0-3

export async function submitMental(input: MentalInput) {
  if (!input.userId) throw new Error('userId wajib')
  const { total, kategori, item10 } = scoreEPDS(input.answers)
  await db.screeningResults.put({ id: crypto.randomUUID(), userId: input.userId, tipe: 'epds', skor: total, kategori, detail: { answers: input.answers, item10 }, createdAt: new Date().toISOString() })
  return { total, kategori, item10 }
}
