# To do

Outstanding work on the SovereignStrUKture site, in priority order.

- **You** — needs a human: a decision, real details, or an account.
- **AI** — can be handed to an AI assistant as written.

Tick items off as they're done, and add new ones in the right section. When an AI finishes an item, it should tick it here in the same commit.

---

## 1. Before sharing the link with officials

### Real details (You)

- [ ] **Email addresses.** Replace `hello@example.co.uk` in `lib/brand.ts` and the three founder addresses in `content/team.ts`. These are used by the contact form, footer, founder pages, privacy notice and structured data.
- [ ] **Social links.** Replace the placeholder LinkedIn / X / GitHub links in `lib/brand.ts`. Then an AI can add them to `sameAs` in `lib/schema.ts`.
- [ ] **Founder photos.** 4:5 portraits in `public/team/`, with `photo` in `content/team.ts` pointing at them. Use the same crop and style for all three.
- [ ] **Founder text.** Rewrite the `focus`, `bio` and `responsibilities` drafts in `content/team.ts` (each is marked `// Draft — edit.`), and add `linkedin` URLs.
- [ ] **Name and logo.** `lib/brand.ts` says they're not final. Decide, then change them there; the rest of the site follows.

### Research (You)

- [ ] **Review the published brief as a team.** `content/research/sovereign-compute-framework.mdx` is live under all three names. Check the argument and the scores in its table. If it isn't ready, set `status: in-progress`.
- [ ] **Routing note.** `content/research/routing-by-complexity.mdx` uses illustrative figures. Replace them with real ones, or set `status: planned` and delete the body.
- [ ] **Research plan.** Check titles, owners and target dates in `content/research/*.mdx`.

### Legal (You)

- [ ] **Privacy notice** (`app/privacy/page.tsx`). Decide who is legally responsible for the data (e.g. a registered company), confirm the two-year retention period, and get a quick check from someone who knows UK GDPR.
- [ ] **US hosting.** The privacy notice says the site is hosted by Vercel (a US company). Decide whether that's acceptable for a sovereignty organisation, or plan a move to UK hosting (see section 4).

### Go live (You)

- [ ] **Merge `research-team-pages` into `main`** with a pull request on GitHub.

---

## 2. Launch

- [ ] **You: choose the domain.** A `.uk` domain signals "British" at a glance: `.org.uk` for a non-profit or policy body, `.co.uk` / `.uk` for a company. Decide the legal form first; the privacy notice needs it too. Register the obvious variants (`.uk`, `.co.uk`, `.com`) and redirect them to the main one.
- [ ] **You: choose an email provider** on the same domain. Options, with the sovereignty trade-off in mind:
  - UK-based email hosting: most consistent with the message; check reliability and spam filtering.
  - European, privacy-focused (e.g. Proton, mailbox.org): outside US jurisdiction.
  - Google Workspace / Microsoft 365: most reliable and familiar to officials, but US companies; be ready to explain the choice.

  Check each provider's current data-residency terms before choosing.
- [ ] **You: set up email authentication** (SPF, DKIM and DMARC records at the domain) so mail reaches gov.uk inboxes rather than junk. The provider's setup guide covers it.
- [ ] **You: create the addresses:** `hello@` (general and website), `firstname@` for each founder; optionally `research@` or `press@` later.
- [ ] **AI:** once the domain and addresses exist, set `brand.url` and `brand.email` in `lib/brand.ts` and the founder `email`s in `content/team.ts`. The contact form, footer, privacy notice, canonical URLs, sitemap, robots file, preview cards, PDFs and structured data all follow. Then add the domain in Vercel and check the build.
- [ ] **You:** add the domain to Google Search Console and submit `/sitemap.xml`.
- [ ] **You:** check a research page and the home page in Google's [Rich Results Test](https://search.google.com/test/rich-results).
- [ ] **You:** run Lighthouse (Chrome DevTools) on the live site, on a phone profile, and share the report with an AI to fix what it finds.

---

## 3. Accessibility (AI)

Both remaining known issues are listed in `app/accessibility/page.tsx`. When one is fixed, remove it from that list and update the date.

- [ ] **Pause control for looping animation** (WCAG 2.2.2). The world-map packets, dot flicker (`flips` on `DotCanvas`) and pulsing status dots loop forever. Add a visible pause/play control that stops all of them, or stop them after a few cycles.
- [ ] **Hero buttons focusable while invisible** (WCAG 2.4.7). In `components/sections/Hero.tsx`, the buttons at 0% opacity can receive keyboard focus. Make them unfocusable (e.g. `inert`) until the text has faded in.
- [ ] **You:** test with VoiceOver (iPhone) or TalkBack (Android) and keyboard-only on desktop, and note any problems here.

---

## 4. Worth doing next

- [ ] **About / funding page (You + AI).** Officials want to know who you are, what kind of organisation, and who funds you. You provide the facts; an AI builds the page.
- [ ] **Contact form sending by itself (You + AI).** It currently opens the visitor's email app, which often isn't set up on work machines. Needs an email service account (e.g. Resend); then an AI adds a server action and updates the privacy notice.
- [ ] **Visitor stats (You + AI).** Choose a cookie-free provider (e.g. Plausible or Fathom), then an AI adds it and updates the privacy notice.
- [ ] **Email updates for new research (You + AI).** Choose a provider; an AI adds the sign-up and updates the privacy notice.
- [ ] **Credibility markers (You).** Company number, partners, advisers, press. An AI can add them once they exist.
- [ ] **UK hosting (You).** Longer term. Would change the privacy notice's hosting section.

---

## 5. Housekeeping (AI)

- [ ] `components/debug/Debug_Border.tsx` is unused. Keep or delete, as the team prefers.
- [ ] Update `content/research/README.md` and `_template.mdx` to document `<Chart>`, `<Callout>`, maths (`$…$`, `$$…$$`) and footnotes.
- [ ] `README.md` is still the Create Next App default. Replace it with a short project README: what the site is, how to run it, where content lives.

---

## Notes for AI assistants

Read `AGENTS.md` first: this project uses **Next.js 16**, whose APIs differ from older versions. Check `node_modules/next/dist/docs/` before writing Next-specific code.

**Where things live**

| What | Where |
| --- | --- |
| Name, email, URL, socials, nav | `lib/brand.ts` |
| Founders | `content/team.ts` |
| Research pieces (one MDX file each; see its README) | `content/research/` |
| Home-page section text | `content/*.ts` |
| Colours and print styles | `app/globals.css` |
| Map grids (built at build time from world-atlas) | `lib/geoGrid.ts`, `MAPS` |
| Preview cards and icons | `lib/og.tsx` |
| Structured data | `lib/schema.ts` |

**Conventions**

- Light only: there is no dark mode, and the site forces a white background. Don't add one.
- Text arrows (→ ← ↗) are not used; use `<Arrow direction="…" />` from `components/ui/Arrow.tsx`.
- Founders are presented as equals: shuffled order, identical treatment. Don't single anyone out.
- Copy is plain and sober, written for ministers and civil servants. No slogans, and no invented statistics, achievements or claims.
- Charts: `<Chart>` in `components/research/Chart.tsx`. Its three colours are validated for colour blindness; don't add more series colours.
- Respect reduced motion in anything animated (`useReducedMotion`).

**Before committing**

```bash
npx tsc --noEmit -p . && npx eslint app components lib content && npm run build
```

Work on a branch, not `main`. Vercel builds a preview for every pushed branch.
