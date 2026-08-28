-- SIAGA Bunda — initial schema (idempotent, safe re-run)
-- Brand: SIAGA Bunda (sebelumnya SiKiBa) — Sistem Informasi Antisipasi & menjaGA Bunda
-- Mirror Dexie src/src/data/db.ts — push via: npx supabase db push (tidak overwrite jika sudah ada)

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

-- RLS (tidak overwrite data, hanya policy)
alter table profiles enable row level security;
alter table screening_results enable row level security;
alter table weight_entries enable row level security;
alter table supplement_reminders enable row level security;
alter table anc_visits enable row level security;
alter table diary_entries enable row level security;
alter table nifas_screenings enable row level security;
alter table bbl_profiles enable row level security;

drop policy if exists "own_profiles" on profiles;
create policy "own_profiles" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own_screening" on screening_results;
create policy "own_screening" on screening_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own_weight" on weight_entries;
create policy "own_weight" on weight_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own_supplement" on supplement_reminders;
create policy "own_supplement" on supplement_reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own_anc" on anc_visits;
create policy "own_anc" on anc_visits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own_diary" on diary_entries;
create policy "own_diary" on diary_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own_nifas" on nifas_screenings;
create policy "own_nifas" on nifas_screenings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own_bbl" on bbl_profiles;
create policy "own_bbl" on bbl_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
