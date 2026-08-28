# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page marketing site for Rumah Manusia (Indonesian training / coaching /
consulting firm), built as a **prerendered Angular 22 application**. Content lives
in **Sanity**; the build fetches it and bakes it into static HTML. Output is plain
files — no server runtime — deployed to Cloudflare Pages.

```
app/         the Angular application (its own package.json)
studio/      Sanity Studio (its own package.json, so the site build never installs React)
content/     seed/mirror of the Sanity content as JSON — NOT what the site reads
assets/      shared stylesheets and brand marks; source of truth, copied into app/ at build
team/        original portrait files, uploaded to Sanity by studio/scripts/upload-team.mjs
tools/       one-off extraction and asset scripts
```

## Deployed

| | |
|---|---|
| Site | https://rumahmanusia.pages.dev/ — Cloudflare **Pages**, builds on push to `main` |
| Studio | https://rumahmanusia.sanity.studio/ |
| Publish → rebuild | Sanity webhook → Cloudflare deploy hook, working |

It is a **Pages** project, not a Worker. `functions/` file-based routing is what
serves `/api/enquiry`; a `wrangler.jsonc` with a Worker entry was tried and is
ignored by Pages. `_headers` and `404.html` are picked up automatically.

Outstanding work is tracked in `.claude/tasks/todo-launch-remaining.md`.

## Commands

Root scripts delegate into the sub-packages:

```sh
npm install          # also installs app/ via postinstall
npm run build        # prebuild syncs assets + fetches Sanity, then prerenders
npm start            # dev server
npm test             # Vitest
npm run studio       # Sanity Studio locally
npm run studio:deploy
```

Studio deps are separate: `npm --prefix studio install` when you need them.

Cloudflare Pages: build `npm run build`, output directory `app/dist/app/browser`.

## Provenance

Originally a Claude Design canvas — project `43ab0bc8-86fd-4349-a864-0acf95a5691f`,
file `Rumah Manusia v5 motion.dc.html`, readable via the `DesignSync` MCP tool.
That file runs on the design-canvas React runtime and is **not** a port target;
compare behaviour and computed values against it, never markup shape.

`assets/styles.css` is the "Modernist" design system, synced from that project.
Treat it as generated: put overrides in `assets/site.css` or a design re-sync
clobbers them.

**An Eleventy implementation of the same page exists on branch `feat/eleventy`**
(frozen at commit `49f2807`). It reached full parity before Angular was adopted.
Useful as a reference for expected behaviour; do not maintain both.

## Content

**Sanity is the source of truth. `content/*.json` is not.**

- `app/tools/fetch-content.mjs` runs before every build, queries Sanity, resolves
  image fields to CDN URLs, excludes drafts, and writes `app/src/content/content.json`.
- That file is gitignored and generated. `ContentService` exposes it.
- `content/*.json` at the repo root is the original seed and a readable mirror.
  `tools/make-sanity-import.mjs` regenerates an NDJSON import from it.
- Editing content means editing in Studio, then rebuilding. Editing the JSON files
  changes nothing the site serves.
- Project `k01eodu7`, dataset `production`, **publicly readable** — so no build
  token is needed, but drafts must stay excluded (they are, in the GROQ).
- 13 singleton documents, one per content area, addressed by fixed `_id`. Studio's
  desk lists them explicitly and create/duplicate/delete are removed, so a section
  cannot be cloned or lost.
- Icons are chosen from a **named list**, never pasted SVG paths. The names must
  match across `app/src/app/ui/icons.ts` and `studio/schemaTypes/_helpers.js`.

## Architecture rules that are load-bearing

### Attribute selectors, not element selectors

Components use `section[rmHero]`, not `<rm-hero>`. This is not style: the
stylesheet staggers `.rm-rise > *` by `:nth-child`, so a component host element
between the section and its wrapper shifts every index and **breaks the reveal
animation on every section**. Keep new sections on native elements.

### Panels stay in the DOM

Tab panels, month topic lists and testimonials use `[hidden]`, never `@if`. `@if`
would leave the 18 hard-skills programs and the second strategy panel out of the
prerendered HTML — an SEO and no-JS regression. `site.css` therefore needs
`[hidden] { display: none !important }`, because the component classes set
`display: flex/grid`.

### Paired keyframes

Re-applying the same CSS animation does not replay it, so entrance animations
alternate between two identical keyframes (`rm-t-a`/`rm-t-b`, `rm-in-a`/`rm-in-b`,
`rm-q-a1`/`rm-q-a2`). `app/src/app/ui/anim.ts` picks the name from a tick counter.
Do not "simplify" the duplicates away — a framework-rendered page needs them.

### Reveal hides content when it breaks

Sections start at `opacity: 0` and are revealed by `RevealService` adding `.rm-in`.
It has three failsafes (immediate reveal near the viewport, a 600 ms sweep, and a
no-IntersectionObserver fallback) precisely because a failure makes content
invisible rather than merely unanimated. Team portraits additionally start at
`opacity: 0` and only appear via the `rm-resolve` scan, which requires the
ancestor `.rm-rise.rm-in`.

### Colours on the brand cyan must be fixed, not themed

`--color-on-accent` and `--color-band` are deliberately **not** overridden in the
dark theme. The cyan does not change between themes, so a theme token inverts to
light and drops to ~2.2:1. The dark theme also inverts `accent-700`/`accent-800`
into light blues — never use those as a background for white text. See the WCAG
notes below before touching any colour.

### Without JavaScript the page must be forced visible

`<html class="no-js">` is removed by the pre-paint script; `site.css` has
`.no-js` rules that hide the loading overlay and force the revealed sections,
hero and portraits opaque.

This is not cosmetic. The overlay is `position: fixed; inset: 0` and only
dismisses when script sets `data-done`; every `.rm-rise` section sits at
`opacity: 0` awaiting `.rm-in`; the hero's animations are `paused` awaiting
`.rm-lit`. Without those rules the page renders **complete in the markup and
blank on screen** — which is exactly how it shipped until it was caught, because
the check had only asserted content was in the DOM, never that it was visible.

A `<noscript><style>` block does **not** work here: the build's critical-CSS
pass escapes its contents into literal text.

### Theme

Resolved by an inline script in `app/src/index.html` **before first paint** from
`localStorage["rm-theme"]`, so a dark reload never flashes white. `ThemeService`
adopts whatever that script decided and owns the toggle only.

## Verification expectations

- **Test the dev server, not just `ng build`.** Angular strips development-mode
  assertions from production bundles. An `NgOptimizedImage` misuse (NG02952) once
  shipped a clean production build while `ng serve` would not boot at all.
- **Audit AXE in both themes.** A light-mode-only audit missed that the selected
  tab failed at 2.22:1 in dark mode.
- **Disable transitions before auditing contrast.** Sampling mid-fade makes AXE
  report blended colours and phantom failures. Force opacity only on the reveal
  wrappers, not globally, or you mask genuinely translucent text.
- Structural parity counts worth re-checking after markup edits: 69 program rows
  (one title is duplicated in the source data), 60 client pills, 40 marquee tiles,
  27 faces, 14 months, 14 quotes, 13 reveal sections, 6 tab panels, 50 topic items.

## Plugin gates in this repo

The `frontend-dev` plugin enforces two hooks on Angular edits: a task file under
`.claude/tasks/todo-*.md` with an agreed plan, and an invocation of
`/frontend-dev:pipeline` before editing code. The pipeline also mandates the
`playwright-cli` skill for browser testing and forbids the Playwright MCP tools.
Expect to be blocked mid-edit otherwise.

## Known gaps

Fixed since this file was first written: the enquiry form now delivers
server-side, Open Graph and JSON-LD are present, and `robots.txt` / `sitemap.xml`
exist. What remains:

- **Six image placeholders are empty** (hero ×2, formats ×3, online ×1). They
  render as dashed frames with their captions. Upload in Studio and `rm-slot`
  swaps to the image.
- **`team/founder.png` is a 205×205 crop recovered from a truncated download** —
  the original exceeds `DesignSync get_file`'s 256 KiB cap.
- **The enquiry Function is live but not configured.** It needs
  `RESEND_API_KEY`, `ENQUIRY_TO` and `ENQUIRY_FROM` in Pages. Until then it
  reports "not configured" and the form offers an email fallback — deliberately,
  rather than failing silently.
- **No Content Security Policy.** Skipped because it cannot be verified without
  a deploy and an untested one breaks the page silently. Now doable against a
  preview.
- **Client marquee logos hotlink `google.com/s2/favicons`** and two already 404.
  Sanity has a `logo` field per featured client which overrides the fallback.
- **`HARD_PROGRAMS` contains "DEBT RESTRUCTURING" twice** — present in the
  design source, kept so the "69 programs" copy stays true.
- **No 301s from the old WordPress URLs.** Needs the old URL list; implement as
  `app/public/_redirects`.
- **Deferred optimisation:** the seven static sections could use
  `@defer (hydrate never)` to keep their templates and content out of the 92 KB
  client bundle. Blocked because `rmReveal` must run client-side; a never-hydrated
  section would stay at `opacity: 0` and its content would be invisible. Doing it
  safely means moving reveal to a shell-level service that queries the DOM.
