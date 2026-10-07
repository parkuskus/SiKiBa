import { db, type Profile } from "@/data/db"
import { supabase } from "@/data/supabase"

export const DEMO_EMAIL = "dummy@siagabunda.test"
export const DEMO_OTP = "246810"
export const DEMO_USER_ID = "demo-dummy"

function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export async function activateDemoAccount() {
  const { error } = await supabase.auth.signInAnonymously()
  if (error) throw new Error(`Gagal mengaktifkan chatbot online: ${error.message}`)

  const today = new Date()
  const birth = new Date(today)
  birth.setFullYear(birth.getFullYear() - 26)
  const hpht = new Date(today)
  hpht.setDate(hpht.getDate() - 70)
  const now = new Date().toISOString()
  const profile: Profile = {
    id: DEMO_USER_ID,
    nama: "Dummy",
    email: DEMO_EMAIL,
    tanggal_lahir: dateString(birth),
    noHp: "081234567890",
    hpht: dateString(hpht),
    gravida: 1,
    para: 0,
    abortus: 0,
    fasyankes: "Puskesmas Uji SIAGA",
    nama_bidan: "Bidan Dummy",
    createdAt: now,
    updatedAt: now,
  }

  const existing = await db.profiles.get(DEMO_USER_ID)
  await db.profiles.put({ ...profile, avatarBlob: existing?.avatarBlob })
  if (!(await db.supplementReminders.where('userId').equals(DEMO_USER_ID).count())) await db.supplementReminders.bulkPut([
    { id: `${DEMO_USER_ID}-folat`, userId: DEMO_USER_ID, namaSuplemen: "Asam folat", waktu: "07:30", waktuList: ["07:30"], statusAktif: true, riwayatKepatuhan: [], frekuensi: "harian1" },
    { id: `${DEMO_USER_ID}-fe`, userId: DEMO_USER_ID, namaSuplemen: "Tablet Fe", waktu: "19:00", waktuList: ["19:00"], statusAktif: true, riwayatKepatuhan: [], frekuensi: "harian1" },
  ])
  const nextVisit = new Date(today)
  nextVisit.setDate(nextVisit.getDate() + 2)
  if (!(await db.ancVisits.get(`${DEMO_USER_ID}-anc-next`))) await db.ancVisits.put({ id: `${DEMO_USER_ID}-anc-next`, userId: DEMO_USER_ID, tanggalTerjadwal: dateString(nextVisit), statusSelesai: false, catatan: "Puskesmas Uji SIAGA" })
  try {
    localStorage.setItem("siaga_demo_user_id", DEMO_USER_ID)
    localStorage.setItem("siaga_active_user_id", DEMO_USER_ID)
    localStorage.setItem("siaga_isPostpartum", "false")
    localStorage.removeItem("siaga_birth_date")
    localStorage.removeItem("siaga_logged_out")
  } catch {}
}
