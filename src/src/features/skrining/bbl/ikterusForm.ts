import { db } from '@/data/db'
import { kategoriKramer } from '@/clinical-rules/kramerZone'

// S-05a: IkterusScreen — spec S-05a:328-333 — wrap kramerZone.ts
export type IkterusInput = {
  userId: string
  usiaBayiHari: number
  zona: 1 | 2 | 3 | 4 | 5
  onsetJam: number
  fesesDempul?: boolean
  aktivitas?: 'aktif' | 'mengantuk' | 'tidak mau minum'
  prematur?: boolean
}

export async function submitIkterus(input: IkterusInput) {
  if (!input.userId) throw new Error('userId wajib')
  const { status, warna } = kategoriKramer({ zona: input.zona, onsetJam: input.onsetJam, fesesDempul: input.fesesDempul })
  // zona 4-5 atau onset<24 sudah MERAH via kramerZone; prematur + zona3 → eskalasi
  let kategori: 'HIJAU' | 'KUNING' | 'MERAH' = warna
  if (input.prematur && input.zona >= 3 && kategori === 'KUNING') kategori = 'MERAH'
  await db.screeningResults.put({ id: crypto.randomUUID(), userId: input.userId, tipe: 'ikterus', skor: input.zona, kategori, detail: { ...input, statusKramer: status }, createdAt: new Date().toISOString() })
  return { status, kategori }
}
