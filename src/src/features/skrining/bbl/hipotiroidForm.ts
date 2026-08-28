import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'

// S-05b: HipotiroidScreen — spec S-05b:340-344
export type HipotiroidInput = {
  userId: string
  sudahTSH: boolean
  usiaBayiHari?: number
  gejala?: { ikterusLama?: boolean; konstipasi?: boolean; tangisanSerak?: boolean; aktivitasKurang?: boolean; lidahBesar?: boolean }
}

export function kategoriHipotiroid(v: HipotiroidInput): 'HIJAU' | 'KUNING' | 'MERAH' {
  if (v.sudahTSH) {
    const g = v.gejala
    if (g && (g.lidahBesar || g.aktivitasKurang)) return 'MERAH'
    return 'HIJAU'
  }
  // belum TSH
  if (v.usiaBayiHari !== undefined && v.usiaBayiHari > 3) return 'KUNING' // lewat window 48-72 jam
  return 'KUNING'
}

export async function submitHipotiroid(input: HipotiroidInput) {
  if (!input.userId) throw new Error('userId wajib')
  const kategori = kategoriHipotiroid(input)
  const row = { id: crypto.randomUUID(), userId: input.userId, tipe: 'hipotiroid', skor: input.sudahTSH ? 1 : 0, kategori, detail: { ...input }, createdAt: new Date().toISOString() }
  await db.screeningResults.put(row)
  syncScreening(row as never)
  return { kategori }
}
