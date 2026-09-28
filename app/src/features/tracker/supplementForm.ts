import { db } from '@/data/db'
import { syncSupplement } from '@/data/sync'
import type { DoseLog } from '@/data/db'

// S-07a: Suplemen ala medication-app — nama, bentuk, periode, frekuensi, jam, status per dosis
export type SupplementInput = {
  id?: string
  userId: string
  namaSuplemen: string
  waktu: string
  statusAktif: boolean
  bentuk?: string
  dosis?: string
  jumlah?: number
  tanggalMulai?: string
  tanggalSelesai?: string
  frekuensi?: 'harian1' | 'harian2' | 'harian3' | 'mingguan' | string
  hari?: number[]
  waktuList?: string[]
}

export async function upsertSupplement(input: SupplementInput) {
  if (!input.userId) throw new Error('userId wajib')
  if (!input.namaSuplemen.trim()) throw new Error('nama wajib')
  const times = (input.waktuList ?? []).filter(Boolean)
  const waktu = times[0] ?? input.waktu
  const row = {
    id: input.id ?? `${input.userId}-${input.namaSuplemen.trim()}`,
    userId: input.userId,
    namaSuplemen: input.namaSuplemen.trim(),
    waktu,
    statusAktif: input.statusAktif,
    riwayatKepatuhan: [],
    bentuk: input.bentuk,
    dosis: input.dosis,
    jumlah: input.jumlah,
    tanggalMulai: input.tanggalMulai,
    tanggalSelesai: input.tanggalSelesai,
    frekuensi: input.frekuensi ?? 'harian1',
    hari: input.hari,
    waktuList: times.length ? times : [waktu],
  }
  await db.supplementReminders.put(row)
  syncSupplement(row)
  return row
}

export async function deleteSupplement(id: string) {
  // ponytail: hapus lokal saja (riwayat dosis ikut terhapus)
  await db.supplementReminders.delete(id)
  const logs = await db.doseLogs.where('suplemenId').equals(id).toArray()
  await Promise.all(logs.map((l) => db.doseLogs.delete(l.id)))
}

export async function setDoseStatus(input: { userId: string; suplemenId: string; tanggal: string; waktu: string; status: DoseLog['status'] }) {
  const id = `${input.userId}-${input.suplemenId}-${input.tanggal}-${input.waktu}`
  await db.doseLogs.put({ id, ...input })
}

export async function getDoseMap(userId: string, tanggal: string): Promise<Record<string, DoseLog['status']>> {
  const mine = await db.doseLogs.where('userId').equals(userId).toArray()
  const map: Record<string, DoseLog['status']> = {}
  for (const l of mine) {
    if (l.tanggal === tanggal) map[`${l.suplemenId}|${l.waktu}`] = l.status
  }
  return map
}
