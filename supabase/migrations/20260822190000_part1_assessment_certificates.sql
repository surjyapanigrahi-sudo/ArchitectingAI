create extension if not exists pgcrypto with schema extensions;

create table if not exists public.assessment_attempts (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  part_id text not null check (part_id = 'part-1'),
  attempt_number integer not null check (attempt_number > 0),
  score_percent integer check (score_percent between 0 and 100),
  correct_count integer check (correct_count between 0 and 15),
  total_questions integer not null default 15 check (total_questions = 15),
  passed boolean,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  question_ids text[] not null,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, part_id, attempt_number)
);

create table if not exists public.assessment_answers (
  id uuid primary key default extensions.gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  question_id text not null,
  selected_option_id text not null,
  is_correct boolean not null,
  unique (attempt_id, question_id)
);

create table if not exists public.certificates (
  id uuid primary key default extensions.gen_random_uuid(),
  certificate_reference text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  part_id text not null check (part_id = 'part-1'),
  assessment_attempt_id uuid not null references public.assessment_attempts(id),
  score_percent integer not null check (score_percent between 70 and 100),
  issued_at timestamptz not null default now(),
  status text not null default 'valid' check (status in ('valid', 'revoked')),
  unique (user_id, part_id)
);

create index if not exists assessment_attempts_user_part_idx on public.assessment_attempts(user_id, part_id, created_at desc);
create index if not exists assessment_answers_attempt_idx on public.assessment_answers(attempt_id);
create index if not exists certificates_reference_idx on public.certificates(certificate_reference);

alter table public.assessment_attempts enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.certificates enable row level security;

drop policy if exists "Learners read own attempts" on public.assessment_attempts;
drop policy if exists "Learners read own answers" on public.assessment_answers;
drop policy if exists "Learners read own certificates" on public.certificates;
create policy "Learners read own attempts" on public.assessment_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy "Learners read own answers" on public.assessment_answers for select to authenticated using (exists (select 1 from public.assessment_attempts a where a.id = attempt_id and a.user_id = (select auth.uid())));
create policy "Learners read own certificates" on public.certificates for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.start_part1_assessment(p_question_ids text[])
returns table (attempt_id uuid, attempt_number integer)
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt_number integer;
  v_attempt_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if cardinality(p_question_ids) <> 15 or (select count(distinct value) from unnest(p_question_ids) value) <> 15 then raise exception 'A valid 15-question set is required'; end if;
  if (select count(*) from unnest(p_question_ids) q where q = any(array[
    'l1-outcome','l1-capability','l1-model-role','l1-production','l1-context','l1-functional','l1-quality','l1-readiness',
    'l2-auth','l2-authority','l2-cross-cutting','l2-flow','l2-change','l2-responsibility','l2-observability','l2-source','l2-contextual',
    'l3-policy-fact','l3-controls','l3-transaction','l3-scale','l3-method','l3-sensitive','l3-failure','l3-authorize-action'
  ]::text[])) <> 15 then raise exception 'Question set contains an unknown question'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text || ':part-1', 0));
  select coalesce(max(a.attempt_number), 0) + 1 into v_attempt_number from public.assessment_attempts a where a.user_id = v_user_id and a.part_id = 'part-1';
  insert into public.assessment_attempts(user_id, part_id, attempt_number, question_ids) values (v_user_id, 'part-1', v_attempt_number, p_question_ids) returning id into v_attempt_id;
  return query select v_attempt_id, v_attempt_number;
end;
$$;

create or replace function public.claim_part1_certificate()
returns table (certificate_reference text, score_percent integer, issued_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_attempt_id uuid;
  v_attempt_score integer;
  v_reference text;
  v_certificate public.certificates%rowtype;
  v_name text;
  v_constraint_name text;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text || ':part-1-certificate', 0));

  select c.* into v_certificate
  from public.certificates c
  where c.user_id = v_user_id and c.part_id = 'part-1';
  if found then
    return query select v_certificate.certificate_reference, v_certificate.score_percent, v_certificate.issued_at;
    return;
  end if;

  select nullif(pg_catalog.btrim(p.full_name), '') into v_name
  from public.profiles p
  where p.id = v_user_id;
  if v_name is null then return; end if;

  select a.id, a.score_percent into v_attempt_id, v_attempt_score
  from public.assessment_attempts a
  where a.user_id = v_user_id
    and a.part_id = 'part-1'
    and a.status = 'submitted'
    and a.passed is true
    and a.correct_count >= 11
    and a.score_percent >= 70
  order by a.submitted_at asc, a.id asc
  limit 1;
  if not found then return; end if;

  loop
    v_reference := 'AAI-P1-' || pg_catalog.date_part('year', pg_catalog.now())::integer || '-' || pg_catalog.upper(pg_catalog.encode(extensions.gen_random_bytes(6), 'hex'));
    begin
      insert into public.certificates(certificate_reference, user_id, part_id, assessment_attempt_id, score_percent)
      values (v_reference, v_user_id, 'part-1', v_attempt_id, v_attempt_score)
      returning * into v_certificate;
      exit;
    exception when unique_violation then
      get stacked diagnostics v_constraint_name = constraint_name;
      if v_constraint_name = 'certificates_certificate_reference_key' then
        continue;
      elsif v_constraint_name = 'certificates_user_id_part_id_key' then
        select c.* into v_certificate
        from public.certificates c
        where c.user_id = v_user_id and c.part_id = 'part-1';
        if found then exit; end if;
        raise;
      else
        raise;
      end if;
    end;
  end loop;

  return query select v_certificate.certificate_reference, v_certificate.score_percent, v_certificate.issued_at;
end;
$$;

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

create or replace function public.verify_certificate(p_reference text)
returns table (learner_name text, program text, part_title text, certificate_reference text, score_percent integer, issued_at timestamptz, status text)
language sql
security definer
stable
set search_path = pg_catalog, public
as $$
  select p.full_name, 'Architecting AI'::text, 'Enterprise AI Architecture Foundations'::text, c.certificate_reference, c.score_percent, c.issued_at, c.status
  from public.certificates c join public.profiles p on p.id = c.user_id
  where c.certificate_reference = upper(trim(p_reference)) and c.status = 'valid' and nullif(trim(p.full_name), '') is not null
  limit 1;
$$;

revoke all on function public.start_part1_assessment(text[]) from public, anon;
revoke all on function public.submit_part1_assessment(uuid, jsonb) from public, anon;
revoke all on function public.claim_part1_certificate() from public, anon;
grant execute on function public.start_part1_assessment(text[]) to authenticated;
grant execute on function public.submit_part1_assessment(uuid, jsonb) to authenticated;
grant execute on function public.claim_part1_certificate() to authenticated;
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;
