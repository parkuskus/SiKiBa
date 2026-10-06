// Run with Node 22+: node --experimental-strip-types scripts/check-profile-reminders.mjs
import assert from 'node:assert/strict'
import { daysUntil, localDateTime, medicineTimes, normalizeTime } from '../supabase/functions/_shared/reminderSchedule.ts'
import { photoCrop } from '../app/src/services/photoCrop.ts'

const monday = '2026-10-05'
const medicine = { id: 'm-1', namaSuplemen: 'Obat Uji', waktu: '19:00', waktuList: ['7.30', '19:00', '19:00'], statusAktif: true }
assert.deepEqual(medicineTimes(medicine, monday), ['07:30', '19:00'])
assert.deepEqual(medicineTimes({ ...medicine, statusAktif: false }, monday), [])
assert.deepEqual(medicineTimes({ ...medicine, tanggalMulai: '2026-10-06' }, monday), [])
assert.deepEqual(medicineTimes({ ...medicine, tanggalSelesai: '2026-10-04' }, monday), [])
assert.deepEqual(medicineTimes({ ...medicine, frekuensi: 'mingguan', hari: [2] }, monday), [])
assert.deepEqual(medicineTimes({ ...medicine, frekuensi: 'mingguan', hari: [1] }, monday), ['07:30', '19:00'])
assert.deepEqual(medicineTimes({ ...medicine, frekuensi: 'mingguan', hari: [] }, monday), [])
assert.equal(normalizeTime('25:00'), '')
assert.equal(normalizeTime('09:61'), '')
assert.equal(daysUntil('2026-12-30', '2027-01-01'), 2)
assert.equal(daysUntil('2026-12-31', '2027-01-01'), 1)
assert.deepEqual(localDateTime(new Date('2026-10-05T17:00:00Z'), 'Asia/Jakarta'), { date: '2026-10-06', time: '00:00' })
assert.deepEqual(localDateTime(new Date('2026-10-05T17:00:00Z'), 'Asia/Makassar'), { date: '2026-10-06', time: '01:00' })
assert.deepEqual(photoCrop(1200, 800, 1, 50, 50), { sx: 200, sy: 0, side: 800 })
assert.deepEqual(photoCrop(800, 1200, 2, 100, 0), { sx: 400, sy: 0, side: 400 })
for (const [width, height] of [[400, 2000], [2000, 400]]) {
  const { sx, sy, side } = photoCrop(width, height, 2.5, 100, 100)
  assert.ok(sx >= 0 && sy >= 0 && sx + side <= width && sy + side <= height)
}
console.log('Reminder dates, weekly schedules, timezone boundaries, and photo crop bounds passed.')
