# Local navigation and privacy verification

Date: 2026-10-23 (Asia/Calcutta)
Branch: `fix/unified-navigation-privacy-local`
Local production preview: http://127.0.0.1:3100
Status: local verification complete; awaiting approval before PR, push, merge, or deployment.

## Changes

- Removed the Courses chevron. Replaced the conflicting details/hover behavior with a controlled native button and disclosure panel, hidden by default.
- Explicit activation opens Courses. Repeat activation, outside pointer interaction, Escape, leaving the menu with the mouse, leaving it with keyboard focus, and selecting a link close it. Escape returns focus to the trigger. Mobile navigation also closes on outside tap and selection.
- Preserved the four original menu entries, including the two original working destinations and the two disabled Coming soon entries. Verified all four catalogue course destinations separately.
- Reused a single shared public header on Home, all marketing routes, and public authentication screens. The Home-specific duplicate header was removed. Scoped CSS standardizes height (78px, 70px on phones), logo, fonts, spacing, alignment, focus styling, and mobile navigation. Home keeps its existing hero placement.
- Added the visible Back to Contact Us link to `/privacy`, pointing to `/contact`.
- Public authentication changes are layout only. Authentication logic, Supabase, environment files, course content, contact backend, and the separate Python LMS were not changed. Existing unrelated working-tree files were left untouched.

## Changed files

| File | Purpose |
| --- | --- |
| `src/components/layout/marketing-chrome.tsx` | Shared accessible header and controlled Courses interaction |
| `src/components/layout/marketing-header.module.css` | Isolated, consistent desktop/mobile header styles |
| `src/components/layout/marketing-shell.tsx` | Use the same shared header without the old secondary variant |
| `src/components/home/public-homepage.tsx` | Remove the duplicate Home header |
| `src/app/(auth)/layout.tsx` | Shared public header above existing authentication screens |
| `src/styles/globals.css` | Allow for header height above the existing authentication screen |
| `src/app/(marketing)/privacy/page.tsx` | Return link to Contact |
| `src/app/(marketing)/courses/page.tsx` | Scope the smaller catalogue heading |
| `src/app/(marketing)/contact/page.tsx` | Scope the smaller Contact heading |
| `tests/marketing-navigation.browser.mjs` | Repeatable browser regression checks |
| `src/components/contact/enquiry-draft.tsx` | In-memory Contact draft shared across public navigation |
| `src/components/contact/enquiry-form.tsx` | Bind form fields to the draft and use client-side policy navigation |
| `tests/contact-draft.browser.mjs` | Regression for policy return-link and browser Back draft preservation |
| `docs/ui-navigation-local-verification.md` | This verification record |

## Results

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS; all 21 static pages generated |
| Browser regression suite | PASS; 43 recorded checks, no browser runtime errors |
| Responsive breakpoint checks | PASS; no header overflow at 320, 390, 768, 900, 901, and 1440px |
| `git diff --check` | PASS |

Browser verification used local headless Chrome against the production build, with desktop 1440x1000 and mobile touch emulation 390x844. Tests cover default hidden state, intentional activation, toggle closed, outside click/tap, Escape and focus restoration, mouse leave, pointer access into the dropdown, Enter/Space activation, Tab order, keyboard focus exit, and close after course selection. Screenshots were captured and representative desktop/mobile screenshots reviewed.

Home, Courses, About, Contact, Privacy, Terms, and Sign In have identical header geometry for each tested viewport. Additional public routes checked: Learning Paths, Workshops, Enterprise AI Foundations workshop and assessment entry, certificate verification, Mission Zero, Register, Forgot Password, and Reset Password. Existing redirects retain their behavior. The route inventory also includes learner/admin layouts, development-only pages, APIs, and static student lesson HTML; those specialized surfaces retain their existing layouts and content.

Course destinations tested on desktop and mobile, all HTTP 200:

- `/courses/ai-for-kids`
- `/courses/ai-architect`
- `/courses/ai-agents-automation`
- `/courses/cybersecurity-essentials`

The two available dropdown course links were exercised through actual navigation. The two Coming soon menu entries remain disabled, matching the original menu. The Privacy return link was exercised on desktop and mobile and reached the Contact heading at `/contact`.

## Reproduction and artifacts

Playwright was installed in a temporary directory, without changing project dependencies or lockfiles. With the local production server running:

```powershell
$env:PLAYWRIGHT_MODULE_PATH = Join-Path $env:TEMP 'architecting-ai-ui-tools/node_modules/playwright'
node tests/marketing-navigation.browser.mjs
```

Optional overrides: `UI_TEST_BASE_URL`, `UI_TEST_BROWSER`, `UI_TEST_OUTPUT`. By default the script uses the installed Windows Chrome executable.

Screenshots, per-route header measurements, and `results.json` are in `%TEMP%/architecting-ai-ui-verification`. Default closed-state screenshots are named `privacy-closed-<width>.png`; open-menu screenshots are named `desktop-<route>-header.png` and `mobile-<route>-header.png`.

## Limits and remaining issues

No remaining issue found within this change scope. Mobile checks use touch emulation; physical devices, Safari, Firefox, and screen-reader output were not tested. Authenticated learner/admin flows, account submissions, and contact submissions were not exercised because they are outside the requested UI scope. The browser connector failed to start due to a sandbox helper error; the local Chrome runner completed the browser checks instead.

No PR opened, no branch pushed, no merge performed, and no Netlify deployment triggered.

## Follow-up: catalogue heading size

Reduced only the Course catalogue h1 from the inherited 51.2-96px hero scale to a responsive 32-48px scale. Text and course content are unchanged. TypeScript, ESLint, and production build passed again. Local production browser checks confirmed 32px at 390px viewport and 48px at 1440px; default Courses dropdown remained hidden. Both screenshots were visually reviewed and saved as `catalogue-smaller-heading-390.png` and `catalogue-smaller-heading-1440.png` in the existing artifacts folder. No deployment or push occurred.

Separate observation from the screenshots: the existing catalogue cards have low-contrast light text on white backgrounds. Card styling was not changed in this heading-size adjustment.

## Follow-up: Contact heading size

Applied the same 32-48px responsive heading scale to Contact using the shared catalogue/contact CSS rule. Form settings, copy, and backend are unchanged. TypeScript, ESLint, production build, and diff checks passed. Local Chrome checks confirmed HTTP 200 and heading sizes of 32px at 390px viewport and 48px at 1440px; the default Courses dropdown remained hidden. Screenshots `contact-smaller-heading-390.png` and `contact-smaller-heading-1440.png` were captured and reviewed. No form was submitted, and no deployment or push occurred.

## Follow-up: Contact entries lost after reading Privacy Policy

Cause: the policy used a plain anchor, causing a document reload, and Contact fields had no state beyond the mounted form. Changed the policy link to Next Link and placed an in-memory draft provider in the persistent marketing layout. All editable fields and consent use the draft. A successful submission clears it alongside the existing form reset. Contact API payloads and backend logic are unchanged. Drafts are not written to cookies, localStorage, or sessionStorage and do not carry across a reload or a new tab.

TypeScript, ESLint, production build, and diff checks passed. `tests/contact-draft.browser.mjs` passed six grouped desktop/mobile checks: fill every field and consent, follow the policy link, scroll the policy, use the return link, verify values, edit and uncheck consent, repeat with browser Back, verify updated values, verify tab isolation and reload clearing, and assert no contact API requests or browser runtime errors. Synthetic test data only; no enquiries submitted. Screenshots `contact-draft-restored-desktop.png` and `contact-draft-restored-mobile.png` were captured. The existing 43-check navigation suite was rerun against this build.

The submission success path was not exercised with live backend collection disabled. Physical devices and other browser engines remain untested. All work remains on the dedicated local branch, with no PR, push, merge, or deployment.
