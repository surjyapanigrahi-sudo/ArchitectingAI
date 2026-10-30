# Contact migration production checklist

Status: **PREPARATION ONLY — production execution requires separate explicit authorization**.

Target: ArchitectingAI / main (PRODUCTION). Branch: `presales-readiness`.

## Reviewed artifacts

- Migration: `supabase/migrations/20261021000100_contact_enquiries.sql`
- Required SHA-256: `55c8f144ebf36491ecee464c16e3bafdfa08ff7a8d78dab867ff8ad8c0ba5eb7`
- Pre-migration baseline: `supabase/inspection/pre_contact_migration_baseline.sql`
- Essential public-data export: `supabase/inspection/export_essential_application_data.sql`
- Post-migration verification: `supabase/inspection/post_contact_migration_verification.sql`
- Targeted contact-object rollback: `supabase/inspection/rollback_contact_objects.sql`

The baseline, export and post-verification scripts start a read-only transaction and commit without writing. The baseline and post-verification scripts include both statistics estimates and exact counts for the six legacy application tables. Save every result set from the inspection scripts for comparison. The rollback script is destructive and must never be included in an inspection run.

## Password-free SQL Editor evidence

When a database password is unavailable, run the baseline and essential-data export through the existing authorized production SQL Editor. Download the results into an approved encrypted folder outside Git, record capture times and compute SHA-256 hashes of the downloaded files. The export produces one result set with a manifest row for each of the six public application tables and a JSON representation of every row.

This export reduces recovery risk for the six public application tables but is not a database backup. It does not preserve Supabase Auth users, identities, password verifiers, sessions or MFA state; database roles; extension state; Storage object bytes; project/API keys and secrets; Vault contents; Auth configuration/templates; Realtime settings; Edge Functions; Netlify state; provider configuration; or a transactional recovery point for changes made outside the export transaction. Foreign keys from exported public rows retain user UUIDs, but those rows cannot be fully restored unless compatible Auth identities exist. The catalog output is evidence and reconstruction input, not directly replayable DDL.

## Backup and recovery decision — must be confirmed in the project

No backup is assumed to exist. An authorized owner must open **Database > Backups** for the ArchitectingAI project and record the project plan, backup type, latest successful recovery point, retention window and available restore actions.

Current Supabase documentation states:

- Pro, Team and Enterprise projects receive daily database backups, with documented retention of 7, 14 and up to 30 days respectively.
- Point-in-Time Recovery (PITR) is a paid-plan add-on and requires at least the Small compute add-on. When PITR is enabled, it replaces daily backups and exposes an earliest/latest recovery window.
- A manual logical database backup can be produced with `supabase db dump` or `pg_dump` through an approved secure operator process.
- Physical/PITR backups may support in-place restoration and, for eligible paid projects, restoration to a new project. In-place restoration causes downtime.
- Database backups contain database data and Storage metadata, but not the underlying Storage objects. A complete application recovery plan must handle Storage objects separately.
- A restored new project does not automatically reproduce all non-database project configuration, including API keys, Auth settings, Edge Functions, Realtime settings and Storage objects/settings.

Official references:

- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/platform/clone-project
- https://supabase.com/docs/guides/deployment/ci/backups

Before migration, choose and document one actually available recovery path:

1. A confirmed daily backup with a successful recovery point before migration; or
2. Confirmed PITR with an acceptable recovery point immediately before migration; or
3. A separately authorized logical dump whose completeness and restoration procedure have been verified.

Record who is authorized to initiate restoration, expected downtime, whether restoration is in place or to a new project, and how non-database configuration/Storage would be recovered. Merely seeing a backup entry is not proof that the complete recovery procedure is understood.

## Pre-authorization checklist

- [ ] Confirm the target shown in the Supabase Dashboard is ArchitectingAI / main (PRODUCTION).
- [ ] Confirm `AUTH_ENABLED=false`, `CONTACT_ENABLED=false` and `CONTACT_NOTIFICATION_ENABLED=false` in the currently deployed environment.
- [ ] Confirm the actual backup/recovery option using the section above.
- [ ] Record an acceptable successful recovery point before migration.
- [ ] Run `pre_contact_migration_baseline.sql` and save every result set with its capture time.
- [ ] Run `export_essential_application_data.sql`, download its single result set outside Git, verify six manifest rows and hash the saved file.
- [ ] Confirm execution role is `postgres`, `BYPASSRLS=true` and CREATE on `public=true`.
- [ ] Confirm exactly six existing public tables and five existing public functions.
- [ ] Confirm every existing public table is postgres-owned and RLS-enabled.
- [ ] Confirm `gen_random_uuid()` resolves and is visible without qualification.
- [ ] Confirm the conflict query returns zero rows.
- [ ] Inspect the complete default-ACL output for every grantee, including custom roles.
- [ ] Confirm the migration file SHA-256 exactly matches the reviewed value.
- [ ] Obtain explicit authorization to execute only this migration.

Any failed or unexplained item is a stop condition.

## Safe production execution procedure — after explicit authorization only

1. Freeze unrelated database changes for the short migration and verification window.
2. Reconfirm the project/environment banner and the selected recovery point. Do not proceed if the backup status changed or the recovery option is unclear.
3. Reconfirm the migration hash locally:

   ```powershell
   (Get-FileHash -Algorithm SHA256 -LiteralPath 'supabase/migrations/20261021000100_contact_enquiries.sql').Hash.ToLower()
   ```

4. In the production Supabase SQL Editor, execute the exact contents of `supabase/migrations/20261021000100_contact_enquiries.sql` once as `postgres`. Do not use a bulk migration push, do not include historic migrations and do not add bootstrap/test SQL.
5. The migration must complete its own `BEGIN`/`COMMIT` transaction without errors. If it fails, capture the sanitized error, leave all gates false and stop. Do not edit and rerun it interactively. Determine whether the transaction rolled back fully before preparing any reviewed forward correction.
6. Immediately run `post_contact_migration_verification.sql` read-only and save every result set.
7. Require all post-migration structural summary checks to be true in production.
8. Confirm all six contact tables are postgres-owned with RLS and FORCE RLS, have no policies and grant no direct privileges to `PUBLIC`, `anon`, `authenticated` or `service_role`.
9. Confirm all five public contact RPCs are postgres-owned `SECURITY DEFINER` functions with `search_path=pg_catalog`; intake and cleanup must also have `lock_timeout=3s`.
10. Confirm `anon` and `authenticated` cannot execute any contact RPC, while `service_role` can execute only the five intended RPCs and has no direct contact-table privileges.
11. Compare the repeated legacy-table, exact-row-count, structure, dependency, policy, grant, function and default-ACL result sets with the saved baseline. The six existing tables and five existing functions must remain unchanged apart from normal statistics estimates that may vary.
12. Keep all feature gates false. Report the migration and verification outcome before requesting any deployment or activation approval.

Do not treat a successful migration as approval to submit an enquiry, enable authentication, configure notifications, run a worker or deploy application source.

## Stop and recovery rules

- If the pre-migration conflict query returns any row, do not run the migration. Determine whether an older draft exists and prepare a reviewed forward migration.
- If the migration reports an error, do not rerun it until catalog inspection confirms whether its transaction rolled back completely.
- If post-migration permissions, owners, RLS, FORCE RLS, search paths or legacy comparisons fail, keep all gates false and prepare a reviewed forward correction.
- Do not drop contact tables, outbox records, tombstones or existing learning data as an improvised rollback.
- Use an in-place restore only after separately approving the downtime and accepting that every database change after the selected recovery point will be lost.
- Prefer a reviewed forward correction when the database remains internally consistent and restoration would discard unrelated production changes.

## Remaining blockers

### Before database migration

1. The Free project has no automatic backup. The SQL Editor export is not a full recovery point; the owner must explicitly accept the unrecoverable scope above or provide another verified recovery method.
2. The production pre-migration baseline and essential-data export have not yet been run and saved/reviewed.
3. The complete default-ACL output must confirm whether any custom role beyond `PUBLIC`, `anon`, `authenticated` and `service_role` receives defaults.
4. Explicit production migration authorization has not been given.

### Before contact collection or notifications

1. Define and record the “last meaningful interaction” used by the approved six-month retention rule.
2. Approve deletion authority, legal exceptions, transaction design and verification.
3. Decide tombstone, notification-audit, backup, provider and Gmail/inbox retention handling.
4. Complete final privacy review.
5. Verify Netlify IP forwarding, origin allowlist, secret isolation and request/error logging.
6. Complete separately approved live contact, authentication and notification tests.

No automatic deletion is implemented or activated.
