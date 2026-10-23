create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role, supabase_auth_admin;

create table if not exists private.email_mfa_challenges (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references auth.sessions(id) on delete cascade,
  digest text not null check (digest ~ '^[0-9a-f]{64}$'),
  attempts integer not null default 0 check (attempts between 0 and 5),
  last_sent_at timestamptz not null default now(),
  expires_at timestamptz not null,
  locked_until timestamptz,
  consumed_at timestamptz,
  invalidated_at timestamptz,
  primary key (user_id, session_id)
);

create table if not exists private.email_mfa_verified_sessions (
  session_id uuid primary key references auth.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  verified_at timestamptz not null default now()
);

create or replace function private.constant_time_hex_equal(left_hex text, right_hex text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  difference integer := 0;
  index integer;
  left_bytes bytea;
  right_bytes bytea;
begin
  if left_hex !~ '^[0-9a-f]{64}$' or right_hex !~ '^[0-9a-f]{64}$' then return false; end if;
  left_bytes := pg_catalog.decode(left_hex, 'hex');
  right_bytes := pg_catalog.decode(right_hex, 'hex');
  for index in 0..31 loop
    difference := difference | (pg_catalog.get_byte(left_bytes, index) # pg_catalog.get_byte(right_bytes, index));
  end loop;
  return difference = 0;
end;
$$;
revoke all on function private.constant_time_hex_equal(text, text) from public, anon, authenticated, service_role, supabase_auth_admin;

alter table private.email_mfa_challenges enable row level security;
alter table private.email_mfa_verified_sessions enable row level security;
revoke all on private.email_mfa_challenges, private.email_mfa_verified_sessions from public, anon, authenticated;
grant select, insert, update, delete on private.email_mfa_challenges, private.email_mfa_verified_sessions to service_role;
grant select on private.email_mfa_verified_sessions to supabase_auth_admin;
grant select (id, encrypted_password, email_confirmed_at) on auth.users to supabase_auth_admin;
grant select (id, user_id, not_after) on auth.sessions to supabase_auth_admin;

create or replace function public.start_email_mfa_challenge(
  p_user_id uuid,
  p_session_id uuid,
  p_digest text
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_challenge private.email_mfa_challenges%rowtype;
  new_attempts integer;
  new_lockout timestamptz;
begin
  if p_digest !~ '^[0-9a-f]{64}$' then return 'invalid'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text || ':' || p_session_id::text, 0));

  select * into current_challenge
  from private.email_mfa_challenges
  where user_id = p_user_id and session_id = p_session_id
  for update;

  if found and current_challenge.locked_until > now() then return 'locked'; end if;
  if found and current_challenge.last_sent_at > now() - interval '60 seconds' then return 'cooldown'; end if;

  new_attempts := coalesce(current_challenge.attempts, 0);
  new_lockout := current_challenge.locked_until;
  if new_attempts >= 5 and (new_lockout is null or new_lockout <= now()) then
    new_attempts := 0;
    new_lockout := null;
  end if;

  insert into private.email_mfa_challenges (
    user_id, session_id, digest, attempts, last_sent_at, expires_at, locked_until, consumed_at, invalidated_at
  ) values (
    p_user_id, p_session_id, p_digest, new_attempts, now(), now() + interval '5 minutes', new_lockout, null, null
  )
  on conflict (user_id, session_id) do update set
    digest = excluded.digest,
    attempts = excluded.attempts,
    last_sent_at = excluded.last_sent_at,
    expires_at = excluded.expires_at,
    locked_until = excluded.locked_until,
    consumed_at = null,
    invalidated_at = null;
  return 'sent';
end;
$$;

create or replace function public.verify_email_mfa_challenge(
  p_user_id uuid,
  p_session_id uuid,
  p_digest text
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  challenge private.email_mfa_challenges%rowtype;
begin
  select * into challenge
  from private.email_mfa_challenges
  where user_id = p_user_id and session_id = p_session_id
  for update;
  if not found or p_digest !~ '^[0-9a-f]{64}$' then return 'invalid'; end if;
  if challenge.consumed_at is not null or challenge.invalidated_at is not null then return 'used'; end if;
  if challenge.expires_at <= now() then return 'expired'; end if;
  if challenge.locked_until > now() then return 'locked'; end if;

  if not private.constant_time_hex_equal(challenge.digest, p_digest) then
    update private.email_mfa_challenges
    set attempts = attempts + 1,
        locked_until = case when attempts + 1 >= 5 then now() + interval '15 minutes' else locked_until end
    where user_id = p_user_id and session_id = p_session_id;
    return case when challenge.attempts + 1 >= 5 then 'locked' else 'invalid' end;
  end if;

  update private.email_mfa_challenges
  set consumed_at = now()
  where user_id = p_user_id and session_id = p_session_id;
  insert into private.email_mfa_verified_sessions (session_id, user_id)
  values (p_session_id, p_user_id)
  on conflict (session_id) do update set user_id = excluded.user_id, verified_at = now();
  return 'verified';
end;
$$;

create or replace function public.revoke_email_mfa_session(p_user_id uuid, p_session_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from private.email_mfa_verified_sessions where user_id = p_user_id and session_id = p_session_id;
  delete from private.email_mfa_challenges where user_id = p_user_id and session_id = p_session_id;
$$;

create or replace function public.clear_email_mfa_challenge(p_user_id uuid, p_session_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from private.email_mfa_challenges where user_id = p_user_id and session_id = p_session_id;
$$;

revoke all on function public.start_email_mfa_challenge(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.verify_email_mfa_challenge(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.revoke_email_mfa_session(uuid, uuid) from public, anon, authenticated;
revoke all on function public.clear_email_mfa_challenge(uuid, uuid) from public, anon, authenticated;
grant execute on function public.start_email_mfa_challenge(uuid, uuid, text) to service_role;
grant execute on function public.verify_email_mfa_challenge(uuid, uuid, text) to service_role;
grant execute on function public.revoke_email_mfa_session(uuid, uuid) to service_role;
grant execute on function public.clear_email_mfa_challenge(uuid, uuid) to service_role;
drop function if exists private.start_email_mfa_challenge(uuid, uuid, text);
drop function if exists private.verify_email_mfa_challenge(uuid, uuid, text);
drop function if exists private.revoke_email_mfa_session(uuid, uuid);

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims jsonb := coalesce(event -> 'claims', '{}'::jsonb) - 'app_mfa_verified';
  method text := event ->> 'authentication_method';
  v_user_id uuid := (event ->> 'user_id')::uuid;
  v_session_id uuid := (event -> 'claims' ->> 'session_id')::uuid;
  verified boolean := false;
begin
  if method = 'email/signup' then
    select exists (
      select 1 from auth.users u
      where u.id = v_user_id
        and coalesce(u.encrypted_password, '') <> ''
        and u.email_confirmed_at is not null
    ) into verified;
  elsif method = 'token_refresh' then
    select exists (
      select 1
      from private.email_mfa_verified_sessions v
      join auth.sessions s on s.id = v.session_id and s.user_id = v.user_id
      where v.user_id = v_user_id and v.session_id = v_session_id
        and (s.not_after is null or s.not_after > now())
    ) into verified;
  end if;

  if verified then claims := jsonb_set(claims, '{app_mfa_verified}', 'true'::jsonb, true); end if;
  return jsonb_set(event, '{claims}', claims, true);
end;
$$;

revoke all on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;

do $$
declare
  policy record;
begin
  for policy in select * from (values
    ('profiles', 'own_profiles', 'id'),
    ('screening_results', 'own_screening', 'user_id'),
    ('weight_entries', 'own_weight', 'user_id'),
    ('supplement_reminders', 'own_supplement', 'user_id'),
    ('anc_visits', 'own_anc', 'user_id'),
    ('diary_entries', 'own_diary', 'user_id'),
    ('nifas_screenings', 'own_nifas', 'user_id'),
    ('bbl_profiles', 'own_bbl', 'user_id'),
    ('chat_messages', 'own_chat', 'user_id'),
    ('birth_plans', 'own_birth_plans', 'user_id'),
    ('push_subscriptions', 'own_push_subscriptions', 'user_id'),
    ('dose_logs', 'own_dose_logs', 'user_id')
  ) as p(tablename, policyname, owner_column)
  loop
    execute pg_catalog.format('drop policy if exists %I on public.%I', policy.policyname, policy.tablename);
    execute pg_catalog.format(
      'create policy %I on public.%I for all to authenticated using (auth.jwt() ->> ''app_mfa_verified'' = ''true'' and auth.uid() = %I) with check (auth.jwt() ->> ''app_mfa_verified'' = ''true'' and auth.uid() = %I)',
      policy.policyname, policy.tablename, policy.owner_column, policy.owner_column
    );
  end loop;
end $$;

drop policy if exists own_profile_avatar_objects on storage.objects;
create policy own_profile_avatar_objects on storage.objects for all to authenticated
  using (
    auth.jwt() ->> 'app_mfa_verified' = 'true'
    and bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    auth.jwt() ->> 'app_mfa_verified' = 'true'
    and bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
