import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'

// S-03c: DangerSignScreen — spec S-03c:200-207, SK04
export type DangerSignInput = {
  userId: string
  perdarahan: boolean
  nyeriKepalaHebat: boolean
  nyeriKepalaSkala?: number // 0 tidak ada, 1-5 skala S-03c (≥4 = hebat)
  pandanganKabur: boolean
  nyeriAbdomenHebat: boolean
  bengkakWajahTangan: boolean
  gerakanJaninBerkurang: boolean // <10x/2jam
  demamTinggi: boolean // >38C
  ketubanPecah: boolean
  sesakNapas: boolean
  tdTinggi?: boolean // bengkak + TD tinggi (≥140/90)
}

// penjelasan klinis singkat tiap gejala (S-03c output)
export const DANGER_INFO: Record<string, { label: string; jelas: string }> = {
  perdarahan: { label: 'Perdarahan per vagina', jelas: 'Bisa tanda plasenta bermasalah — segera ke IGD' },
  nyeriKepalaHebat: { label: 'Nyeri kepala hebat', jelas: 'Waspada tanda preeklamsia, terutama bila disertai pandangan kabur' },
  pandanganKabur: { label: 'Pandangan kabur', jelas: 'Bisa tanda tekanan darah tinggi pada kehamilan' },
  nyeriAbdomenHebat: { label: 'Nyeri perut hebat menetap', jelas: 'Bisa tanda gawat janin atau plasenta — segera ke IGD' },
  bengkakWajahTangan: { label: 'Bengkak wajah dan tangan', jelas: 'Waspada bila disertai tekanan darah tinggi' },
  gerakanJaninBerkurang: { label: 'Gerakan janin berkurang', jelas: 'Kurang dari 10 kali dalam 2 jam perlu evaluasi bidan' },
  demamTinggi: { label: 'Demam di atas 38°C', jelas: 'Bisa tanda infeksi — periksa ke fasyankes' },
  ketubanPecah: { label: 'Ketuban pecah', jelas: 'Cairan merembes sebelum waktunya — segera ke fasyankes' },
  sesakNapas: { label: 'Sesak napas mendadak', jelas: 'Bisa tanda gawat — segera ke IGD' },
}

export function kepalaHebat(v: Pick<DangerSignInput, 'nyeriKepalaHebat' | 'nyeriKepalaSkala'>): boolean {
  return v.nyeriKepalaHebat || (v.nyeriKepalaSkala ?? 0) >= 4
}

export function kategoriDanger(v: DangerSignInput): 'HIJAU' | 'KUNING' | 'MERAH' {
  const hebat = kepalaHebat(v)
  if (v.perdarahan || (hebat && v.pandanganKabur) || v.nyeriAbdomenHebat || v.ketubanPecah || v.sesakNapas) return 'MERAH'
  const kuning = [v.bengkakWajahTangan && v.tdTinggi, v.gerakanJaninBerkurang, v.demamTinggi].filter(Boolean).length
  if (kuning >= 1) {
    if (kuning >= 2) return 'MERAH' // kombinasi >=2 KUNING → MERAH SK04
    return 'KUNING'
  }
  if (hebat || v.pandanganKabur || (v.nyeriKepalaSkala ?? 0) === 3) return 'KUNING'
  return 'HIJAU'
}

export async function submitDangerSign(input: DangerSignInput) {
  if (!input.userId) throw new Error('userId wajib')
  const kategori = kategoriDanger(input)
  const flags = Object.entries(input).filter(([k, v]) => k !== 'userId' && v === true).map(([k]) => k)
  if ((input.nyeriKepalaSkala ?? 0) > 0 && !flags.includes('nyeriKepalaHebat')) flags.push('nyeriKepalaHebat')

  const faktorRisiko: string[] = []
  for (const f of flags) {
    const info = DANGER_INFO[f]
    if (info) faktorRisiko.push(`${info.label} — ${info.jelas}`)
  }
  if (input.bengkakWajahTangan && input.tdTinggi) faktorRisiko.push('Bengkak disertai TD tinggi — curiga preeklamsia, cek skrining preeklamsia')

  const faktorAman: string[] = []
  if (kategori === 'HIJAU') {
    faktorAman.push('Tidak ada tanda bahaya terdeteksi')
    faktorAman.push('Gerakan janin baik dan tidak ada keluhan akut')
  }

  const row = { id: globalThis.crypto?.randomUUID?.() ?? ("demo-" + Date.now() + "-" + Math.random().toString(36).slice(2,8)), userId: input.userId, tipe: 'danger_sign', skor: flags.length, kategori, detail: { ...input, flags, faktorRisiko }, createdAt: new Date().toISOString() }
  await db.screeningResults.put(row)
  syncScreening(row as never)
  return { kategori, flags, faktorRisiko, faktorAman }
}
