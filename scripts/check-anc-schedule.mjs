import assert from 'node:assert/strict'
import { calcHPL } from '../app/src/clinical-rules/ukHpl.ts'
import { generateANCJadwal, reconcileANCRecords } from '../app/src/features/tracker/ancSchedule.ts'

const hpht = '2026-01-01'
const schedule = generateANCJadwal(hpht)
const weeks = schedule.map((visit) => visit.mingguTerjadwal)
assert.deepEqual(weeks, [1, 5, 9, 13, 18, 22, 26, 28, 30, 32, 34, 36, 37, 38, 39, 40])
assert.equal(schedule[0].tanggalTerjadwal, '2026-01-08')
assert.equal(schedule.at(-1).tanggalTerjadwal, calcHPL(hpht))
assert.ok(schedule.every((visit) => visit.tanggalTerjadwal <= calcHPL(hpht)))

const phase28 = schedule.findIndex((visit) => visit.mingguTerjadwal === 28)
const phase37 = schedule.findIndex((visit) => visit.mingguTerjadwal === 37)
assert.deepEqual(weeks.slice(phase28, phase37), [28, 30, 32, 34, 36])
assert.deepEqual(weeks.slice(phase37), [37, 38, 39, 40])

const existing = [
  { id: 'moved', userId: 'ibu-a', tanggalTerjadwal: '2026-07-18', statusSelesai: false, mingguTerjadwal: 28, tanggalDiedit: true },
  { id: 'done', userId: 'ibu-a', tanggalTerjadwal: '2026-05-01', statusSelesai: true },
  { id: 'old-generated', userId: 'ibu-a', tanggalTerjadwal: '2026-08-30', statusSelesai: false },
  { id: 'custom-note', userId: 'ibu-a', tanggalTerjadwal: '2026-09-02', statusSelesai: false, catatan: 'RS' },
]
const reconciled = reconcileANCRecords(existing, 'ibu-a', [
  { tanggalTerjadwal: '2026-07-16', mingguTerjadwal: 28 },
  { tanggalTerjadwal: '2026-07-30', mingguTerjadwal: 30 },
], '2026-07-01', () => 'new-visit')
assert.ok(reconciled.preservedIds.includes('moved'))
assert.ok(reconciled.preservedIds.includes('done'))
assert.ok(reconciled.preservedIds.includes('custom-note'))
assert.ok(!reconciled.deleteIds.includes('moved'))
assert.deepEqual(reconciled.deleteIds, ['old-generated'])
assert.ok(reconciled.upsert.some((visit) => visit.id === 'new-visit' && visit.tanggalTerjadwal === '2026-07-30'))
console.log('ANC intervals, HPL bound, reschedule preservation, and legacy reconciliation passed.')
