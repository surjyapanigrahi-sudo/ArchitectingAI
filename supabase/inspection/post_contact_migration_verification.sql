-- Architecting AI: verification after the approved contact migration
-- READ ONLY. Run before enabling any application, contact or notification gate.
-- Compare the repeated legacy-object sections with the saved pre-migration output.

begin transaction read only;
set local statement_timeout = '30s';
set local lock_timeout = '1s';

-- 1. Environment identity.
select
  current_database() as database_name,
  current_user as execution_role,
  session_user,
  current_user = 'postgres' as execution_role_is_expected,
  r.rolsuper,
  r.rolbypassrls,
  clock_timestamp() as captured_at
from pg_catalog.pg_roles r
where r.rolname = current_user;

-- 2. The six expected contact tables. Every row must exist, be postgres-owned,
-- and have both RLS and FORCE RLS enabled.
with expected(schema_name, table_name) as (
  values
    ('public', 'contact_enquiries'),
    ('contact_private', 'requests'),
    ('contact_private', 'rate_buckets'),
    ('contact_private', 'notification_outbox'),
    ('contact_private', 'request_tombstones'),
    ('contact_private', 'notification_resolutions')
)
select
  e.schema_name,
  e.table_name,
  c.oid is not null as exists,
  pg_catalog.pg_get_userbyid(c.relowner) as owner,
  c.relkind,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls,
  c.reltuples::bigint as planner_row_estimate,
  s.n_live_tup::bigint as statistics_live_row_estimate,
  pg_catalog.pg_total_relation_size(c.oid) as total_bytes
from expected e
left join pg_catalog.pg_namespace n on n.nspname = e.schema_name
left join pg_catalog.pg_class c
  on c.relnamespace = n.oid and c.relname = e.table_name and c.relkind in ('r', 'p')
left join pg_catalog.pg_stat_all_tables s on s.relid = c.oid
order by e.schema_name, e.table_name;

-- 3. Contact columns, constraints, indexes and trigger definitions.
select
  cols.table_schema,
  cols.table_name,
  cols.ordinal_position,
  cols.column_name,
  cols.data_type,
  cols.udt_schema,
  cols.udt_name,
  cols.is_nullable,
  cols.column_default
from information_schema.columns cols
where (cols.table_schema, cols.table_name) in (
  ('public', 'contact_enquiries'),
  ('contact_private', 'requests'),
  ('contact_private', 'rate_buckets'),
  ('contact_private', 'notification_outbox'),
  ('contact_private', 'request_tombstones'),
  ('contact_private', 'notification_resolutions')
)
order by cols.table_schema, cols.table_name, cols.ordinal_position;

select
  n.nspname as table_schema,
  c.relname as table_name,
  con.conname as constraint_name,
  con.contype,
  pg_catalog.pg_get_constraintdef(con.oid, true) as definition
from pg_catalog.pg_constraint con
join pg_catalog.pg_class c on c.oid = con.conrelid
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where (n.nspname = 'public' and c.relname = 'contact_enquiries')
   or n.nspname = 'contact_private'
order by n.nspname, c.relname, con.conname;

select schemaname, tablename, indexname, indexdef
from pg_catalog.pg_indexes
where (schemaname = 'public' and tablename = 'contact_enquiries')
   or schemaname = 'contact_private'
order by schemaname, tablename, indexname;

select
  n.nspname as table_schema,
  c.relname as table_name,
  t.tgname as trigger_name,
  pg_catalog.pg_get_triggerdef(t.oid, true) as definition
from pg_catalog.pg_trigger t
join pg_catalog.pg_class c on c.oid = t.tgrelid
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where not t.tgisinternal
  and n.nspname = 'public'
  and c.relname = 'contact_enquiries'
order by t.tgname;

-- 4. No contact table should have a policy; access is through definer RPCs only.
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_catalog.pg_policies
where (schemaname = 'public' and tablename = 'contact_enquiries')
   or schemaname = 'contact_private'
order by schemaname, tablename, policyname;

-- 5. Effective contact table ACLs. Only the owner should appear.
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
where c.relkind in ('r', 'p')
  and ((n.nspname = 'public' and c.relname = 'contact_enquiries') or n.nspname = 'contact_private')
order by n.nspname, c.relname, grantee, acl.privilege_type;

-- 6. Direct table privilege matrix. Every privilege below must be false.
with expected_tables(schema_name, table_name) as (
  values
    ('public', 'contact_enquiries'),
    ('contact_private', 'requests'),
    ('contact_private', 'rate_buckets'),
    ('contact_private', 'notification_outbox'),
    ('contact_private', 'request_tombstones'),
    ('contact_private', 'notification_resolutions')
), roles(role_name) as (values ('anon'), ('authenticated'), ('service_role'))
select
  roles.role_name,
  e.schema_name,
  e.table_name,
  pg_catalog.has_table_privilege(roles.role_name, format('%I.%I', e.schema_name, e.table_name), 'SELECT') as can_select,
  pg_catalog.has_table_privilege(roles.role_name, format('%I.%I', e.schema_name, e.table_name), 'INSERT') as can_insert,
  pg_catalog.has_table_privilege(roles.role_name, format('%I.%I', e.schema_name, e.table_name), 'UPDATE') as can_update,
  pg_catalog.has_table_privilege(roles.role_name, format('%I.%I', e.schema_name, e.table_name), 'DELETE') as can_delete,
  pg_catalog.has_table_privilege(roles.role_name, format('%I.%I', e.schema_name, e.table_name), 'TRUNCATE') as can_truncate,
  pg_catalog.has_table_privilege(roles.role_name, format('%I.%I', e.schema_name, e.table_name), 'REFERENCES') as can_reference,
  pg_catalog.has_table_privilege(roles.role_name, format('%I.%I', e.schema_name, e.table_name), 'TRIGGER') as can_trigger
from expected_tables e
cross join roles
order by roles.role_name, e.schema_name, e.table_name;

-- 7. The five public SECURITY DEFINER RPCs and their fixed settings.
with expected(function_signature) as (
  values
    ('public.submit_contact_enquiry(uuid,text,text,text,jsonb)'),
    ('public.claim_contact_notification()'),
    ('public.finish_contact_notification(uuid,uuid,text,text)'),
    ('public.resolve_contact_notification(uuid,text,text,text)'),
    ('public.cleanup_contact_metadata(timestamptz,timestamptz,integer)')
)
select
  e.function_signature,
  p.oid is not null as exists,
  pg_catalog.pg_get_userbyid(p.proowner) as owner,
  p.prosecdef as security_definer,
  p.proconfig,
  ('search_path=pg_catalog' = any(p.proconfig)) as fixed_pg_catalog_search_path,
  case
    when p.oid is null then null
    when p.proname in ('submit_contact_enquiry', 'cleanup_contact_metadata')
      then 'lock_timeout=3s' = any(p.proconfig)
    else true
  end as required_lock_timeout_present,
  pg_catalog.pg_get_functiondef(p.oid) as definition
from expected e
left join pg_catalog.pg_proc p on p.oid = pg_catalog.to_regprocedure(e.function_signature)
order by e.function_signature;

-- 8. RPC execution matrix: anon/authenticated must be false; service_role true.
with expected(function_signature) as (
  values
    ('public.submit_contact_enquiry(uuid,text,text,text,jsonb)'),
    ('public.claim_contact_notification()'),
    ('public.finish_contact_notification(uuid,uuid,text,text)'),
    ('public.resolve_contact_notification(uuid,text,text,text)'),
    ('public.cleanup_contact_metadata(timestamptz,timestamptz,integer)')
), roles(role_name) as (values ('anon'), ('authenticated'), ('service_role'))
select
  roles.role_name,
  e.function_signature,
  case when p.oid is null then null
    else pg_catalog.has_function_privilege(roles.role_name, p.oid, 'EXECUTE')
  end as can_execute
from expected e
cross join roles
left join pg_catalog.pg_proc p on p.oid = pg_catalog.to_regprocedure(e.function_signature)
order by roles.role_name, e.function_signature;

-- 9. Exact RPC ACL entries. Expected non-owner grantee: service_role only.
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
where n.nspname = 'public'
  and p.proname in (
    'submit_contact_enquiry',
    'claim_contact_notification',
    'finish_contact_notification',
    'resolve_contact_notification',
    'cleanup_contact_metadata'
  )
order by p.oid::regprocedure::text, grantee;

-- 10. Private trigger function and schema privilege boundary.
select
  p.oid::regprocedure::text as function_signature,
  pg_catalog.pg_get_userbyid(p.proowner) as owner,
  p.prosecdef as security_definer,
  p.proconfig,
  pg_catalog.pg_get_functiondef(p.oid) as definition
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'contact_private' and p.proname = 'touch_enquiry';

select
  role_name,
  pg_catalog.has_schema_privilege(role_name, 'contact_private', 'USAGE') as has_usage,
  pg_catalog.has_schema_privilege(role_name, 'contact_private', 'CREATE') as has_create
from (values ('anon'), ('authenticated'), ('service_role')) roles(role_name)
order by role_name;

-- 11. Summary checks. Every check must be true.
with contact_tables as (
  select c.*
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r', 'p')
    and ((n.nspname = 'public' and c.relname = 'contact_enquiries') or n.nspname = 'contact_private')
), contact_rpcs as (
  select p.*
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in (
      'submit_contact_enquiry', 'claim_contact_notification', 'finish_contact_notification',
      'resolve_contact_notification', 'cleanup_contact_metadata'
    )
)
select
  (select count(*) = 6 from contact_tables) as exactly_six_contact_tables,
  (select bool_and(pg_catalog.pg_get_userbyid(relowner) = 'postgres') from contact_tables) as all_contact_tables_postgres_owned,
  (select bool_and(relrowsecurity and relforcerowsecurity) from contact_tables) as all_contact_tables_force_rls,
  not exists (
    select 1 from pg_catalog.pg_policies
    where (schemaname = 'public' and tablename = 'contact_enquiries') or schemaname = 'contact_private'
  ) as no_contact_policies,
  not exists (
    select 1
    from contact_tables t
    cross join (values ('anon'), ('authenticated'), ('service_role')) roles(role_name)
    where pg_catalog.has_table_privilege(roles.role_name, t.oid, 'SELECT')
       or pg_catalog.has_table_privilege(roles.role_name, t.oid, 'INSERT')
       or pg_catalog.has_table_privilege(roles.role_name, t.oid, 'UPDATE')
       or pg_catalog.has_table_privilege(roles.role_name, t.oid, 'DELETE')
       or pg_catalog.has_table_privilege(roles.role_name, t.oid, 'TRUNCATE')
       or pg_catalog.has_table_privilege(roles.role_name, t.oid, 'REFERENCES')
       or pg_catalog.has_table_privilege(roles.role_name, t.oid, 'TRIGGER')
  ) as no_direct_api_role_table_privileges,
  (select count(*) = 5 from contact_rpcs) as exactly_five_public_contact_rpcs,
  (select bool_and(
    pg_catalog.pg_get_userbyid(proowner) = 'postgres'
    and prosecdef
    and 'search_path=pg_catalog' = any(proconfig)
  ) from contact_rpcs) as all_rpcs_have_expected_owner_and_security,
  not exists (
    select 1
    from contact_rpcs p
    cross join (values ('anon'), ('authenticated')) roles(role_name)
    where pg_catalog.has_function_privilege(roles.role_name, p.oid, 'EXECUTE')
  ) as no_anon_or_authenticated_rpc_execute,
  (select bool_and(pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE'))
   from contact_rpcs p) as service_role_can_execute_all_five_rpcs,
  not pg_catalog.has_schema_privilege('anon', 'contact_private', 'USAGE')
    and not pg_catalog.has_schema_privilege('authenticated', 'contact_private', 'USAGE')
    and not pg_catalog.has_schema_privilege('service_role', 'contact_private', 'USAGE')
    as private_schema_has_no_api_role_usage,
  exists (
    select 1
    from pg_catalog.pg_trigger t
    join pg_catalog.pg_class c on c.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'contact_enquiries'
      and t.tgname = 'contact_enquiries_updated'
      and not t.tgisinternal
  ) as expected_update_trigger_exists;

-- 12. Repeat the legacy public-table baseline, excluding the new contact table.
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
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
  and c.relname <> 'contact_enquiries'
order by c.relname;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_catalog.pg_policies
where schemaname = 'public' and tablename <> 'contact_enquiries'
order by tablename, policyname;

select
  n.nspname as table_schema,
  c.relname as table_name,
  case when acl.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(acl.grantee) end as grantee,
  pg_catalog.pg_get_userbyid(acl.grantor) as grantor,
  acl.privilege_type,
  acl.is_grantable
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
cross join lateral pg_catalog.aclexplode(
  coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
) acl
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
  and c.relname <> 'contact_enquiries'
order by c.relname, grantee, acl.privilege_type;

-- 13. Repeat the legacy public-function baseline, excluding the five new RPCs.
select
  p.oid::regprocedure::text as function_signature,
  pg_catalog.pg_get_userbyid(p.proowner) as owner,
  p.prosecdef as security_definer,
  p.proconfig,
  pg_catalog.pg_get_functiondef(p.oid) as definition
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prokind = 'f'
  and p.proname not in (
    'submit_contact_enquiry', 'claim_contact_notification', 'finish_contact_notification',
    'resolve_contact_notification', 'cleanup_contact_metadata'
  )
order by p.oid::regprocedure::text;

-- 14. Default ACLs should match the saved pre-migration baseline.
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

-- 15. Exact legacy row counts. Compare all six values with the pre-migration
-- baseline and the application-data export manifest. The migration adds no rows
-- to any of these tables, so every value must be unchanged.
select 'public.profiles' as table_name, count(*)::bigint as exact_row_count from public.profiles
union all select 'public.assessment_attempts', count(*)::bigint from public.assessment_attempts
union all select 'public.assessment_answers', count(*)::bigint from public.assessment_answers
union all select 'public.certificates', count(*)::bigint from public.certificates
union all select 'public.experience_progress', count(*)::bigint from public.experience_progress
union all select 'public.learner_course_progress', count(*)::bigint from public.learner_course_progress
order by table_name;

-- 16. Full legacy structure for direct comparison with the pre-migration capture.
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
  and cols.table_name in (
    'profiles', 'assessment_attempts', 'assessment_answers', 'certificates',
    'experience_progress', 'learner_course_progress'
  )
order by cols.table_name, cols.ordinal_position;

select
  n.nspname as table_schema,
  c.relname as table_name,
  con.conname as constraint_name,
  con.contype,
  pg_catalog.pg_get_constraintdef(con.oid, true) as definition
from pg_catalog.pg_constraint con
join pg_catalog.pg_class c on c.oid = con.conrelid
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles', 'assessment_attempts', 'assessment_answers', 'certificates',
    'experience_progress', 'learner_course_progress'
  )
order by c.relname, con.conname;

select schemaname, tablename, indexname, indexdef
from pg_catalog.pg_indexes
where schemaname = 'public'
  and tablename in (
    'profiles', 'assessment_attempts', 'assessment_answers', 'certificates',
    'experience_progress', 'learner_course_progress'
  )
order by tablename, indexname;

select
  n.nspname as table_schema,
  c.relname as table_name,
  t.tgname as trigger_name,
  pg_catalog.pg_get_triggerdef(t.oid, true) as definition
from pg_catalog.pg_trigger t
join pg_catalog.pg_class c on c.oid = t.tgrelid
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and not t.tgisinternal
  and c.relname in (
    'profiles', 'assessment_attempts', 'assessment_answers', 'certificates',
    'experience_progress', 'learner_course_progress'
  )
order by c.relname, t.tgname;

-- 17. Legacy function and column ACLs for direct comparison.
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
where n.nspname = 'public'
  and p.prokind = 'f'
  and p.proname not in (
    'submit_contact_enquiry', 'claim_contact_notification', 'finish_contact_notification',
    'resolve_contact_notification', 'cleanup_contact_metadata'
  )
order by p.oid::regprocedure::text, grantee, acl.privilege_type;

select grantor, grantee, table_schema, table_name, column_name, privilege_type, is_grantable
from information_schema.column_privileges
where table_schema = 'public'
  and table_name in (
    'profiles', 'assessment_attempts', 'assessment_answers', 'certificates',
    'experience_progress', 'learner_course_progress'
  )
order by table_name, column_name, grantee, privilege_type;

-- 18. Legacy dependency graph for direct comparison.
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
    and p.proname not in (
      'submit_contact_enquiry', 'claim_contact_notification', 'finish_contact_notification',
      'resolve_contact_notification', 'cleanup_contact_metadata'
    )
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

-- 19. Unexpected contact-like objects. This result must be empty. Indexes and the
-- expected trigger are checked separately above and therefore excluded here.
select object_type, schema_name, object_name
from (
  select 'relation'::text as object_type, n.nspname as schema_name, c.relname as object_name
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r', 'p', 'v', 'm', 'S', 'f')
    and (
      (n.nspname = 'contact_private' and not (c.relkind in ('r', 'p') and c.relname in (
        'requests', 'rate_buckets', 'notification_outbox',
        'request_tombstones', 'notification_resolutions'
      )))
      or (n.nspname = 'public' and c.relname like 'contact%' and c.relname <> 'contact_enquiries')
    )
  union all
  select 'function', n.nspname,
    p.proname || '(' || pg_catalog.pg_get_function_identity_arguments(p.oid) || ')'
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where (n.nspname = 'contact_private' and p.proname <> 'touch_enquiry')
     or (n.nspname = 'public' and p.proname like '%contact%' and p.proname not in (
       'submit_contact_enquiry', 'claim_contact_notification', 'finish_contact_notification',
       'resolve_contact_notification', 'cleanup_contact_metadata'
     ))
) unexpected
order by object_type, schema_name, object_name;

commit;
