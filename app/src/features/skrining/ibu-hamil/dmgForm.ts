import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'
import { validateScreening } from '../screeningCompleteness'

// S-03e: DMGScreen — spec S-03e:228-234
export type DMGInput = {
  userId: string
  usia: number
  bbPreKg: number
  tbCm: number
  imtPre: number
  riwayatDMG?: boolean
  riwayatMakrosomia?: boolean // bayi >4kg
  riwayatDMKeluarga?: boolean
  glikosuria?: boolean
  pcos?: boolean
  etnisRisiko?: boolean // Asia/Afrika (S-03e)
  ukMinggu: number
  faktorDitinjau?: boolean
}

export function kategoriDMG(v: DMGInput): 'HIJAU' | 'KUNING' | 'MERAH' {
  const mayor = [v.riwayatDMG, v.riwayatMakrosomia, v.riwayatDMKeluarga, v.imtPre > 30].filter(Boolean).length
  if (mayor >= 1) return 'MERAH' // risiko tinggi → TTGO
  if (v.usia > 35 || v.pcos || v.glikosuria || v.etnisRisiko) return 'KUNING'
  return 'HIJAU'
}

export async function submitDMG(input: DMGInput) {
  const errs = validateScreening('dmg', input as unknown as Record<string, unknown>)
  if (Object.keys(errs).length) throw Object.assign(new Error(Object.values(errs)[0]), { errs })
  const kategori = kategoriDMG(input)
  const perluTTGO = input.ukMinggu >= 24 && input.ukMinggu <= 28 && kategori !== 'HIJAU'

  const faktorRisiko: string[] = []
  if (input.riwayatDMG) faktorRisiko.push('Pernah diabetes saat hamil sebelumnya')
  if (input.riwayatMakrosomia) faktorRisiko.push('Pernah melahirkan bayi besar (>4 kg)')
  if (input.riwayatDMKeluarga) faktorRisiko.push('Keluarga dekat ada diabetes')
  if (input.imtPre > 30) faktorRisiko.push(`IMT pra-hamil ${input.imtPre} (obesitas)`)
  if (input.usia > 35) faktorRisiko.push(`Usia ${input.usia} tahun (>35)`)
  if (input.pcos) faktorRisiko.push('PCOS (polisistik ovarium)')
  if (input.glikosuria) faktorRisiko.push('Gula dalam urine (glikosuria)')
  if (input.etnisRisiko) faktorRisiko.push('Etnis berisiko tinggi (Asia/Afrika)')
  if (perluTTGO) faktorRisiko.push(`UK ${input.ukMinggu} minggu — waktu tepat TTGO (24–28 minggu)`)

  const faktorAman: string[] = []
  if (kategori === 'HIJAU') {
    faktorAman.push('Tidak ada faktor risiko DMG')
    faktorAman.push(`UK ${input.ukMinggu} minggu terpantau`)
  }

  const row = { id: globalThis.crypto?.randomUUID?.() ?? ("demo-" + Date.now() + "-" + Math.random().toString(36).slice(2,8)), userId: input.userId, tipe: 'dmg', skor: kategori === 'MERAH' ? 2 : kategori === 'KUNING' ? 1 : 0, kategori, detail: { ...input, perluTTGO, faktorRisiko, validasiKelengkapan: 1 }, createdAt: new Date().toISOString() }
  await db.screeningResults.put(row)
  syncScreening(row as never)
  return { kategori, perluTTGO, faktorRisiko, faktorAman }
}
