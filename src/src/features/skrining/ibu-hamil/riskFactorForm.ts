import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'
import { scorePoedji } from '@/clinical-rules/poedjiRochjati'

// S-03a: RiskFactorScreen — form-only (FE menyusul) — spec S-03a:171, SK01

export type RiskFactorInput = {
  userId: string
  usia: number // tahun
  ukMinggu?: number
  paritas: number // jumlah anak (grande >=4)
  jarakTahun?: number
  riwayatKomplikasi?: boolean // +4, jika SC +8 via riwayatSC
  riwayatSC?: boolean
  riwayatPE?: boolean
  penyakitKronik?: boolean // HT/DM/Jantung/Ginjal/SLE +8
  kehamilanGanda?: boolean
  hidramnion?: boolean
  kelainanLetak?: boolean
  // field tambahan spec (TB/BB/TD/TRB) disimpan di detail tapi tidak ubah skor Poedji inti
  sistolik?: number
  diastolik?: number
  tbCm?: number
  bbKg?: number
  trb?: boolean // teknik reproduksi berbantu
}

export function validateRiskFactor(v: RiskFactorInput): Record<string, string> {
  const e: Record<string, string> = {}
  if (!v.userId) e.userId = 'userId wajib'
  if (v.usia < 10 || v.usia > 60) e.usia = 'Usia 10-60 tahun'
  if (v.paritas < 0 || v.paritas > 15) e.paritas = 'Paritas 0-15'
  if (v.jarakTahun !== undefined && (v.jarakTahun < 0 || v.jarakTahun > 20)) e.jarakTahun = 'Jarak 0-20 th'
  return e
}

export async function submitRiskFactor(input: RiskFactorInput) {
  const errs = validateRiskFactor(input)
  if (Object.keys(errs).length) throw Object.assign(new Error('validasi gagal'), { errs })

  const { skor, kategori, warna } = scorePoedji({
    usia: input.usia,
    paritas: input.paritas,
    jarakTahun: input.jarakTahun,
    riwayatSC: input.riwayatSC || input.riwayatKomplikasi,
    riwayatPE: input.riwayatPE,
    penyakitKronik: input.penyakitKronik,
    kehamilanGanda: input.kehamilanGanda,
    hidramnion: input.hidramnion,
    kelainanLetak: input.kelainanLetak,
  })

  const faktorRisiko: string[] = []
  if (input.usia < 20 || input.usia > 35) faktorRisiko.push('Usia berisiko (<20/>35)')
  if (input.paritas >= 4) faktorRisiko.push('Grande multipara')
  if (input.jarakTahun !== undefined && input.jarakTahun < 2) faktorRisiko.push('Jarak <2th')
  if (input.penyakitKronik) faktorRisiko.push('Penyakit kronik')
  if (input.kehamilanGanda) faktorRisiko.push('Kehamilan ganda')
  if (input.kelainanLetak) faktorRisiko.push('Kelainan letak')

  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const row = {
    id,
    userId: input.userId,
    tipe: 'poedji_rochjati',
    skor,
    kategori: warna, // HIJAU=HRR KRR, KUNING=KRS, MERAH=KRT — mapping ke traffic light
    detail: { ...input, kategoriPoedji: kategori, faktorRisiko, trb: input.trb },
    createdAt,
  }
  await db.screeningResults.put(row)
  syncScreening(row as never)

  return { skor, kategori, warna, faktorRisiko }
}
