# Adult POC release follow-up

Baseline release commit: 169ac457132798bfcbbd4c67623b441170d0fe75. This document records its scoped follow-up; no deployment is performed.

## Owner-confirmed hosted evidence (not repeated)

- Production branch main and automatic publishing; matching Netlify/Supabase project.
- AUTH_ENABLED=true, AUTH_REGISTRATION_ENABLED=true, ASSESSMENT_ENABLED=false, CONTACT_ENABLED=True and CONTACT_NOTIFICATION_ENABLED=false.
- Supabase password email provider/signup enabled; email confirmation and anonymous sign-in disabled for the controlled adult POC.
- Contact RPC existence, basic permissions and RLS verified previously.
- Required authenticated profile SELECT/INSERT/UPDATE and course-progress SELECT grants are true. Profiles and progress tables have own-user RLS.
- record_part1_experience_progress(text,text,boolean) is SECURITY DEFINER, derives user_id from auth.uid(), rejects anonymous callers and validates lesson/experience IDs. Effective EXECUTE: anon=false, authenticated=true.
- start_part1_assessment(text[]), submit_part1_assessment(uuid,jsonb), claim_part1_certificate(): effective EXECUTE anon=false, authenticated=false, service_role=true. Hosted permissions intentionally differ from historical local migrations; do not replay those migrations to undo the restriction.
- The actual v2 production origin is https://architecting-ai.netlify.app (with the hyphen).

## Follow-up implementation and local verification

- Password recovery requests the exact /auth/confirm callback through getPublicSiteUrl(), which reads NEXT_PUBLIC_SITE_URL. The callback recognizes the SDK PKCE redirectType=recovery marker and sends the provider-validated session to /reset-password; older query/OTP recovery links remain supported.
- Callback tests use the hyphenated production origin as configured input. Source code does not hardcode either production hostname. Contact origin protection continues to read CONTACT_ALLOWED_ORIGINS.
- Contact HTTP 503 explains temporary unavailability, retained draft and email fallback. Missing/invalid trusted platform IP fails before persistence; caller-supplied forwarding headers remain ignored.
- Five callback tests, isolated browser recovery/password update, desktop/mobile Contact 503/retry/200, consent and origin-denial checks, focused ESLint and no-emit TypeScript checks pass. Fixtures use loopback providers only; no real account, email or production data is created.
- Earlier successful isolated login, registration, duplicate handling, session refresh, logout and protected-route evidence is reused. No unnecessary full-suite/build or hosted SQL rerun.
- All 16 course entries, lessons, browser-local quizzes, database migrations, AGENTS.md and 17 unrelated files are preserved. Production development-auth bypass remains forced off; assessment and notification activation is excluded.

## Remaining release risks

- Confirm Netlify NEXT_PUBLIC_SITE_URL and CONTACT_ALLOWED_ORIGINS, plus Supabase Site URL and callback allowlist, all use https://architecting-ai.netlify.app. Earlier supplied Supabase settings used the unhyphenated hostname; identifying the actual hostname alone does not verify that those settings were corrected. Recovery must start and finish on the same origin/browser.
- The documented Netlify getContext().ip API supports framework request scopes and current adapter source passes platform context into Next handling. This site's deployed adapter/version/context has not been observed; absent trusted IP safely yields 503. Local RPC success does not prove deployed persistence.
- Real recovery mail/template/rate-limit behavior and controlled live registration/login/progress/Contact smoke tests remain unobserved. Do not claim live feature success from fixture results.
- Controlled adult admission and operational privacy/retention handling remain owner responsibilities. Public registration is not an approved-user allowlist; automatic deletion is not implemented. Notifications and formal assessment remain disabled.

Local follow-up is ready for review/commit. Production readiness remains conditional on canonical configuration alignment and acceptance/resolution of the explicit live runtime/mail verification risks above. Previously completed hosted authorization checks are no longer blockers.
