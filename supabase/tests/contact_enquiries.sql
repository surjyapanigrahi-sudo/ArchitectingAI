-- Run ONLY against an isolated Supabase-compatible test database after the contact migration.
-- Run as database owner; every test mutation is rolled back. Never run on production.
\set ON_ERROR_STOP on
begin;
do $$
declare body jsonb:='{"full_name":"Local Test","email":"local-test@example.test","phone":null,"enquiry_type":"General Enquiry","message":"A local database verification enquiry.","consent_version":"contact-2026-10-review-1"}'; v_request_id uuid:=gen_random_uuid(); answer text; job jsonb; v_enquiry_id uuid;
begin
 assert (select relrowsecurity and relforcerowsecurity from pg_class where oid='public.contact_enquiries'::regclass), 'RLS missing';
 assert not has_table_privilege('anon','public.contact_enquiries','SELECT,INSERT,UPDATE,DELETE'), 'Anonymous privileges';
 assert not has_table_privilege('authenticated','public.contact_enquiries','SELECT,INSERT,UPDATE,DELETE'), 'Learner privileges';
 assert not has_function_privilege('anon','public.submit_contact_enquiry(uuid,text,text,text,jsonb)','EXECUTE'), 'Anonymous RPC';
 assert not has_function_privilege('authenticated','public.claim_contact_notification()','EXECUTE'), 'Learner outbox';
 assert (select count(*)=0 from pg_policies where schemaname='public' and tablename='contact_enquiries'), 'Unexpected policy';
 answer:=public.submit_contact_enquiry(v_request_id,repeat('a',64),repeat('b',64),repeat('c',64),body); assert answer='saved';
 answer:=public.submit_contact_enquiry(v_request_id,repeat('a',64),repeat('b',64),repeat('c',64),body); assert answer='duplicate';
 answer:=public.submit_contact_enquiry(v_request_id,repeat('d',64),repeat('b',64),repeat('c',64),body); assert answer='conflict';
 select r.enquiry_id into v_enquiry_id from contact_private.requests r where r.request_id=v_request_id;
 assert (select count(*)=1 from contact_private.notification_outbox o where o.enquiry_id=v_enquiry_id);
 assert (select status='new' and internal_notes is null from public.contact_enquiries e where e.id=v_enquiry_id);
 perform public.submit_contact_enquiry(gen_random_uuid(),repeat('a',64),repeat('b',64),repeat('c',64),body);
 perform public.submit_contact_enquiry(gen_random_uuid(),repeat('a',64),repeat('b',64),repeat('c',64),body);
 answer:=public.submit_contact_enquiry(gen_random_uuid(),repeat('a',64),repeat('b',64),repeat('c',64),body); assert answer='rate_limited';
 job:=public.claim_contact_notification(); assert job is not null;
 assert job ? 'created_at' and (job->>'created_at') is not null, 'Submission timestamp missing from notification claim';
 assert public.finish_contact_notification((job->>'job_id')::uuid,(job->>'lease_token')::uuid,null,'provider_unavailable');
 assert (select count(*)=1 from public.contact_enquiries e where e.id=v_enquiry_id), 'Email failure discarded enquiry';
 assert (select state='uncertain' from contact_private.notification_outbox where id=(job->>'job_id')::uuid), 'Unknown provider outcome must not auto-retry';
 assert not public.finish_contact_notification((job->>'job_id')::uuid,gen_random_uuid(),'wrong',null), 'Lease not enforced';
end; $$;
set local role anon;
do $$ begin
 begin perform id from public.contact_enquiries; raise exception 'Anonymous read unexpectedly allowed'; exception when insufficient_privilege then null; end;
 begin perform public.claim_contact_notification(); raise exception 'Anonymous outbox unexpectedly allowed'; exception when insufficient_privilege then null; end;
end; $$;
reset role;
set local role authenticated;
do $$ begin
 begin perform id from public.contact_enquiries; raise exception 'Student read unexpectedly allowed'; exception when insufficient_privilege then null; end;
 begin delete from public.contact_enquiries; raise exception 'Student delete unexpectedly allowed'; exception when insufficient_privilege then null; end;
 begin perform public.claim_contact_notification(); raise exception 'Student outbox unexpectedly allowed'; exception when insufficient_privilege then null; end;
end; $$;
reset role;
rollback;
