-- LOCAL PROPOSAL ONLY. Apply only after production approval and isolated verification.
begin;
-- FORCE RLS requires a trusted migration/function owner with BYPASSRLS.
do $$ begin
 if not exists(select 1 from pg_roles where rolname=current_user and (rolsuper or rolbypassrls)) then raise exception 'Contact migration requires a trusted BYPASSRLS owner'; end if;
end; $$;
create schema contact_private;
revoke all on schema contact_private from public, anon, authenticated;
create table public.contact_enquiries (
 id uuid primary key default gen_random_uuid(),
 full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
 email text not null check (char_length(email) between 3 and 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
 phone text check (phone is null or char_length(phone)<=40),
 enquiry_type text not null check (enquiry_type in ('Business Partnership','Course Enquiry','AI Video Generation Solution','General Enquiry')),
 message text not null check (char_length(btrim(message)) between 10 and 5000),
 status text not null default 'new' check (status in ('new','contacted','closed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 contacted_at timestamptz, internal_notes text,
 consent_version text not null
);
create index contact_enquiries_created_at_idx on public.contact_enquiries(created_at desc);
create index contact_enquiries_status_idx on public.contact_enquiries(status);
create index contact_enquiries_email_idx on public.contact_enquiries(lower(email));
create table contact_private.requests(request_id uuid primary key, fingerprint text not null, enquiry_id uuid not null references public.contact_enquiries(id), created_at timestamptz not null default now());
create table contact_private.rate_buckets(bucket_key text primary key, window_start timestamptz not null, count integer not null check(count>=0));
create table contact_private.notification_outbox(
 id uuid primary key default gen_random_uuid(), enquiry_id uuid not null unique references public.contact_enquiries(id),
 state text not null default 'pending' check(state in ('pending','processing','failed','accepted','uncertain','exhausted')),
 attempts integer not null default 0, next_attempt_at timestamptz not null default now(),
 lease_token uuid, lease_until timestamptz, first_attempt_at timestamptz,
 provider_message_id text, last_error_code text, accepted_at timestamptz, created_at timestamptz not null default now()
);
create table contact_private.request_tombstones(request_id uuid primary key, fingerprint text not null, original_created_at timestamptz not null, archived_at timestamptz not null default clock_timestamp());
create table contact_private.notification_resolutions(id uuid primary key default gen_random_uuid(), job_id uuid not null references contact_private.notification_outbox(id) on delete cascade, action text not null, note text not null check(char_length(note) between 10 and 500), actor text not null default session_user, created_at timestamptz not null default clock_timestamp());
create index contact_requests_created_idx on contact_private.requests(created_at);
create index contact_rate_window_idx on contact_private.rate_buckets(window_start);
create index contact_outbox_pending_idx on contact_private.notification_outbox(state,next_attempt_at);
alter table public.contact_enquiries enable row level security;
alter table public.contact_enquiries force row level security;
alter table contact_private.requests enable row level security;
alter table contact_private.rate_buckets enable row level security;
alter table contact_private.notification_outbox enable row level security;
alter table contact_private.request_tombstones enable row level security;
alter table contact_private.notification_resolutions enable row level security;
alter table contact_private.requests force row level security;
alter table contact_private.rate_buckets force row level security;
alter table contact_private.notification_outbox force row level security;
alter table contact_private.request_tombstones force row level security;
alter table contact_private.notification_resolutions force row level security;
-- No anon/authenticated policies: visitors and students have no direct CRUD access.
revoke all on public.contact_enquiries from public,anon,authenticated,service_role;
revoke all on all tables in schema contact_private from public,anon,authenticated,service_role;
create function contact_private.touch_enquiry() returns trigger language plpgsql set search_path=pg_catalog as $$
begin
 new.updated_at=now();
 if new.status='contacted' and new.contacted_at is null then new.contacted_at=now(); end if;
 return new;
end; $$;
create trigger contact_enquiries_updated before update on public.contact_enquiries for each row execute function contact_private.touch_enquiry();
create function public.submit_contact_enquiry(p_request_id uuid,p_fingerprint text,p_ip_hash text,p_email_hash text,p_enquiry jsonb) returns text
language plpgsql security definer set search_path=pg_catalog set lock_timeout='3s' as $$
declare previous text; bucket record; current_count integer; v_id uuid; v_window timestamptz;
begin
 -- One short transaction at expected low volume. Bounded lock waits fail closed.
 perform pg_advisory_xact_lock(210102026);
 -- Compute after waiting: now() would retain the transaction's possibly stale start time.
 v_window:=date_bin(interval '15 minutes',clock_timestamp(),timestamptz '2000-01-01');
 if p_request_id is null or coalesce(p_fingerprint,'') !~ '^[0-9a-f]{64}$' or coalesce(p_ip_hash,'') !~ '^[0-9a-f]{64}$' or coalesce(p_email_hash,'') !~ '^[0-9a-f]{64}$' then raise exception 'Invalid request'; end if;
 select fingerprint into previous from contact_private.requests where request_id=p_request_id;
 if not found then select fingerprint into previous from contact_private.request_tombstones where request_id=p_request_id; end if;
 if found then return case when previous=p_fingerprint then 'duplicate' else 'conflict' end; end if;
 for bucket in select * from (values ('ip:'||p_ip_hash,5),('email:'||p_email_hash,3),('global',100)) as limits(key,maximum) loop
  select count into current_count from contact_private.rate_buckets where bucket_key=bucket.key and window_start=v_window;
  if coalesce(current_count,0)>=bucket.maximum then return 'rate_limited'; end if;
 end loop;
 for bucket in select * from (values ('ip:'||p_ip_hash),('email:'||p_email_hash),('global')) as keys(key) loop
  insert into contact_private.rate_buckets(bucket_key,window_start,count) values(bucket.key,v_window,1)
  on conflict(bucket_key) do update set window_start=v_window,count=case when rate_buckets.window_start=v_window then rate_buckets.count+1 else 1 end;
 end loop;
 if jsonb_typeof(p_enquiry) is distinct from 'object' or p_enquiry->>'consent_version' is distinct from 'contact-2026-10-review-1' then raise exception 'Invalid acknowledgement'; end if;
 insert into public.contact_enquiries(full_name,email,phone,enquiry_type,message,consent_version)
 values(p_enquiry->>'full_name',p_enquiry->>'email',p_enquiry->>'phone',p_enquiry->>'enquiry_type',p_enquiry->>'message',p_enquiry->>'consent_version') returning id into v_id;
 insert into contact_private.requests(request_id,fingerprint,enquiry_id) values(p_request_id,p_fingerprint,v_id);
 insert into contact_private.notification_outbox(enquiry_id) values(v_id);
 return 'saved';
end; $$;
create function public.claim_contact_notification() returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare job contact_private.notification_outbox%rowtype; enquiry public.contact_enquiries%rowtype; v_now timestamptz:=clock_timestamp();
begin
 -- An expired worker may already have sent. Never reclaim its job for blind resend.
 update contact_private.notification_outbox set state='uncertain',last_error_code='lease_expired',lease_until=null,lease_token=null
 where state='processing' and lease_until<=v_now;
 update contact_private.notification_outbox set state='exhausted',last_error_code=case when attempts>=5 then 'attempts_exhausted' else 'retry_window_expired' end
 where state='failed' and (attempts>=5 or first_attempt_at<=v_now-interval '23 hours');
 select * into job from contact_private.notification_outbox where attempts<5 and next_attempt_at<=v_now and state in ('pending','failed') order by created_at for update skip locked limit 1;
 if not found then return null; end if;
 update contact_private.notification_outbox set state='processing',attempts=attempts+1,lease_token=gen_random_uuid(),lease_until=v_now+interval '2 minutes',first_attempt_at=coalesce(first_attempt_at,v_now) where id=job.id returning * into job;
 select * into enquiry from public.contact_enquiries where id=job.enquiry_id;
 return jsonb_build_object('job_id',job.id,'lease_token',job.lease_token,'enquiry_id',enquiry.id,'full_name',enquiry.full_name,'email',enquiry.email,'phone',enquiry.phone,'enquiry_type',enquiry.enquiry_type,'message',enquiry.message,'created_at',enquiry.created_at,'attempts',job.attempts);
end; $$;
create function public.finish_contact_notification(p_job_id uuid,p_lease_token uuid,p_provider_id text,p_error_code text) returns boolean
language plpgsql security definer set search_path=pg_catalog as $$
begin
 if p_error_code is not null and p_error_code not in ('provider_rejected','provider_rate_limited','provider_unavailable','outcome_unknown') then raise exception 'Invalid status'; end if;
 if p_error_code is null and coalesce(btrim(p_provider_id),'')='' then raise exception 'Missing provider acknowledgement'; end if;
 update contact_private.notification_outbox set
 state=case when p_error_code is null then 'accepted' when p_error_code in ('outcome_unknown','provider_unavailable') then 'uncertain' when p_error_code='provider_rejected' or attempts>=5 then 'exhausted' else 'failed' end,
 provider_message_id=case when p_error_code is null then p_provider_id else null end,last_error_code=p_error_code,
 accepted_at=case when p_error_code is null then clock_timestamp() else null end,
 next_attempt_at=clock_timestamp()+interval '5 minutes'*power(2,attempts-1),lease_until=null,lease_token=null
 where id=p_job_id and lease_token=p_lease_token and state='processing' and lease_until>clock_timestamp();
 return found;
end; $$;
create function public.resolve_contact_notification(p_job_id uuid,p_action text,p_note text,p_provider_id text default null) returns boolean
language plpgsql security definer set search_path=pg_catalog as $$
declare job contact_private.notification_outbox%rowtype;
begin
 if coalesce(char_length(btrim(p_note)),0) not between 10 and 500 or p_action not in ('mark_accepted','retry_confirmed_not_sent','close') or p_action is null then raise exception 'Explicit reconciliation required'; end if;
 select * into job from contact_private.notification_outbox where id=p_job_id for update;
 if not found or job.state not in ('uncertain','exhausted') then return false; end if;
 if p_action='mark_accepted' and coalesce(btrim(p_provider_id),'')='' then raise exception 'Verified provider identifier required'; end if;
 if p_action='retry_confirmed_not_sent' and (job.state<>'uncertain' or job.attempts>=5 or job.first_attempt_at<=clock_timestamp()-interval '23 hours') then raise exception 'Retry is not safe'; end if;
 update contact_private.notification_outbox set state=case p_action when 'mark_accepted' then 'accepted' when 'retry_confirmed_not_sent' then 'failed' else 'exhausted' end,
 provider_message_id=case when p_action='mark_accepted' then p_provider_id else provider_message_id end,
 accepted_at=case when p_action='mark_accepted' then clock_timestamp() else accepted_at end,
 last_error_code=case when p_action='retry_confirmed_not_sent' then 'confirmed_not_sent' else last_error_code end,
 next_attempt_at=clock_timestamp(),lease_token=null,lease_until=null where id=p_job_id;
 insert into contact_private.notification_resolutions(job_id,action,note) values(p_job_id,p_action,btrim(p_note));
 return true;
end; $$;
create function public.cleanup_contact_metadata(p_bucket_before timestamptz,p_request_before timestamptz,p_limit integer default 500) returns jsonb
language plpgsql security definer set search_path=pg_catalog set lock_timeout='3s' as $$
declare bucket_count integer; request_count integer;
begin
 -- Explicit, approved cutoffs only; a one-day technical safety floor is not a retention policy.
 if p_bucket_before is null or p_request_before is null or p_bucket_before>clock_timestamp()-interval '1 day' or p_request_before>clock_timestamp()-interval '1 day' or p_limit is null or p_limit not between 1 and 1000 then raise exception 'Unsafe cleanup parameters'; end if;
 perform pg_advisory_xact_lock(210102026);
 delete from contact_private.rate_buckets where bucket_key in (select bucket_key from contact_private.rate_buckets where window_start<p_bucket_before order by window_start limit p_limit);
 get diagnostics bucket_count=row_count;
 with stale as (select request_id,fingerprint,created_at from contact_private.requests where created_at<p_request_before order by created_at limit p_limit for update),
 archived as (insert into contact_private.request_tombstones(request_id,fingerprint,original_created_at) select request_id,fingerprint,created_at from stale
 on conflict(request_id) do update set fingerprint=request_tombstones.fingerprint where request_tombstones.fingerprint=excluded.fingerprint returning request_id)
 delete from contact_private.requests where request_id in (select request_id from archived);
 get diagnostics request_count=row_count;
 return jsonb_build_object('rate_buckets_removed',bucket_count,'requests_compacted',request_count);
end; $$;
revoke all on function contact_private.touch_enquiry() from public,anon,authenticated,service_role;
revoke all on function public.submit_contact_enquiry(uuid,text,text,text,jsonb) from public,anon,authenticated;
revoke all on function public.claim_contact_notification() from public,anon,authenticated;
revoke all on function public.finish_contact_notification(uuid,uuid,text,text) from public,anon,authenticated;
revoke all on function public.resolve_contact_notification(uuid,text,text,text) from public,anon,authenticated;
revoke all on function public.cleanup_contact_metadata(timestamptz,timestamptz,integer) from public,anon,authenticated;
grant execute on function public.submit_contact_enquiry(uuid,text,text,text,jsonb) to service_role;
grant execute on function public.claim_contact_notification() to service_role;
grant execute on function public.finish_contact_notification(uuid,uuid,text,text) to service_role;
grant execute on function public.resolve_contact_notification(uuid,text,text,text) to service_role;
grant execute on function public.cleanup_contact_metadata(timestamptz,timestamptz,integer) to service_role;
commit;
