-- Scheduled Edge Function reads user-scoped reminders with the service-role client.
grant usage on schema public to service_role;
grant select on table
  public.supplement_reminders,
  public.anc_visits,
  public.dose_logs,
  public.push_subscriptions
to service_role;
grant select, insert, delete on table public.reminder_deliveries to service_role;
grant delete on table public.push_subscriptions to service_role;
