import { supabase } from "./supabase"
import { db } from "./db"

// ponytail: single source of truth untuk userId — Supabase auth uid jika ada, fallback ke Dexie pertama, terakhir demo-siti untuk dev tanpa login
export async function getCurrentUserId(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession()
    const uid = data.session?.user?.id
    if (uid) return uid
    const { data: u } = await supabase.auth.getUser()
    if (u.user?.id) return u.user.id
  } catch {
    // ignore — offline atau placeholder supabase
  }
  try {
    const profiles = await db.profiles.toArray()
    if (profiles.length) return profiles[0].id
  } catch {
    // ignore
  }
  return "demo-siti"
}

export async function getCurrentProfile() {
  const uid = await getCurrentUserId()
  const p = await db.profiles.get(uid)
  if (p) return p
  // coba fetch dari Supabase jika ada sesi riil tapi Dexie kosong (login di device baru)
  try {
    const { data: remote } = await supabase.from("profiles").select("*").eq("id", uid).single()
    if (remote) {
      const mapped = {
        id: remote.id as string,
        nama: (remote.nama as string) ?? "",
        tanggal_lahir: (remote.tanggal_lahir as string) ?? "",
        noHp: (remote.no_hp as string) ?? "",
        hpht: (remote.hpht as string) ?? "",
        gravida: (remote.gravida as number) ?? 1,
        para: (remote.para as number) ?? 0,
        abortus: (remote.abortus as number) ?? 0,
        fasyankes: (remote.fasyankes as string) ?? "",
        nama_bidan: (remote.nama_bidan as string) ?? "",
        createdAt: (remote.created_at as string) ?? new Date().toISOString(),
        updatedAt: (remote.updated_at as string) ?? new Date().toISOString(),
      }
      await db.profiles.put(mapped as never)
      return mapped as never
    }
  } catch {
    // ignore — offline atau belum sync
  }
  const all = await db.profiles.toArray()
  return all[0] ?? null
}
