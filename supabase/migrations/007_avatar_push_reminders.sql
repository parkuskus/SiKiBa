-- Profile photo references and server-delivered reminder push notifications.
alter table public.profiles add column if not exists avatar_path text;

alter table public.supplement_reminders
  add column if not exists client_id text,
  add column if not exists waktu_list text[] not null default '{}',
  add column if not exists frekuensi text not null default 'harian1',
  add column if not exists hari int[] not null default '{}',
  add column if not exists tanggal_mulai date,
  add column if not exists tanggal_selesai date;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  time_zone text not null default 'Asia/Jakarta',
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='push_subscriptions' and policyname='own_push_subscriptions') then
    create policy "own_push_subscriptions" on public.push_subscriptions
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
grant select, insert, update, delete on public.push_subscriptions to authenticated;

create table if not exists public.dose_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  suplemen_id text not null,
  tanggal date not null,
  waktu text not null,
  status text not null check (status in ('taken', 'skip', 'none')),
  updated_at timestamptz not null default now(),
  primary key (user_id, suplemen_id, tanggal, waktu)
);

alter table public.dose_logs enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='dose_logs' and policyname='own_dose_logs') then
    create policy "own_dose_logs" on public.dose_logs
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
grant select, insert, update, delete on public.dose_logs to authenticated;
grant delete on public.supplement_reminders to authenticated;

-- Only the scheduled Edge Function uses this idempotency table (service role bypasses RLS).
create table if not exists public.reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  delivery_key text not null,
  claimed_at timestamptz not null default now(),
  unique (subscription_id, delivery_key)
);
alter table public.reminder_deliveries enable row level security;
grant all on public.push_subscriptions, public.dose_logs, public.reminder_deliveries to service_role;

-- Avatar images are private; object paths begin with the owning auth user UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='own_profile_avatar_objects') then
    create policy "own_profile_avatar_objects" on storage.objects
      for all to authenticated
      using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
      with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;
