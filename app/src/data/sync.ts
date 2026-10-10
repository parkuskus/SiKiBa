import { db, type BirthPlan } from './db'
import { supabase } from './supabase'

// ponytail: offline queue — Dexie syncQueue + flush on online, never block local.
// Mitigasi retensi iOS + offline submit (ARCHITECTURE.md:9): submit offline → enqueue → auto flush saat online.

type Op = 'insert' | 'upsert' | 'delete'

async function enqueue(table: string, op: Op, payload: Record<string, unknown>, onConflict?: string) {
  await db.syncQueue.add({ table, op, payload, onConflict, createdAt: new Date().toISOString() }).catch(() => {})
}

async function fireOrQueue(table: string, op: Op, payload: Record<string, unknown>, onConflict?: string) {
  let outgoing = payload
  let owner = String(payload.user_id ?? payload.id ?? '')
  if (owner.startsWith('demo-')) {
    if (!['supplement_reminders', 'anc_visits', 'dose_logs'].includes(table)) return
    try {
      const demoPushOwner = localStorage.getItem('siaga_demo_push_user_id')
      const { data: { session } } = await supabase.auth.getSession()
      if (!demoPushOwner || demoPushOwner !== session?.user.id || !session.user.is_anonymous) return
      owner = demoPushOwner
      outgoing = { ...payload, user_id: owner }
    } catch { return }
  }
  // ponytail: coba langsung jika online, gagal → queue; offline langsung queue
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    await enqueue(table, op, outgoing, onConflict)
    return
  }
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || owner !== session.user.id) {
      await enqueue(table, op, outgoing, onConflict)
      return
    }
    const q = op === 'delete' ? supabase.from(table).delete().match(outgoing)
      : op === 'upsert'
      ? supabase.from(table).upsert(outgoing as never, onConflict ? { onConflict } as never : undefined)
      : supabase.from(table).insert(outgoing as never)
    const { error } = await q as unknown as { error: unknown }
    if (error) {
      // RLS/FK warn (belum auth) jangan queue ulang — cukup log, biar tidak spam
      const msg = String(error)
      if (msg.includes('violates row-level') || msg.includes('foreign key') || msg.includes('JWT')) {
        console.warn('[sync] skip (auth):', error)
        return
      }
      await enqueue(table, op, outgoing, onConflict)
      console.warn('[sync] queued after error:', error)
    }
  } catch (e) {
    await enqueue(table, op, outgoing, onConflict)
    console.warn('[sync] queued offline:', e)
  }
}

export async function flushSyncQueue(): Promise<number> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return 0
  const items = await db.syncQueue.toArray()
  if (!items.length) return 0
  let ok = 0
  for (const it of items) {
    if (String(it.payload.user_id ?? it.payload.id ?? '').startsWith('demo-')) {
      await db.syncQueue.delete(it.id!)
      continue
    }
    if (String(it.payload.user_id ?? it.payload.id ?? '') !== session.user.id) continue
    try {
      const q = it.op === 'delete' ? supabase.from(it.table).delete().match(it.payload)
        : it.op === 'upsert'
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
export function syncProfile(p: { id: string; nama: string; email: string; tanggal_lahir: string; hpht: string; gravida: number; para: number; abortus: number; fasyankes: string; nama_bidan: string; noHp: string; avatarPath?: string }): Promise<void> {
  return fireOrQueue('profiles', 'upsert', {
    id: p.id, nama: p.nama, email: p.email, tanggal_lahir: p.tanggal_lahir || null, hpht: p.hpht || null,
    gravida: p.gravida, para: p.para, abortus: p.abortus,
    fasyankes: p.fasyankes, nama_bidan: p.nama_bidan, no_hp: p.noHp,
    ...(p.avatarPath !== undefined ? { avatar_path: p.avatarPath || null } : {}),
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

export function syncSupplement(e: { id: string; userId: string; namaSuplemen: string; waktu: string; statusAktif: boolean; riwayatKepatuhan: number[]; waktuList?: string[]; frekuensi?: string; hari?: number[]; tanggalMulai?: string; tanggalSelesai?: string }) {
  return fireOrQueue('supplement_reminders', 'upsert', {
    client_id: e.id, user_id: e.userId, nama_suplemen: e.namaSuplemen, waktu: e.waktu,
    status_aktif: e.statusAktif, riwayat_kepatuhan: e.riwayatKepatuhan,
    waktu_list: e.waktuList ?? [e.waktu], frekuensi: e.frekuensi ?? 'harian1', hari: e.hari ?? [],
    tanggal_mulai: e.tanggalMulai ?? null, tanggal_selesai: e.tanggalSelesai ?? null,
  }, 'user_id,nama_suplemen')
}

export function deleteSyncedSupplement(userId: string, name: string) {
  void fireOrQueue('supplement_reminders', 'delete', { user_id: userId, nama_suplemen: name })
}

export function syncDose(e: { userId: string; suplemenId: string; tanggal: string; waktu: string; status: 'taken' | 'skip' | 'none' }) {
  return fireOrQueue('dose_logs', 'upsert', {
    user_id: e.userId, suplemen_id: e.suplemenId, tanggal: e.tanggal, waktu: e.waktu,
    status: e.status, updated_at: new Date().toISOString(),
  }, 'user_id,suplemen_id,tanggal,waktu')
}

export function syncAnc(e: { id: string; userId: string; tanggalTerjadwal: string; statusSelesai: boolean; catatan?: string }) {
  return fireOrQueue('anc_visits', 'upsert', {
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

export function syncBirthPlan(plan: BirthPlan): Promise<void> {
  return fireOrQueue('birth_plans', 'upsert', {
    user_id: plan.userId,
    penolong: plan.penolong,
    tempat_bersalin: plan.tempatBersalin,
    pendamping: plan.pendamping,
    hp_bidan_siaga: plan.hpBidanSiaga,
    donor1_nama: plan.donor1Nama,
    donor1_golongan_darah: plan.donor1GolonganDarah || null,
    donor2_nama: plan.donor2Nama,
    donor2_golongan_darah: plan.donor2GolonganDarah || null,
    transportasi: plan.transportasi,
    estimasi_dana: plan.estimasiDana,
    checklist_perlengkapan: plan.checklistPerlengkapan,
    tanda_persalinan_dipahami: plan.tandaPersalinanDipahami,
    created_at: plan.createdAt,
    updated_at: plan.updatedAt,
  }, 'user_id')
}
