# Task: Deliver enquiries server-side

Replace the `mailto:` handoff with a real submission that reaches
`layanan@rumahmanusia.com` without depending on the visitor's mail client.

## Why

This is the site's primary conversion path. Today the form builds a `mailto:`
URL and hands off — which on mobile frequently goes nowhere, and for anyone on
webmail does nothing at all. Enquiries are being lost silently.

## Constraints

- Cloudflare Pages serves static files and has no PHP. Server-side work happens
  in a Pages Function.
- The Function needs an email provider. Resend chosen for a usable free tier and
  a plain REST API; isolated in one place so swapping it is a small edit.
- Must not require an API key at build time — only at runtime, from Pages
  environment variables. The repo must never contain a key.
- Progressive enhancement: the form should submit without JavaScript too, since
  the rest of the page already works that way.

## Approach

- `functions/api/enquiry.ts` — validates, checks two spam signals, sends via
  Resend, replies JSON to `fetch` and HTML to a plain form post.
- The form gets a real `action` and `method`, so a no-JS submit is a normal POST.
  Angular intercepts and uses `fetch` when available.
- Spam: a honeypot field that must stay empty, and a minimum time between page
  render and submit. No captcha for now; Turnstile is the upgrade if abuse
  appears.
- `mailto:` is kept as a fallback for when the request itself fails, so a
  provider outage degrades to today's behaviour rather than losing the enquiry.

## Steps

- [x] `functions/api/enquiry.ts`
- [x] Form posts to it; Angular submit handler uses `fetch` with states
      (idle / sending / sent / failed)
- [x] Honeypot + timing fields
- [x] No-JS path returns a readable confirmation
- [x] `_headers` for caching and baseline security headers
- [x] Document the required environment variables
- [x] Verify: validation, honeypot rejection, success path, failure fallback
- [x] Confirm no regression: build, tests, AXE, structural counts

## Risks

| Risk | Mitigation |
|---|---|
| A key committed by accident | Read only from `env`; never a default, never in the repo |
| Resend needs a verified sender domain | Document it; the Function reports a clear error rather than failing silently |
| Spam to a public endpoint | Honeypot + timing, and the Function refuses anything oversized |
| Silent failure loses an enquiry | Explicit failure state in the UI plus the `mailto:` fallback |
| CSP could break the inline theme script and Google Fonts | Not added — cannot be verified without a deploy. Left as a documented follow-up |

## Review

### Outcome

Enquiries now POST to a Cloudflare Pages Function which sends via Resend.
Verified end to end against Cloudflare's real runtime (`wrangler pages dev`),
not a stub: 24 browser assertions and 23 unit-level assertions, all passing.

Covered: client-side validation stopping before the network, the round trip,
payload contents, the unconfigured failure surfacing rather than being
swallowed, the `mailto:` fallback appearing pre-filled, a plain form post
without JavaScript, and the honeypot being accepted silently while sending
nothing.

### A worse bug found along the way

The no-JavaScript submit kept timing out because **the loading overlay was
intercepting the click** — and that turned out to be the visible symptom of
something much larger: with JavaScript disabled the page rendered **completely
in the markup and blank on screen**. The overlay is `position: fixed; inset: 0`
and only dismisses when script sets `data-done`; every `.rm-rise` section sits
at `opacity: 0` awaiting `.rm-in`; the hero's animations are `paused` awaiting
`.rm-lit`; team photos start transparent.

An earlier check had claimed the site "works with JavaScript disabled". It had
only asserted that content was present in the DOM, never that any of it was
visible. That was a real gap in how this was verified.

Fixed with a `no-js` class on `<html>` that the existing pre-paint script
removes, plus fallback rules in `site.css`. A `<noscript><style>` block does
**not** work here — the build's critical-CSS pass escapes its contents into
`&lt;style&gt;`, so it renders as literal text. Worth knowing before anyone
tries it again.

Now verified as *visible* without JavaScript: overlay gone, 0 of 13 sections
invisible, hero and panel visible, 27 of 27 photos visible, and the form
genuinely submits.

### Known and accepted

Tab panels stay `hidden` for the inactive tab without JavaScript — 3 of 6.
Switching tabs inherently needs script. The content is in the DOM and indexable,
which was the goal; a no-JS visitor sees the first tab of each group. Making the
tabs CSS-only (radio inputs) was judged disproportionate for a marketing page
and would fight the ARIA tablist pattern.

### Still needed before this works in production

1. A Resend account, and **rumahmanusia.com verified there** (DKIM records —
   take care not to disturb the existing mail DNS).
2. Three Pages environment variables: `RESEND_API_KEY`, `ENQUIRY_TO`,
   `ENQUIRY_FROM`. Template in `.env.example`; no key is in the repo.

Until those exist the Function returns a clear "not configured yet" and the UI
offers the email fallback, which is strictly better than today's silent loss.

### Deliberately not done

A Content Security Policy. It cannot be verified without a deploy — the inline
theme script, Google Fonts and the Sanity image CDN all need allowing — and an
untested CSP breaks the page silently. Left as a follow-up to do against a live
preview.
