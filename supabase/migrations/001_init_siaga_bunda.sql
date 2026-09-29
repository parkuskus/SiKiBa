-- SIAGA Bunda — initial schema (idempotent, safe re-run)
-- Brand: SIAGA Bunda (sebelumnya SiKiBa) — Sistem Informasi Antisipasi & menjaGA Bunda
-- Mirror Dexie app/src/data/db.ts — push via: npx supabase db push (tidak overwrite jika sudah ada)

create extension if not exists "pgcrypto";

-- 1. profiles (id = auth.users.id)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  tanggal_lahir date,
  hpht date,
  gravida int,
  para int,
  abortus int,
  fasyankes text,
  nama_bidan text,
  no_hp text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. screening_results
create table if not exists screening_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tipe text not null,
  skor int,
  kategori text check (kategori in ('HIJAU','KUNING','MERAH')),
  detail jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_screening_user on screening_results(user_id);
create index if not exists idx_screening_tipe on screening_results(tipe);

-- 3. weight_entries
create table if not exists weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tanggal date not null,
  berat_kg numeric,
  created_at timestamptz default now()
);
create index if not exists idx_weight_user on weight_entries(user_id);

-- 4. supplement_reminders
create table if not exists supplement_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  nama_suplemen text not null,
  waktu text,
  status_aktif boolean default true,
  riwayat_kepatuhan int[] default '{}',
  unique(user_id, nama_suplemen)
);

-- 5. anc_visits
create table if not exists anc_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tanggal_terjadwal date not null,
  status_selesai boolean default false,
  catatan text
);

-- 6. diary_entries
create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tanggal date not null,
  teks text,
  mood int check (mood between 1 and 5),
  created_at timestamptz default now()
);

-- 7. nifas_screenings
create table if not exists nifas_screenings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  hari_ke int check (hari_ke between 0 and 42),
  parameter_vital jsonb,
  status text check (status in ('HIJAU','KUNING','MERAH')),
  created_at timestamptz default now()
);

-- 8. bbl_profiles
create table if not exists bbl_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  data_lahir date,
  apgar int,
  usia_gestasi int,
  created_at timestamptz default now()
);

-- RLS (safe: cek dulu, tidak drop/overwrite jika policy sudah ada)
alter table profiles enable row level security;
alter table screening_results enable row level security;
alter table weight_entries enable row level security;
alter table supplement_reminders enable row level security;
alter table anc_visits enable row level security;
alter table diary_entries enable row level security;
alter table nifas_screenings enable row level security;
alter table bbl_profiles enable row level security;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='own_profiles') THEN
    CREATE POLICY "own_profiles" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='screening_results' AND policyname='own_screening') THEN
    CREATE POLICY "own_screening" ON screening_results FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='weight_entries' AND policyname='own_weight') THEN
    CREATE POLICY "own_weight" ON weight_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='supplement_reminders' AND policyname='own_supplement') THEN
    CREATE POLICY "own_supplement" ON supplement_reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='anc_visits' AND policyname='own_anc') THEN
    CREATE POLICY "own_anc" ON anc_visits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='diary_entries' AND policyname='own_diary') THEN
    CREATE POLICY "own_diary" ON diary_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='nifas_screenings' AND policyname='own_nifas') THEN
    CREATE POLICY "own_nifas" ON nifas_screenings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bbl_profiles' AND policyname='own_bbl') THEN
    CREATE POLICY "own_bbl" ON bbl_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
