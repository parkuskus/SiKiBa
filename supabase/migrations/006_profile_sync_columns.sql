-- Keep the deployed profiles table aligned with the frontend profile mirror.
alter table public.profiles add column if not exists no_hp text;
alter table public.profiles add column if not exists updated_at timestamptz default now();

update public.profiles
set updated_at = created_at
where updated_at is null;
