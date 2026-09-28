import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'
import { calcIMT, kategoriIMT, kategoriLILA, warnaGizi } from '@/clinical-rules/imtLila'

// S-03b: GiziScreen — form-only — spec S-03b:188-194, SK03

export type GiziInput = {
  userId: string
  bbPreKg: number
  tbCm: number
  lilaCm: number
  bbSekarangKg: number
  ukMinggu: number
}

export function validateGizi(v: GiziInput): Record<string, string> {
  const e: Record<string, string> = {}
  if (!v.userId) e.userId = 'userId wajib'
  if (v.bbPreKg < 20 || v.bbPreKg > 200) e.bbPreKg = 'BB pre 20-200kg'
  if (v.tbCm < 100 || v.tbCm > 200) e.tbCm = 'TB 100-200cm'
  if (v.lilaCm < 15 || v.lilaCm > 40) e.lilaCm = 'LILA 15-40cm'
  if (v.bbSekarangKg < 20 || v.bbSekarangKg > 250) e.bbSekarangKg = 'BB sekarang 20-250kg'
  if (v.ukMinggu < 0 || v.ukMinggu > 45) e.ukMinggu = 'UK 0-45 minggu'
  return e
}

export async function submitGizi(input: GiziInput) {
  const errs = validateGizi(input)
  if (Object.keys(errs).length) throw Object.assign(new Error('validasi gagal'), { errs })

  const imt = calcIMT(input.bbPreKg, input.tbCm)
  const { kat: imtKat, targetKg } = kategoriIMT(imt)
  const lilaKat = kategoriLILA(input.lilaCm)
  const kenaikanAktual = Math.round((input.bbSekarangKg - input.bbPreKg) * 10) / 10
  // trajectory: sesuai/kurang/lebih vs target proporsional UK/40
  const targetProp = ((targetKg[0] + targetKg[1]) / 2) * (input.ukMinggu / 40)
  const kenaikanKurang = kenaikanAktual < targetProp - 1 // toleransi 1kg
  const warna = warnaGizi(imtKat, lilaKat, kenaikanKurang)
  const trajectory = kenaikanKurang ? 'kurang' : kenaikanAktual > targetProp + 2 ? 'lebih' : 'sesuai'

  const id = globalThis.crypto?.randomUUID?.() ?? ("demo-" + Date.now() + "-" + Math.random().toString(36).slice(2,8))
  const createdAt = new Date().toISOString()
  const row = {
    id,
    userId: input.userId,
    tipe: 'imt_lila',
    skor: imt,
    kategori: warna,
    detail: { ...input, imt, imtKat, targetKg, lilaKat, kenaikanAktual, trajectory },
    createdAt,
  }
  await db.screeningResults.put(row)
  syncScreening(row as never)

  return { imt, imtKat, targetKg, lilaKat, kenaikanAktual, trajectory, warna }
}
