begin;

do $$
declare
  test_user_id uuid := gen_random_uuid();
  attempt integer;
begin
  insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
  values (test_user_id, 'authenticated', 'authenticated', test_user_id::text || '@chat-limit.invalid', 'test-only', pg_catalog.now(), '{}'::jsonb, '{}'::jsonb);

  if has_function_privilege('anon', 'public.consume_chat_rate_limit(uuid)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.consume_chat_rate_limit(uuid)', 'EXECUTE') then
    raise exception 'chat rate limit RPC must not be callable by browser roles';
  end if;
  if not has_function_privilege('service_role', 'public.consume_chat_rate_limit(uuid)', 'EXECUTE') then
    raise exception 'chat Edge Function service role cannot check rate limits';
  end if;

  for attempt in 1..20 loop
    if not public.consume_chat_rate_limit(test_user_id) then
      raise exception 'chat request % was rejected below the limit', attempt;
    end if;
  end loop;
  if public.consume_chat_rate_limit(test_user_id) then
    raise exception 'chat request above the limit was accepted';
  end if;

  update public.chat_rate_limits
  set window_started_at = pg_catalog.clock_timestamp() - interval '11 minutes'
  where user_id = test_user_id;
  if not public.consume_chat_rate_limit(test_user_id) then
    raise exception 'chat request was not allowed after the rate limit window expired';
  end if;
end $$;

rollback;
