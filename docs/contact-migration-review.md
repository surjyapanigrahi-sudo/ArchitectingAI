# Contact migration hardening review - 22 October 2026

Branch: presales-readiness. LOCAL ONLY. No production migration, Supabase/Netlify setting, email activation, commit, push or deployment. Earlier uncommitted work is preserved. This review supersedes historical notes saying no real SQL tests were available.

## PASS / PARTIAL / FAIL

| Area | Result | Evidence and remaining limits |
|---|---|---|
| Rate limiting and duplicate accounting | PASS (isolated SQL) | Concurrent same-key intake saves one enquiry. Concurrent distinct requests respect IP/email/global caps with no lost counter increments. Duplicate/conflicting keys are checked before limits. Previous-window buckets reset to one. Validation, lock timeout and explicit rollback leave no partial counters or rows. |
| Cleanup strategy | PASS (implemented and isolated SQL tested); PARTIAL policy approval | Service-only bounded maintenance removes stale counters and compacts stale request links to minimal replay tombstones. Active buckets and enquiries are untouched. Archived/deleted enquiry requests cannot be replayed into a second enquiry. No schedule or production cleanup is enabled. Cutoffs and tombstone retention still require approval. |
| Notification outbox | PASS (isolated SQL + mocked provider tests) | Unknown outcomes and expired leases become uncertain and cannot be auto-claimed. Permanent rejection, exhausted attempts and expired known-refusal retry windows become exhausted. Leases, concurrency, backoff, late acknowledgements and audited recovery are tested. No real provider delivery tested. |
| Database security | PASS (real PostgreSQL 17 with Supabase-compatible roles); PARTIAL hosted verification | All contact tables have RLS/FORCE RLS. Anonymous/authenticated direct CRUD, private-schema CREATE and privileged RPC execution denied. Service RPC operations succeed; direct service-role table reads are intentionally not granted. Owner/BYPASSRLS guard, fixed search_path and revocation of Supabase-style default grants tested. Actual hosted owner/default-grant/PostgREST configuration still requires approved release verification. |
| Existing data preservation | PASS (migration review + isolated SQL) | Migration statements target only new contact objects. Existing profile, assessment, certificate, course and progress sentinel rows/owners/ACLs remain unchanged. No existing application auth/course/lesson modules changed in this run. |
| Legacy table grants | PRE-EXISTING ISSUE; deferred | Production catalog evidence shows `anon`, `authenticated` and `service_role` hold broad grants, including `TRUNCATE`, on all six legacy public tables. RLS constrains row-level DML but PostgreSQL does not apply RLS to `TRUNCATE`. The normal Supabase data API does not expose a truncate operation, but the catalog privileges remain unnecessarily broad. Do not change them in the contact migration; review and remediate them through a separate migration with application compatibility testing. The contact migration explicitly revokes all direct privileges from every new contact table. |
| Privacy/data lifecycle | PARTIAL | consent_version remains stored and validated. Contact enquiry personal data has an approved business retention rule of six months after the last meaningful interaction, subject to applicable legal obligations and final privacy review. No automatic deletion is implemented or active. The meaningful-interaction definition, deletion workflow, tombstone/audit lifecycle, provider/Gmail handling and backup deletion remain unresolved. |
| Application checks | PASS | 42 mocked/unit application tests, ESLint, standalone TypeScript and production build pass. Real SQL scenarios are counted separately below. |

## Corrections made

1. Fixed the missing closing quote in the original enquiry insert's consent_version extraction. Real PostgreSQL execution caught this; mocked storage tests could not.
2. Rate-window calculation now uses clock_timestamp AFTER acquiring the advisory lock, so a waiter does not use its transaction-start window. The same lock protects cleanup and intake; lock waits are bounded to three seconds and fail closed.
3. SQL input checks reject null/malformed request hashes and null/incorrect consent versions. An exception rolls back counters, enquiry, dedup mapping and outbox atomically.
4. Added private request_tombstones and notification_resolutions, plus cleanup indexes. FORCE RLS now covers every private contact table as well as enquiries. Direct table privileges are explicitly revoked even from service_role; only reviewed RPC execution is granted to that existing backend role.
5. Unknown send outcomes no longer return to the automatic retry queue. Expired leases are invalidated and held as uncertain rather than reclaimed. A provider-accepted message is never reopened for resending.
6. Exhausted is an explicit terminal state. Retry claims are restricted to pending or known-safe failed jobs below five attempts and within the original 23-hour retry window.
7. Added service-only reconciliation and bounded metadata maintenance functions. Neither has an application HTTP route. Ordinary students receive no administrative privileges.

## Advisory lock assessment

Keep the single advisory transaction lock for the current low-volume contact intake. The global quota is 100 accepted enquiries per fixed 15-minute window and the locked transaction performs only short database operations, never an email/network call. Twelve simultaneous intake connections were tested for duplicate/rate accounting; contention and a three-second timeout were tested. This is test evidence, not a production throughput benchmark. A timed-out operation returns no false persistence success and can retry with its original key. Revisit the design if measured production contention warrants finer-grained locking; do not remove the lock without another concurrency design.

The fixed-window design permits bursts around a boundary; it is not advertised as a sliding-window limiter. Rollover tests seeded previous-window rows in real PostgreSQL. Time calculation after lock acquisition is also reviewed in the deployed function definition; no production clock was changed.

## Notification outcomes and recovery

| Event | Stored state | Automatic resend |
|---|---|---|
| Provider returns a valid accepted-message ID | accepted | Never |
| Confirmed provider HTTP 429 refusal | failed, then bounded backoff | Below five attempts and within original 23-hour window only |
| Timeout, network error, malformed acceptance, HTTP 408/409/5xx, legacy provider_unavailable or outcome_unknown | uncertain | Never |
| Lease expires, regardless of whether the worker might have sent | uncertain | Never |
| Permanent provider rejection | exhausted | Never |
| Fifth confirmed refusal or expired safe retry window | exhausted | Never |

An expired lease cannot acknowledge a job, and a wrong/old lease cannot overwrite a newer attempt. Unknown outcomes retain the enquiry and notification record. The stable contact-enquiry/<enquiry UUID> key remains defense in depth. We deliberately require reconciliation for ambiguous results even though the provider offers idempotent requests. Provider reference: https://resend.com/docs/dashboard/emails/idempotency-keys ; rate-limit reference: https://resend.com/changelog/api-rate-limit .

After separate approval, an authorized operator must inspect provider history and ensure there is no in-flight send before calling resolve_contact_notification. It requires an explanatory note (10-500 characters) and records the decision privately, including database session identity/time. Do not include visitor details, credentials or unnecessary personal data in the note.

- mark_accepted requires a verified provider message ID and never resends.
- retry_confirmed_not_sent requires definitive evidence that the uncertain attempt was not accepted, fewer than five attempts and less than 23 hours since first attempt. The same enquiry/key and cumulative attempt count are preserved.
- close leaves the job exhausted without sending.

An accepted job cannot be reopened. Exhausted jobs cannot be reset into automatic retry through this helper. Further remediation needs a separate reviewed operation; do not reset attempts or generate a new key to bypass safeguards. If provider history cannot establish the result, keep the job uncertain. Accepted is not a promise of Gmail delivery. No webhook or Gmail delivery test was performed.

## Metadata cleanup: implemented, tested, NOT scheduled

cleanup_contact_metadata(p_bucket_before, p_request_before, p_limit default 500) is service-only and has no HTTP endpoint. Both cutoffs must be explicit and at least one day in the past; batch size is 1-1000. The day is a technical safety floor to avoid active buckets/requests, not a published retention period. Obtain approved cutoffs before any real-data maintenance.

The function takes the same bounded advisory lock as intake, removes only stale rate counters, and transactionally replaces stale request-to-enquiry mappings with tombstones containing request UUID, keyed fingerprint and original/archive timestamps. It does NOT delete contact_enquiries or notification jobs. Batches and replay protection were tested against real PostgreSQL, including replay after the underlying enquiry was deleted in an isolated fixture.

Tombstones are retained rather than silently forgotten: deleting them would allow an old unsigned UUID request to create another enquiry. They are still pseudonymous operational records and require an approved retention decision. Complete erasure of those records requires an approved replay-expiry design or explicit acceptance of losing that protection. No indefinite-retention policy is asserted here and no automatic tombstone purge is installed.

## Enquiry retention decision and proposed deletion procedure

Approved business rule: retain contact enquiry personal data for six months after the last meaningful interaction, subject to applicable legal obligations and final privacy review. This decision does not activate or authorize automatic deletion.

1. Before collection, approve the operational definition and recording of the last meaningful interaction, deletion authority, legal-hold/retention exceptions, request handling and treatment of dedup tombstones, notification audit records, backups and provider/Gmail copies.
2. For an approved visitor request, verify ownership proportionately and identify the affected enquiry IDs without requesting unnecessary personal information. Check any approved reason to retain a record. Mark follow-up closed where appropriate; closing alone is not deletion.
3. Reconcile pending/processing/uncertain notification outcomes first; do not delete the evidence of an in-flight or ambiguous send and then create another notification.
4. A specifically authorized database operator should use one reviewed transaction, take the intake advisory lock, preserve only the approved minimal replay tombstone, remove associated request links and outbox/resolution records, then delete the selected enquiry. Verify affected counts before commit and record a minimal audit outside the deleted personal payload. Do not bulk-delete by an unreviewed date or use CASCADE across unrelated learning tables.
5. Handle any provider/Gmail copies and backup lifecycle under separately approved procedures; a database deletion does not erase those copies. No automation for these actions is implemented.
6. Confirm the agreed outcome to the requester without promising a completion deadline that has not been approved.

The integration suite exercises deletion of local fixtures after compaction only to prove replay safety. It is NOT a production erasure tool. The six-month business rule is documented, but real enquiry deletion, retention automation and scheduling remain disabled and unapproved pending the procedures above.

## Real database versus mocks

Real SQL: PostgreSQL 17 binaries found under C:/Program Files/PostgreSQL/17/bin, outside PATH. Initialized a new temporary cluster, bound only to 127.0.0.1:55439, using a new database contact_review and test-only roles anon/authenticated (NOBYPASSRLS) and service_role (BYPASSRLS). No existing PostgreSQL service, project connection string or production credential was used. The test harness requires an explicit --isolated flag, loopback/port/database/user, and a matching database marker before mutating anything.

npm run test:contact:sql passed 28 real integration scenarios. They cover atomic insert/outbox/consent, duplicates/conflicts, rollback, 12 concurrent same-key requests, 12 concurrent rate-accounting requests, email/global limits, window reset, bounded lock wait, batch cleanup, tombstones after fixture erasure, real service-role RPC calls, accepted/unknown/expired/rejected/exhausted outcomes, controlled recovery, two concurrent workers, role/ownership/search_path permissions, source-level HTTP surface review, complete migration DDL rollback, untrusted owner rejection, sentinel preservation and simulated Supabase default grants. Source-level route review is labeled as such, not a network PostgREST test.

The separate supabase/tests/contact_enquiries.sql transaction/permission suite also passed on that cluster and rolls back its fixture data. Application tests use fake database/provider adapters: 42 passed, including email formatting and conservative failure classification. No real Resend request/email, hosted Supabase/PostgREST call, browser login or production data was involved.

## Reproduction (fresh disposable database only)

Use the installed PostgreSQL initdb and pg_ctl binaries to initialize a NEW temporary data directory with test owner contact_test_owner; bind to 127.0.0.1 port 55439. Do not point pg_ctl at an existing server's data directory. Create database contact_review and test roles anon NOLOGIN NOBYPASSRLS, authenticated NOLOGIN NOBYPASSRLS and service_role NOLOGIN BYPASSRLS. Mark the new database with COMMENT ON DATABASE contact_review IS 'architecting-ai disposable contact review'. These role/bootstrap commands are isolated test setup, not additions to the production migration.

Apply only supabase/migrations/20261021000100_contact_enquiries.sql to that new database with psql -X -v ON_ERROR_STOP=1. Run npm run test:contact:sql; it uses the explicit loopback test connection and unique disposable probe databases. CONTACT_TEST_PSQL can point to another local psql executable. Run the suite alone, because it resets ONLY contact fixtures in the marked test database. Run supabase/tests/contact_enquiries.sql separately if desired. Stop the temporary cluster with pg_ctl using its exact new data directory when finished. No database installation/download is needed here.

## Files changed in this run

- supabase/migrations/20261021000100_contact_enquiries.sql
- supabase/tests/contact_enquiries.sql
- src/modules/contact/notifications.ts
- tests/contact.test.mjs
- tests/notification-format.test.mjs
- tests/contact-sql.integration.mjs (new)
- package.json (isolated SQL test command only)
- docs/contact-enquiries.md
- docs/contact-migration-review.md (new)

## Remaining production gates

Review/approve the revised migration, owner/grants in the existing hosted project, final privacy/retention/tombstone/deletion procedure, actual PostgREST role behavior, server-secret/logging boundaries, runtime origin/IP handling and approved live test plan. The current migration is still unapplied to production; if any environment has applied an earlier draft, do not rerun this file over it - prepare a separate reviewed forward migration. Contact collection and email stay disabled. No live maintenance, reconciliation, email sending, commit, push or deployment is authorized by this report.

## Final run closure

All 28 isolated integration scenarios and the rollback-only SQL suite passed. All 42 application tests, final ESLint, standalone TypeScript, production build and whitespace checks passed. The temporary PostgreSQL cluster was stopped after testing; its workspace pointer was removed. Only synthetic fixtures were used. No production activation or live send occurred.
