-- Authenticated requests still pass through the per-user RLS policies.
-- Grant only the operations used by the app and user-scoped chat function.
grant usage on schema public to authenticated;

grant select, insert, update on table
  public.profiles,
  public.screening_results,
  public.weight_entries,
  public.supplement_reminders,
  public.anc_visits,
  public.diary_entries,
  public.nifas_screenings,
  public.bbl_profiles,
  public.chat_messages
to authenticated;

grant select on table public.guideline_chunks to authenticated;
