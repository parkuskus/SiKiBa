create table if not exists public.chat_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0)
);

alter table public.chat_rate_limits enable row level security;
revoke all on table public.chat_rate_limits from public, anon, authenticated, service_role;

create or replace function public.consume_chat_rate_limit(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.clock_timestamp();
  current_count integer;
begin
  insert into public.chat_rate_limits as limits (user_id, window_started_at, request_count)
  values (p_user_id, v_now, 1)
  on conflict (user_id) do update
  set window_started_at = case
        when limits.window_started_at + interval '10 minutes' <= v_now then v_now
        else limits.window_started_at
      end,
      request_count = case
        when limits.window_started_at + interval '10 minutes' <= v_now then 1
        else limits.request_count + 1
      end
  returning request_count into current_count;

  return current_count <= 20;
end;
$$;

revoke all on function public.consume_chat_rate_limit(uuid) from public, anon, authenticated;
grant execute on function public.consume_chat_rate_limit(uuid) to service_role;
