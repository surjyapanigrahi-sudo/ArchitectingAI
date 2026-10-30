-- Architecting AI: password-free SQL Editor export of essential public data
-- READ ONLY. Run before the contact migration and download the final result as CSV.
-- The output contains personal data. Save it only in an approved encrypted folder
-- outside Git; do not paste it into tickets, chat, logs or source files.
--
-- This is a logical row export, not a PostgreSQL/Supabase backup. It deliberately
-- excludes auth, storage, extensions, role definitions and provider configuration.

begin transaction read only;
set local statement_timeout = '5min';
set local lock_timeout = '1s';

-- Fail clearly if the production catalog differs from the confirmed six tables.
do $guard$
begin
  if exists (
    select 1
    from (values
      ('profiles'), ('assessment_attempts'), ('assessment_answers'),
      ('certificates'), ('experience_progress'), ('learner_course_progress')
    ) expected(table_name)
    where pg_catalog.to_regclass('public.' || expected.table_name) is null
  ) then
    raise exception 'One or more expected public application tables are missing';
  end if;
end
$guard$;

-- One downloadable result set. Each table has one manifest row even when empty,
-- followed by its lossless JSON rows. table_row_number is stable for this capture.
with expected_tables(table_name) as (
  values
    ('public.profiles'),
    ('public.assessment_attempts'),
    ('public.assessment_answers'),
    ('public.certificates'),
    ('public.experience_progress'),
    ('public.learner_course_progress')
), application_rows as (
  select 'public.profiles'::text as table_name, pg_catalog.to_jsonb(t) as row_json
  from public.profiles t
  union all
  select 'public.assessment_attempts', pg_catalog.to_jsonb(t)
  from public.assessment_attempts t
  union all
  select 'public.assessment_answers', pg_catalog.to_jsonb(t)
  from public.assessment_answers t
  union all
  select 'public.certificates', pg_catalog.to_jsonb(t)
  from public.certificates t
  union all
  select 'public.experience_progress', pg_catalog.to_jsonb(t)
  from public.experience_progress t
  union all
  select 'public.learner_course_progress', pg_catalog.to_jsonb(t)
  from public.learner_course_progress t
), numbered as (
  select
    table_name,
    row_number() over (partition by table_name order by row_json::text) as table_row_number,
    row_json
  from application_rows
), counts as (
  select e.table_name, count(n.row_json)::bigint as table_row_count
  from expected_tables e
  left join numbered n on n.table_name = e.table_name
  group by e.table_name
), export_result as (
  select
    c.table_name,
    'manifest'::text as record_type,
    0::bigint as table_row_number,
    c.table_row_count,
    null::jsonb as row_json
  from counts c
  union all
  select
    n.table_name,
    'data',
    n.table_row_number,
    c.table_row_count,
    n.row_json
  from numbered n
  join counts c using (table_name)
)
select table_name, record_type, table_row_number, table_row_count, row_json
from export_result
order by table_name, table_row_number;

commit;
