# Task: Angular prerendered variant

Port the Rumah Manusia single-page site from the Eleventy build on `main` to a
prerendered Angular application, on branch `feat/angular`. Content continues to
come from Sanity project `k01eodu7` at build time. `main` stays deployable
throughout so nothing is lost if this variant is not adopted.

## Why

Owner is fluent in Angular, not Eleventy/Nunjucks. Maintainability by the person
who owns the codebase was judged to outweigh the payload cost. Decision taken
after two rounds of discussion; measurement below is reported for information,
not to reopen it.

## Constraints

- `outputMode: 'static'` — fully prerendered, no server runtime. Deploys to
  Cloudflare Pages as static files.
- Zoneless, standalone components, `OnPush`, signals. No NgModules.
- Reuse `assets/styles.css` and `assets/site.css` unchanged; the repo root stays
  the single source of truth and `tools/sync-static.mjs` copies them in.
- **Attribute selectors on native elements** (`section[rmHero]`) rather than
  element selectors, so no wrapper nodes appear. The stylesheet depends on DOM
  structure: `.rm-rise > *` staggers direct children by `:nth-child`, and an
  extra host element would break both the stagger and the reveal.
- Content must be complete in the prerendered HTML — nothing that matters may
  depend on hydration.
- `prefers-reduced-motion` respected everywhere.

## Measured payload (for the record)

| | JS gzipped |
|---|---|
| Eleventy variant (`main`), complete | 5.7 KB |
| Angular, empty starter | 56.9 KB |
| Angular, header + hero + footer only | 66.2 KB |

Expect roughly 85–100 KB once all sections and behaviour are in, because content
is bundled for hydration in addition to being present in the HTML.

## Steps

### Scaffolding
- [x] Branch `feat/angular`
- [x] `ng new app` — SSR/prerender, zoneless, vitest, prefix `rm`
- [x] Switch `outputMode` to `static`; verify only browser assets are emitted
- [x] Wire shared stylesheets and brand assets via `tools/sync-static.mjs`
- [x] `tools/fetch-content.mjs` — build-time Sanity fetch, drafts excluded,
      image fields resolved to CDN URLs
- [x] `prebuild` / `prestart` run sync + fetch
- [x] Content types mirroring the Sanity schema
- [x] `ContentService`

### Shared UI
- [x] `Icon` — `svg[rmIcon]`, named shapes, no wrapper element
- [x] `Slot` — photo placeholder, renders uploaded image when present
- [x] `ThemeService` — adopts the pre-paint choice, owns the toggle
- [x] `RevealDirective` — replaces the IntersectionObserver in `app.js`
- [x] `Tabs` — shared tablist behaviour with roving tabindex and arrow keys

### Sections
- [x] Header (nav, theme toggle, burger)
- [x] Hero (stat count-up)
- [x] Footer
- [x] Prerender final stat values, rewind and animate on the client
- [x] Clients (marquee + pills)
- [x] Vision & mission
- [x] What we do
- [x] Approach (strategy tabs)
- [x] Featured formats (audience tabs)
- [x] Programs (search, track tabs, collapse)
- [x] Schedule (timeline SVG, bar chart, autoplay, mobile pills)
- [x] Online learning
- [x] Advantages
- [x] Testimony carousel
- [x] Team (founder + 27 portraits)
- [x] Closing CTA
- [x] Contact (form + mailto handoff)

### Chrome
- [x] Loading overlay
- [x] WhatsApp panel (quick asks, outside-click, Escape)
- [x] Scroll progress bar (click scrub + keyboard)
- [x] Sticky-header shrink on scroll

### Images
- [x] `NgOptimizedImage` with a Sanity loader for team portraits
- [x] Decide: Sanity CDN vs build-time download to our own origin

### Verification
- [x] Structural parity against `main` (69 programs, 60 clients, 27 faces,
      14 months, 14 quotes, 13 reveal sections)
- [x] Interaction parity in-browser, as run against the Eleventy build
- [x] Prerendered HTML complete with JS disabled
- [x] Reduced-motion pass
- [x] AXE / WCAG AA check — `aria-hidden-focus` fixed; **colour contrast
      outstanding, needs a brand decision (see Review)**
- [x] Final payload comparison
- [ ] Lighthouse against `main` (deferred — payload measured directly instead)

## Open questions

- **Primary button contrast fails WCAG AA and needs a brand decision.** White on
  the brand cyan measures 2.53:1 against a 4.5:1 requirement. Dark ink on the
  same cyan measures 6.56:1 and is what the active tabs already use. Present in
  both variants — inherited from the design, not the port.
- Keep both variants long term, or delete the Eleventy build once adopted?

## Resolved

- Portraits: served from `cdn.sanity.io` via `NgOptimizedImage` with a Sanity
  loader. Idiomatic, gives hotspot cropping, costs a second origin. Reversible.
- Eleventy build stays on `main` until this variant is adopted.

## Review

### Outcome

Full port complete on `feat/angular`. 20 sections, 4 chrome pieces, prerendered
to static files, content from Sanity at build time.

**Structural parity with `main`: 20/20 counts identical** — 69 program rows
(including the duplicated title), 60 client pills, 40 marquee tiles, 27 faces,
14 months, 14 quotes, 13 reveal sections, 6 tab panels, 50 topic list items.

**Interaction parity: identical** across tabs, search, collapse, track switch,
timeline/bars/pills, autoplay start-stop, carousel, theme toggle, WhatsApp panel,
Escape, scroll reveal (13/13) and the team scan animation (27/27 faces resolving
to opacity 1).

**With JavaScript disabled** the Angular build serves all 69 programs, 60
clients, 14 quotes, 14 months, both strategy panels, the hard-skills track and
the contact address.

### Two defects found and fixed

1. **Stat tiles prerendered their starting values** — the page claimed "0
   Training programs" without JavaScript. Now prerenders the real figures and
   rewinds on the client. `main` still has this bug.
2. **Expand state leaked across track switches** — the hard-skills track opened
   fully expanded instead of collapsing to 15. Fixed with `linkedSignal` keyed on
   the track; regression test added.

Also fixed: the chart SVGs were `aria-hidden` while containing the only
keyboard-reachable month controls on desktop. `main` still has this too.

### Payload, measured (gzipped)

| | Angular | Eleventy |
|---|---|---|
| JS | 92.8 KB | 5.7 KB |
| CSS | 6.9 KB | 8.1 KB |
| HTML | 25.4 KB | 16.9 KB |
| **Total** | **122.0 KB** | **30.0 KB** |

The gap is the framework runtime plus the content being bundled a second time
for hydration. This was accepted knowingly in exchange for maintainability.

**Identified optimisation, not applied:** the seven genuinely static sections
(vision, what, advantages, online, cta, footer, clients) could use
`@defer (hydrate never)` to keep their templates and content out of the client
bundle. Blocked by a design conflict — `rmReveal` must run client-side to reveal
each section, so a never-hydrated section would stay at `opacity: 0` and its
content would be invisible. Doing this safely means moving reveal from a
per-section directive to a shell-level service that queries the DOM, as the
vanilla build does. Worth a follow-up; needs care, since a mistake hides content.

### One more defect, found by the owner running `ng serve`

`NgOptimizedImage` rejects pixel values in `sizes` (NG02952) and the portraits
used them, so the dev server would not boot. The assertion is development-mode
only and stripped from production builds — parity had been verified against
`ng build` output alone, so the production bundle was clean while dev mode was
broken. Fixed, and dev-mode console checking added to the verification routine.

### Tests

17 Vitest tests across 3 files, all passing: schedule geometry derivation,
program filter/collapse/track-reset, theme service.

### Still open on `main` (both variants share the design)

- Six image placeholders empty
- `team/founder.png` is a recovered crop
- Contact form hands off to a mail client rather than delivering
- Primary button contrast
