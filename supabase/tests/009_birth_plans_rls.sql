-- Transactional RLS smoke test. All temporary test rows are rolled back.
begin;

create temporary table birth_plan_rls_test_users on commit drop as
select (array_agg(id order by id))[1] as user_a,
       (array_agg(id order by id))[2] as user_b,
       (array_agg(id order by id))[3] as user_c
from public.profiles;

do $$ begin
  if (select user_c from birth_plan_rls_test_users) is null then
    raise exception 'RLS smoke test requires three existing test profiles';
  end if;
end $$;

select set_config('siaga.rls_test.user_a', user_a::text, true),
       set_config('siaga.rls_test.user_b', user_b::text, true),
       set_config('siaga.rls_test.user_c', user_c::text, true)
from birth_plan_rls_test_users;

insert into public.birth_plans (user_id, penolong)
values (current_setting('siaga.rls_test.user_a')::uuid, 'rls-test-a'),
       (current_setting('siaga.rls_test.user_b')::uuid, 'rls-test-b')
on conflict (user_id) do update set penolong = excluded.penolong;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('siaga.rls_test.user_a'), true);

do $$
declare
  own_rows integer;
  other_rows integer;
  affected integer;
begin
  select count(*) into own_rows from public.birth_plans where user_id = current_setting('siaga.rls_test.user_a')::uuid;
  select count(*) into other_rows from public.birth_plans where user_id = current_setting('siaga.rls_test.user_b')::uuid;
  if own_rows <> 1 or other_rows <> 0 then raise exception 'RLS SELECT isolation failed for user A'; end if;

  update public.birth_plans set penolong = 'unauthorized-update'
    where user_id = current_setting('siaga.rls_test.user_b')::uuid;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'RLS allowed user A to update user B data'; end if;

  update public.birth_plans set penolong = 'rls-test-a-updated'
    where user_id = current_setting('siaga.rls_test.user_a')::uuid;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'RLS denied user A access to their own row'; end if;
end $$;

reset role;
delete from public.birth_plans where user_id = current_setting('siaga.rls_test.user_a')::uuid;
delete from public.birth_plans where user_id = current_setting('siaga.rls_test.user_c')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('siaga.rls_test.user_a'), true);

do $$
declare
  rejected boolean := false;
  affected integer;
begin
  insert into public.birth_plans (user_id, penolong)
  values (current_setting('siaga.rls_test.user_a')::uuid, 'rls-test-a-inserted');
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'RLS denied user A from inserting their own row'; end if;

  begin
    insert into public.birth_plans (user_id, penolong)
    values (current_setting('siaga.rls_test.user_c')::uuid, 'unauthorized-insert');
  exception when insufficient_privilege then
    rejected := true;
  end;
  if not rejected then raise exception 'RLS allowed user A to insert for user C'; end if;
end $$;

select set_config('request.jwt.claim.sub', current_setting('siaga.rls_test.user_b'), true);
do $$
declare
  own_rows integer;
  other_rows integer;
begin
  select count(*) into own_rows from public.birth_plans where user_id = current_setting('siaga.rls_test.user_b')::uuid;
  select count(*) into other_rows from public.birth_plans where user_id = current_setting('siaga.rls_test.user_a')::uuid;
  if own_rows <> 1 or other_rows <> 0 then raise exception 'RLS SELECT isolation failed for user B'; end if;
end $$;

reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$
declare
  rejected boolean := false;
begin
  begin
    perform 1 from public.birth_plans limit 1;
  exception when insufficient_privilege then
    rejected := true;
  end;
  if not rejected then raise exception 'Anonymous role can read birth plans'; end if;
end $$;

rollback;
