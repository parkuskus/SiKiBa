// ponytail: Web Crypto stub — ganti dengan AES-GCM real saat Supabase aktif (ARCHITECTURE.md:91)
// Sekarang pass-through biar Dexie jalan offline tanpa enkripsi overhead.

export async function encryptJson(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  // TODO: SubtleCrypto AES-GCM + kunci dari auth, fallback ke plaintext untuk MVP lokal
  return data
}

export async function decryptJson(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  return data
}
