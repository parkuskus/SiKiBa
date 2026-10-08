import { db, type BirthPlan } from "@/data/db"
import { supabase } from "@/data/supabase"
import { syncBirthPlan } from "@/data/sync"

export const CHECKLIST_PERLENGKAPAN = [
  ["bukuKia", "Buku KIA"],
  ["ktpBpjs", "KTP dan BPJS"],
  ["pakaianIbu", "Pakaian ibu"],
  ["pakaianBayi", "Pakaian bayi"],
  ["popok", "Popok"],
  ["pembalutNifas", "Pembalut nifas"],
  ["selimutBayi", "Selimut bayi"],
  ["perlengkapanMandi", "Perlengkapan mandi"],
  ["peralatanMenyusui", "Peralatan menyusui"],
  ["tasPersalinan", "Tas persalinan sudah siap"],
] as const

export const TANDA_PERSALINAN = [
  ["kontraksiTeratur", "Kontraksi teratur"],
  ["lendirDarah", "Keluar lendir bercampur darah"],
  ["ketubanPecah", "Ketuban pecah"],
  ["pantauGerakan", "Gerakan janin tetap dipantau"],
  ["tahuFasilitas", "Mengetahui kapan harus ke fasilitas kesehatan"],
] as const

export function rencanaKosong(userId: string): BirthPlan {
  const now = new Date().toISOString()
  return {
    id: userId,
    userId,
    penolong: "",
    tempatBersalin: "",
    pendamping: "",
    hpBidanSiaga: "",
    donor1Nama: "",
    donor1GolonganDarah: "",
    donor2Nama: "",
    donor2GolonganDarah: "",
    transportasi: "",
    estimasiDana: null,
    danaDikonfirmasi: false,
    checklistPerlengkapan: Object.fromEntries(CHECKLIST_PERLENGKAPAN.map(([key]) => [key, false])),
    tandaPersalinanDipahami: Object.fromEntries(TANDA_PERSALINAN.map(([key]) => [key, false])),
    createdAt: now,
    updatedAt: now,
  }
}

function dariCloud(row: Record<string, unknown>): BirthPlan {
  const userId = String(row.user_id)
  const kosong = rencanaKosong(userId)
  return {
    id: userId,
    userId,
    penolong: String(row.penolong ?? ""),
    tempatBersalin: String(row.tempat_bersalin ?? ""),
    pendamping: String(row.pendamping ?? ""),
    hpBidanSiaga: String(row.hp_bidan_siaga ?? ""),
    donor1Nama: String(row.donor1_nama ?? ""),
    donor1GolonganDarah: (row.donor1_golongan_darah ?? "") as BirthPlan["donor1GolonganDarah"],
    donor2Nama: String(row.donor2_nama ?? ""),
    donor2GolonganDarah: (row.donor2_golongan_darah ?? "") as BirthPlan["donor2GolonganDarah"],
    transportasi: String(row.transportasi ?? ""),
    estimasiDana: typeof row.estimasi_dana === "number" ? row.estimasi_dana : null,
    danaDikonfirmasi: typeof row.estimasi_dana === "number",
    checklistPerlengkapan: { ...kosong.checklistPerlengkapan, ...(row.checklist_perlengkapan as Record<string, boolean> | null ?? {}) },
    tandaPersalinanDipahami: { ...kosong.tandaPersalinanDipahami, ...(row.tanda_persalinan_dipahami as Record<string, boolean> | null ?? {}) },
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  }
}

export async function getBirthPlan(userId: string): Promise<{ plan: BirthPlan | null; conflict?: { device: BirthPlan; cloud: BirthPlan } }> {
  const local = await db.birthPlans.get(userId)
  if (userId.startsWith("demo-")) return { plan: local ?? null }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user.id !== userId) return { plan: local ?? null }
    const { data, error } = await supabase.from("birth_plans").select("*").eq("user_id", userId).maybeSingle()
    if (error || !data) return { plan: local ?? null }

    const cloud = dariCloud(data as Record<string, unknown>)
    const localTime = local ? Date.parse(local.updatedAt) : 0
    const cloudTime = Date.parse(cloud.updatedAt)
    if (local && localTime !== cloudTime) {
      return {
        plan: localTime > cloudTime ? local : cloud,
        conflict: { device: local, cloud },
      }
    }
    if (!local || cloudTime > localTime) await db.birthPlans.put(cloud)
    return { plan: cloud }
  } catch {
    return { plan: local ?? null }
  }
}

export async function simpanLokalDanSinkronkan(plan: BirthPlan): Promise<BirthPlan> {
  const saved = { ...plan, updatedAt: new Date().toISOString() }
  await db.birthPlans.put(saved)
  void syncBirthPlan(saved)
  return saved
}

export async function pilihVersiRencana(plan: BirthPlan): Promise<BirthPlan> {
  await db.birthPlans.put(plan)
  void syncBirthPlan(plan)
  return plan
}
