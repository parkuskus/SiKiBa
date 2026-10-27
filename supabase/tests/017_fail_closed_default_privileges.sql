begin;

do $$
declare
  suffix text := replace(gen_random_uuid()::text, '-', '');
  probe_table text := 'rls_default_table_' || suffix;
  probe_sequence text := 'rls_default_sequence_' || suffix;
  probe_function text := 'rls_default_function_' || suffix;
  api_role text;
  privilege text;
begin
  execute pg_catalog.format('create table public.%I (id integer)', probe_table);
  foreach api_role in array array['anon', 'authenticated', 'service_role'] loop
    foreach privilege in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN'] loop
      if has_table_privilege(api_role, pg_catalog.format('public.%I', probe_table), privilege) then
        raise exception 'new public table grants % to %', privilege, api_role;
      end if;
    end loop;
  end loop;

  execute pg_catalog.format('create sequence public.%I', probe_sequence);
  foreach api_role in array array['anon', 'authenticated', 'service_role'] loop
    foreach privilege in array array['USAGE', 'SELECT', 'UPDATE'] loop
      if has_sequence_privilege(api_role, pg_catalog.format('public.%I', probe_sequence), privilege) then
        raise exception 'new public sequence grants % to %', privilege, api_role;
      end if;
    end loop;
  end loop;

  execute pg_catalog.format('create function public.%I() returns integer language sql as %L', probe_function, 'select 1');
  foreach api_role in array array['anon', 'authenticated', 'service_role'] loop
    if has_function_privilege(api_role, pg_catalog.format('public.%I()', probe_function), 'EXECUTE') then
      raise exception 'new public function is executable by %', api_role;
    end if;
  end loop;
end $$;

rollback;
