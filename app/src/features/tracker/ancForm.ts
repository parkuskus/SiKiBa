import { db } from '@/data/db'
import type { ANCVisit } from '@/data/db'
import { deleteSyncedAnc, syncAnc, type SyncOutcome } from '@/data/sync'
import { generateANCJadwal, reconcileANCRecords, sameANCVisit } from '@/features/tracker/ancSchedule'

export { generateANCJadwal } from '@/features/tracker/ancSchedule'

const todayISO = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

const newId = () => globalThis.crypto?.randomUUID?.() ?? `anc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export async function reconcileANC(userId: string, hpht: string): Promise<ANCVisit[]> {
  const existing = await db.ancVisits.where('userId').equals(userId).toArray()
  const today = todayISO()
  const schedule = generateANCJadwal(hpht)
  const { upsert, deleteIds } = reconcileANCRecords(existing, userId, schedule, today, newId)
  const priorById = new Map(existing.map((visit) => [visit.id, visit]))
  const changed = upsert.filter((visit) => {
    const prior = priorById.get(visit.id)
    return !prior || !sameANCVisit(prior, visit)
  })

  await db.transaction('rw', db.ancVisits, async () => {
    if (deleteIds.length) await db.ancVisits.bulkDelete(deleteIds)
    if (changed.length) await db.ancVisits.bulkPut(changed)
  })

  await Promise.all(changed.map((visit) => syncAnc(visit)))
  await Promise.all(deleteIds.map((id) => deleteSyncedAnc(userId, id)))
  return db.ancVisits.where('userId').equals(userId).toArray()
}

export async function moveANC(visitId: string, tanggalTerjadwal: string): Promise<SyncOutcome> {
  const date = new Date(`${tanggalTerjadwal}T00:00:00`)
  const normalizedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalTerjadwal) || Number.isNaN(date.getTime()) || normalizedDate !== tanggalTerjadwal) {
    throw new Error('Tanggal jadwal tidak valid')
  }
  const visit = await db.ancVisits.get(visitId)
  if (!visit) throw new Error('Jadwal ANC tidak ditemukan')
  const duplicate = await db.ancVisits.where('userId').equals(visit.userId)
    .filter((item) => item.id !== visitId && item.tanggalTerjadwal === tanggalTerjadwal).first()
  if (duplicate) throw new Error('Sudah ada jadwal ANC pada tanggal tersebut')
  const updated = { ...visit, tanggalTerjadwal, tanggalDiedit: true }
  await db.ancVisits.put(updated)
  return await syncAnc(updated)
}

export async function toggleANC(visitId: string, selesai: boolean, catatan?: string) {
  const v = await db.ancVisits.get(visitId)
  if (!v) throw new Error('kunjungan tidak ada')
  v.statusSelesai = selesai; if (catatan !== undefined) v.catatan = catatan
  await db.ancVisits.put(v)
  syncAnc(v)
}
