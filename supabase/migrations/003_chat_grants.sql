-- SIAGA Bunda — 003 grants chat (idempotent, safe re-run)
-- service_role dipakai scripts/ingest-guideline.py (bypass RLS tapi tetap butuh GRANT tabel).

grant all on table chat_messages to service_role;
grant all on table guideline_chunks to service_role;
grant usage, select on all sequences in schema public to service_role;
