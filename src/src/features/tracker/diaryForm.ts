import { db } from '@/data/db'
import { syncDiary } from '@/data/sync'

// S-07c: Diary — spec S-07c:443-445
export type DiaryInput = { userId: string; teks: string; mood: 1 | 2 | 3 | 4 | 5; tanggal?: string }

export async function submitDiary(input: DiaryInput) {
  if (!input.userId) throw new Error('userId wajib')
  if (!input.teks.trim()) throw new Error('teks wajib')
  if (input.mood < 1 || input.mood > 5) throw new Error('mood 1-5')
  const tanggal = input.tanggal ?? new Date().toISOString().slice(0, 10)
  const row = { id: globalThis.crypto?.randomUUID?.() ?? ("demo-" + Date.now() + "-" + Math.random().toString(36).slice(2,8)), userId: input.userId, tanggal, teks: input.teks.trim(), mood: input.mood }
  await db.diaryEntries.put(row)
  syncDiary(row)
  return { tanggal }
}
