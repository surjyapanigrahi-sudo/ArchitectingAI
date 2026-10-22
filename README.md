# Architecting AI V2

Existing Next.js 16 / React 19 / TypeScript website with public student and professional samples, Supabase authentication/progress modules and a locally prepared enquiry API. Preserve the educational content and stable URLs.

## Local commands

- npm run dev
- npm test (Node 22.18+ or Node 24; fake database/email in application tests)
- npm run lint
- npx tsc --noEmit
- npm run build

Copy reviewed placeholders from .env.example into a private local environment when needed; never commit credentials. AUTH_ENABLED, CONTACT_ENABLED and CONTACT_NOTIFICATION_ENABLED default to false. Do not enable real collection or email during local verification.

See [contact-enquiries.md](docs/contact-enquiries.md) for the unapplied migration, SQL test requirements, security boundaries, environment variables, controlled retries and approval gates. See [supabase-auth.md](docs/supabase-auth.md) for auth callback/redirect setup and the live-account test checklist. No migration, live configuration or deployment is authorized by these instructions.
