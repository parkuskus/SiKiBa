import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import 'fake-indexeddb/auto'
import Dexie from 'dexie'

await new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase('SIAGADB')
  request.onsuccess = resolve
  request.onerror = () => reject(request.error)
})
await new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase('SIAGAKeyring')
  request.onsuccess = resolve
  request.onerror = () => reject(request.error)
})

const legacy = new Dexie('SIAGADB')
legacy.version(1).stores({
  profiles: 'id, hpht', screeningResults: 'id, userId, tipe, kategori, createdAt',
  weightEntries: 'id, userId, tanggal', supplementReminders: 'id, userId, namaSuplemen',
  ancVisits: 'id, userId, tanggalTerjadwal', diaryEntries: 'id, userId, tanggal',
  nifasScreenings: 'id, userId, hariKe', bblProfiles: 'id, userId',
})
legacy.version(2).stores({ syncQueue: '++id, table, createdAt' })
legacy.version(3).stores({ profiles: 'id, hpht, noHp' })
legacy.version(4).stores({ doseLogs: 'id, userId, tanggal' })
legacy.version(5).stores({ profiles: 'id, hpht, noHp, email' })
legacy.version(6).stores({ birthPlans: 'id, userId, updatedAt' })
await legacy.open()
const legacyProfile = {
  id: 'legacy-user', nama: 'Nama Sintetis', email: 'legacy@example.invalid',
  tanggal_lahir: '1990-01-01', noHp: '0000000000', hpht: '2026-01-01',
  gravida: 1, para: 0, abortus: 0, fasyankes: 'Sintetis', nama_bidan: 'Bidan Uji',
  avatarBlob: new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' }),
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
}
await legacy.table('profiles').put(legacyProfile)
const queueId = await legacy.table('syncQueue').add({
  table: 'screening_results', op: 'insert',
  payload: { user_id: 'legacy-user', detail: { marker: 'queue-health-marker' } },
  createdAt: '2026-01-01T00:00:00.000Z',
})
legacy.close()

const { db, deleteLocalAccountData } = await import('../src/data/db.ts')
const recoveredProfile = await db.profiles.get(legacyProfile.id)
assert.deepEqual(recoveredProfile, legacyProfile, 'legacy profile remains usable after migration')
const recoveredQueue = await db.syncQueue.get(queueId)
assert.equal(recoveredQueue.payload.detail.marker, 'queue-health-marker', 'queued payload remains usable offline')

const rawDb = db.backendDB()
async function rawGet(table, key) {
  return await new Promise((resolve, reject) => {
    const request = rawDb.transaction(table, 'readonly').objectStore(table).get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
const rawProfile = await rawGet('profiles', legacyProfile.id)
assert.ok(rawProfile.__siaga?.version === 1, 'legacy profile is ciphertext at rest')
assert.equal(rawProfile.nama, undefined)
assert.equal(rawProfile.email, undefined)
assert.equal(rawProfile.noHp, undefined)
const rawQueue = await rawGet('syncQueue', queueId)
assert.ok(rawQueue.__siaga?.version === 1, 'offline queue payload is ciphertext at rest')
assert.equal(rawQueue.payload, undefined)
assert.equal(rawQueue.userId, 'legacy-user', 'queue remains owner-filterable')

const avatar = new Blob([new Uint8Array([4, 5, 6])], { type: 'image/webp' })
await db.profiles.update(legacyProfile.id, { avatarBlob: avatar })
const updatedProfile = await db.profiles.get(legacyProfile.id)
assert.equal(updatedProfile.nama, legacyProfile.nama, 'partial profile update retains other encrypted fields')
assert.deepEqual([...new Uint8Array(await updatedProfile.avatarBlob.arrayBuffer())], [4, 5, 6], 'encrypted Blob survives partial update')
await db.profiles.put({ ...legacyProfile, id: 'other-user', email: 'other@example.invalid' })

await db.screeningResults.put({
  id: 'new-screening', userId: 'legacy-user', tipe: 'uji', skor: 1, kategori: 'HIJAU',
  detail: { marker: 'new-health-marker' }, createdAt: '2026-01-02T00:00:00.000Z',
})
const rawScreening = await rawGet('screeningResults', 'new-screening')
assert.ok(rawScreening.__siaga?.version === 1, 'new screening is ciphertext at rest')
assert.equal(rawScreening.detail, undefined)
assert.equal(rawScreening.kategori, undefined, 'clinical result category is not exposed at rest')
assert.equal(rawScreening.tipe, undefined, 'screening category is not exposed at rest')
assert.equal((await db.screeningResults.get('new-screening')).detail.marker, 'new-health-marker')
assert.equal((await db.profiles.where('id').equals('legacy-user').first()).nama, 'Nama Sintetis')

await db.screeningResults.put({ id: 'owned-a', userId: 'legacy-user', tipe: 'uji', skor: 1, kategori: 'HIJAU', detail: { marker: 'owned-a' }, createdAt: '2026-01-03T00:00:00.000Z' })
await db.screeningResults.put({ id: 'owned-b', userId: 'other-user', tipe: 'uji', skor: 1, kategori: 'HIJAU', detail: { marker: 'owned-b' }, createdAt: '2026-01-03T00:00:00.000Z' })
await deleteLocalAccountData('legacy-user')
assert.equal(await db.profiles.get('legacy-user'), undefined, 'deletion removes only the selected local profile')
assert.equal(await db.screeningResults.get('owned-a'), undefined, 'deletion removes selected account health rows')
assert.equal((await db.screeningResults.get('owned-b')).userId, 'other-user', 'deletion retains another local account')

db.close()
await db.open()
assert.equal((await db.profiles.get('other-user')).email, 'other@example.invalid', 'device key survives database reopen and retains other user')
await db.delete()
await new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase('SIAGAKeyring')
  request.onsuccess = resolve
  request.onerror = () => reject(request.error)
})
execFileSync(process.execPath, ['--experimental-strip-types', 'scripts/check-local-migration-failure.mjs'], {
  cwd: process.cwd(),
  stdio: 'inherit',
})
console.log('Enkripsi Dexie, migrasi legacy, antrean offline, dan reopen terverifikasi')
