import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'

// S-04a: LaktasiScreen — spec S-04a:304-310
export type LaktasiInput = {
  userId: string
  usiaBayiHari: number
  frekuensiMenyusuPerHari: number
  kondisiPuting: 'normal' | 'nyeri' | 'luka' | 'masuk'
  kondisiPayudara: 'normal' | 'bengkak' | 'keras' | 'merah'
  volumeASI: 'cukup' | 'sedikit' | 'tidak ada'
  bbBayiTren: 'naik' | 'stagnan' | 'turun'
  bakPerHari: number
  demam?: boolean
}

export function kategoriLaktasi(v: LaktasiInput): { warna: 'HIJAU' | 'KUNING' | 'MERAH'; masalah?: string } {
  const mastitis = v.kondisiPayudara === 'merah' || (v.kondisiPayudara === 'bengkak' && v.demam)
  if (mastitis) return { warna: 'MERAH', masalah: 'Mastitis — rujuk + antibiotik' }
  if (v.bakPerHari < 6 || v.bbBayiTren !== 'naik' || v.volumeASI !== 'cukup') return { warna: 'KUNING', masalah: 'ASI kurang — cek latch-on & frekuensi' }
  if (v.kondisiPuting === 'luka' || v.kondisiPuting === 'nyeri') return { warna: 'KUNING', masalah: 'Puting luka — edukasi latch-on' }
  return { warna: 'HIJAU' }
}

export async function submitLaktasi(input: LaktasiInput) {
  if (!input.userId) throw new Error('userId wajib')
  const { warna, masalah } = kategoriLaktasi(input)
  const row = { id: crypto.randomUUID(), userId: input.userId, tipe: 'laktasi', skor: input.bakPerHari, kategori: warna, detail: { ...input, masalah }, createdAt: new Date().toISOString() }
  await db.screeningResults.put(row)
  syncScreening(row as never)
  return { warna, masalah }
}
