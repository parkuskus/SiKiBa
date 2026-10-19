-- Repair historical FK definitions that CREATE TABLE IF NOT EXISTS did not update.
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

alter table public.screening_results
  drop constraint if exists screening_results_user_id_fkey;

alter table public.screening_results
  add constraint screening_results_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
