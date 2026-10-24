# Consolidated POC corrections — local review

Baseline: main `99c90a1512090a62a703f25c3c26942ca7d9b81e`.
Local branch: `fix/consolidated-poc-readiness`.
No commit, push, PR, merge, production setting change, real user, email, enquiry or deployment is authorized/performed by this work.

## Activation proposal (owner approval required; not applied)

Set these nonsecret feature values only after the corresponding service checks:

| Name | Proposed Production value | Scope / prerequisite |
| --- | --- | --- |
| AUTH_ENABLED | true | Functions; enables real provider-validated sessions, password login and recovery |
| AUTH_REGISTRATION_ENABLED | true | Functions; requires AUTH_ENABLED; adult POC registration only |
| ASSESSMENT_ENABLED | false | Functions; leave false while certificate-producing RPC and answer-key exposure remain unverified |
| CONTACT_ENABLED | true | Functions, only after trusted request context and Contact RPC permissions are verified |
| CONTACT_ALLOWED_ORIGINS | https://architecting-ai.netlify.app | Functions; exact origins; add a custom domain only when actually used |
| NEXT_PUBLIC_SITE_URL | https://architecting-ai.netlify.app | Builds and Functions; canonical HTTPS origin |
| NEXT_PUBLIC_DEV_AUTH_BYPASS | false | Builds and Functions; code also forces bypass off in production |
| CONTACT_NOTIFICATION_ENABLED | false | Actual worker environment; do not enable until sender, schedule, credentials and delivery are verified |

NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must reference the intended project and be available to Builds and Functions. SUPABASE_SECRET_KEY and a strong CONTACT_HASH_SECRET of at least 32 characters are server-only Functions values. No secret values are listed or changed here. Optional notification names are RESEND_API_KEY, CONTACT_NOTIFICATION_FROM and CONTACT_NOTIFICATION_TO; the existing worker restricts the destination to the existing owner inbox.

All boolean gates accept trimmed case-insensitive `true`, and fail closed for missing, false or other strings. Netlify Functions receive the values associated with their deployment; dashboard changes alone do not update an existing function deployment. The client IP comes only from the documented @netlify/functions getContext().ip metadata. Arbitrary IP forwarding headers are ignored. Context absence in production returns unavailable, never a shared/guessed client IP.

## Hosted checks still required

- Verify Netlify's current adapter supplies the trusted Context to the Next route. No production request has been submitted.
- Review hosted Contact RPC signatures, function owner, search_path, grants and RLS through a read-only catalog path. The existing untracked migration and all SQL files are unchanged. Do not bulk-apply migrations.
- Verify profiles, progress and assessment user isolation against the actual hosted policies. Mock owner-filtered reads are not RLS verification.
- The configured project's public Auth settings previously reported email enabled, signup allowed, auto-confirmation enabled and anonymous users disabled. No settings were changed. Confirm the intended production project, exact redirect allowlist, email-confirmation decision and SMTP/rate limits before activation. Auto-confirmation is not proof of email ownership.
- Approve adult demonstration accounts and a controlled live login/registration/recovery test separately. No real account or email was used locally.
- Existing authenticated assessment scoring uses the provider RPC; its result supersedes client calculations. However the client question bank still exposes answers, and the existing submission RPC can issue certificates. Both app assessment entry points are separately gated off by default. This UI gate does not revoke provider RPC privileges. Before certification, approve a server-side question delivery/post-submission feedback design and independently verify RPC authorization/scoring. No scoring algorithm, certificate rule, lesson content or database object was silently changed.
- Notifications remain off. Submission queues an outbox record; only the explicitly approved worker processes it. Provider acceptance is not inbox delivery. External scheduling remains unverified.

## Policy decisions requiring owner approval

The public text is a factual adult LMS/video POC notice, not a claim of legal compliance. No payments or commercial school enrolment are offered. It does not promise automated deletion, delivery or tamper-proof certificates.

Before real collection, approve the operator identification, effective date, privacy contact, retention period and start event, deletion/identity-check process, backup lifecycle, enquiry deduplication tombstones, notification audit records, provider copies and inbox copies. The earlier six-month proposal is not an implemented deletion capability; do not publish it as an automatic promise. Approve the final Privacy and Terms text before release.

## Local verification boundary

The real Next routes and Supabase SDK are exercised against a loopback-only in-memory provider/RPC fixture with synthetic adult data. This verifies application integration, not Supabase itself. No SMTP, real credentials, hosted database writes, production users or production enquiries are exercised. Existing student quizzes persist only in the disposable browser context.

The 17 pre-existing uncommitted files are protected by SHA-256 comparisons. All 16 AI Architect entries and existing lesson/video materials remain unchanged. Next.js 16.4.3 generated AGENTS.md and updated next-env.d.ts; these are reported as generated compatibility artifacts, not production settings changes.

## Completed verification

- PASS: ESLint, TypeScript, 50 unit tests, Next.js 16.4.3 production build, git diff --check.
- PASS: npm audit and npm audit --omit=dev: zero vulnerabilities. Resolved Next.js 16.4.3, Sharp 0.35.5, PostCSS 8.5.23, Nanoid 3.3.20 and source-map-js 1.2.2.
- PASS: 43 desktop/mobile navigation checks; both Privacy new-tab and same-tab return paths; draft and explicit-consent preservation.
- PASS: desktop/mobile catalogue contrast, six widths (320,390,768,900,901,1440), all 16 Architect entries, four professional and three student lesson destinations, all three student quizzes and browser-local best-score persistence, admin/dev 404 and unauthorized protected routes.
- PASS against isolated provider: desktop/mobile password login, invalid credentials, duplicate/valid registration, validation, profile creation, owner-filtered data reads, expired-session refresh, logout failure/retry/success and assessment gate.
- PASS against isolated provider: missing recovery session rejected; simulated recovery request, PKCE callback and password update; no real email. Callback now uses the configured canonical public origin rather than an internal proxy origin. Reset readiness is based on provider-validated server user state.
- PASS against isolated RPC: Contact True parsing, explicit consent, shared field errors, privacy navigation, 503/retry/200 and draft clearing, origin/consent denial. Production-mode unit tests reject forged IP headers and fail closed without trusted context.
- PASS: 27 final browser assets checked for credential-shaped strings and accidental copies of configured server secrets; none found. No values displayed.
- NOT VERIFIED: real hosted signup/login/recovery emails, hosted profile/progress/contact persistence, hosted RLS/grants, Netlify adapter Context at runtime, actual notification delivery, certificate integrity, Safari/Firefox and physical devices.
- No SQL integration script was run against any database. Existing SQL files and migrations were inspected, not applied or changed.

## Exact correction/compatibility file manifest

```text
AGENTS.md
docs/POC_CONSOLIDATED_REVIEW.md
next-env.d.ts
package-lock.json
package.json
scripts/retry-contact-notifications.mjs
src/app/(admin)/admin/page.tsx
src/app/(auth)/auth/confirm/route.ts
src/app/(auth)/forgot-password/page.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/reset-password/page.tsx
src/app/(learner)/dashboard/page.tsx
src/app/(marketing)/about/page.tsx
src/app/(marketing)/contact/page.tsx
src/app/(marketing)/privacy/page.tsx
src/app/(marketing)/terms/page.tsx
src/app/(marketing)/workshops/[workshopSlug]/part-1-assessment/page.tsx
src/app/api/contact/route.ts
src/components/contact/enquiry-form.tsx
src/components/contact/privacy-contact-return.tsx
src/components/home/public-homepage.tsx
src/config/boolean.ts
src/modules/auth/activation.ts
src/modules/auth/components/auth-frame.tsx
src/modules/auth/components/login-form.tsx
src/modules/auth/components/logout-button.tsx
src/modules/auth/components/password-recovery-form.tsx
src/modules/auth/components/registration-form.tsx
src/modules/contact/client-ip.ts
src/modules/contact/service.ts
src/modules/contact/validation.ts
src/proxy.ts
src/styles/globals.css
tests/auth-callback.test.mjs
tests/auth-poc.browser.mjs
tests/contact-submission.browser.mjs
tests/poc-readiness.test.mjs
tests/poc-ui.browser.mjs
tsconfig.json
```

## Preserved unrelated work

All 17 entries below retain their original SHA-256 fingerprints:

```text
docs/PROJECT_HANDOVER_2026-10-21.md
docs/START_HERE_TOMORROW.md
docs/contact-migration-review.md
docs/contact-production-migration-checklist.md
docs/local-contact-submission-readiness.md
docs/presales-final-verification.md
docs/presales-review.md
docs/supabase-production-baseline-2026-10-22.md
docs/ui-navigation-local-verification.md
supabase/inspection/export_essential_application_data.sql
supabase/inspection/final_missing_baseline_checks.sql
supabase/inspection/post_contact_migration_verification.sql
supabase/inspection/pre_contact_migration_baseline.sql
supabase/inspection/rollback_contact_objects.sql
supabase/migrations/20261021000100_contact_enquiries.sql
supabase/tests/contact_enquiries.sql
tests/contact-sql.integration.mjs
```

## Release recommendation and next approval

NO-GO for unrestricted full POC activation until hosted configuration, authorization/storage and trusted request context checks are complete. Local code is ready for owner review; this is not a production-service success claim. No known dependency high/critical finding remains in npm audit. High blockers: hosted Contact RPC/RLS readiness; live auth/session/user-isolation verification; certificate-producing assessment authorization/answer exposure. Medium: owner approval of POC policy wording and retention operations, SMTP/redirect allowlist and notification scheduling. Low: other browsers/physical devices and nonblocking Node module-type warnings.

Approve the source diff and policy text first; then authorize read-only hosted settings/catalog checks. Approve adult demonstration accounts and any controlled live user/email/enquiry tests separately. Decide which features to enable using the proposed flags. Keep ASSESSMENT_ENABLED and CONTACT_NOTIFICATION_ENABLED false. Do not publish with the existing CONTACT_ENABLED=True until Contact prerequisites are met: the corrected parser will recognize that value. Only after these decisions approve one local commit and one planned GitHub-main publication/automatic Netlify deployment; none is performed now.
