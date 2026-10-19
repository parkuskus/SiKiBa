import assert from 'node:assert/strict'
import 'fake-indexeddb/auto'
import Dexie from 'dexie'

const legacy = new Dexie('SIAGADB')
legacy.version(1).stores({ profiles: 'id, hpht' })
legacy.version(2).stores({ syncQueue: '++id, table, createdAt' })
legacy.version(3).stores({ profiles: 'id, hpht, noHp' })
legacy.version(4).stores({ doseLogs: 'id, userId, tanggal' })
legacy.version(5).stores({ profiles: 'id, hpht, noHp, email' })
legacy.version(6).stores({ birthPlans: 'id, userId, updatedAt' })
await legacy.open()
const source = { id: 'preserve-me', nama: 'Sumber Sintetis', email: 'source@example.invalid', noHp: '0000000000' }
await legacy.table('profiles').put(source)
legacy.close()

const keyDb = await new Promise((resolve, reject) => {
  const request = indexedDB.open('SIAGAKeyring', 1)
  request.onupgradeneeded = () => request.result.createObjectStore('keys')
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})
const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
const keyTx = keyDb.transaction('keys', 'readwrite')
keyTx.objectStore('keys').put(key, 'device-aes-gcm-v1')
await new Promise((resolve, reject) => {
  keyTx.oncomplete = resolve
  keyTx.onerror = () => reject(keyTx.error)
})
keyDb.close()

const rawDb = await new Promise((resolve, reject) => {
  const request = indexedDB.open('SIAGADB')
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})
const seedTx = rawDb.transaction('profiles', 'readwrite')
seedTx.objectStore('profiles').put({ id: 'corrupt', __siaga: { version: 1, iv: 'AA==', data: 'invalid' } })
await new Promise((resolve, reject) => {
  seedTx.oncomplete = resolve
  seedTx.onerror = () => reject(seedTx.error)
})
rawDb.close()

const { db } = await import('../src/data/db.ts')
await assert.rejects(db.profiles.get(source.id), 'a corrupt ciphertext must stop migration')
const verificationDb = await new Promise((resolve, reject) => {
  const request = indexedDB.open('SIAGADB')
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})
const preserved = await new Promise((resolve, reject) => {
  const request = verificationDb.transaction('profiles').objectStore('profiles').get(source.id)
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})
assert.equal(preserved.nama, source.nama)
assert.equal(preserved.email, source.email)
assert.equal(preserved.noHp, source.noHp)
assert.equal(preserved.__siaga, undefined, 'failed migration leaves original source plaintext untouched')
verificationDb.close()
db.close()
console.log('Migrasi gagal tertutup dan sumber plaintext tetap utuh')
