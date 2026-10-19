import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getScreeningAuditFields, getScreeningGestationalAge } from '../src/features/profil/screeningAudit.ts'

assert.equal(getScreeningGestationalAge({ ukMinggu: 24 }), '24 minggu')
assert.equal(getScreeningGestationalAge({}), null, 'historical records must not infer gestation from today’s profile')
assert.deepEqual(getScreeningAuditFields({ userId: 'private', validasiKelengkapan: 1, glikosuria: null, faktorRisiko: ['Tekanan darah'] }), [
  { label: 'Glikosuria', value: 'Belum diperiksa' },
  { label: 'Faktor Risiko', value: 'Tekanan darah' },
])
const sync = await readFile('src/data/sync.ts', 'utf8')
const syncScreening = sync.slice(sync.indexOf('export function syncScreening'), sync.indexOf('export function syncWeight'))
assert.match(syncScreening, /created_at:\s*r\.createdAt/, 'offline sync must preserve the original screening time')

console.log('Konteks riwayat mempertahankan usia gestasi historis dan membedakan data yang belum diperiksa')
