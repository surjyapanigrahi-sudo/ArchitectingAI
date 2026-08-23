-- Manual production patch: replace only the deployed submission RPC.
-- This preserves all tables, data, RLS policies, and existing function grants.

create or replace function public.submit_part1_assessment(p_attempt_id uuid, p_answers jsonb)
returns table (score_percent integer, correct_count integer, passed boolean, certificate_reference text, certificate_score integer, certificate_issued_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt public.assessment_attempts%rowtype;
  v_correct integer;
  v_score integer;
  v_passed boolean;
  v_certificate public.certificates%rowtype;
  v_answer_key jsonb := '{
    "l1-outcome":"outcome","l1-capability":"wider","l1-model-role":"component","l1-production":"revisit","l1-context":"different","l1-functional":"answer","l1-quality":"reliable","l1-readiness":"not-ready",
    "l2-auth":"authorization","l2-authority":"hr","l2-cross-cutting":"across","l2-flow":"controlled","l2-change":"balance","l2-responsibility":"allocated","l2-observability":"health","l2-source":"system","l2-contextual":"evaluate",
    "l3-policy-fact":"patterns","l3-controls":"application","l3-transaction":"transactions","l3-scale":"operating","l3-method":"sequence","l3-sensitive":"strengthen","l3-failure":"recover","l3-authorize-action":"permission"
  }'::jsonb;
  v_option_key jsonb := '{
    "l1-outcome":["outcome","model","diagram","controls"],"l1-capability":["wider","size","channels","automation"],"l1-model-role":["component","system","record","control"],"l1-production":["revisit","unchanged","model-only","features"],"l1-context":["different","same","largest","security"],"l1-functional":["answer","availability","latency","audit"],"l1-quality":["reliable","policy","balance","search"],"l1-readiness":["not-ready","ready","model-owner","delay"],
    "l2-auth":["authorization","authentication","observability","retrieval"],"l2-authority":["hr","model","policy","chat"],"l2-cross-cutting":["across","last","model","data"],"l2-flow":["controlled","memory","document","direct"],"l2-change":["balance","remove","maximize","copy"],"l2-responsibility":["allocated","model-all","ui-all","record-all"],"l2-observability":["health","identity","truth","scope"],"l2-source":["system","model","average","recent"],"l2-contextual":["evaluate","always","never","vendor"],
    "l3-policy-fact":["patterns","same","documents","manual"],"l3-controls":["application","prompt","response","training"],"l3-transaction":["transactions","wording","model","documents"],"l3-scale":["operating","identity","authority","scope"],"l3-method":["sequence","technology","model","controls"],"l3-sensitive":["strengthen","prompt","remove","same"],"l3-failure":["recover","repeat","assume","ignore"],"l3-authorize-action":["permission","fluency","popularity","document"]
  }'::jsonb;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  select * into v_attempt from public.assessment_attempts where id = p_attempt_id and user_id = v_user_id for update;
  if not found then raise exception 'Assessment attempt not found'; end if;
  if v_attempt.status <> 'in_progress' then raise exception 'Assessment attempt already submitted'; end if;
  if p_answers is null or pg_catalog.jsonb_typeof(p_answers) <> 'object' or (
    select pg_catalog.count(*)
    from pg_catalog.jsonb_object_keys(p_answers)
  ) <> 15 then raise exception 'All 15 answers are required'; end if;
  if exists (select 1 from pg_catalog.jsonb_object_keys(p_answers) key where not (key = any(v_attempt.question_ids))) or exists (select 1 from pg_catalog.unnest(v_attempt.question_ids) q where not p_answers ? q) then raise exception 'Answers do not match this attempt'; end if;
  if exists (
    select 1
    from pg_catalog.jsonb_each_text(p_answers) submitted(question_id, selected_option_id)
    where not coalesce((v_option_key -> submitted.question_id) ? submitted.selected_option_id, false)
  ) then raise exception 'An answer contains an invalid option'; end if;

  select pg_catalog.count(*) filter (where submitted.selected_option_id = v_answer_key ->> submitted.question_id)
  into v_correct
  from pg_catalog.jsonb_each_text(p_answers) submitted(question_id, selected_option_id);
  v_score := round((v_correct::numeric / 15) * 100);
  v_passed := v_correct >= 11;

  insert into public.assessment_answers(attempt_id, question_id, selected_option_id, is_correct)
  select p_attempt_id, submitted.question_id, submitted.selected_option_id, submitted.selected_option_id = v_answer_key ->> submitted.question_id
  from pg_catalog.jsonb_each_text(p_answers) submitted(question_id, selected_option_id);

  update public.assessment_attempts set score_percent = v_score, correct_count = v_correct, passed = v_passed, status = 'submitted', submitted_at = pg_catalog.now() where id = p_attempt_id;

  if v_passed then
    select claimed.certificate_reference, claimed.score_percent, claimed.issued_at
    into v_certificate.certificate_reference, v_certificate.score_percent, v_certificate.issued_at
    from public.claim_part1_certificate() claimed;
  end if;

  if v_certificate.certificate_reference is null then
    select c.* into v_certificate from public.certificates c where c.user_id = v_user_id and c.part_id = 'part-1';
  end if;
  return query select v_score, v_correct, v_passed, v_certificate.certificate_reference, v_certificate.score_percent, v_certificate.issued_at;
end;
$$;
