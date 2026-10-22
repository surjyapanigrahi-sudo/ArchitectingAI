> Current hardening review and real PostgreSQL evidence: [contact-migration-review.md](contact-migration-review.md). Unknown outcomes and expired leases now require reconciliation; no blind resend. Production remains disabled.

# Contact enquiries - local implementation and release procedure

Status: LOCAL ONLY. Production enquiry collection, account collection and notification sends default to disabled. No migration or external configuration has been applied. Supersedes the Netlify Forms sections in presales-review.md. The existing Supabase project is the intended database; do not create another project.

## Architecture and privacy boundaries

POST /api/contact accepts anonymous visitors; it does not require registration or trust a user cookie. The route is Node.js server-side code. createContactClient is explicitly server-only, has no persisted user session and never passes its credential to React. There is no public enquiry reader, status editor, retry endpoint or admin dashboard.

The API validates Origin against an explicit allowlist; validates JSON, types, unknown fields, consent, four enquiry types and lengths; bounds the streamed body to 32 KiB; rejects a filled honeypot; and requires a v4 UUID Idempotency-Key. Browser rules are only usability checks. Without JavaScript the form POSTs (never GETs personal data into a URL) and the API rejects unsupported encoding.

When CONTACT_ENABLED is false the API returns 503 before reading/storing a body; the page also disables submission. No Netlify Forms submission path or static detection skeleton remains. Origin checks and a honeypot do not alone stop bots; durable limits and an operational global circuit breaker are additional controls. A CAPTCHA is not installed or configured.

## Schema and migration

Migration: supabase/migrations/20261021000100_contact_enquiries.sql.

public.contact_enquiries stores id, full_name, email, nullable phone, enquiry_type, message, status, created_at, updated_at, nullable contacted_at, nullable internal_notes and consent_version. Status is restricted to new/contacted/closed and defaults to new. A trigger updates updated_at and fills contacted_at on first transition to contacted. Separate indexes cover created_at, status and lower(email).

contact_private.requests maps a unique request UUID to its keyed payload fingerprint and saved enquiry. Approved metadata cleanup compacts old mappings to contact_private.request_tombstones so replay protection survives deletion of the linked enquiry. contact_private.rate_buckets holds keyed IP/email counters. contact_private.notification_outbox stores job/lease/delivery state, bounded attempts, provider identifier and sanitized error codes. contact_private.notification_resolutions records privileged reconciliation decisions. Public and learner roles have no schema/table access or function execution. RLS and FORCE RLS are enabled on every contact table. There are no anon/authenticated enquiry policies. Security-definer functions have a fixed pg_catalog search path and fully qualified object references; only service_role receives execution grants. No existing auth, profile, progress, course or assessment table is modified.

The Supabase secret/service-role credential bypasses RLS: server isolation and SQL execution grants are essential, not optional. Apply as the approved Supabase database owner with appropriate BYPASSRLS privileges, and verify the resulting owner/grants in an isolated environment first. No administrator privileges are granted to any learner.

The submission RPC serializes this low-volume contact transaction with a dedicated advisory lock, checks duplicate request IDs before limits, enforces limits, inserts enquiry, dedup record and outbox together, and returns only a result code. An exception rolls back the transaction. Matching retries return duplicate; same key with altered payload returns conflict. The browser retains a key for same-payload retries after network errors. No permanent content-based deduplication is claimed for independently generated new keys.

Limits per fixed 15-minute window: 5 per IP hash, 3 per normalized-email hash, 100 globally. These are version-controlled SQL defaults; change only through a reviewed migration. Keyed HMAC-SHA256 hashes avoid storing raw IPs in contact tables. Database records containing the enquiry email remain personal data. A service-only metadata cleanup function requires explicit approved cutoffs, enforces a one-day technical safety floor and bounded batches, deletes only stale counters and compacts request mappings to replay-protection tombstones. It is not scheduled and does not delete enquiries. The approved business rule is to retain contact enquiry personal data for six months after the last meaningful interaction, subject to applicable legal obligations and final privacy review. No automatic enquiry deletion is implemented or active. The operational definition of a meaningful interaction, deletion workflow, tombstone and audit-record lifecycle, backup handling, provider records and inbox copies remain unresolved and require separate approval. Keep CONTACT_HASH_SECRET stable through outstanding retries; rotate through an approved procedure.

Production trusts x-nf-client-connection-ip only when NETLIFY=true, validates it as a single IP, and otherwise fails closed. Verify that the actual Netlify Next.js runtime supplies/overwrites this platform header before activation; never substitute an arbitrary forwarded IP header. Development uses a common local bucket. Rate-limit failures or missing credentials do not permit unsafeguarded inserts.

## Environment variables

- NEXT_PUBLIC_SUPABASE_URL: existing project URL.
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: existing browser-safe auth key, unchanged.
- NEXT_PUBLIC_SITE_URL: canonical HTTPS production origin; local HTTP is allowed only in development. No credentials, paths, query or fragment.
- CONTACT_ENABLED=false: server-side collection gate; do not enable before DB/RLS/privacy verification.
- CONTACT_ALLOWED_ORIGINS: exact comma-separated origins, e.g. local origin for isolated local testing and canonical HTTPS origin for production. No wildcard.
- CONTACT_HASH_SECRET: server-only random secret of at least 32 characters; store in deployment secrets, never source.
- SUPABASE_SECRET_KEY: existing-project server-only secret key (or approved legacy service-role key value). Never use NEXT_PUBLIC_ for this key.
- AUTH_ENABLED=false: app account-entry and callback gate, pending final privacy/live-service approval. Public lessons remain accessible. This app gate does not change Supabase project settings or prevent direct provider access; verify project-level signup settings separately after approval.
- CONTACT_NOTIFICATION_ENABLED=false.
- CONTACT_NOTIFICATION_TO=surjya.panigrahi@gmail.com (worker rejects another recipient).
- CONTACT_NOTIFICATION_FROM: approved verified-domain sender, still unset.
- RESEND_API_KEY: server/operator-only, still unset.

No secrets were added to .env.local. Do not paste secrets into chat or logs. No package install is required. The test/retry commands use Node 22.18+ or Node 24 type stripping; application build still uses Next.js tooling.

## Notification readiness and controlled retries

Enquiry success depends on database commit, never email. A notification is queued even when sending is disabled, and the submission API does not send email. Resend is an adapter implemented with server-side fetch, not an activated account. The payload uses the standardized subject convention and plain text; internal_notes are never included. From and recipient are operator configuration, not visitor-controlled headers.

After separate live-email approval, an authorized operator can run npm run contact:retry -- --approved-send with CONTACT_NOTIFICATION_ENABLED=true and server secrets supplied through a secure environment. It claims at most one job, not an unbounded batch. The worker checks the flag and explicit send argument before touching storage or the provider. No public retry endpoint exists. No scheduled production worker is enabled; its hosting/schedule is a separate configuration decision.

Claims use row locking, SKIP LOCKED and an exclusive lease token. Completion requires a matching, unexpired lease. The provider idempotency key remains contact-enquiry/<enquiry UUID>. Only a confirmed rate-limit refusal (HTTP 429) is eligible for bounded backoff. A timeout, network failure, malformed acceptance, HTTP 408/409/5xx, unknown outcome or expired lease is held as uncertain for operator reconciliation, never blindly resent. Permanent rejection and five consumed attempts become exhausted. Known refusals outside the 23-hour retry window are also exhausted. Provider idempotency remains defense in depth; it is not used as a reason to resend an unknown outcome automatically.

resolve_contact_notification is service-role-only and has no HTTP endpoint. An authorized operator must confirm provider history first, then record a note and mark accepted with a verified provider ID, close without resending, or explicitly confirm not sent before allowing a retry. A retry is permitted only for an uncertain job below five attempts and within the original 23-hour window; it keeps the same enquiry/key and never resets attempts. Accepted jobs cannot be reopened. Decisions are audited privately. No operator reconciliation or production send has been performed here.

accepted means provider accepted the email, not Gmail delivery. Delivery/bounce tracking through verified webhooks is not implemented. Verify provider history and the Gmail inbox/Spam manually after approval. Provider error bodies, email contents, keys and enquiry rows are not logged. The worker prints only a generic state.

Required external setup, NOT performed: approve provider and current costs, identify a domain you control and verified sender, create/configure the approved Resend account/key, approve any DNS changes, then test notification delivery. Gmail is only the destination; no Gmail password or SMTP credential is required.

References checked: https://resend.com/docs/dashboard/emails/idempotency-keys ; https://resend.com/docs/dashboard/domains/introduction ; https://supabase.com/docs/guides/getting-started/api-keys ; https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/

## Verification and release sequence

1. Review this migration, the privacy/terms pages, the approved six-month-after-last-meaningful-interaction retention rule, unresolved deletion/backup/provider procedures, origin/IP handling and server-secret permissions. Approve the final privacy wording and operational definition of a meaningful interaction before collection.
2. In an isolated Supabase-compatible database only: apply this one migration, then run supabase/tests/contact_enquiries.sql with psql and ON_ERROR_STOP. It asserts persistence, deduplication, rates, outbox failure behavior and anonymous/student denials, then rolls back test data. PostgreSQL 17 was subsequently found under C:/Program Files/PostgreSQL/17/bin. A new loopback-only temporary cluster with Supabase-compatible roles was used for real SQL tests; see contact-migration-review.md. This is not a hosted Supabase/PostgREST or production verification.
3. Run npm test, npm run lint, npx tsc --noEmit and npm run build. Local unit tests use fake persistence/provider responses and no live account or email. Browser/route checks must block external requests while testing locally.
4. Obtain explicit production migration approval. Apply ONLY the reviewed contact migration to the existing project through the approved deployment process. Do not blindly push every existing migration or rerun it; it deliberately fails if its new tables already exist. Verify grants, RLS, function owner and representative two-role access checks against the intended environment.
5. Obtain deployment approval separately. Deploy with CONTACT_ENABLED=false, AUTH_ENABLED=false and CONTACT_NOTIFICATION_ENABLED=false; confirm server-only keys do not enter client bundles. Confirm trusted platform IP and database connectivity through an authorized controlled verification process.
6. After final privacy and approved live test plan, enable collection with approved environment values and rebuild/redeploy as needed. Verify one approved test request persisted exactly once, denied direct anonymous/student reads and safe failure/duplicate handling. No real visitor data before this sign-off.
7. Configure/enable Resend only after separate approval; use an approved test enquiry, run one explicit retry, verify provider acceptance and Gmail inbox/Spam. Keep saved enquiries if notifications fail. Arrange any approved worker schedule later.
8. Activate authentication only after approved existing-project URLs/templates and test accounts are ready. Follow docs/supabase-auth.md and the checklist below. No production admin dashboard is exposed.

## Live authentication checklist - not executed

Register approved test account; verify confirmation email and signed callback; reject expired/reused links; login with correct/incorrect password; logout and verify protected routes; test refresh/expiry; request recovery with known/unknown address without account enumeration; verify recovery callback and password change; test malformed/expired reset sessions; check canonical local/production redirects; verify two users cannot read each other's progress/assessment data. Check account removal/retention procedure. Public samples must load signed out throughout. No existing live policies/templates/redirects were changed.

## Remaining approval gates

Production read-only catalog inspection; production migration; final privacy review and operational approval for deletion, meaningful-interaction dates, tombstones, audits, backups, provider records and inbox copies; production Netlify runtime/env changes and deployment; auth activation/settings/test accounts; Resend account, sender domain/DNS/costs, live email and worker scheduling. Curriculum numbering remains a documented proposal only. This document does not authorize any of these actions.

## Standard notification subject and message format

Every notification uses: [Architecting AI] New Enquiry | {Enquiry Type} | {Visitor Name}. The server formatter uses the stored enquiry category and visitor name. Categories are rechecked against the four supported values; the subject name is limited to 120 characters. CR/LF, C0/C1 controls, Unicode line separators and embedded pipe delimiters are removed from subject components.

From remains the operator-configured verified Architecting AI sender (CONTACT_NOTIFICATION_FROM), never the visitor address. Resend reply_to uses the visitor email after independent address/header validation. Sender configuration containing header controls is rejected before a job is claimed. Sender-domain verification and live delivery still require approval and are not performed here.

The professional plain-text body includes enquiry ID, the original created_at submission instant formatted in Asia/Kolkata as IST (UTC+05:30), visitor name/email, optional phone, category and the full message. Plain text avoids HTML interpolation; private internal notes and credentials are never included. The claim RPC now returns the EXISTING enquiry created_at field; no table/schema or storage behavior changed. This response-field addition is included in the still-unapplied migration and must be present before running the updated worker. Missing/invalid timestamps fail safely rather than substituting send time.

The standardized email formatter is unchanged by the subsequent hardening, while outbox states now distinguish uncertain/exhausted outcomes and require reconciliation as described above. Stable idempotency keys and enquiry persistence are preserved. As with any email-template change, do not switch payload versions for a notification whose provider outcome is unresolved: reconcile it before retrying under the same key. No emails have been sent by this implementation. Tests use fake provider responses.
