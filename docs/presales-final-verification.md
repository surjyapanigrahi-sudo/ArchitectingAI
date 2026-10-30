# Consolidated pre-sales local verification - 21 October 2026

Branch: presales-readiness. All existing uncommitted work preserved. LOCAL ONLY: no migration applied, live settings changed, account created, real email sent, commit, push or deployment. No dependencies installed and no separate Python LMS/video-generation engine touched.

## PASS / PARTIAL / FAIL

| Priority | Result | Evidence and limits |
|---|---|---|
| Homepage | PASS (local) | Light homepage, images and animations retained. Shared navigation/footer, keyboard Courses menu, contrasting links, explicit sample counts and honest account/progress wording. Browser checks at 375/768/1440; pause and reduced motion checked. |
| Contact Us + Supabase persistence | PARTIAL | Server-only anonymous API, migration, private tables/RPC grants/RLS definitions, transactional idempotency/rate limits/outbox and validation implemented. Application persistence/failure tests use injected fake storage. Real migration, transaction and RLS tests NOT executed. Production gate remains off. |
| Gmail notification readiness | PARTIAL | Resend adapter, secure one-job operator command, stable provider idempotency key, leased/bounded retries and private status storage implemented. Disabled worker verified with no DB/network work. No account/domain/DNS setup, scheduled worker, live send, signed delivery webhook or Gmail receipt test. Provider accepted is not delivered. |
| Login / registration / recovery | PARTIAL | Existing provider retained; registration, confirmation, password login/logout and recovery/reset code present; session refresh and canonical redirect validation implemented. Unit tests cover validation, callback gating, safe redirects, recovery code/OTP and expired/malformed links. AUTH_ENABLED remains false. Full live-account, mailbox, refresh/expiry and cross-user tests remain pending. |
| AI learning capability section | PASS (local) | Exact heading, text/PDF/PowerPoint, narrated videos and notes/activities/quizzes; three desktop columns and one mobile/tablet column. Genuine sample link; assisted production copy, no live upload/generation controls. |
| About Us | PASS (local) | Approved Surjya Panigrahi founder designation and supplied paragraph added. No employer, invented credentials, partnerships or achievements. |
| Privacy and Terms | PARTIAL | Local pages and shared footer links implemented; enquiry purpose/Supabase/email provider/account/browser-storage explanations and approved privacy contact present. Retention/deletion and final policy review remain explicit activation blockers. No fixed retention or automatic deletion claim. |
| Remaining audit corrections | PARTIAL | Public engineering copy cleaned up, unfinished resources hidden without deleting source entries, primary marketing/auth metadata improved and progress claims clarified. Professional numbering proposal remains documented; no lesson deletion/merging/renumbering. Production dev routes already return 404. |
| Existing lessons and videos | PARTIAL | All seven published lesson routes return 200 signed out. Twenty-six core course/data/lab/student files compare unchanged to HEAD after Windows BOM/line-ending normalization; only sample demo descriptive copy was edited. Six distinct MP4 URLs match the original references. Remote playback and full quiz-scoring walkthroughs NOT performed. |

## Test results

- npm test: 30 passed, 0 failed. Contact tests cover bounded bodies, malformed/invalid input, private field/status injection, consent/honeypot, content type/origin/activation/key guards, confirmed persistence before success, duplicate/conflicting retry, storage failure, rate-limit response, notification failures, stable email keys, accepted status and acknowledgement failure. Auth tests cover validation and callback/configuration controls. No real database or email calls are made.
- npm run lint: passed after correcting findings.
- npx tsc --noEmit: passed.
- npm run build: passed, including TypeScript.
- git diff --check: passed.
- Local Chrome via an existing Playwright installation: 21 width/page combinations passed (375/768/1440 across homepage, Contact, About, Privacy, Terms and both course indexes). No horizontal overflow. Keyboard menu, sample counts, responsive workflow, account gates and footer/privacy links checked. Screenshots inspected; low-contrast footer/button findings corrected and retested. External browser traffic was blocked.
- Seven published lessons return 200; protected dashboard/learn return 307 to login. Disabled POST /api/contact returns 503; GET returns 405; disabled confirmation callback returns 503; old /__forms.html returns 404. Development preview/showcase routes return 404 in production build. Pause and reduced-motion checks passed without browser page errors.
- Client-bundle scan found no privileged credential names or secret-key patterns. Private .env.local was not edited; no credentials added to source. This is a pattern/isolation check, not a claim of exhaustive external security auditing.
- Isolated SQL/RLS suite is provided in supabase/tests/contact_enquiries.sql but NOT run: psql, Docker and Supabase CLI were not found on PATH. No production DB was used as a substitute. Real persistence, SQL concurrency/rates/leases and unauthorized-role denials are release blockers until isolated testing passes.
- Local Node emits a non-failing module-type warning when directly testing TypeScript; no application/package module mode was changed just to suppress it.
- Earlier lint and test-fixture findings were corrected. No remaining failed local checks; unavailable live/SQL/video checks are marked untested, not passed.

## Migration, environment and operations

Read [contact-enquiries.md](contact-enquiries.md) for table/privilege design, exact migration/test instructions, privacy gates, environment variables, notification behavior and the complete live-auth checklist. The migration intentionally fails on an existing contact_private schema or contact table so unexpected structures are investigated rather than overwritten. Do not apply every historic migration or run SQL tests against production.

New server-only configuration: CONTACT_ENABLED=false, CONTACT_ALLOWED_ORIGINS, CONTACT_HASH_SECRET, SUPABASE_SECRET_KEY, CONTACT_NOTIFICATION_ENABLED=false, CONTACT_NOTIFICATION_TO=surjya.panigrahi@gmail.com, CONTACT_NOTIFICATION_FROM and RESEND_API_KEY. AUTH_ENABLED=false controls app account entry/callbacks. Existing public Supabase URL/key and NEXT_PUBLIC_SITE_URL remain required; production redirects require a canonical HTTPS origin. .env.example has placeholders only.

The trusted Netlify IP header and actual runtime behavior must be verified before enabling contact intake. Missing trustworthy IP/configuration fails closed. Supabase secret credentials bypass RLS and must stay server-only; also review platform logging to avoid recording submitted bodies or sensitive provider errors. The API never returns enquiry rows or internal notes, and there is no public/admin enquiry viewer.

Notification recipient is fixed to surjya.panigrahi@gmail.com. Resend still needs an approved account/key, verified sender on a domain you control, any approved DNS work and a current cost review. No Gmail password is used. Notifications queue independently of form success, with retries limited to the provider's supported deduplication window and manual reconciliation afterwards. No automated delivery receipt tracking is claimed.

## Recommended approval/deployment sequence

1. Review policy/consent version, retention/deletion and operational-data handling; confirm production origin/IP and credential boundaries.
2. Use an isolated Supabase-compatible database to apply ONLY the new contact migration and run its rollback SQL tests. Resolve any failures before release.
3. Obtain explicit approval for applying the reviewed migration to the EXISTING production project. Verify resulting RLS/grants/function owner without changing auth/course/progress tables.
4. Obtain separate deployment approval. Deploy with all collection/send gates false; verify configuration, client-secret isolation and runtime behavior.
5. Approve controlled contact and auth test accounts/data plus existing Supabase redirects/templates. Verify saved/duplicate/failed enquiries and anonymous/student denials before enabling real collection. Verify complete registration/login/logout/recovery and cross-user isolation before account activation.
6. Obtain separate Resend/sender/DNS/cost/live-email approval; run one approved notification, verify provider acceptance and Gmail inbox/Spam. Decide separately whether to configure a private scheduled worker. Saved enquiries must survive any email failure.
7. Keep the curriculum mapping as a proposal until explicit numbering/merging approval. All current lesson URLs and planned entries remain preserved.

## Changed/new files (full branch working tree)

```text
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
?? tests/contact.test.mjs
```
