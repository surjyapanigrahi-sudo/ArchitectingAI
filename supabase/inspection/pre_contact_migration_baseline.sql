-- Architecting AI: production baseline before contact migration
-- READ ONLY. Run against the ArchitectingAI main database and save every result set.
-- Expected before migration: 6 public tables, 5 public functions, no contact objects.

begin transaction read only;
set local statement_timeout = '30s';
set local lock_timeout = '1s';

-- 1. Environment and expected migration owner.
select
  current_database() as database_name,
  current_user as execution_role,
  session_user,
  current_user = 'postgres' as execution_role_is_expected,
  r.rolsuper,
  r.rolbypassrls,
  has_schema_privilege(current_user, 'public', 'CREATE') as can_create_in_public,
  current_setting('server_version') as server_version,
  clock_timestamp() as captured_at
from pg_catalog.pg_roles r
where r.rolname = current_user;

-- 2. Expected pre-migration object counts.
select
  count(*) filter (where c.relkind in ('r', 'p')) as public_table_count,
  count(*) filter (where c.relkind = 'v') as public_view_count,
  count(*) filter (where c.relkind = 'm') as public_materialized_view_count
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public';

select count(*) as public_function_count
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prokind = 'f';

-- 3. gen_random_uuid() must resolve from the migration execution search path.
select
  p.oid::regprocedure::text as resolved_signature,
  n.nspname as function_schema,
  pg_catalog.pg_get_userbyid(p.proowner) as owner,
  p.prosecdef as security_definer,
  pg_catalog.pg_function_is_visible(p.oid) as visible_without_qualification
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where p.oid = pg_catalog.to_regprocedure('gen_random_uuid()');

-- 4. Every query below must return zero rows before migration.
select 'schema' as object_type, n.nspname as schema_name, n.nspname as object_name
from pg_catalog.pg_namespace n
where n.nspname = 'contact_private'
union all
select 'relation', n.nspname, c.relname
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where (n.nspname, c.relname) in (
  ('public', 'contact_enquiries'),
  ('contact_private', 'requests'),
  ('contact_private', 'rate_buckets'),
  ('contact_private', 'notification_outbox'),
  ('contact_private', 'request_tombstones'),
  ('contact_private', 'notification_resolutions'),
  ('public', 'contact_enquiries_created_at_idx'),
  ('public', 'contact_enquiries_status_idx'),
  ('public', 'contact_enquiries_email_idx'),
  ('contact_private', 'contact_requests_created_idx'),
  ('contact_private', 'contact_rate_window_idx'),
  ('contact_private', 'contact_outbox_pending_idx')
)
union all
select 'function', n.nspname, p.proname || '(' || pg_catalog.pg_get_function_identity_arguments(p.oid) || ')'
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where (n.nspname, p.proname) in (
  ('contact_private', 'touch_enquiry'),
  ('public', 'submit_contact_enquiry'),
  ('public', 'claim_contact_notification'),
  ('public', 'finish_contact_notification'),
  ('public', 'resolve_contact_notification'),
  ('public', 'cleanup_contact_metadata')
)
union all
select 'trigger', n.nspname, t.tgname
from pg_catalog.pg_trigger t
join pg_catalog.pg_class c on c.oid = t.tgrelid
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where not t.tgisinternal and t.tgname = 'contact_enquiries_updated'
order by 1, 2, 3;

-- 5. Public table baseline. Row figures are planner/statistics estimates, not row scans.
select
  n.nspname as table_schema,
  c.relname as table_name,
  c.relkind,
  pg_catalog.pg_get_userbyid(c.relowner) as owner,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls,
  c.relpersistence,
  c.reltuples::bigint as planner_row_estimate,
  s.n_live_tup::bigint as statistics_live_row_estimate,
  s.n_dead_tup::bigint as statistics_dead_row_estimate,
  s.last_analyze,
  s.last_autoanalyze,
  pg_catalog.pg_total_relation_size(c.oid) as total_bytes
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
left join pg_catalog.pg_stat_all_tables s on s.relid = c.oid
where n.nspname = 'public' and c.relkind in ('r', 'p')
order by c.relname;

-- 5a. Exact row counts for the six confirmed legacy application tables.
-- These scans are read only. Save this result for an exact post-migration comparison.
select 'public.profiles' as table_name, count(*)::bigint as exact_row_count from public.profiles
union all select 'public.assessment_attempts', count(*)::bigint from public.assessment_attempts
union all select 'public.assessment_answers', count(*)::bigint from public.assessment_answers
union all select 'public.certificates', count(*)::bigint from public.certificates
union all select 'public.experience_progress', count(*)::bigint from public.experience_progress
union all select 'public.learner_course_progress', count(*)::bigint from public.learner_course_progress
order by table_name;

-- 6. Column definitions for the six public tables.
select
  cols.table_schema,
  cols.table_name,
  cols.ordinal_position,
  cols.column_name,
  cols.data_type,
  cols.udt_schema,
  cols.udt_name,
  cols.is_nullable,
  cols.column_default,
  cols.is_identity,
  cols.identity_generation,
  cols.is_generated,
  cols.generation_expression
from information_schema.columns cols
where cols.table_schema = 'public'
  and exists (
    select 1
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = cols.table_schema
      and c.relname = cols.table_name
      and c.relkind in ('r', 'p')
  )
order by cols.table_name, cols.ordinal_position;

-- 7. Constraints, indexes and non-internal triggers on existing public tables.
select
  n.nspname as table_schema,
  c.relname as table_name,
  con.conname as constraint_name,
  con.contype,
  pg_catalog.pg_get_constraintdef(con.oid, true) as definition
from pg_catalog.pg_constraint con
join pg_catalog.pg_class c on c.oid = con.conrelid
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p')
order by c.relname, con.conname;

select
  schemaname as table_schema,
  tablename as table_name,
  indexname,
  indexdef
from pg_catalog.pg_indexes
where schemaname = 'public'
order by tablename, indexname;

select
  n.nspname as table_schema,
  c.relname as table_name,
  t.tgname as trigger_name,
  pg_catalog.pg_get_triggerdef(t.oid, true) as definition
from pg_catalog.pg_trigger t
join pg_catalog.pg_class c on c.oid = t.tgrelid
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and not t.tgisinternal
order by c.relname, t.tgname;

-- 8. RLS policies. Preserve this output for post-migration comparison.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_catalog.pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 9. Effective relation ACL entries, including implicit owner defaults.
select
  n.nspname as table_schema,
  c.relname as table_name,
  pg_catalog.pg_get_userbyid(c.relowner) as owner,
  case when acl.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(acl.grantee) end as grantee,
  pg_catalog.pg_get_userbyid(acl.grantor) as grantor,
  acl.privilege_type,
  acl.is_grantable
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
cross join lateral pg_catalog.aclexplode(
  coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
) acl
where n.nspname = 'public' and c.relkind in ('r', 'p')
order by c.relname, grantee, acl.privilege_type;

-- 10. Existing public function definitions and security properties.
select
  p.oid::regprocedure::text as function_signature,
  pg_catalog.pg_get_userbyid(p.proowner) as owner,
  l.lanname as language,
  p.prosecdef as security_definer,
  p.proleakproof,
  p.proisstrict,
  p.provolatile,
  p.proparallel,
  p.proconfig,
  pg_catalog.pg_get_function_result(p.oid) as result_type,
  pg_catalog.pg_get_functiondef(p.oid) as definition
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
join pg_catalog.pg_language l on l.oid = p.prolang
where n.nspname = 'public' and p.prokind = 'f'
order by p.oid::regprocedure::text;

-- 10a. Dependencies owned or referenced by the six legacy tables and five
-- legacy public functions. pg_describe_object keeps extension, type, sequence,
-- trigger-function and cross-schema dependencies visible without executing DDL.
with legacy_objects as (
  select c.oid as object_oid, 'pg_catalog.pg_class'::regclass as class_oid
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and c.relname in (
      'profiles', 'assessment_attempts', 'assessment_answers', 'certificates',
      'experience_progress', 'learner_course_progress'
    )
  union all
  select p.oid, 'pg_catalog.pg_proc'::regclass
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
), dependency_edges as (
  select distinct
    pg_catalog.pg_describe_object(d.classid, d.objid, d.objsubid) as dependent_object,
    pg_catalog.pg_describe_object(d.refclassid, d.refobjid, d.refobjsubid) as referenced_object,
    d.deptype
  from pg_catalog.pg_depend d
  join legacy_objects o on o.class_oid = d.classid and o.object_oid = d.objid
  union
  select distinct
    pg_catalog.pg_describe_object(d.classid, d.objid, d.objsubid),
    pg_catalog.pg_describe_object(d.refclassid, d.refobjid, d.refobjsubid),
    d.deptype
  from pg_catalog.pg_depend d
  join legacy_objects o on o.class_oid = d.refclassid and o.object_oid = d.refobjid
)
select dependent_object, referenced_object, deptype
from dependency_edges
order by dependent_object, referenced_object, deptype;

-- 10b. Column-level grants, if any. An empty result is valid.
select
  grantor,
  grantee,
  table_schema,
  table_name,
  column_name,
  privilege_type,
  is_grantable
from information_schema.column_privileges
where table_schema = 'public'
  and table_name in (
    'profiles', 'assessment_attempts', 'assessment_answers', 'certificates',
    'experience_progress', 'learner_course_progress'
  )
order by table_name, column_name, grantee, privilege_type;

-- 11. Effective function ACL entries, including implicit PUBLIC EXECUTE defaults.
select
  p.oid::regprocedure::text as function_signature,
  pg_catalog.pg_get_userbyid(p.proowner) as owner,
  case when acl.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(acl.grantee) end as grantee,
  pg_catalog.pg_get_userbyid(acl.grantor) as grantor,
  acl.privilege_type,
  acl.is_grantable
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
cross join lateral pg_catalog.aclexplode(
  coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
) acl
where n.nspname = 'public' and p.prokind = 'f'
order by p.oid::regprocedure::text, grantee, acl.privilege_type;

-- 12. Schema ACLs for public and any pre-existing contact_private schema.
select
  n.nspname as schema_name,
  pg_catalog.pg_get_userbyid(n.nspowner) as owner,
  case when acl.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(acl.grantee) end as grantee,
  pg_catalog.pg_get_userbyid(acl.grantor) as grantor,
  acl.privilege_type,
  acl.is_grantable
from pg_catalog.pg_namespace n
cross join lateral pg_catalog.aclexplode(
  coalesce(n.nspacl, pg_catalog.acldefault('n', n.nspowner))
) acl
where n.nspname in ('public', 'contact_private')
order by n.nspname, grantee, acl.privilege_type;

-- 13. Every configured default ACL and every grantee, including custom roles.
select
  pg_catalog.pg_get_userbyid(d.defaclrole) as default_owner,
  coalesce(n.nspname, '<all schemas>') as schema_name,
  case d.defaclobjtype
    when 'r' then 'TABLES'
    when 'S' then 'SEQUENCES'
    when 'f' then 'FUNCTIONS'
    when 'T' then 'TYPES'
    when 'n' then 'SCHEMAS'
    else d.defaclobjtype::text
  end as object_type,
  case when acl.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(acl.grantee) end as grantee,
  pg_catalog.pg_get_userbyid(acl.grantor) as grantor,
  acl.privilege_type,
  acl.is_grantable
from pg_catalog.pg_default_acl d
left join pg_catalog.pg_namespace n on n.oid = d.defaclnamespace
cross join lateral pg_catalog.aclexplode(d.defaclacl) acl
order by default_owner, schema_name, object_type, grantee, acl.privilege_type;

commit;
