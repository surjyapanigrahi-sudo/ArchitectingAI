# Architecting AI Website V2 - project handover

Requested checkpoint date: **21 October 2026**. This handover also includes the migration-hardening evidence completed on **22 October 2026 (Asia/Calcutta)**. The requested filename is retained. "Tomorrow" means the next work session. Work stops after this documentation checkpoint.

## 1. Critical current state

Business objective: prepare the EXISTING Architecting AI website for a credible pre-sales presentation to **CoachEasily** and other education-technology partners. Do not rebuild it or confuse it with the separate Python LMS/video-generation engine.

- Branch: **presales-readiness**. Implementation changes are uncommitted; no commit, push or deployment occurred during these runs.
- Existing Supabase project: **ArchitectingAI** (user-confirmed). No new Supabase project was created. Actual hosted identifiers/policies/settings have not been changed or fully verified here.
- **contact_enquiries migration is NOT applied to the existing/production Supabase project.** It was applied only to new disposable local PostgreSQL databases with synthetic fixtures.
- Contact submissions and live notifications remain disabled. AUTH_ENABLED also defaults to false in local source. This gate does not modify existing Supabase signup settings. Live auth flows remain unverified.
- Preserve all current production authentication, profile, assessment, certificate, course and progress tables. Never bulk-push historic migrations.
- Preserve both student/professional courses, planned entries, stable lesson URLs, videos, quizzes and exercises. No lesson renumbering, merging or deletion is approved.
- Do not modify the separate Python LMS/video engine or disclose proprietary code/architecture.
- No live email, external account, DNS change, paid service, enquiry admin dashboard or scheduler was activated.
- The temporary PostgreSQL cluster used for testing is STOPPED; its repository pointer was removed.

**Tomorrow's FIRST task: review the revised contact enquiry migration and security report, then re-test it in a fresh isolated PostgreSQL environment before considering ANY production activation.**

## 2. Framework and authoritative documents

Next.js 16.2.12 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, existing Supabase JS/SSR SDKs. Marketing/auth/learner/admin route groups are in src/app; public student samples in public/courses/ai-for-kids; professional modules/curriculum in src/modules and src/content. No dependencies were installed during this work.

Existing production site reference: https://architecting-ai.netlify.app/ . Local verification does not establish the current production deployment's behavior. No repository netlify.toml was found; runtime/dashboard settings remain external review items.

Read these documents in order:
1. This handover and START_HERE_TOMORROW.md.
2. **contact-migration-review.md**: latest hardening, real SQL evidence, recovery and lifecycle proposals.
3. **contact-enquiries.md**: architecture, environment, notification operations and release sequence.
4. **supabase-auth.md**: provider/callback integration and pending live-flow checklist.
5. **presales-final-verification.md**: earlier consolidated website implementation report.
6. **presales-review.md**: historical assessment. Its Netlify Forms proposal, founder/policy approval status and initial unavailable SQL/browser notes are superseded. Do not restore that architecture.

## 3. Original audit and priorities

The 21 October audit identified:
- Low-contrast Courses navigation on dark pages and inconsistent marketing headers, footers and styles.
- Unpublished Contact channels; apparent prototype login/account behavior.
- Misleading course availability: 18 student/16 professional lessons advertised versus 3/4 published samples.
- Missing founder identity and source-material-to-video capability explanation.
- Conflicting professional/workshop numbering, unfinished references and public engineering/demo-validation wording.
- Browser-local student progress described too broadly; missing Privacy/Terms links.
- No obvious motion pause controls; mobile, delivery, auth and full quiz scoring unverified.

Priorities: homepage credibility; genuine enquiries; genuine accounts/recovery; AI-assisted learning capability section; remaining pre-sales cleanup. Later approvals included the exact founder text, local policy pages, Supabase storage instead of Netlify Forms, modular Resend notifications, standardized subjects and migration hardening/isolated tests. These were LOCAL approvals, not production activation permission.

## 4. Completed local website improvements

### Homepage, navigation and presentation

Preserved the light homepage, imagery, carousel and animations without a whole-site redesign. Shared MarketingHeader/MarketingFooter, mobile menu and keyboard-operable Courses details menu now serve marketing pages. Corrected navigation/dropdown/footer/contact label and button contrast; screenshot findings were fixed and retested.

Course cards clearly show **3 samples / 18 planned** (students) and **4 samples / 16 planned** (professionals). Broader available-now wording was narrowed to samples. Student labels use Classes 7-9; wording clarifies starting without coding experience rather than promising a coding-free entire future curriculum. Student progress is browser-local; supported professional progress is account-based when enabled. Certificate wording is scoped to Part 1, with no accreditation/unsupported outcomes.

Added explicit slideshow/ticker pause controls, reduced-motion behavior, descriptive marketing/auth metadata and honest account-verification status. Existing production guards keep development previews/showcase routes unavailable. No new public self-service generation tool or admin enquiry dashboard exists.

### About/founder

Approved designation implemented: **Surjya Panigrahi - Founder, Architecting AI** (rendered with an em dash).

Approved paragraph:
"Architecting AI is an educational technology initiative founded by Surjya Panigrahi, focused on making AI education and digital learning more accessible. The initiative develops AI-assisted learning experiences for professional learners and school students, combining video lessons, practical activities and assessments."

No employer, invented certifications, partnerships, testimonials or achievements were added.

### AI learning capability section

Exact heading: **From Knowledge to Engaging Learning Experiences**.

Workflow: **Text / PDF / PowerPoint -> Narrated Video Lessons -> Notes, Activities and Quizzes**. Three desktop columns become one tablet/mobile column. Uses existing icons/styles and a genuine student sample link. Clearly describes assisted production; no public upload/generation control or promise of a live self-service portal. Proprietary engine details were not disclosed.

### Contact UI and privacy/terms

Retained Full Name, Email Address, optional Phone, four-category Enquiry Type and Message; added privacy acknowledgement and honeypot. Browser validation supplements server validation. Form submits only to /api/contact and retains the request UUID for same-payload retries. Non-JavaScript fallback uses POST, never personal data in a GET URL; unsupported encoding is rejected.

Netlify Forms is obsolete: its detection file and submission wiring were removed. Do not enable it as a parallel mechanism.

Local /privacy and /terms pages and footer links explain Supabase enquiry/account processing, possible email-provider notifications and browser-local progress. Privacy contact: **surjya.panigrahi@gmail.com**. Retention/deletion procedures remain pending approval; no fixed period or automatic enquiry deletion is promised. Do not collect unnecessary children's personal details.

### Authentication and remaining cleanup

Reused existing Supabase integration: signUp, email confirmation via PKCE/supported OTP, password login, logout with failure handling, forgot-password email, password update, cookie-backed server validation, scoped refresh proxy, canonical redirects and protected learner routes. Public lessons remain accessible signed out. AUTH_ENABLED=false gates login/register/recovery/confirmation while final policy/provider verification is pending; it does not change provider-level signup settings or replace database isolation.

Replaced public engineering/demo-validation wording and hid unfinished resource items without deleting source entries. Core lesson data, quiz activities and stable URLs remain preserved; only approved demo explanatory copy/resource visibility changed. Professional numbering was investigated but not silently reconciled.

## 5. Current Supabase enquiry design

Authoritative SQL: **supabase/migrations/20261021000100_contact_enquiries.sql**, revised locally and UNAPPLIED to production.

Anonymous visitor -> POST /api/contact -> server validation -> server-only Supabase client -> submit_contact_enquiry RPC -> one committed transaction -> generic success. Intake does not send email. Email failure cannot discard or duplicate a saved enquiry.

Checks: disabled/enabled flag; exact Origin allowlist; JSON content type; streamed body <=32 KiB; UUID v4 Idempotency-Key; unknown-field rejection; field lengths/email/category; honeypot; privacy acknowledgement. No enquiry/internal-note payload or raw provider/database error is returned/logged. No public reader, editor, deletion, cleanup or reconciliation HTTP route exists.

public.contact_enquiries fields: UUID id, full_name, email, nullable phone, enquiry_type, message, status default new (new/contacted/closed), created_at, updated_at, nullable contacted_at/internal_notes, consent_version. Indexes: created_at, status, lower(email). Trigger maintains follow-up timestamps. Claim response projects EXISTING created_at for email timestamps.

Private structures: requests (unique key/fingerprint/enquiry link), rate_buckets, notification_outbox, request_tombstones (minimal replay metadata), notification_resolutions (privileged audited recovery). All have RLS/FORCE RLS. No existing learning/auth tables are altered.

### Rate limiting, security and cleanup

Limits per fixed 15-minute window: 5 per IP hash, 3 per normalized-email hash, 100 globally. A single short advisory transaction lock protects duplicate checks, accounting, insert and metadata cleanup. Window is computed with clock_timestamp AFTER lock acquisition, not transaction-start now(). Lock wait is bounded to three seconds. Duplicate/conflicting keys are checked before counters. Exceptions roll back all counters/records together.

The global lock is acceptable for expected low volume; concurrent/timeout tests pass, not a production throughput benchmark. Fixed windows permit boundary bursts. Only the expected valid Netlify IP header is trusted in production; actual forwarding/runtime must be verified. Missing trustworthy IP fails closed. Raw IPs are not stored; server HMAC key must remain secret/stable.

PUBLIC/anon/authenticated direct privileges are revoked. Direct service-role table access is also intentionally revoked; only explicit contact RPC execution is granted to the existing backend role. SECURITY DEFINER functions have fixed search_path=pg_catalog and qualified references. Migration rejects an owner without trusted superuser/BYPASSRLS. Hosted ownership/default grants still require review. Secret/service-role keys bypass RLS and must stay exclusively server-side/operator-side, never NEXT_PUBLIC_.

CREATE SCHEMA fails safely on unexpected existing objects. If any environment applied an old draft, prepare a reviewed forward migration instead of rerunning this file. Real SQL execution caught/fixed a missing closing quote in the original consent_version insert and strengthened null/consent checks.

cleanup_contact_metadata is service-only, explicit-cutoff, bounded (default 500, allowed 1-1000), with a one-day technical safety floor. It deletes stale counters and compacts request links to minimal UUID/HMAC/timestamp tombstones under the intake lock. It is NOT scheduled and does NOT delete enquiries/outbox jobs. Tombstones preserve replay protection after approved enquiry deletion; do not purge them without an approved expiry/privacy design.

Retention/deletion remains an approval-only procedure: proportionately verify requester; reconcile in-flight/uncertain notifications; use a specifically reviewed transaction to preserve approved minimal replay metadata and remove selected enquiry/link/outbox/audit records; verify counts; handle provider/Gmail/backup copies separately. No automatic personal-data erasure or fixed retention commitment exists. See contact-migration-review.md for details.

## 6. Gmail notification requirements and behavior

Recipient: **surjya.panigrahi@gmail.com**.

Exact subject:

~~~text
[Architecting AI] New Enquiry | {Enquiry Type} | {Visitor Name}
~~~

Categories: Business Partnership; Course Enquiry; AI Video Generation Solution; General Enquiry. Server formatter uses stored category/name, revalidates category, strips CR/LF/control/Unicode line separators/embedded pipe delimiters from subject components and bounds the visitor name to 120 characters. From is the configured VERIFIED Architecting AI sender, never visitor-controlled. Reply-To uses the independently validated visitor email.

Plain-text body: enquiry ID; stored submission date/time in Asia/Kolkata, labeled IST (UTC+05:30); visitor name/email; optional phone; category; full message. No private internal notes, credentials or HTML interpolation. Actual domain/sender verification and Gmail delivery have NOT occurred.

Resend is the preferred implemented adapter, not an activated account. Operator CLI claims at most one job and requires both CONTACT_NOTIFICATION_ENABLED=true and --approved-send for live mode. Do NOT invoke live mode without approval. No public retry endpoint, live scheduler or signed delivery webhook exists.

Hardened state handling:
- Valid provider acceptance ID -> accepted; never reopened automatically. Accepted does not mean delivered to Gmail.
- Confirmed HTTP 429 refusal -> failed/backoff, at most five attempts and within the original 23-hour window.
- Timeout/network/malformed acceptance/HTTP 408,409,5xx/outcome_unknown or expired lease -> uncertain; NO blind automatic retry.
- Permanent rejection, exhausted attempts or expired safe window -> exhausted; no automatic resend/reset.
- Completion requires a matching unexpired lease; stale workers cannot overwrite newer attempts.
- Stable provider key: contact-enquiry/<enquiry UUID>. Preserve payload across unresolved attempts; do not generate a new key to bypass safeguards.
- resolve_contact_notification is privileged/audited, with no HTTP route. Operator must definitively reconcile history and no in-flight send, then mark accepted with verified provider ID, close, or confirm not sent before same-key retry under original limits. Accepted/exhausted jobs are not reset into automatic retry.

## 7. Test history and current results

Historical milestones: initial consolidated implementation reached 30 application tests; the email subject enhancement reached **41 passing tests**; migration hardening subsequently reached **42 passing application tests** and **28 isolated integration scenarios**. Earlier lower counts and unavailable-SQL/browser statements in historical docs are superseded.

Latest completed evidence (NOT rerun during this documentation-only checkpoint):
- npm test: **42 passed, zero failed**. Storage/provider adapters are mocked. Covers validation, persistence-before-success, duplicate/conflicting retries, limits/failures, subjects/header injection/Reply-To/IST/body, conservative notification outcomes and auth callback/configuration/validation.
- npm run test:contact:sql: **28 isolated scenarios passed** with REAL PostgreSQL 17 and Supabase-compatible roles. Includes one explicitly source-level API surface review, not a network PostgREST test. Cases: atomic insert/outbox/consent; duplicate accounting; rollback; concurrent intake (12 connections); IP/email/global caps; window rollover; bounded lock waits; cleanup/tombstones; service RPCs; unknown/exhausted/lease/recovery handling; concurrent workers; ownership/search_path/RLS/grants; whole-DDL rollback; untrusted owner rejection; Supabase-style default grants; legacy-table sentinel preservation.
- supabase/tests/contact_enquiries.sql passed on the real disposable cluster and rolled back fixtures.
- ESLint, standalone TypeScript, production build and git diff --check passed. Earlier fixture/lint/SQL findings were corrected; no remaining failed check is recorded.
- Prior browser checks: existing Playwright + headless Chrome, external requests blocked; **375/768/1440px**, 21 marketing page/width combinations. Navigation, responsive workflow, footer/form contrast, keyboard menu, pause/reduced motion, policy links and collection gates checked; no horizontal overflow/page errors.
- Both course indexes and all **seven published lesson routes** loaded signed out. Six distinct MP4 URLs preserved. Core course/data/lab/student comparisons passed; only approved demo explanatory copy changed.
- Protected dashboard/learn -> login; disabled POST /api/contact ->503, GET ->405; disabled callback ->503; old /__forms.html ->404; production dev/showcase routes ->404.
- Prior client-bundle scan found no privileged credential names/secret-key patterns; this is not exhaustive production security certification.

Real SQL used a NEW temporary loopback-only PostgreSQL 17 cluster, contact_review database, contact_test_owner and test anon/authenticated/service_role roles, plus disposable probe databases and synthetic data. It was not an existing server or ArchitectingAI connection. The cluster is STOPPED. No real provider/email, hosted Supabase/PostgREST verification or live account data was used.

Node direct TypeScript imports emit a non-failing module-type warning; no package-wide mode change was made just to suppress it.

## 8. Remaining issues and limitations

1. Production migration, hosted function owner/default grants/RLS and actual PostgREST role behavior need approved verification. Compatible PostgreSQL is real SQL evidence, not a full hosted deployment test.
2. Live signup/confirmation/login/logout/recovery/session expiry and cross-user isolation remain unverified. Existing-project redirect/template/settings review and approved test accounts are pending.
3. Resend account/key, verified sender/domain, any DNS/cost approval, real notification and Gmail inbox/Spam tests are pending. No delivery webhook or production scheduler exists.
4. Final policy/consent, retention/deletion authority, tombstone/audit lifecycle, backups/provider/inbox erasure procedures require approval before collection.
5. Netlify trusted IP forwarding, exact origins, secret storage and body/error logging need review before activation.
6. Numbering discrepancy remains: course catalogue has 12 future topics numbered 5-16; shifted workshop mapping has 13 remaining entries, gaps and numbering extending to 18. The four published curriculum-catalog entries/stable URLs are proposed authority. Do NOT delete, merge or renumber without approval.
7. Remote video playback and complete quiz scoring were not walked through. Git ignores some local MP4 paths; verify intended media-host delivery before release.
8. Full legal review/account removal process, broader accessibility and actual production metadata remain release checks. No unsupported compliance/accreditation/security guarantee.
9. No enquiry admin dashboard, ordinary-user enquiry access or admin privilege assignment is approved/implemented.

## 9. Approved and pending decisions

Approved LOCAL work: existing-design marketing improvements; preserve content/URLs; anonymous server API in EXISTING ArchitectingAI Supabase project; migration/security/outbox/rate/idempotency work; conservative unknown-outcome handling and isolated tests; modular Resend adapter; exact subject/recipient; supplied founder text; local Privacy/Terms; unfinished reference/public-copy cleanup; documentation. No new dependencies/paid services were needed.

Still pending: production migration; historic auth/progress migration application; live Supabase URLs/templates/signup/policy changes; production env settings; final privacy/retention/deletion/tombstone handling; account/data activation and test accounts; provider account/domain/DNS/cost/live email; scheduler/webhook/admin dashboard; curriculum merges/renumbering; any commit, push or deployment. Local approval does not authorize these automatically next session.

## 10. External services and environment

All gates stay false. .env.example has placeholders; ignored private .env.local was not edited or copied into this handover. Never paste keys into chat/source/logs.

| Variable | Purpose and pending action |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Existing ArchitectingAI URL; verify intended project securely. |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Existing browser-safe auth key, never a service credential. |
| NEXT_PUBLIC_SITE_URL | Approved canonical HTTPS production origin; local HTTP only in development; no credentials/path/query. |
| NEXT_PUBLIC_DEV_AUTH_BYPASS | false; cannot operate in production. |
| AUTH_ENABLED | false pending policy, configuration and approved live auth checks. |
| CONTACT_ENABLED | false pending reviewed migration/security/privacy and controlled tests. |
| CONTACT_ALLOWED_ORIGINS | Exact comma-separated origins, no wildcard; match local test port if needed. |
| CONTACT_HASH_SECRET | Stable server-only random secret, >=32 characters; rotation affects fingerprints/retries. |
| SUPABASE_SECRET_KEY | Existing-project server-only secret or approved legacy service-role value; NEVER NEXT_PUBLIC_. |
| CONTACT_NOTIFICATION_ENABLED | false. |
| CONTACT_NOTIFICATION_TO | surjya.panigrahi@gmail.com; worker restricts recipient. |
| CONTACT_NOTIFICATION_FROM | Approved VERIFIED sender/domain, still requires setup. |
| RESEND_API_KEY | Approved provider key, still requires setup; server/operator only. |
| AUTH_PROVIDER / DATABASE_PROVIDER / AI_PROVIDER | Optional existing labels; not credentials or automatic service setup. |
| CONTACT_TEST_PSQL | Optional local psql executable for disposable tests, not production connection configuration. |

No Gmail password, new Supabase project, Redis/rate-limit account or new paid package is required. Verify current hosting/provider limits before approving external activation; no cost commitment was made.

## 11. Production deployment and rollback - NOT authorized

1. Complete migration/security/privacy review and isolated tests; obtain explicit hosted-project approval.
2. Identify the real project/current deployment, capture authorized baseline tables/owners/grants and arrange an approved restorable backup. Do not copy credentials into reports.
3. Apply ONLY the reviewed contact migration through the approved process. Its transaction-wide rollback was tested. Stop on unexpected objects/owner/default grants; never run local bootstrap/reset tests against production or bulk-push historic migrations.
4. Verify real API-role denials and existing learning/account data preservation. Keep gates false.
5. Obtain separate deployment/env approval. Deploy compatible source with CONTACT_ENABLED=false, AUTH_ENABLED=false and CONTACT_NOTIFICATION_ENABLED=false. Public Next.js configuration generally requires rebuild; verify actual deployed values.
6. Approve test data/accounts; verify persistence, duplicates, failure behavior, live auth and isolation before activation. Approve email/provider/DNS separately and check a single notification plus Gmail receipt before scheduling sends.
7. Source rollback should restore a known approved deployment with gates off. No new live release was made here, so its prior release ID still needs capture before deployment.
8. Do NOT roll back collected data by dropping contact schema/tables/outbox/tombstones or touching learning tables. Preserve enquiries/provider evidence, reconcile uncertain sends and prefer a reviewed forward fix. Check backend/schema/worker payload compatibility together.

## 12. Tomorrow's ordered tasks

1. **FIRST: review and test the revised contact migration.** Read contact-migration-review.md and the FULL SQL, including untracked files. Review duplicate-before-rate checks, post-lock clock, bounded cleanup/tombstones, unknown/exhausted/lease/recovery states, owner/BYPASSRLS, FORCE RLS and grants. Re-test in a NEW isolated cluster before any production activation.
2. Check Git status against this inventory/fingerprints; preserve every modified/untracked file. Re-run application checks if source changes warrant it. Keep real SQL results separate from mocks.
3. Present migration/security and privacy/retention/tombstone/deletion decisions for explicit approval; agree which read-only hosted inspection and controlled tests are authorized. Do not equate local SQL passes with production-write authorization.
4. After approval only, review hosted ArchitectingAI owner/default grants/PostgREST, Netlify IP/origins/secrets/logging and production-table preservation. Prepare the narrowly scoped migration/deployment plan.
5. Obtain final policy/consent and provider/sender/domain/cost approvals; keep all gates false.
6. After separate auth-setting/test-account approval, verify signup/verification/login/logout/session/recovery and two-user isolation. Keep public samples accessible.
7. After separate contact/email test approval, verify saved-once intake, direct-role denials, no blind retry and Gmail inbox/Spam receipt. Provider acceptance alone is not delivery.
8. Review curriculum mapping without modifying entries; verify remote video playback/full quiz scoring and the final pre-sales walkthrough before a release/partner-presentation decision.

## 13. Exact commands for project and tests

PowerShell, repository root:

~~~powershell
Set-Location -LiteralPath 'C:\Surjya\ArchitectingAI\architecting-ai-v2'
git branch --show-current
git status --short --untracked-files=all
npm run dev
# Stop dev before switching to production-build checks.
npm test
npm run lint
npx tsc --noEmit
npm run build
npm run start -- --port 3100
git -c core.safecrlf=false diff --check
~~~

Do not execute these as one blind batch: dev/start are long-running servers. Keep gates false. No dependency installation is needed in the current workspace. Tests used Node 24.18.0; use a suitable Node version supporting direct TypeScript imports. Safe disabled notification check: npm run contact:retry. Do not add --approved-send or enable live flags without approval.

### Fresh isolated SQL test commands - NEXT SESSION ONLY

Review the SQL first. Use a NEW temporary cluster and synthetic data, NEVER production. Check port 55439 is free; check each external command's exit code and stop on failure. PostgreSQL 17 exists outside PATH. The harness checks loopback connection/test owner/database marker before resetting fixtures. Run it alone. Always stop only the temporary cluster you just created, even if a test fails.

~~~powershell
$contactPgBin = 'C:\Program Files\PostgreSQL\17\bin'
$contactPgRoot = Join-Path $env:TEMP ('architecting-ai-contact-review-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $contactPgRoot | Out-Null
& (Join-Path $contactPgBin 'initdb.exe') -D (Join-Path $contactPgRoot 'data') -A trust -U contact_test_owner --no-locale --encoding=UTF8
& (Join-Path $contactPgBin 'pg_ctl.exe') -D (Join-Path $contactPgRoot 'data') -l (Join-Path $contactPgRoot 'server.log') -o '-h 127.0.0.1 -p 55439' -w start
& (Join-Path $contactPgBin 'psql.exe') -X -h 127.0.0.1 -p 55439 -U contact_test_owner -d postgres -v ON_ERROR_STOP=1 -c 'CREATE DATABASE contact_review'
$contactSqlArgs = @('-X','-h','127.0.0.1','-p','55439','-U','contact_test_owner','-d','contact_review','-v','ON_ERROR_STOP=1')
& (Join-Path $contactPgBin 'psql.exe') @contactSqlArgs -c "COMMENT ON DATABASE contact_review IS 'architecting-ai disposable contact review'; CREATE ROLE anon NOLOGIN NOBYPASSRLS; CREATE ROLE authenticated NOLOGIN NOBYPASSRLS; CREATE ROLE service_role NOLOGIN BYPASSRLS;"
& (Join-Path $contactPgBin 'psql.exe') @contactSqlArgs -f 'supabase/migrations/20261021000100_contact_enquiries.sql'
npm run test:contact:sql
& (Join-Path $contactPgBin 'psql.exe') @contactSqlArgs -f 'supabase/tests/contact_enquiries.sql'
# Finally: stop ONLY this newly created temporary cluster.
& (Join-Path $contactPgBin 'pg_ctl.exe') -D (Join-Path $contactPgRoot 'data') -m fast -w stop
~~~

Bootstrap creates test roles ONLY in the disposable cluster, not the hosted project. Never target an existing PostgreSQL data directory/project URL, never run these reset tests against production, and do not replace them with a generic supabase db push. No test/server/migration commands above were executed during this checkpoint.

## 14. Git checkpoint and complete file inventory

Branch: **presales-readiness**. HEAD: **a7830f2b236698d0dd4a0455f3a5f9e3353f2c01**.

At capture: **26 modified tracked files**, **25 pre-existing untracked files**, plus these two new handover documents. Existing implementation work is unstaged/uncommitted. No stash/reset/clean/stage/commit was performed. The existing files are preserved on disk; this handover is not a Git commit or an encrypted backup.

Git diff alone omits untracked implementation files, including the migration/API/tests. Include ALL of the following in tomorrow's review. Never discard this work with git clean, reset --hard, checkout/restore or a replacement branch.

~~~text
 M .env.example
 M README.md
 M docs/supabase-auth.md
 M package.json
 M src/app/(auth)/auth/confirm/route.ts
 M src/app/(auth)/forgot-password/page.tsx
 M src/app/(auth)/login/page.tsx
 M src/app/(auth)/register/page.tsx
 M src/app/(marketing)/about/page.tsx
 M src/app/(marketing)/contact/page.tsx
 M src/app/(marketing)/courses/[courseSlug]/page.tsx
 M src/app/(marketing)/courses/page.tsx
 M src/app/(marketing)/learning-paths/page.tsx
 M src/app/(marketing)/workshops/[workshopSlug]/page.tsx
 M src/app/(marketing)/workshops/page.tsx
 M src/app/layout.tsx
 M src/components/home/public-homepage.tsx
 M src/components/layout/marketing-shell.tsx
 M src/lib/supabase/config.ts
 M src/modules/auth/components/logout-button.tsx
 M src/modules/auth/components/registration-form.tsx
 M src/modules/auth/current-user.ts
 M src/modules/auth/validation/auth-validation.ts
 M src/modules/learning-experience/components/tool-dock.tsx
 M src/modules/learning-experience/data/demo-learning-experience.ts
 M src/styles/globals.css
?? docs/contact-enquiries.md
?? docs/contact-migration-review.md
?? docs/presales-final-verification.md
?? docs/presales-review.md
?? scripts/retry-contact-notifications.mjs
?? src/app/(auth)/reset-password/page.tsx
?? src/app/(marketing)/privacy/page.tsx
?? src/app/(marketing)/terms/page.tsx
?? src/app/api/contact/route.ts
?? src/components/contact/enquiry-form.tsx
?? src/components/layout/marketing-chrome.tsx
?? src/lib/supabase/contact-server.ts
?? src/modules/auth/activation.ts
?? src/modules/auth/components/password-recovery-form.tsx
?? src/modules/contact/notifications.ts
?? src/modules/contact/service.ts
?? src/proxy.ts
?? supabase/migrations/20261021000100_contact_enquiries.sql
?? supabase/tests/contact_enquiries.sql
?? tests/auth-callback.test.mjs
?? tests/auth-config.test.mjs
?? tests/auth-validation.test.mjs
?? tests/contact-sql.integration.mjs
?? tests/contact.test.mjs
?? tests/notification-format.test.mjs
?? docs/PROJECT_HANDOVER_2026-10-21.md
?? docs/START_HERE_TOMORROW.md
~~~

### Pre-existing local-file fingerprints

SHA-256 fingerprints cover every modified/untracked file present before these two handover writes. They allow identification of later edits and reveal no secret values. Ignored .env.local, generated output and Git internals are not copied. Neither handover hashes itself.

~~~text
5bc49fd808895c480339361f32556a2e6aee88d245bc36352b36ce2014282cbe  .env.example
9c7aad8890d3570908b0c008f1428d63a97b58e28eb1dda8eb5b9a822c79992e  README.md
983a6ed0e2341f0cedd075d88cdfb88218368b98268a67cae54fe1bce3a8cb8b  docs/supabase-auth.md
6c80180a9c54c446a122d984b4395748256c6353d8b0b07a7ecd4e24a6111bbd  package.json
0b49c2222c98fede89bec23c25649bf6efb8a951d556cf78dac2ac5ffb25af62  src/app/(auth)/auth/confirm/route.ts
0dda8a73b8860872cd2879438bbc65e7b9e0224d54fc9bcc9d936021896cd811  src/app/(auth)/forgot-password/page.tsx
bb5f54cd50b081e7fd8cb378ad10a8279b82d66374e91a63383629ed01111d55  src/app/(auth)/login/page.tsx
168d4398e4d66ed3430fda639df00e6b173c28d6ce26db67a976b7cff57d9b3f  src/app/(auth)/register/page.tsx
e81c4b0bad1b226823913a4cb45fbe4c3ed6484f15ea93808865adec1267ebd9  src/app/(marketing)/about/page.tsx
44c152d61bd46dded513d16ffcb4445e17f0f3903295e38319dccb7365854b4c  src/app/(marketing)/contact/page.tsx
3a4596167ce2a392a45e4762f43b80c09e2d8f6b05daca9300a7dcabd1ecc18c  src/app/(marketing)/courses/[courseSlug]/page.tsx
f637c6415363e99d9a15d82366d44ee99ac1fd78eacefa4d96bf6e39ddd156a8  src/app/(marketing)/courses/page.tsx
5f2e5c50b12343293c29102ced6143383e41c9b1b1aa8b63a6609525e31d7c2e  src/app/(marketing)/learning-paths/page.tsx
313bff060d51f4b4f06ef2cc23ed69005a89589d632b3bbbb2b422b47946ffa0  src/app/(marketing)/workshops/[workshopSlug]/page.tsx
691cdb696834e14ed75b639670f9b78c064e5924d5374a08faa484f7465d3a65  src/app/(marketing)/workshops/page.tsx
b39133e098057dd79750e07dcdbf7b3aec97136ad4571381cd52167c63eeb0a2  src/app/layout.tsx
a020e7519aa7a78a9fbc0ab82061b5838784d9d4845e4949f13e576d73431935  src/components/home/public-homepage.tsx
ff2641671f8c164a0e99d431911dd4e5b2810975db541573d230d706f47d3187  src/components/layout/marketing-shell.tsx
a0423efd0b393a87736f29674ff3decc28504e4f4526c785997fff065f3c4f1e  src/lib/supabase/config.ts
875503b37ba6fe0663090918f2ba578c307cb5a7b5b4a53ca6c9ef19a4f4f890  src/modules/auth/components/logout-button.tsx
52e0adba886dbedd6b4d923d51bce57dee8315ddb47f784c7c91544875f770a3  src/modules/auth/components/registration-form.tsx
03f7304bca8fd01a26aea2c5d98d41c6111cb130a422b466ed8c0ce4c068c323  src/modules/auth/current-user.ts
73885c51b19f074b608ae1518c6237066e3690a6e8caba81865f4d04c2b59676  src/modules/auth/validation/auth-validation.ts
81b0411bdbc419d03f290cfaa74018d4382135629d4cd1164690115b89515cf4  src/modules/learning-experience/components/tool-dock.tsx
de1407e5676789b0ace675d54073fdcf37f992b62164a97dc15ca07b2fada0de  src/modules/learning-experience/data/demo-learning-experience.ts
8be4950b9ec35ede7373cd452701e5c6c1c48b0e5e9cd665e0b7bf5feff34e4e  src/styles/globals.css
4ef2e20b9c762be14517702365cbd8206d1c038e1c90658d0c793e59e5ff5d0f  docs/contact-enquiries.md
da578dca3b4fe27d5baa53e14945b52b86128d29425c884c2e7e0672f254f8c2  docs/contact-migration-review.md
cb020b189c64b2a14343e43ca12b28dfa9622c9a2515b5f751e042131614cfd2  docs/presales-final-verification.md
765294a47bd0f57701db9ef3a982480b9145af5f752bce5672cffa8bf5cd42a9  docs/presales-review.md
9911dffd641621609c25cea1890162d9d76fcef44cc2a7b3d2cc40f675b9ab44  scripts/retry-contact-notifications.mjs
6db882e6de10b3ddf399e8f17f6b206ae041d7a71e1282d0244f53738d61c2a8  src/app/(auth)/reset-password/page.tsx
10b0e47eb9f0ed8c70d88bca060003e702a03547c4622e4036a2f63a0deb4847  src/app/(marketing)/privacy/page.tsx
e3334e8a26066258a69924dae85296c70aa1f89180cb2f4106e7bc888390c479  src/app/(marketing)/terms/page.tsx
a49ffe5a4e8bae51d8ed378c6d2ac5518af59bdf3927378212d9739578f83ba5  src/app/api/contact/route.ts
56d0b8e050a3aef12c49d30b1a03703f6b8facdd638e8c7d2214e037452f1bcc  src/components/contact/enquiry-form.tsx
8bc6477dd4789840cc9a14a51ca3a43e81bdfb257893e1b091a3e93bc43c0426  src/components/layout/marketing-chrome.tsx
7c94a4442be0b162b1ee832274ed165fd222ca3484ef0e88f303fd4544147e3e  src/lib/supabase/contact-server.ts
c58bc7134566d33ccb4082d72ebe8813878316ea312caa4375bbe0dde8a0bc57  src/modules/auth/activation.ts
5aaaa5867cb6e4f08cf5fe04b3efa38fc02058c58c583cfa477c724377abf2e0  src/modules/auth/components/password-recovery-form.tsx
b644840d465ed17598835bba3e7ac43c1e0a8dd55236fa51d7f9bbe225ddc41b  src/modules/contact/notifications.ts
a5ef460fd18047a22a39288ed8f8412e61ee2af3ce383823e08c0097bf5aee64  src/modules/contact/service.ts
d0adac571baf9ef0a0bf66365143e312a7e5d2b670812eed4914b44944988f9d  src/proxy.ts
55c8f144ebf36491ecee464c16e3bafdfa08ff7a8d78dab867ff8ad8c0ba5eb7  supabase/migrations/20261021000100_contact_enquiries.sql
12d914398512fb6f847a1d0c4c994b388a75c7462a582a609b17ebe6757862c8  supabase/tests/contact_enquiries.sql
68d6c9cd9bf68e5a3a54f7583285b12d45fa854fcaa7961fba7bd25ab9e4ba48  tests/auth-callback.test.mjs
4e76c352d446ddb5c29b1a2bb7f3a922117467375d04a3448e40514cbf67bd9f  tests/auth-config.test.mjs
f43cd912835fccef658cc003837ff9a04e9b1a5cd6ad95badf3deee06cf5304e  tests/auth-validation.test.mjs
5cbe1f3688a94ccca80029d08fb717b9f870a65011ed70e8889328031cb130ac  tests/contact-sql.integration.mjs
6d4967ff6cbf50b7050f70b07638e63b5edf5ee50f0a813992eb5f11eff6bf16  tests/contact.test.mjs
167a437118954d457216503b61662d726f8d1320accb7099b729cc1a7881ce12  tests/notification-format.test.mjs
~~~

## 15. Checkpoint verification and stop

Both handover files were saved and read back. Every pre-existing file in the captured working-tree inventory was hashed before and after documentation writes and remained unchanged. The current branch was rechecked. No application functionality, database, service or environment configuration changed during this checkpoint. No tests, migrations, servers, email, commit, push or deployment were run here; all test results above refer to completed earlier runs. Work stops now; resume only on the user's next request.
