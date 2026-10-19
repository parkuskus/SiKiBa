const KEY_DATABASE = 'SIAGAKeyring'
const KEY_STORE = 'keys'
const KEY_NAME = 'device-aes-gcm-v1'
let cachedKey: CryptoKey | undefined
let keyPromise: Promise<CryptoKey> | undefined

export type EncryptedJson = {
  __siaga: { version: 1; iv: string; data: string }
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Penyimpanan kunci gagal dibaca'))
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = transaction.onerror = () => reject(transaction.error ?? new Error('Penyimpanan kunci gagal'))
  })
}

function openKeyDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(KEY_DATABASE, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(KEY_STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Penyimpanan kunci tidak tersedia'))
  })
}

export async function loadDeviceKey(): Promise<CryptoKey | undefined> {
  if (cachedKey) return cachedKey
  const database = await openKeyDatabase()
  const transaction = database.transaction(KEY_STORE, 'readonly')
  const value = await requestResult(transaction.objectStore(KEY_STORE).get(KEY_NAME)) as CryptoKey | undefined
  await transactionDone(transaction)
  database.close()
  if (value) cachedKey = value
  return value
}

export function getOrCreateDeviceKey(): Promise<CryptoKey> {
  if (cachedKey) return Promise.resolve(cachedKey)
  keyPromise ??= (async () => {
    const existing = await loadDeviceKey()
    if (existing) return existing

    const generated = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
    const database = await openKeyDatabase()
    const transaction = database.transaction(KEY_STORE, 'readwrite')
    const store = transaction.objectStore(KEY_STORE)
    const current = await requestResult(store.get(KEY_NAME)) as CryptoKey | undefined
    const key = current ?? generated
    if (!current) store.put(generated, KEY_NAME)
    await transactionDone(transaction)
    database.close()
    cachedKey = key
    return key
  })()
  return keyPromise
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

async function serialize(value: unknown): Promise<unknown> {
  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return { __siagaBlob: 1, type: value.type, data: toBase64(new Uint8Array(await value.arrayBuffer())) }
  }
  if (Array.isArray(value)) return Promise.all(value.map(serialize))
  if (value && typeof value === 'object') {
    return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key, item]) => [key, await serialize(item)])))
  }
  return value
}

function deserialize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deserialize)
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (record.__siagaBlob === 1 && typeof record.data === 'string' && typeof record.type === 'string') {
      return new Blob([toArrayBuffer(fromBase64(record.data))], { type: record.type })
    }
    return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, deserialize(item)]))
  }
  return value
}

export async function encryptJson(data: Record<string, unknown>, key?: CryptoKey): Promise<EncryptedJson> {
  const cryptoKey = key ?? await getOrCreateDeviceKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(await serialize(data)))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, plaintext)
  return { __siaga: { version: 1, iv: toBase64(iv), data: toBase64(new Uint8Array(encrypted)) } }
}

export async function decryptJson(data: Record<string, unknown>, key?: CryptoKey): Promise<Record<string, unknown>> {
  const envelope = data.__siaga as EncryptedJson['__siaga'] | undefined
  if (!envelope) return data
  if (envelope.version !== 1 || typeof envelope.iv !== 'string' || typeof envelope.data !== 'string') {
    throw new Error('Format data lokal terenkripsi tidak dikenal')
  }
  const cryptoKey = key ?? await loadDeviceKey()
  if (!cryptoKey) throw new Error('Kunci data lokal tidak ditemukan; data tidak diubah')
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: toArrayBuffer(fromBase64(envelope.iv)) }, cryptoKey, toArrayBuffer(fromBase64(envelope.data)))
  const result = JSON.parse(new TextDecoder().decode(plaintext)) as unknown
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('Isi data lokal terenkripsi tidak valid')
  return deserialize(result) as Record<string, unknown>
}
