import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'

// S-03e: DMGScreen — spec S-03e:228-234
export type DMGInput = {
  userId: string
  usia: number
  imtPre: number
  riwayatDMG?: boolean
  riwayatMakrosomia?: boolean // bayi >4kg
  riwayatDMKeluarga?: boolean
  glikosuria?: boolean
  pcos?: boolean
  ukMinggu: number
}

export function kategoriDMG(v: DMGInput): 'HIJAU' | 'KUNING' | 'MERAH' {
  const mayor = [v.riwayatDMG, v.riwayatMakrosomia, v.riwayatDMKeluarga, v.imtPre > 30].filter(Boolean).length
  if (mayor >= 1) return 'MERAH' // risiko tinggi → TTGO
  if (v.usia > 35 || v.pcos || v.glikosuria) return 'KUNING'
  return 'HIJAU'
}

export async function submitDMG(input: DMGInput) {
  if (!input.userId) throw new Error('userId wajib')
  const kategori = kategoriDMG(input)
  const perluTTGO = input.ukMinggu >= 24 && input.ukMinggu <= 28 && kategori !== 'HIJAU'
  const row = { id: crypto.randomUUID(), userId: input.userId, tipe: 'dmg', skor: kategori === 'MERAH' ? 2 : kategori === 'KUNING' ? 1 : 0, kategori, detail: { ...input, perluTTGO }, createdAt: new Date().toISOString() }
  await db.screeningResults.put(row)
  syncScreening(row as never)
  return { kategori, perluTTGO }
}
