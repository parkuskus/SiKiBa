alter table public.anc_visits
  add column if not exists minggu_terjadwal smallint,
  add column if not exists tanggal_diedit boolean not null default false;

grant select, insert, update on table public.anc_visits to authenticated;
