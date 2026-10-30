# Start here next session

Updated 30 October 2026. Read [CLAUDE.md](../CLAUDE.md) first (stack, run commands, rules). Older background: [PROJECT_HANDOVER_2026-10-21.md](PROJECT_HANDOVER_2026-10-21.md). That handover and the 22 October notes are historical: they say the contact migration is unapplied, but the contact form is now live and saving to Supabase (verified 30 Oct).

## Where things stand
- Branch: **redesign-home** (local only), created from `fix/consolidated-poc-readiness`. **Nothing has been pushed or deployed.** Netlify auto-builds on every push to GitHub, so never push without permission.
- Run locally: `npm run dev`, open http://localhost:3000. Last checks: 51 tests, lint, type-check and `npm run build` all passed.
- Live site (not touched): https://architectingai.netlify.app. The docs address `architecting-ai.netlify.app` is outdated.

## Home-page redesign done so far (all committed locally, newest first)
| Commit | What |
|---|---|
| `2ea2656` | Institutes slide: new text, numbered steps, classroom photo `hero-institutes.webp` |
| `cbd3299` | Institutes slide: label, heading, steps row, button and muted note |
| `81ece30` | "Revise by subject." section moved to just after the hero (above "Two paths"), centred heading, 3 cards in one row; whole Physics card is one link; Chemistry and Maths have "Tell me when it's ready" to /contact |
| `be01e62` | Hero slide 1 rotates the Physics, Chemistry and Maths photos (WebP); gentle 1.0 to 1.05 zoom on every hero photo, off for reduced motion |
| `482586a` | Subject cards as their own full-width section |
| `11f073d` | Animated subject SVG cards and the physics drawing beside "How learning works" (plain `<img>`, not next/image) |
| `3c1e01b` | Knowledge-check card removed from hero slide 1 |
| `78f0c3f` | 3-slide hero, announcement strip text, Pause button no longer overlaps the moving text |
| `2741c99`, `4317289` | CLAUDE.md, AGENTS.md, handover docs, contact SQL files |

Hero today: slide 1 "Learn it. Check it. Remember it." (rotating subject photos), slide 2 "Lessons your students will love, made for you." (institutes), slide 3 "Discover AI. Create Something Amazing." The old AI Agents "coming soon" slide is gone.

## Known open items
- Course-card thumbnails still have empty alt text (four cards in "Skills for the world ahead").
- Header and footer: the home page has two footers in the HTML, with one hidden by a CSS rule (`.shell:has(.academy-home)>.secondary-footer`). Fragile; worth tidying.
- Sample lesson links end in `/index.html` (the same address without it gives 404).
- Primary buttons "Try a free lesson" and "For institutes" currently link to `/courses` and `/contact` as placeholders.
- Contact form plan: extend the same form with a request type (waitlist, sample request, general). Do not add a new form service.
- Knowledge-check card idea was dropped; the animated SVGs are used only in the subject cards and "How learning works", not in the hero.
- The three physics, chemistry and maths PNGs and `hero-institutes.png` are kept as originals in `public/images/`; the site uses the WebP copies.
- Visual checks were done with headless Chrome screenshots. The slow zoom, hover and keyboard focus, and the animated SVGs still need a look in a normal browser. Real phone width (390px) was checked only for the hero.
- `next-env.d.ts` shows as modified whenever the dev server runs. Leave it out of commits.

## Rules to keep
- Never push or deploy without permission; test locally first.
- Keep `AUTH_ENABLED`, `CONTACT_ENABLED` and `CONTACT_NOTIFICATION_ENABLED` as they are; do not change or re-apply the contact migration.
- Do all redesign work on `redesign-home`.
