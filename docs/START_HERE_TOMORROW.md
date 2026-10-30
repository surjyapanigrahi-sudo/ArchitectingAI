# Start here next session

Read [PROJECT_HANDOVER_2026-10-21.md](PROJECT_HANDOVER_2026-10-21.md) first. Requested checkpoint: 21 October 2026; includes hardening evidence from 22 October (IST).

Branch: **presales-readiness**. All existing implementation work remains uncommitted. Existing Supabase project: **ArchitectingAI**. The production contact migration is NOT applied. Collection/send gates remain off; live auth is unverified. Nothing has been pushed or deployed.

First three actions:

1. Review **supabase/migrations/20261021000100_contact_enquiries.sql** and [contact-migration-review.md](contact-migration-review.md), then re-test in a NEW isolated PostgreSQL cluster BEFORE any production activation. The previous temporary cluster is stopped. Full setup commands are in the handover.
2. Check Git status and the handover inventory/fingerprints; preserve all modified AND untracked files. Re-run application checks if changes warrant it. Latest evidence: **42 application tests + 28 isolated integration scenarios**, rollback SQL suite, TypeScript, ESLint and build passed. Earlier notification-format milestone: **41 tests**.
3. Obtain explicit migration/security/privacy approval before hosted writes, settings changes, collection or email tests. Keep AUTH_ENABLED, CONTACT_ENABLED and CONTACT_NOTIFICATION_ENABLED false. No commit/push/deployment is authorized.

Preserve all existing production tables and student/professional courses, planned lessons, URLs, videos, quizzes and exercises. Do not modify the separate Python LMS/video engine. See the full handover for architecture, subject convention, recipient, environment variables, pending decisions and rollback considerations.
