-- Run once per minute. Missing Vault configuration makes the job a no-op until setup.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Generate the cron credential in Vault; it never enters the repository or browser.
do $$ begin
  if not exists (select 1 from vault.decrypted_secrets where name = 'siaga_reminder_cron_secret') then
    perform vault.create_secret(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 'siaga_reminder_cron_secret', 'SIAGA reminder cron authentication');
  end if;
  if not exists (select 1 from vault.decrypted_secrets where name = 'siaga_supabase_url') then
    perform vault.create_secret('https://sepindjvfvzxchesrtct.supabase.co', 'siaga_supabase_url', 'SIAGA Supabase project URL');
  end if;
end $$;

create or replace function public.verify_reminder_dispatch(dispatch_secret text)
returns boolean language sql security definer set search_path = '' as $$
  select exists (
    select 1 from vault.decrypted_secrets where name = 'siaga_reminder_cron_secret' and decrypted_secret = dispatch_secret
  );
$$;
revoke all on function public.verify_reminder_dispatch(text) from public, anon, authenticated;
grant execute on function public.verify_reminder_dispatch(text) to service_role;

create or replace function public.enqueue_reminder_push()
returns void language plpgsql security definer set search_path = '' as $$
declare
  project_url text;
  dispatch_secret text;
begin
  select decrypted_secret into project_url from vault.decrypted_secrets where name = 'siaga_supabase_url' limit 1;
  select decrypted_secret into dispatch_secret from vault.decrypted_secrets where name = 'siaga_reminder_cron_secret' limit 1;
  if project_url is null or dispatch_secret is null then return; end if;
  perform net.http_post(
    url := rtrim(project_url, '/') || '/functions/v1/dispatch-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-reminder-secret', dispatch_secret),
    body := '{}'::jsonb, timeout_milliseconds := 50000
  );
end;
$$;
revoke all on function public.enqueue_reminder_push() from public, anon, authenticated;

do $$ begin
  if not exists (select 1 from cron.job where jobname = 'siaga-reminder-push') then
    perform cron.schedule('siaga-reminder-push', '* * * * *', 'select public.enqueue_reminder_push();');
  end if;
end $$;
