# Task: Open Graph tags and SEO plumbing

Add share previews and search-engine metadata to the prerendered Angular site.

## Why

The entire call-to-action strategy on this page is WhatsApp — floating button,
quick-ask prompts, a WhatsApp number in the contact rows. But a pasted link
currently renders with no image, title or description, because none of those
tags exist. For Indonesian B2B that is a direct cost.

Separately, the site is about to replace a WordPress install and will lose
whatever local SEO that had accumulated, so there should be something structured
for search engines to read on arrival.

## Approach

Everything editorial is driven from Sanity through `ContentService`, not
hardcoded, so an editor changing the description in Studio changes the share
preview too. Only the canonical origin is a constant — that is deployment
configuration, not content.

Meta tags and JSON-LD are applied during prerender, so they land in the static
HTML rather than depending on hydration.

## Steps

- [x] Share image, 1200x630, rendered from an HTML card via the browser so the
      brand font is real rather than approximated
- [x] `SeoService` — title, description, canonical, Open Graph, Twitter card
- [x] JSON-LD: Organization with both offices, contact points and social
      profiles; WebSite; OfferCatalog of the two program tracks
- [x] `robots.txt`
- [x] `sitemap.xml`
- [x] Canonical origin constant, documented as deployment config
- [x] Verify the tags are present in the prerendered HTML, not injected later
- [x] Validate the JSON-LD parses and carries the expected entities
- [x] Confirm no regression: structural counts, tests, AXE

## Risks

| Risk | Mitigation |
|---|---|
| Meta set client-side would not appear to crawlers or WhatsApp | Assert presence in the built `index.html`, not the live DOM |
| Angular strips `<script>` from templates | Build the JSON-LD element imperatively via `DOCUMENT`, set `textContent` (never `innerHTML`) |
| Wrong canonical breaks indexing | Single constant, one place, documented |
| OfferCatalog with 69 programs bloats the HTML | Measure the delta; drop it if disproportionate |

## Review

### Outcome

All metadata is applied by `provideSeo()` during prerender, so it lands in the
static HTML where crawlers and WhatsApp's unfurler can see it. Verified by
grepping the built `index.html`, not the live DOM.

Present: title, description, canonical, 11 Open Graph tags, 5 Twitter card tags,
and a JSON-LD graph.

### JSON-LD

`Organization` + `EducationalOrganization`, `WebSite`, `OfferCatalog`.

- Both offices as `Place` with `PostalAddress`; postal codes extracted by regex
  from the address lines (12910 Jakarta, 17116 Bekasi)
- Phone converted to E.164 from the WhatsApp number
- `numberOfEmployees` derived from the team count, so it tracks the CMS
- `OfferCatalog` carries all 69 programs as `Course` entries across the two
  tracks. Measured cost: **+1.6 KB gzipped** — cheap for the long-tail value on
  program-name queries, which is the page's real search substance.

`sameAs` contains Instagram only. YouTube is a channel name with no handle in the
content, and inventing a URL that 404s is worse than omitting it. **Add the real
YouTube URL to the Sanity contact rows and it will be picked up** — or extend
`socialProfiles()` if the mapping needs to be less strict.

### Idempotency

Meta tags, canonical and JSON-LD are upserted, so hydration re-running the
initializer does not duplicate them. Confirmed in-browser: exactly one of each
after hydration, zero page errors.

### Single source for the origin

`app/site.config.json` holds the canonical origin, locale and share-image
dimensions. Both the TypeScript and `tools/generate-seo-files.mjs` read it, so
`robots.txt` and `sitemap.xml` cannot drift from the meta tags. `sitemap.xml`
lists only the homepage — the in-page anchors are not separate URLs and listing
them would dilute rather than help.

### No regressions

9/9 structural counts intact, 17 tests passing, zero WCAG A/AA violations in
both themes.

### Not done

- **The share image is a design artefact I generated**, not something from the
  brand. It reuses the real Archivo face, the brand mark and the cyan panel from
  the site, but it is worth a human look before launch.
- Open Graph `og:locale` is `en_US` while the testimonials are Indonesian. If an
  Indonesian version of the page ever exists, add `og:locale:alternate`.
