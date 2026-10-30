# Supabase production pre-migration baseline — 22 October 2026

Status: **INCOMPLETE — read-only catalog access unavailable**.

Project: existing ArchitectingAI Supabase production project. Branch: `presales-readiness`.

## Inspection boundary

No production SQL, DDL, row query, RPC call, migration, setting change or test submission was performed. The workspace has no Supabase CLI installation, linked project metadata, database connection URL or Supabase management access token. The configured browser-safe project key was tested only against the PostgREST OpenAPI metadata endpoint and was refused because that endpoint requires a secret key. No table data was requested or returned.

The workspace contains a server-side Supabase key, but it is write-capable and therefore was not used for this read-only inspection. A production catalog baseline requires an access path technically constrained to read-only operations.

## Production facts not yet verified

The following remain unknown in the hosted project:

- complete schema and public-table inventory;
- existence of `contact_private`, `public.contact_enquiries` or any contact RPC from an earlier draft;
- table and function owners, including whether the intended migration owner has `BYPASSRLS`;
- table RLS/FORCE RLS settings and policies;
- schema, table, sequence and function grants for `PUBLIC`, `anon`, `authenticated`, `service_role` and other roles;
- applicable default privileges for the migration owner and any Supabase-managed owner roles;
- PostgREST exposure of existing tables/functions to anonymous, authenticated and service roles;
- exact hosted definitions of learning, profile, assessment, certificate and progress objects;
- current extensions and availability of `gen_random_uuid()`;
- current production backup/restoration point and recovery procedure.

## Evidence already established outside production

The proposed migration creates only `public.contact_enquiries`, the new `contact_private` schema and its contact-specific tables/functions. It contains no DDL naming existing profile, assessment, certificate, course or progress tables. A fresh PostgreSQL 17 run with synthetic legacy-table sentinels confirmed that all 28 isolated integration scenarios pass, transaction-wide DDL rollback removes partial contact objects, untrusted owners are rejected, Supabase-style default grants are revoked, and legacy sentinels remain unchanged.

This evidence does not replace hosted catalog inspection.

## Required read-only access

Provide one of these authorized, technically read-only paths without sharing credentials in chat or source:

1. An authenticated Supabase dashboard session that permits viewing Database tables, schemas, functions, policies, roles/grants and project API documentation without opening a write-capable SQL execution path; or
2. A temporary PostgreSQL login for the production database with `CONNECT` plus catalog visibility and `SELECT` only on the specific catalog/information-schema views needed for inventory, with no ownership, membership in privileged roles, `BYPASSRLS`, DDL or DML privileges; or
3. A sanitized catalog export produced by an authorized operator from an approved read-only script, covering schemas, relations, columns, owners, RLS/FORCE RLS, policies, functions, function settings/security mode, explicit grants, default privileges, extensions and PostgREST-exposed schemas.

The read-only path must be independently constrained; a service-role API key or database owner credential is not an acceptable substitute.

## Production migration prerequisites

Before requesting migration approval:

1. Complete the hosted catalog and API-role baseline above.
2. Confirm that no `contact_private` schema, `contact_enquiries` table or same-signature contact function already exists. If an older draft exists, prepare a reviewed forward migration instead of rerunning the proposed migration.
3. Confirm the selected migration owner is trusted and has the required `BYPASSRLS` capability, while application roles do not inherit owner privileges.
4. Review explicit and default privileges so the migration's revocations produce the intended anonymous/authenticated denial and service-role RPC-only boundary.
5. Capture an approved restorable backup or recovery point and verify the restoration procedure.
6. Snapshot the definitions, ownership, grants, RLS and row-count metadata of existing learning, profile, assessment, certificate and progress tables for post-migration comparison.
7. Keep `AUTH_ENABLED=false`, `CONTACT_ENABLED=false` and `CONTACT_NOTIFICATION_ENABLED=false` through migration and post-migration verification.
8. Obtain separate approval before applying only `supabase/migrations/20261021000100_contact_enquiries.sql`.

## Retention decision

The approved business rule is to retain contact enquiry personal data for six months after the last meaningful interaction, subject to applicable legal obligations and final privacy review. No automatic deletion is implemented or active. The definition and recording of a meaningful interaction, legal exceptions, deletion authorization and verification, request tombstones, notification-resolution audits, backups, email-provider records and Gmail/inbox copies remain unresolved and require approved operating procedures before collection is enabled.
