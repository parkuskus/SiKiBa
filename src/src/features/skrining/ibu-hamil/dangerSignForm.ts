import { db } from '@/data/db'
import { syncScreening } from '@/data/sync'

// S-03c: DangerSignScreen — spec S-03c:200-207, SK04
export type DangerSignInput = {
  userId: string
  perdarahan: boolean
  nyeriKepalaHebat: boolean
  pandanganKabur: boolean
  nyeriAbdomenHebat: boolean
  bengkakWajahTangan: boolean
  gerakanJaninBerkurang: boolean // <10x/2jam
  demamTinggi: boolean // >38C
  ketubanPecah: boolean
  sesakNapas: boolean
  tdTinggi?: boolean // bengkak + TD tinggi
}

export function kategoriDanger(v: DangerSignInput): 'HIJAU' | 'KUNING' | 'MERAH' {
  if (v.perdarahan || (v.nyeriKepalaHebat && v.pandanganKabur) || v.nyeriAbdomenHebat || v.ketubanPecah || v.sesakNapas) return 'MERAH'
  const kuning = [v.bengkakWajahTangan && v.tdTinggi, v.gerakanJaninBerkurang, v.demamTinggi].filter(Boolean).length
  if (kuning >= 1) {
    if (kuning >= 2) return 'MERAH' // kombinasi >=2 KUNING → MERAH SK04
    return 'KUNING'
  }
  if (v.nyeriKepalaHebat || v.pandanganKabur) return 'KUNING'
  return 'HIJAU'
}

export async function submitDangerSign(input: DangerSignInput) {
  if (!input.userId) throw new Error('userId wajib')
  const kategori = kategoriDanger(input)
  const flags = Object.entries(input).filter(([k, v]) => k !== 'userId' && v === true).map(([k]) => k)
  const row = { id: crypto.randomUUID(), userId: input.userId, tipe: 'danger_sign', skor: flags.length, kategori, detail: { ...input, flags }, createdAt: new Date().toISOString() }
  await db.screeningResults.put(row)
  syncScreening(row as never)
  return { kategori, flags }
}
