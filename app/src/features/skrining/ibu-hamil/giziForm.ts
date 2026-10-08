import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'
import { evaluasiGizi } from '@/clinical-rules/imtLila'

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
  if (v.bbPreKg < 20 || v.bbPreKg > 200) e.bbPreKg = 'BB awal (kg) harus 20–200'
  if (v.tbCm < 100 || v.tbCm > 200) e.tbCm = 'Tinggi (cm) harus 100–200'
  if (v.lilaCm < 15 || v.lilaCm > 40) e.lilaCm = 'LILA (cm) harus 15–40'
  if (v.bbSekarangKg < 20 || v.bbSekarangKg > 250) e.bbSekarangKg = 'BB kini (kg) harus 20–250'
  if (v.ukMinggu < 0 || v.ukMinggu > 45) e.ukMinggu = 'Usia kehamilan (minggu) harus 0–45'
  return e
}

export async function submitGizi(input: GiziInput) {
  const errs = validateGizi(input)
  if (Object.keys(errs).length) throw Object.assign(new Error('validasi gagal'), { errs })

  // S-03b uses the same live calculation as its form preview.
  const { imt, imtKat, targetKg, lilaKat, kenaikanAktual, trajectory, warna } = evaluasiGizi(input)

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
