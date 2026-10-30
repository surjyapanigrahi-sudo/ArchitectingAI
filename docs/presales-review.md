> Current contact architecture: see [contact-enquiries.md](contact-enquiries.md). Supabase/API replaces the historical Netlify Forms proposal below; collection and email remain disabled. The consolidated verification report supersedes earlier test counts.

# Pre-sales readiness: review and activation

Local branch: presales-readiness. No course, lesson, planned curriculum entry, video reference, or lesson URL has been removed. No external service was configured, no migration applied, and nothing committed, pushed, or deployed.

## Contact activation (approval required)

The local contact UI submits URL-encoded AJAX to /__forms.html. public/__forms.html contains the matching static Netlify detection form, including honeypot and identical field names. NEXT_PUBLIC_CONTACT_ENABLED defaults to false. Keep it false until the privacy notice below is approved and added to the form and actual delivery is ready. This flag is a UI release gate, not an access-control boundary; Netlify form detection itself must remain disabled until setup is approved.

After external setup/deployment approval:
1. In the existing Netlify team, check Usage & billing and the site's Forms usage. Confirm the actual plan, allowances and potential charges before enabling. As checked on 21 October 2026, current credit-based plans list Forms as free/unlimited; legacy plans can have different metered billing. Account-specific usage was not accessible.
2. Enable form detection in the site's Forms settings, then deploy the approved source. Confirm architecting-ai-enquiry is detected with all expected fields.
3. In form notifications, add an email notification for this form to surjya.panigrahi@gmail.com. The recipient is intentionally not a browser-side delivery configuration.
4. After approval of the notice and confirmation of retention practice, add the notice next to Submit Enquiry, set NEXT_PUBLIC_CONTACT_ENABLED=true in the approved environment and rebuild/deploy. Environment changes require rebuilding public Next.js configuration.
5. Submit an approved test enquiry. Confirm its appearance in Netlify verified submissions and arrival in Gmail, including Spam. A successful HTTP response does not establish email receipt. Delete test data as agreed.
6. Test failure handling and required fields on the deployed site. Local Next.js is not a Netlify Forms backend.

Sources checked: https://docs.netlify.com/manage/forms/setup/ ; https://docs.netlify.com/manage/forms/troubleshooting-tips/ ; https://docs.netlify.com/manage/forms/usage-and-billing/

## Authentication activation and verification (approval required)

Reuse the existing Supabase project and installed SDKs. No new service or paid package is needed. Add/verify the approved production NEXT_PUBLIC_SITE_URL and public Supabase configuration. Never add service-role keys. Verify the actual project's profile, assessment, certificate and progress migrations/RLS, including two-user isolation; local SQL is not evidence of deployed policies.

Recovery requests use /auth/confirm?destination=reset-password; PKCE code exchange or a recovery token_hash establishes cookies before /reset-password. Allow the exact local and production callback URLs, including the recovery query destination, in Supabase. For a custom recovery template, use {{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery (the supplied recovery RedirectTo already has a query string). Verify template behavior in the existing project before editing it. Confirmation signup templates remain unchanged.

Use approved test accounts to verify signup, verification, login, expiry/refresh, logout failure/success, recovery email, expired/reused links, password update, protected routes, and public sample access. Server-side user validation and database RLS remain the authorization boundaries. The new scoped Next.js proxy refreshes session cookies; pages still verify users themselves.

## Founder copy: proposed, not published

?Surjya Panigrahi founded Architecting AI, a learning initiative supporting professional AI education and school-level AI learning. Its courses connect explanations with sample lessons, activities and assessments.?

Please confirm the founder relationship before publication. No qualifications, employers, experience duration or business achievements are asserted.

## Enquiry privacy notice: proposed, not published

?We collect your name, email, optional phone number, enquiry type and message to respond to your enquiry. If enabled, Netlify processes submissions and an email notification is sent to the enquiry inbox. Please avoid including sensitive information or children's personal details.?

Before publication confirm the inbox access arrangements, actual processors and delivery configuration, retention/deletion period, privacy contact and request handling. Add the verified retention period; none is invented here.

## Privacy page draft outline: not published

Describe the operator and verified privacy contact; distinguish public browsing, browser-local student progress, Supabase accounts/professional progress/assessment records, and Netlify enquiries. State the actual collected fields, purposes, providers, storage, access, retention/deletion arrangements and account deletion route. Confirm analytics/cookies and minors/guardian arrangements before making claims. Do not request child personal data through the enquiry form. No compliance or security guarantee is proposed.

## Terms draft outline: not published

Describe sample availability versus planned curriculum; learning use; account responsibilities; content ownership and source-material permissions; assessment and Part 1 certificate scope (without accreditation claims); acceptable use; and a verified support contact. Confirm the operator, audience/guardian rules, commercial terms if any, governing provisions and effective date before publication.

Privacy/Terms routes and footer links are deferred until wording is approved. Registration no longer asks users to agree to nonexistent documents; it acknowledges account data transmission instead. This acknowledgement is not a substitute for a privacy policy.

## Curriculum mapping recommendation: no renumbering applied

Use curriculum-catalog.ts as the authority for the four published professional lessons and stable URLs. The course catalogue has 12 future topics numbered 5?16. The workshop's shifted legacy list has 13 remaining entries and numbers extending to 18, including the legacy AI Foundations for Enterprise Architects topic. Decide whether that topic is a distinct planned lesson or supplementary material. Preserve both lists until an explicit mapping is approved; do not silently remove or merge topics. Public numbering remains as found pending this decision.

## Verification limitations

Build/lint and local route checks are recorded in the delivery report. Live service flows, inbox receipt, account-specific limits, deployed RLS, remote video playback, full quiz scoring and 375/768/desktop visual checks need their stated environments. Git ignores local MP4 files; ensure any existing externally hosted or separately deployed media remains available before deployment.

## Local validation results

- ESLint passed after correcting recovery effect handling.
- Final production build passed, including TypeScript and all 23 generated pages.
- HTTP checks: 19 public routes returned 200, including both course indexes and all three student/four professional lesson routes. /dashboard and /learn returned 307 to /login.
- Normalized content comparison against HEAD passed for both course catalogues, published/planned professional curriculum, professional lesson definitions and all tracked student lesson files.
- Static Netlify form field names match the React form; private .env.local is unchanged.
- Browser verification could not start because the computer/browser tool runtime exited unexpectedly. Mobile widths, keyboard behavior, computed contrast, and video/quiz interaction remain unverified visually.
- No live form/auth requests, migrations, dashboard changes or notification delivery tests were performed.

## Modified/new files

```text
 M .env.example
 M docs/supabase-auth.md
 M src/app/(auth)/auth/confirm/route.ts
 M src/app/(auth)/forgot-password/page.tsx
 M src/app/(marketing)/about/page.tsx
 M src/app/(marketing)/contact/page.tsx
 M src/app/(marketing)/courses/[courseSlug]/page.tsx
 M src/app/(marketing)/workshops/[workshopSlug]/page.tsx
 M src/components/home/public-homepage.tsx
 M src/components/layout/marketing-shell.tsx
 M src/modules/auth/components/logout-button.tsx
 M src/modules/auth/components/registration-form.tsx
 M src/modules/auth/validation/auth-validation.ts
 M src/styles/globals.css
?? docs/presales-review.md
?? public/__forms.html
?? src/app/(auth)/reset-password/page.tsx
?? src/components/contact/enquiry-form.tsx
?? src/components/layout/marketing-chrome.tsx
?? src/modules/auth/components/password-recovery-form.tsx
?? src/proxy.ts
```

## Focused verification before deployment - 21 October 2026

This section supersedes the earlier browser-tool limitation: the standard tool still fails at sandbox startup, but existing Playwright and headless Chrome successfully tested localhost with all external browser traffic blocked. No packages were installed.

- Homepage PASS: 375/768/1440 widths tested on homepage, contact and both course indexes; no horizontal overflow. Keyboard Enter opens Courses; dark-page summary computed color is #e7f0f5 against #071321, light-header summary #17324d against near-white. Shared header/footer retained. Counts render 3 samples / 18 planned and 4 samples / 16 planned. Browser-local student progress and account-based professional progress are distinguished. Obsolete local-prototype auth claim is absent. Screenshot review found and corrected contact-label contrast and mobile header placement in globals.css, then browser checks passed again.
- Contact PARTIAL: static form names/fields match the React form; honeypot, required fields, email type, URL encoding and response error guard checked. Browser confirms submission remains disabled and empty fields are invalid. Recipient remains surjya.panigrahi@gmail.com in activation instructions; no notification was configured. Privacy notice/retention approval and external Netlify detection, plan check and notification setup remain pending. No deployed delivery or inbox test performed.
- Login PARTIAL: source verified signUp, email confirmation, signInWithPassword, signOut, resetPasswordForEmail, callback session exchange and updateUser password flow. Validation functions were executed locally. Browser confirms empty-login validation and rejection of reset without a session. Live registration, verification mail, login/logout persistence, expiry, recovery links and deployed RLS isolation still require approved accounts/configuration. No Supabase project created and no policies changed.
- Workflow PASS: exact heading present; Text/PDF/PowerPoint, narrated video production (narration/visuals/subtitles), and notes/activities/quizzes represented. Three desktop columns become one at mobile/tablet. Sample lesson link retained; no upload or generation controls and copy says assisted production workflow.
- Preservation PASS: 45 tracked course/lesson/workshop/lab/student files compare unchanged to HEAD after normalizing BOM/line endings; six distinct MP4 URLs remain unchanged. Remote media playback and complete quiz scoring were not exercised.
- Final production build, TypeScript, ESLint and patch whitespace checks passed. No commit/push/deployment or external changes.

Remaining review/approval items: enquiry notice and retention practice; Netlify detection/notifications and any costs before activation; existing Supabase redirect/template changes and test accounts; founder/policy publication and curriculum mapping remain separately pending. No lesson renumbering or deletion was performed.
