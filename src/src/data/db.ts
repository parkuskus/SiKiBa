import Dexie, { type Table } from 'dexie'

// ponytail: local mirror Supabase Postgres (ARCHITECTURE.md:91) — sync ke Supabase nanti, sekarang Dexie-only

export interface Profile {
  id: string // auth uid (uuid)
  nama: string
  tanggal_lahir: string // YYYY-MM-DD
  noHp: string
  hpht: string // YYYY-MM-DD
  gravida: number
  para: number
  abortus: number
  fasyankes: string
  nama_bidan: string
  createdAt: string
  updatedAt: string
}

export interface ScreeningResult {
  id: string
  userId: string
  tipe: string // poedji_rochjati | preeklamsia | imt_lila | danger_sign | dmg | epds | ...
  skor: number
  kategori: 'HIJAU' | 'KUNING' | 'MERAH'
  detail: Record<string, unknown> // JSONB, dienkripsi via crypto.ts sebelum simpan
  createdAt: string
}

export interface WeightEntry { id: string; userId: string; tanggal: string; beratKg: number }
export interface SupplementReminder { id: string; userId: string; namaSuplemen: string; waktu: string; statusAktif: boolean; riwayatKepatuhan: number[] }
export interface ANCVisit { id: string; userId: string; tanggalTerjadwal: string; statusSelesai: boolean; catatan?: string }
export interface DiaryEntry { id: string; userId: string; tanggal: string; teks: string; mood: number }
export interface NifasScreening { id: string; userId: string; hariKe: number; parameterVital: Record<string, unknown>; status: string; createdAt: string }
export interface BBLProfile { id: string; userId: string; dataLahir: string; apgar?: number; usiaGestasi?: number }

export class SIGAPDB extends Dexie {
  profiles!: Table<Profile, string>
  screeningResults!: Table<ScreeningResult, string>
  weightEntries!: Table<WeightEntry, string>
  supplementReminders!: Table<SupplementReminder, string>
  ancVisits!: Table<ANCVisit, string>
  diaryEntries!: Table<DiaryEntry, string>
  nifasScreenings!: Table<NifasScreening, string>
  bblProfiles!: Table<BBLProfile, string>

  constructor() {
    super('SIGAPDB')
    this.version(1).stores({
      profiles: 'id, hpht',
      screeningResults: 'id, userId, tipe, kategori, createdAt',
      weightEntries: 'id, userId, tanggal',
      supplementReminders: 'id, userId, namaSuplemen',
      ancVisits: 'id, userId, tanggalTerjadwal',
      diaryEntries: 'id, userId, tanggal',
      nifasScreenings: 'id, userId, hariKe',
      bblProfiles: 'id, userId',
    })
  }
}

export const db = new SIGAPDB()
// ponytail: alias backwards-compat kalau ada import lama SiKiBaDB
export const SiKiBaDB = SIGAPDB
