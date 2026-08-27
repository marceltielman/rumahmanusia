# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, single-page marketing site for Rumah Manusia (Indonesian training / coaching /
consulting firm), implemented from a Claude Design canvas. There is **no build step, no
package manager, no test suite, and no framework** — plain HTML, CSS and one vanilla JS file.

```
index.html          all markup and all content (single page, ~1200 lines, generated once then hand-maintained)
assets/styles.css   the "Modernist" design-system layer — tokens + .btn/.card/.tag/.input primitives
assets/site.css     page layer — brand token overrides, all motion, and page component classes
assets/app.js       behavior only — contains no content
team/*.png          founder + 27 trainer portraits (200×200)
favicon.png, apple-touch-icon.png
.import/            fetched copy of the canvas source (reference only, not served)
```

## Commands

```sh
python3 -m http.server 8000        # serve; open http://localhost:8000
```

Relative paths (`assets/`, `team/`, `favicon.png`) mean it must be served over HTTP, not
opened as `file://`. Deploy by copying the repo root as-is.

## Provenance

The design source of truth is the Claude Design project
`43ab0bc8-86fd-4349-a864-0acf95a5691f`, file `Rumah Manusia v5 motion.dc.html`. Read it with
the `DesignSync` MCP tool (`get_file`); `.import/v5-motion.dc.html` is a local copy.

That canvas file runs on the design-canvas React runtime (`<x-dc>` template, `sc-for`/`sc-if`,
`{{ }}` bindings, a `DCLogic` component class). **This repo is a re-implementation, not a
port** — the runtime, `support.js` and `image-slot.js` are deliberately not shipped. When
reconciling against the design, compare *behavior and computed values*, not markup shape.

`assets/styles.css` is the design system verbatim from the canvas project. Treat it as synced
output: put page-level overrides in `site.css` rather than retuning tokens here, or a future
design sync will clobber them.

## Architecture

**Content lives in HTML, never in JS.** Every state of every dynamic section is rendered
statically and JS toggles the `hidden` attribute. Consequences worth knowing before editing:

- Adding a program, month, quote, client or trainer is an **HTML-only** edit. `app.js` derives
  labels and counts from the DOM — month names from the pill button text, topic counts from
  `<ul>` child count, program search from `.rm-prog[data-name]` (lowercased), quote count from
  `.rm-quote` siblings.
- `site.css` needs `[hidden] { display: none !important }` because the component classes set
  `display: flex/grid`, which would otherwise win over `[hidden]`.
- Tabs are generic: a `[role="tablist"][data-tabs="..."]` whose `[role="tab"]` buttons point at
  panels via `aria-controls`. Three groups use it (`strategy`, `audience`, `track`).

### Motion contract (the main source of coupling)

Scroll reveal, staggering and the team-photo effect are split across all three files, so a
structural edit in `index.html` can silently break animation:

- Sections opt in with `class="rm-rise"`; `app.js` adds `.rm-in` via IntersectionObserver.
- `site.css` staggers `.rm-rise > *` with `:nth-child(1..5)` and starts them at `opacity: 0`.
  **Each `.rm-rise` section must keep exactly one direct child wrapper** (the `.rm-wrap` div) —
  adding a second direct child makes it animate as a separate stagger step.
- `.rm-hero > *:nth-child(1..5)` delays assume the hero's five children in order.
- `.rm-face img` starts at `opacity: 0` and is only made visible by the `rm-resolve` scan
  animation, which requires the ancestor `.rm-rise.rm-in`. Team photos are invisible until the
  section reveals. The diagonal wipe comes from per-face inline `animation-delay`.
- The canvas restarted animations by alternating duplicate keyframe names on re-render. Here
  `app.js` restarts them explicitly with a `replay(el, anim)` helper, so the duplicates
  (`rm-in-b`, `rm-t-b`, `rm-q-a2`, `rm-q-b2`) were removed. If you add a state change that
  should re-animate, call `replay()` — don't reintroduce paired keyframes.
- Everything is guarded by `prefers-reduced-motion: reduce`; keep new motion guarded too.

### Theme

Dark mode is opt-in via `html[data-theme="dark"]`, whose token overrides live at the end of the
brand block in `site.css`. An inline script in `<head>` resolves the theme from
`localStorage["rm-theme"]` (falling back to `prefers-color-scheme`) **before first paint** to
avoid a white flash; `app.js` only handles the toggle button. No `prefers-color-scheme` media
query styles the page — the attribute is the single switch.

### Fixed values carried over from the canvas

The canvas exposed editable props; those defaults are now hard-coded and appear in more than
one place:

- Program grid `347px` column min (`site.css` `.rm-prog-grid`) — was `round(1040 / 3)` columns.
- Program collapse threshold: **15** rows (`app.js` and the initial count text in `index.html`).
- Schedule timeline geometry: `x = 40 + i * (1000/13)` over a `0 0 1080 150` viewBox; bars are
  `x = 4 + i*14`, `height = topics * 10` in a `0 0 200 60` viewBox. Both are baked into the
  generated SVG — recompute if the month count changes from 14.
- Autoplay steps one month every 2200 ms.

## Known gaps

- **`assets/app.js` is not written yet.** `index.html` already loads it, so the page currently
  renders complete and readable but is inert: no scroll reveal (sections stay at `opacity: 0`
  past the fold), no theme toggle, no tabs, no search, no carousel. The head script still sets
  the theme. This is the next piece of work; the contract it must satisfy is the Architecture
  section above.
- `team/founder.png` is a 205×205 head-and-shoulders **crop recovered from a truncated
  download** — the original exceeds `DesignSync get_file`'s 256 KiB cap. Replace it with the
  full-resolution original when available.
- `.rm-slot` elements are empty photo placeholders (hero ×2, formats ×3, online ×1). They
  replace the canvas's `<image-slot>` component, which had no filled images. Drop an `<img>`
  inside a `.rm-slot` to fill one; `.rm-slot:has(img)` removes the dashed frame.
- The client marquee hotlinks `google.com/s2/favicons` for logos, as the canvas did. Self-host
  if that matters.
- `HARD_PROGRAMS` contains "DEBT RESTRUCTURING" twice — present in the design source, kept
  verbatim so the 69-program count in the copy still holds.

## Not applicable here

This repo has no `workflow/` directory, so the multi-agent sprint contract in
`~/.claude/CLAUDE.md` does not apply. There is no Angular or Go toolchain either, so the
`frontend-dev` plugin pipelines (`/frontend-dev:pipeline`, `ng-*`, `go-*`) have nothing to run
against — its SessionStart hook nags for orchestration sections that this project does not need.
