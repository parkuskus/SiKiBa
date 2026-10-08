create table if not exists public.birth_plans (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  penolong text not null default '',
  tempat_bersalin text not null default '',
  pendamping text not null default '',
  hp_bidan_siaga text not null default '',
  donor1_nama text not null default '',
  donor1_golongan_darah text check (donor1_golongan_darah in ('A', 'B', 'AB', 'O') or donor1_golongan_darah is null),
  donor2_nama text not null default '',
  donor2_golongan_darah text check (donor2_golongan_darah in ('A', 'B', 'AB', 'O') or donor2_golongan_darah is null),
  transportasi text not null default '',
  estimasi_dana numeric check (estimasi_dana is null or estimasi_dana >= 0),
  checklist_perlengkapan jsonb not null default '{}'::jsonb,
  tanda_persalinan_dipahami jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.birth_plans enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'birth_plans' and policyname = 'own_birth_plans'
  ) then
    create policy "own_birth_plans" on public.birth_plans
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

grant select, insert, update, delete on table public.birth_plans to authenticated;
