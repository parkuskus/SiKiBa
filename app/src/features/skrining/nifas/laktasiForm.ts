import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'

// S-04a: LaktasiScreen — spec S-04a:304-310
export type LaktasiInput = {
  userId: string
  usiaBayiHari: number
  frekuensiMenyusuPerHari: number
  durasiMenyusuMenit?: number // per sesi (S-04a)
  kondisiPuting: 'normal' | 'nyeri' | 'luka' | 'masuk'
  kondisiPayudara: 'normal' | 'bengkak' | 'keras' | 'merah'
  volumeASI: 'cukup' | 'sedikit' | 'tidak ada'
  bbBayiTren: 'naik' | 'stagnan' | 'turun'
  bakPerHari: number
  urin?: 'jernih' | 'kuning' | 'gelap' // warna urin bayi (S-04a)
  demam?: boolean
}

export function kategoriLaktasi(v: LaktasiInput): { warna: 'HIJAU' | 'KUNING' | 'MERAH'; masalah?: string } {
  const mastitis = v.kondisiPayudara === 'merah' || (v.kondisiPayudara === 'bengkak' && v.demam)
  if (mastitis) return { warna: 'MERAH', masalah: 'Mastitis — rujuk + antibiotik' }
  if (v.bakPerHari < 6 || v.bbBayiTren !== 'naik' || v.volumeASI !== 'cukup') return { warna: 'KUNING', masalah: 'ASI kurang — cek latch-on & frekuensi' }
  if (v.kondisiPuting === 'luka' || v.kondisiPuting === 'nyeri') return { warna: 'KUNING', masalah: 'Puting luka — edukasi latch-on' }
  if (v.frekuensiMenyusuPerHari < 8) return { warna: 'KUNING', masalah: 'Frekuensi kurang — tingkatkan 8–12 kali sehari' }
  if (v.urin === 'gelap') return { warna: 'KUNING', masalah: 'Urin gelap — curiga kurang ASI' }
  return { warna: 'HIJAU' }
}

export async function submitLaktasi(input: LaktasiInput) {
  if (!input.userId) throw new Error('userId wajib')
  const { warna, masalah } = kategoriLaktasi(input)

  const faktorRisiko: string[] = []
  if (masalah) faktorRisiko.push(masalah)
  if (input.frekuensiMenyusuPerHari < 8) faktorRisiko.push(`Menyusu ${input.frekuensiMenyusuPerHari}x/hari (anjuran 8–12x)`)
  if (input.urin === 'gelap') faktorRisiko.push('Urin bayi gelap pekat')
  if (input.bakPerHari < 6) faktorRisiko.push(`BAK ${input.bakPerHari}x/hari (normal ≥6x)`)
  if (input.bbBayiTren !== 'naik') faktorRisiko.push(`BB bayi ${input.bbBayiTren} (harus naik 15–30 g/hari)`)

  const faktorAman: string[] = []
  if (warna === 'HIJAU') {
    faktorAman.push(`BAK ${input.bakPerHari}x/hari — kecukupan ASI baik`)
    faktorAman.push('Pelekatan dan payudara normal')
  }

  const row = { id: globalThis.crypto?.randomUUID?.() ?? ("demo-" + Date.now() + "-" + Math.random().toString(36).slice(2,8)), userId: input.userId, tipe: 'laktasi', skor: input.bakPerHari, kategori: warna, detail: { ...input, masalah, faktorRisiko }, createdAt: new Date().toISOString() }
  await db.screeningResults.put(row)
  syncScreening(row as never)
  return { warna, kategori: warna, masalah, faktorRisiko, faktorAman }
}
