# Local Contact submission readiness review

Date: 2026-10-23 (Asia/Calcutta)
Branch: `fix/unified-navigation-privacy-local`
Scope: review and preparation only. No environment, backend, Supabase, authentication, or deployment changes.

## Finding

The disabled Submit Enquiry button matches the current configuration. Enabling its appearance alone will not make submissions work. The API independently checks collection activation, origin, hash-secret length, trusted client IP, and confirmed persistence through the Supabase contact RPC.

## Redacted local configuration checks

| Check | Result |
| --- | --- |
| Contact collection | Off |
| Contact notifications | Off |
| Authentication activation | Off |
| Configured database URL | Non-local; no request was made to it |
| Server database key | Present; value not displayed or used |
| Contact hash secret has at least 32 characters | No |
| Allowed origin includes `http://127.0.0.1:3100` | No |
| Allowed origin includes `http://localhost:3000` | No |

PostgreSQL 17 binaries are installed. A server already listens on port 5432; it was not connected to or changed. No listener was found at the expected local Supabase API/database ports 54321/54322 or the earlier disposable SQL-test port 55439. Docker, Supabase CLI, and psql were not found on PATH. A plain PostgreSQL listener is not sufficient for the existing Supabase HTTP RPC adapter.

The current preview uses `next start`, so NODE_ENV is production. In that mode `src/app/api/contact/route.ts` requires Netlify's client-IP source; a direct loopback request has no client IP and returns unavailable after the earlier gates pass. Use a loopback development server for a local test rather than weakening the production IP checks or pretending to run on Netlify.

## Verification completed now

- `npm test`: 42 passed, zero failed. Tests include valid submission with mocked persistence, duplicate handling, field/consent validation, origin/content-type/idempotency/config checks, failure handling, rate limiting, and notification safeguards.
- Configuration checks returned only booleans and a local/non-local classification. No credentials were printed.
- Read the route, persistence adapter, service tests, migration review, handover, and prior hosted-baseline report.
- No real submission, database connection, migration, email, or hosted API call was made.

Prior records report 28 isolated PostgreSQL integration checks, but they were not rerun during this review and are not proof of a complete browser-to-Supabase HTTP test. Hosted migration application and security remain unverified in the latest recorded baseline; do not use the configured hosted endpoint for a local trial.

## Concrete local activation plan

1. Provision a separate disposable, loopback-only Supabase-compatible database/API stack using synthetic data. Leave the existing PostgreSQL server on 5432, hosted Supabase, and the separate Python LMS untouched. Review and apply only the contact migration to the new test database; never bulk-apply historic migrations.
2. Verify the contact RPC, trusted function ownership, RLS/grants, denial of anonymous/authenticated direct access, and preservation of unrelated objects in that disposable stack. Rerun the isolated SQL suite against its explicitly marked disposable test database.
3. Start a separate loopback `next dev` process with a process-only configuration override targeting the isolated stack. Use test-only keys, a freshly generated hash secret of at least 32 characters, the exact preview origin, and contact collection enabled only in that process. Keep authentication and contact notification activation off. Do not edit `.env.local`, existing keys, production configuration, or any Netlify setting. Record the actual temporary port and exact origin together.
4. Exercise the button with synthetic fields and consent. Confirm one stored enquiry and pending outbox job, duplicate retries producing one record, invalid fields/no consent failing, rate limiting, and database failure never displaying success. Do not run the email worker. Repeat the Privacy Policy return trip on desktop and mobile.
5. Stop only the processes created for this test and remove the process overrides. Keep the normal local production preview and all production collection/email gates off. Record results before any request for hosted activation or deployment.

The plan requires isolated backend provisioning and temporary process configuration, which go beyond the current review and earlier UI-only authorization. Nothing in this review activates those steps.

## Limits

The button remains disabled on the normal preview. No browser-to-real-database submission, actual hosted RPC, live email delivery, or deployment was tested. A mocked UI demo can demonstrate form behavior but must be labeled as a simulation and cannot establish that an enquiry was stored.
