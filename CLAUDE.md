# Architecting AI

Learning-platform website for students (Classes 7-9) and professionals. See also [AGENTS.md](AGENTS.md): this Next.js version has breaking changes, so read `node_modules/next/dist/docs/` before writing Next.js code.

## Rules
- **Never deploy or push without my permission; test locally first.**
- Netlify is linked to GitHub with automatic builds, so every push may trigger a build and use credits. Never push to GitHub without my permission.
- The planned redesign is in progress on branch `redesign-home`; test locally first.
- Never print or commit secret values. Keep `AUTH_ENABLED`, `CONTACT_ENABLED` and `CONTACT_NOTIFICATION_ENABLED` as they are unless told otherwise.
- Contact form is live and saving to Supabase (verified 30 Oct). Later we will extend this same form with a request type (waitlist, sample request, general) instead of adding a new form service. Do not change or re-apply the contact migration.

## Built with
Next.js 16, React 19, TypeScript, hand-written CSS in `src/styles/globals.css` (Tailwind is installed but barely used). Supabase for login, database, progress and video storage. Resend for optional notification email. The three student sample lessons are static HTML files in `public/`.

## Run locally
```
npm install     (first time only)
npm run dev     then open http://localhost:3000
npm test | npm run lint | npx tsc --noEmit | npm run build
```
Needs Node 22.18+.

## Folder map
- `src/app/` pages: `(marketing)` public pages, `(auth)` login/register/reset, `(learner)` and `(admin)` signed-in areas, `api/contact` form backend, `dev/` test pages
- `src/components/home/public-homepage.tsx` home page: announcement strip, hero slideshow, sections
- `src/components/layout/marketing-chrome.tsx` header and footer; `marketing-shell.tsx` wraps public pages
- `src/content/courses.ts` course and lesson list
- `src/modules/` features: auth, contact, dashboard, learning-experience, architecture-lab, assessment, progress
- `src/config/`, `src/lib/supabase/`, `src/proxy.ts` settings and session refresh
- `public/brand/` logo; `public/images/` hero and course pictures
- `public/courses/ai-for-kids/<lesson>/index.html` static sample lessons (+ `poster.jpg`). Videos are hosted in Supabase Storage (`course-videos` bucket), not in the repo. Quiz and video progress live in browser `localStorage` only.
- `supabase/` SQL migrations; `tests/`, `scripts/`, `docs/`

## Settings
`.env.local` (private, git-ignored); template in `.env.example`. Secret server-only values: `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_HASH_SECRET`.

## Deployment
Live site: https://architectingai.netlify.app (the docs mention `architecting-ai.netlify.app`, which is outdated). There is no `netlify.toml`. Git remote `origin` is github.com/surjyapanigrahi-sudo/ArchitectingAI. Netlify is linked to the GitHub repo with automatic builds (confirmed by the owner), so a push can trigger a build and use build credits. Build settings live in the Netlify dashboard (Site configuration, Build & deploy), not in the code.
