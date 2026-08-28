import { supabase } from './supabase'

// ponytail: fire-and-forget Dexie→Supabase, never block local, never throw offline.
// RL S/S FK fails silently (belum auth) — log warn, local tetap aman (ARCHITECTURE.md:9).

function fire(p: Promise<{ error: unknown }>) {
  p.then(({ error }) => { if (error) console.warn('[sync] supabase skip:', error) }).catch((e) => console.warn('[sync] offline:', e))
}

// helper map Dexie → Supabase snake_case, pakai upsert biar idempoten
export function syncProfile(p: { id: string; nama: string; tanggal_lahir: string; hpht: string; gravida: number; para: number; abortus: number; fasyankes: string; nama_bidan: string; noHp: string }) {
  if (!navigator.onLine) return
  fire(supabase.from('profiles').upsert({
    id: p.id, nama: p.nama, tanggal_lahir: p.tanggal_lahir || null, hpht: p.hpht || null,
    gravida: p.gravida, para: p.para, abortus: p.abortus,
    fasyankes: p.fasyankes, nama_bidan: p.nama_bidan, no_hp: p.noHp,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' }) as unknown as Promise<{ error: unknown }>)
}

export function syncScreening(r: { id: string; userId: string; tipe: string; skor: number; kategori: string; detail: Record<string, unknown>; createdAt: string }) {
  if (!navigator.onLine) return
  fire(supabase.from('screening_results').insert({
    id: r.id, user_id: r.userId, tipe: r.tipe, skor: r.skor, kategori: r.kategori, detail: r.detail,
  }) as unknown as Promise<{ error: unknown }>)
}

export function syncWeight(e: { id: string; userId: string; tanggal: string; beratKg: number }) {
  if (!navigator.onLine) return
  fire(supabase.from('weight_entries').insert({
    id: e.id, user_id: e.userId, tanggal: e.tanggal, berat_kg: e.beratKg,
  }) as unknown as Promise<{ error: unknown }>)
}

export function syncSupplement(e: { userId: string; namaSuplemen: string; waktu: string; statusAktif: boolean; riwayatKepatuhan: number[] }) {
  if (!navigator.onLine) return
  // ponytail: id lokal `${userId}-${nama}` bukan uuid → upsert by (user_id,nama_suplemen), tanpa id
  fire(supabase.from('supplement_reminders').upsert({
    user_id: e.userId, nama_suplemen: e.namaSuplemen, waktu: e.waktu,
    status_aktif: e.statusAktif, riwayat_kepatuhan: e.riwayatKepatuhan,
  }, { onConflict: 'user_id,nama_suplemen' }) as unknown as Promise<{ error: unknown }>)
}

export function syncAnc(e: { id: string; userId: string; tanggalTerjadwal: string; statusSelesai: boolean; catatan?: string }) {
  if (!navigator.onLine) return
  fire(supabase.from('anc_visits').upsert({
    id: e.id, user_id: e.userId, tanggal_terjadwal: e.tanggalTerjadwal,
    status_selesai: e.statusSelesai, catatan: e.catatan ?? null,
  }, { onConflict: 'id' }) as unknown as Promise<{ error: unknown }>)
}

export function syncDiary(e: { id: string; userId: string; tanggal: string; teks: string; mood: number }) {
  if (!navigator.onLine) return
  fire(supabase.from('diary_entries').insert({
    id: e.id, user_id: e.userId, tanggal: e.tanggal, teks: e.teks, mood: e.mood,
  }) as unknown as Promise<{ error: unknown }>)
}

export function syncNifas(e: { id: string; userId: string; hariKe: number; parameterVital: Record<string, unknown>; status: string }) {
  if (!navigator.onLine) return
  fire(supabase.from('nifas_screenings').insert({
    id: e.id, user_id: e.userId, hari_ke: e.hariKe, parameter_vital: e.parameterVital, status: e.status,
  }) as unknown as Promise<{ error: unknown }>)
}

export function syncBbl(e: { id: string; userId: string; dataLahir: string; apgar?: number; usiaGestasi?: number }) {
  if (!navigator.onLine) return
  fire(supabase.from('bbl_profiles').insert({
    id: e.id, user_id: e.userId, data_lahir: e.dataLahir || null, apgar: e.apgar ?? null, usia_gestasi: e.usiaGestasi ?? null,
  }) as unknown as Promise<{ error: unknown }>)
}
