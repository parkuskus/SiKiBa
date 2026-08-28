import { db } from '@/data/db'
import { syncNifas, syncScreening } from '@/data/sync'
import { warnaMEOWS } from '@/clinical-rules/meows'

// S-04: NifasSkrScreen — spec S-04:271, SK06
export type NifasInput = {
  userId: string
  hariKe: number // 0-42
  suhu: number
  sistolik: number
  diastolik: number
  nadi?: number
  spo2?: number
  perdarahanMl?: number
  lochiaBau?: boolean
  nyeriUterus?: boolean
  lukaBengkak?: boolean
  nyeriSkala?: number
  produksiASI?: 'ada' | 'sedikit' | 'tidak'
}

export function validateNifas(v: NifasInput): Record<string, string> {
  const e: Record<string, string> = {}
  if (!v.userId) e.userId = 'userId wajib'
  if (v.hariKe < 0 || v.hariKe > 42) e.hariKe = 'hariKe 0-42'
  if (v.suhu < 34 || v.suhu > 42) e.suhu = 'suhu 34-42'
  return e
}

export async function submitNifas(input: NifasInput) {
  const errs = validateNifas(input)
  if (Object.keys(errs).length) throw Object.assign(new Error('validasi gagal'), { errs })
  const warna = warnaMEOWS({
    sistolik: input.sistolik, diastolik: input.diastolik, suhu: input.suhu,
    nadi: input.nadi, spo2: input.spo2, perdarahanMl: input.perdarahanMl,
    adaDemamNyeriUterus: !!(input.suhu > 38 && input.nyeriUterus && input.lochiaBau),
  })
  // endpoint: lochia berbau + demam sudah MERAH via meows; tambah luka bengkak → KUNING→MERAH
  let kategori: 'HIJAU' | 'KUNING' | 'MERAH' = warna
  if (input.lukaBengkak && kategori === 'HIJAU') kategori = 'KUNING'

  const nifasRow = { id: crypto.randomUUID(), userId: input.userId, hariKe: input.hariKe, parameterVital: { ...input }, status: kategori, createdAt: new Date().toISOString() }
  await db.nifasScreenings.put(nifasRow)
  syncNifas(nifasRow)
  // juga simpan ringkas ke screeningResults untuk histori S-03g
  const sRow = { id: crypto.randomUUID(), userId: input.userId, tipe: 'nifas', skor: input.hariKe, kategori, detail: { ...input, meows: warna }, createdAt: new Date().toISOString() }
  await db.screeningResults.put(sRow)
  syncScreening(sRow as never)
  return { kategori, meows: warna }
}
