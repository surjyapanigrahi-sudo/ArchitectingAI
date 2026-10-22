# Supabase authentication

## Environment

Local development requires these values in the gitignored `.env.local` file:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

Only the browser-safe Supabase project URL and publishable key are used. No service-role key is required or permitted in client code. `.env.example` contains placeholders only.

## Registration and confirmation

The existing registration form calls Supabase `signUp` with email, password, and the approved full-name metadata. Its email redirect is `${NEXT_PUBLIC_SITE_URL}/auth/confirm`. With email confirmation enabled, the UI tells the learner to check their email and does not claim an authenticated session exists.

`/auth/confirm` supports both Supabase confirmation callback formats. It exchanges a PKCE `code` using `exchangeCodeForSession`, or verifies a custom email-template `token_hash` with its OTP type. Both paths establish the cookie-backed session, upsert the authenticated learner's profile, and redirect to `/dashboard`. Invalid or expired links receive a safe error page.

Configure the Supabase confirmation email template link as:

`{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`

This token-hash template is the preferred explicit SSR format. The default Supabase confirmation flow may instead redirect to the same endpoint with a `code`; the endpoint supports that format as well. The signup request supplies `/auth/confirm` as `.RedirectTo`.

The `public.profiles.id` value is always the authenticated `auth.users.id`. The profile upsert stores only approved profile data and is idempotent. Passwords and credentials are never written to `public.profiles`.

## Login and logout

Login uses `signInWithPassword` and redirects successful sessions to `/dashboard`. Provider errors are mapped to safe user-facing messages. Session persistence uses Supabase's standard browser-client behavior; the former visual-only Remember me control has been removed.

Logout calls Supabase `signOut` and returns to `/`.

## Server authentication and route policy

Browser and server clients are centralized in `src/lib/supabase`. Server authentication uses `auth.getUser()` rather than trusting client state. `/dashboard` and `/learn` are protected. The production Lesson 1 route remains public during the current preview phase, as do `/`, `/experience/mission-zero`, `/register`, `/login`, `/forgot-password`, and `/workshops`.

The development bypass is accepted only when `NEXT_PUBLIC_DEV_AUTH_BYPASS=true` and `NODE_ENV` is not `production`. Production always disables it. It does not use local storage or query-string state.

## Security boundaries

- RLS remains enabled and the client acts only as the signed-in user.
- No service-role key, password, token, or raw provider error is logged or displayed.
- Missing environment configuration produces a generic development-safe error.
- `.env.local`, generated output, and logs remain ignored by Git.

## Redirect configuration

For local development, add `http://localhost:3000/auth/confirm` to the Supabase Auth redirect allow list. Before Netlify deployment, set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS site URL in Netlify and add `https://<production-domain>/auth/confirm` to the Supabase redirect allow list. Preview-domain redirects should be added only if preview authentication is intentionally enabled.

## Known limitations

Password recovery and reset are now implemented locally, using the existing Supabase provider and a recovery callback. A scoped Next.js proxy refreshes session cookies; protected pages continue validating users server-side. See presales-review.md for redirect/template setup and approval requirements. Live signup, email delivery, dashboard-table verification, and production redirects require access to the external Supabase project and inbox.

## Local release gate and final verification

AUTH_ENABLED defaults to false. Login, registration, recovery and confirmation entry points remain unavailable until final privacy/service approval. getCurrentUser keeps learner routes dynamic and rejects missing/unverified users. Proxy refresh is skipped while the gate is off. This is an application gate, not a change to live Supabase signup settings. Public sample lessons remain accessible. See contact-enquiries.md for the full approved-account test checklist and deployment order. NEXT_PUBLIC_SITE_URL must be a canonical HTTPS origin in production; invalid URLs fail safely rather than silently redirecting to localhost.
