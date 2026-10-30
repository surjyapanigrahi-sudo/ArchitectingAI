-- Architecting AI: final missing production baseline evidence
-- READ ONLY. One result set covering original baseline sections 5, 8, 9, 10 and 11.
-- Expected before contact migration: exactly six public tables and five public functions.

begin transaction read only;
set local statement_timeout = '30s';
set local lock_timeout = '1s';

with public_tables as (
  select c.oid, c.relname, c.relowner, c.relkind, c.relpersistence,
         c.relrowsecurity, c.relforcerowsecurity, c.relacl
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p')
), public_functions as (
  select p.*
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
), evidence as (
  -- Section 5: table ownership and RLS state.
  select
    5 as section_number,
    'table_security'::text as evidence_type,
    'public.' || t.relname as object_name,
    pg_catalog.jsonb_build_object(
      'owner', pg_catalog.pg_get_userbyid(t.relowner),
      'relation_kind', t.relkind,
      'persistence', t.relpersistence,
      'rls_enabled', t.relrowsecurity,
      'force_rls', t.relforcerowsecurity,
      'policy_count', (
        select pg_catalog.count(*)
        from pg_catalog.pg_policy pol
        where pol.polrelid = t.oid
      )
    ) as details
  from public_tables t

  union all

  -- Section 8: one row per table, including an empty array when it has no policy.
  select
    8,
    'table_policies',
    'public.' || t.relname,
    pg_catalog.jsonb_build_object(
      'policies', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'name', pol.policyname,
            'permissive', pol.permissive,
            'roles', pol.roles,
            'command', pol.cmd,
            'using', pol.qual,
            'with_check', pol.with_check
          ) order by pol.policyname
        )
        from pg_catalog.pg_policies pol
        where pol.schemaname = 'public' and pol.tablename = t.relname
      ), '[]'::pg_catalog.jsonb)
    )
  from public_tables t

  union all

  -- Section 9: effective table ACL, including implicit owner defaults.
  select
    9,
    'table_effective_grants',
    'public.' || t.relname,
    pg_catalog.jsonb_build_object(
      'grants', (
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'grantee', case when acl.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(acl.grantee) end,
            'grantor', pg_catalog.pg_get_userbyid(acl.grantor),
            'privilege', acl.privilege_type,
            'grantable', acl.is_grantable
          ) order by
            case when acl.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(acl.grantee) end,
            acl.privilege_type
        )
        from pg_catalog.aclexplode(
          coalesce(t.relacl, pg_catalog.acldefault('r', t.relowner))
        ) acl
      )
    )
  from public_tables t

  union all

  -- Section 10: function ownership, security settings and complete definition.
  select
    10,
    'function_security_and_definition',
    p.oid::pg_catalog.regprocedure::text,
    pg_catalog.jsonb_build_object(
      'owner', pg_catalog.pg_get_userbyid(p.proowner),
      'language', l.lanname,
      'security_definer', p.prosecdef,
      'leakproof', p.proleakproof,
      'strict', p.proisstrict,
      'volatility', p.provolatile,
      'parallel', p.proparallel,
      'configuration', p.proconfig,
      'result_type', pg_catalog.pg_get_function_result(p.oid),
      'definition', pg_catalog.pg_get_functiondef(p.oid)
    )
  from public_functions p
  join pg_catalog.pg_language l on l.oid = p.prolang

  union all

  -- Section 11: effective function ACL, including implicit PUBLIC EXECUTE.
  select
    11,
    'function_effective_grants',
    p.oid::pg_catalog.regprocedure::text,
    pg_catalog.jsonb_build_object(
      'grants', (
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'grantee', case when acl.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(acl.grantee) end,
            'grantor', pg_catalog.pg_get_userbyid(acl.grantor),
            'privilege', acl.privilege_type,
            'grantable', acl.is_grantable
          ) order by
            case when acl.grantee = 0 then 'PUBLIC' else pg_catalog.pg_get_userbyid(acl.grantee) end,
            acl.privilege_type
        )
        from pg_catalog.aclexplode(
          coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
        ) acl
      )
    )
  from public_functions p
)
select section_number, evidence_type, object_name, details
from evidence
order by section_number, object_name;

commit;
