import { db } from './db'
import { supabase } from './supabase'

// ponytail: offline queue — Dexie syncQueue + flush on online, never block local.
// Mitigasi retensi iOS + offline submit (ARCHITECTURE.md:9): submit offline → enqueue → auto flush saat online.

type Op = 'insert' | 'upsert'

async function enqueue(table: string, op: Op, payload: Record<string, unknown>, onConflict?: string) {
  await db.syncQueue.add({ table, op, payload, onConflict, createdAt: new Date().toISOString() }).catch(() => {})
}

async function fireOrQueue(table: string, op: Op, payload: Record<string, unknown>, onConflict?: string) {
  // ponytail: coba langsung jika online, gagal → queue; offline langsung queue
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    await enqueue(table, op, payload, onConflict)
    return
  }
  try {
    const q = op === 'upsert'
      ? supabase.from(table).upsert(payload as never, onConflict ? { onConflict } as never : undefined)
      : supabase.from(table).insert(payload as never)
    const { error } = await q as unknown as { error: unknown }
    if (error) {
      // RLS/FK warn (belum auth) jangan queue ulang — cukup log, biar tidak spam
      const msg = String(error)
      if (msg.includes('violates row-level') || msg.includes('foreign key') || msg.includes('JWT')) {
        console.warn('[sync] skip (auth):', error)
        return
      }
      await enqueue(table, op, payload, onConflict)
      console.warn('[sync] queued after error:', error)
    }
  } catch (e) {
    await enqueue(table, op, payload, onConflict)
    console.warn('[sync] queued offline:', e)
  }
}

export async function flushSyncQueue(): Promise<number> {
  const items = await db.syncQueue.toArray()
  if (!items.length) return 0
  let ok = 0
  for (const it of items) {
    try {
      const q = it.op === 'upsert'
        ? supabase.from(it.table).upsert(it.payload as never, it.onConflict ? { onConflict: it.onConflict } as never : undefined)
        : supabase.from(it.table).insert(it.payload as never)
      const { error } = await q as unknown as { error: unknown }
      if (error) {
        const msg = String(error)
        if (msg.includes('violates row-level') || msg.includes('foreign key') || msg.includes('JWT')) {
          // hapus biar tidak loop selamanya untuk data invalid auth
          await db.syncQueue.delete(it.id!)
          console.warn('[sync] drop (auth) queue id', it.id, error)
          continue
        }
        // network error → stop, coba lagi next online
        break
      }
      await db.syncQueue.delete(it.id!)
      ok++
    } catch {
      break
    }
  }
  if (ok) console.log(`[sync] flushed ${ok}/${items.length}`)
  return ok
}

// auto flush saat online + saat load pertama
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { void flushSyncQueue() })
  // ponytail: Fire-kan sekali saat import jika sudah online
  if (navigator.onLine) setTimeout(() => { void flushSyncQueue() }, 1500)
}

// helpers — tetap fire-and-forget untuk caller (void), tapi di dalam sudah queue-aware
export function syncProfile(p: { id: string; nama: string; tanggal_lahir: string; hpht: string; gravida: number; para: number; abortus: number; fasyankes: string; nama_bidan: string; noHp: string }) {
  void fireOrQueue('profiles', 'upsert', {
    id: p.id, nama: p.nama, tanggal_lahir: p.tanggal_lahir || null, hpht: p.hpht || null,
    gravida: p.gravida, para: p.para, abortus: p.abortus,
    fasyankes: p.fasyankes, nama_bidan: p.nama_bidan, no_hp: p.noHp,
    updated_at: new Date().toISOString(),
  }, 'id')
}

export function syncScreening(r: { id: string; userId: string; tipe: string; skor: number; kategori: string; detail: Record<string, unknown>; createdAt: string }) {
  void fireOrQueue('screening_results', 'insert', {
    id: r.id, user_id: r.userId, tipe: r.tipe, skor: r.skor, kategori: r.kategori, detail: r.detail,
  })
}

export function syncWeight(e: { id: string; userId: string; tanggal: string; beratKg: number }) {
  void fireOrQueue('weight_entries', 'insert', {
    id: e.id, user_id: e.userId, tanggal: e.tanggal, berat_kg: e.beratKg,
  })
}

export function syncSupplement(e: { userId: string; namaSuplemen: string; waktu: string; statusAktif: boolean; riwayatKepatuhan: number[] }) {
  void fireOrQueue('supplement_reminders', 'upsert', {
    user_id: e.userId, nama_suplemen: e.namaSuplemen, waktu: e.waktu,
    status_aktif: e.statusAktif, riwayat_kepatuhan: e.riwayatKepatuhan,
  }, 'user_id,nama_suplemen')
}

export function syncAnc(e: { id: string; userId: string; tanggalTerjadwal: string; statusSelesai: boolean; catatan?: string }) {
  void fireOrQueue('anc_visits', 'upsert', {
    id: e.id, user_id: e.userId, tanggal_terjadwal: e.tanggalTerjadwal,
    status_selesai: e.statusSelesai, catatan: e.catatan ?? null,
  }, 'id')
}

export function syncDiary(e: { id: string; userId: string; tanggal: string; teks: string; mood: number }) {
  void fireOrQueue('diary_entries', 'insert', {
    id: e.id, user_id: e.userId, tanggal: e.tanggal, teks: e.teks, mood: e.mood,
  })
}

export function syncNifas(e: { id: string; userId: string; hariKe: number; parameterVital: Record<string, unknown>; status: string }) {
  void fireOrQueue('nifas_screenings', 'insert', {
    id: e.id, user_id: e.userId, hari_ke: e.hariKe, parameter_vital: e.parameterVital, status: e.status,
  })
}

export function syncBbl(e: { id: string; userId: string; dataLahir: string; apgar?: number; usiaGestasi?: number }) {
  void fireOrQueue('bbl_profiles', 'insert', {
    id: e.id, user_id: e.userId, data_lahir: e.dataLahir || null, apgar: e.apgar ?? null, usia_gestasi: e.usiaGestasi ?? null,
  })
}
