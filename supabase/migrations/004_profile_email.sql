-- Add email to the local profile mirror; Auth remains the identity source.
alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null
  and u.email is not null;
