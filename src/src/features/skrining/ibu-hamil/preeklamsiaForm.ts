import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'
import { calcMAP, kategoriMAP, kategoriTD } from '@/clinical-rules/mapCalculator'

// S-03d: PreeklamsiScreen — spec S-03d:216-222, SK02 (MAP <90 / 90-99 / >99)
export type PreeklamsiaInput = {
  userId: string
  sistolik: number
  diastolik: number
  ukMinggu: number
  proteinuria: boolean
  riwayatPE?: boolean
  kehamilanGanda?: boolean
  imtPre?: number
  nullipara?: boolean
  htKronik?: boolean
  autoimun?: boolean // APS/SLE
  usia?: number
  jarakTahun?: number
  riwayatKeluargaPE?: boolean
}

export function validatePreeklamsia(v: PreeklamsiaInput): Record<string, string> {
  const e: Record<string, string> = {}
  if (!v.userId) e.userId = 'userId wajib'
  if (v.sistolik < 70 || v.sistolik > 250) e.sistolik = 'Sistolik 70-250'
  if (v.diastolik < 40 || v.diastolik > 150) e.diastolik = 'Diastolik 40-150'
  return e
}

export async function submitPreeklamsia(input: PreeklamsiaInput) {
  const errs = validatePreeklamsia(input)
  if (Object.keys(errs).length) throw Object.assign(new Error('validasi gagal'), { errs })
  const map = calcMAP(input.sistolik, input.diastolik)
  const mapKat = kategoriMAP(map) // HIJAU <90 KUNING 90-99 MERAH >99
  const tdKat = kategoriTD(input.sistolik, input.diastolik)
  // NICE risiko tinggi PE: >=1 mayor
  const risikoTinggi = !!(input.riwayatPE || input.htKronik || input.autoimun || (input.imtPre !== undefined && input.imtPre > 35) || false)
  let kategori: 'HIJAU' | 'KUNING' | 'MERAH' = 'HIJAU'
  if (input.sistolik >= 160 || input.diastolik >= 110 || mapKat === 'MERAH') kategori = 'MERAH'
  else if (tdKat === 'KUNING' || mapKat === 'KUNING' || risikoTinggi || input.proteinuria) kategori = 'KUNING'
  // proteinuria + HT = preeklamsia
  const detail: Record<string, unknown> = { ...input, map, mapKat, tdKat, risikoTinggi }
  const row = { id: globalThis.crypto?.randomUUID?.() ?? ("demo-" + Date.now() + "-" + Math.random().toString(36).slice(2,8)), userId: input.userId, tipe: 'preeklamsia', skor: map, kategori, detail, createdAt: new Date().toISOString() }
  await db.screeningResults.put(row)
  syncScreening(row as never)
  return { map, mapKat, tdKat, kategori }
}
