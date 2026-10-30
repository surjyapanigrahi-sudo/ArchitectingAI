-- Architecting AI: targeted rollback of the contact migration
-- DESTRUCTIVE. DO NOT RUN as part of inspection or migration verification.
-- Run only with separate production rollback authorization, all feature gates off,
-- and after securely exporting any contact records that must be retained.
-- This removes only objects introduced by 20261021000100_contact_enquiries.sql.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

-- Refuse rollback if the private schema contains tables or functions that are not
-- owned by this migration. This prevents CASCADE from hiding an expanded scope.
do $guard$
declare
  unexpected text;
begin
  select pg_catalog.string_agg(object_name, ', ' order by object_name)
  into unexpected
  from (
    select 'relation contact_private.' || c.relname as object_name
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'contact_private'
      and c.relkind in ('r', 'p', 'v', 'm', 'S', 'f')
      and not (c.relkind in ('r', 'p') and c.relname in (
        'requests', 'rate_buckets', 'notification_outbox',
        'request_tombstones', 'notification_resolutions'
      ))
    union all
    select 'function contact_private.' || p.proname || '(' ||
      pg_catalog.pg_get_function_identity_arguments(p.oid) || ')'
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'contact_private'
      and not (p.proname = 'touch_enquiry' and pg_catalog.pg_get_function_identity_arguments(p.oid) = '')
  ) objects;

  if unexpected is not null then
    raise exception 'Rollback refused; unexpected private objects: %', unexpected;
  end if;

  if pg_catalog.to_regclass('public.contact_enquiries') is null
     or pg_catalog.to_regprocedure('public.submit_contact_enquiry(uuid,text,text,text,jsonb)') is null
     or pg_catalog.to_regprocedure('public.claim_contact_notification()') is null
     or pg_catalog.to_regprocedure('public.finish_contact_notification(uuid,uuid,text,text)') is null
     or pg_catalog.to_regprocedure('public.resolve_contact_notification(uuid,text,text,text)') is null
     or pg_catalog.to_regprocedure('public.cleanup_contact_metadata(timestamptz,timestamptz,integer)') is null
     or pg_catalog.to_regprocedure('contact_private.touch_enquiry()') is null then
    raise exception 'Rollback refused; expected contact migration objects are incomplete';
  end if;
end
$guard$;

drop function public.cleanup_contact_metadata(timestamptz, timestamptz, integer);
drop function public.resolve_contact_notification(uuid, text, text, text);
drop function public.finish_contact_notification(uuid, uuid, text, text);
drop function public.claim_contact_notification();
drop function public.submit_contact_enquiry(uuid, text, text, text, jsonb);

drop trigger contact_enquiries_updated on public.contact_enquiries;
drop function contact_private.touch_enquiry();

drop table contact_private.notification_resolutions;
drop table contact_private.requests;
drop table contact_private.rate_buckets;
drop table contact_private.request_tombstones;
drop table contact_private.notification_outbox;
drop table public.contact_enquiries;
drop schema contact_private;

commit;
