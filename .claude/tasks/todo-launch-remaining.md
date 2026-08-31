# Task: remaining work before and after launch

Handover note. The site is live and working; what follows is what is left.
Written 2026-08-28.

## Where things stand

| | |
|---|---|
| Site | https://rumahmanusia.pages.dev/ — live, Cloudflare Pages, builds on push to `main` |
| Studio | https://rumahmanusia.sanity.studio/ — live |
| Sanity | project `k01eodu7`, dataset `production`, publicly readable |
| Publish → rebuild | working: Sanity webhook `y6xWt0dT2P2p4xBK` → Cloudflare deploy hook → build |
| Enquiry endpoint | `functions/api/enquiry.ts`, live, **not yet configured to send** |
| Domain | still on WordPress at GoDaddy. DNS not touched. |

Verified in production: 24 enquiry assertions, 18 no-JavaScript assertions,
zero WCAG A/AA violations in both themes, ~110 ms response.

## Blocked on the owner

### 1. Make the enquiry form actually send

Highest value item — it is the site's primary conversion path and currently
reports "not configured" and offers an email fallback.

1. Create a Resend account. Free tier covers 3,000/month.
2. **Verify `rumahmanusia.com`** there. This means adding DKIM records to the
   domain — take care not to disturb the existing mail DNS while doing it.
3. Set three variables in Pages → Settings → Environment variables:
   `RESEND_API_KEY`, `ENQUIRY_TO`, `ENQUIRY_FROM`. Template in `.env.example`.
   `ENQUIRY_FROM` must be on the verified domain.
4. Redeploy, then submit the form once and confirm it arrives.

The Function already handles a missing key gracefully, so nothing breaks while
this is pending.

### 2. Fill the six photo placeholders

Hero (2), Featured formats (3), Online learning (1). They render as dashed
frames with their captions until an image is uploaded. Do it in Studio; a
publish rebuilds the site automatically.

The old WordPress media library is the obvious source — it almost certainly has
the training-room, in-house-session, workshop-audience and online-class shots the
captions describe. **Grab them before WordPress is decommissioned.**

### 3. Replace `team/founder.png`

Currently a 205×205 head-and-shoulders crop recovered from a truncated download
— the original exceeded `DesignSync get_file`'s 256 KiB cap. Upload the
full-resolution original in Studio when available.

### 4. Old URL list, for redirects

Needed to write 301s from the WordPress URLs before DNS moves, or their search
rankings and inbound links are lost. Get it from `/wp-sitemap.xml`,
`/sitemap_index.xml`, or a Search Console export.

Implement as a `_redirects` file in `app/public/`. Cloudflare Pages reads it,
same as `_headers` (confirmed working in production).

### 5. DNS cutover

Do this last, once the preview is signed off.

- Lower the MX TTL to 300 a day beforehand.
- Export the **whole** zone first, especially MX, SPF, DKIM and DMARC.
- If DNS moves to Cloudflare, anything mail-related must stay **DNS only**
  (grey cloud) — proxying `mail.` breaks IMAP and SMTP.
- Test send *and* receive on every address afterwards, especially `layanan@`.

### 6. Decommission WordPress

Only after the new site has been live on the real domain for a while.

- Full cPanel backup first: files **and** MySQL database, downloaded off the
  server.
- Rename WordPress directories rather than deleting; delete weeks later.
- Keep the GoDaddy plan for email. It is bundled with the hosting, so cancelling
  the hosting destroys the mailboxes — that is a migration, not a billing
  change. See the discussion in the session history.

## Not blocked — can be done any time

### 7. Client marquee logos

Currently hotlinks `google.com/s2/favicons`; two of the twenty already 404, and
128px favicons look thin for a firm whose credibility rests on naming Bank
Mandiri and three ministries. The Sanity `clients.featured[].logo` field already
exists and overrides the fallback when set.

Worth checking permission before reproducing client marks. Naming them in text,
as the pill list does, is on safer ground.

### 8. Content Security Policy

Deliberately skipped: it cannot be verified without a deploy, and an untested
CSP breaks a page silently. Now that production exists, it can be done against a
preview deployment. Needs to allow the inline theme script, Google Fonts, and
`cdn.sanity.io`.

### 9. Payload: `@defer (hydrate never)`

The JS is 92 KB gzipped against the Eleventy variant's 5.7 KB. Seven sections
are entirely static (vision, what, advantages, online, cta, footer, clients) and
could keep their templates and content out of the client bundle.

**Blocked by a design conflict, not effort.** `rmReveal` must run client-side to
add `.rm-in`; a never-hydrated section would stay at `opacity: 0` and its content
would be invisible. Doing it safely means moving reveal from a per-section
directive to a shell-level service that queries the DOM, as the vanilla build
did. Get it wrong and content disappears — verify with the no-JavaScript suite.

### 10. Multi-language — considered, not planned

Raised 2026-08-28 and left as an option. Notes so the thinking is not repeated:

**Angular's built-in i18n does very little here.** It localizes hardcoded
template strings, and almost nothing on this page is hardcoded — it all comes
from Sanity. The work is in the content layer, not the framework.

Shape if it is ever wanted:

- Sanity text fields become localized (`internationalized-array`, or a
  `{ id, en }` object per field). This touches most fields across all 13
  documents and is the bulk of the engineering.
- Prerender two routes, `/` and `/en/`, passing a locale into the content fetch.
  Angular's prerenderer handles multiple routes.
- `hreflang` alternates, `og:locale:alternate`, both URLs in the sitemap, a
  switcher in the header, and the ~10 genuinely hardcoded strings ("Sending…",
  "Show all N programs", "topics", aria-labels) moved to a locale dictionary.

Roughly 1–2 days of engineering. **The expensive part is translation**, and it
is not an engineering task: 69 program names, every heading, all body copy.
Machine-translated marketing copy would read badly to precisely the audience a
human-skills training firm is trying to persuade.

**The prior question is which language should be primary.** The page is English
while all fourteen testimonials are Indonesian and the clients are Indonesian
ministries and banks — a mix that reads as unintentional. An Indonesian-first
site would plausibly convert better, with English as the secondary. Switching
outright is a content job in Studio: no schema change, no routing, no second
copy to keep in sync forever.

**Nothing to do now.** The content model is clean and localizing it later is a
contained change. Adding a half-used second locale before translations exist
would only be scaffolding, and a bilingual site doubles the editorial burden
permanently.

### 11. Per-program pages — discussed 2026-08-28, blocked on content

Splitting the single page into About / Programs / Team / Contact is **not worth
doing**: roughly neutral to slightly negative. The page currently has strong
topical density and one narrative ending in a CTA. Cutting it into five thinner
pages spreads whatever authority accrues and loses people at every navigation
hop. For a brochure site, one strong page usually beats five weak ones.

**A page per program is a different proposition and could be a real win.** The 69
program names are the long-tail inventory — someone searching "pelatihan
assertive communication" wants a page about that program, not a homepage with 69
rows. One page carries one title, one H1, one meta description; it cannot rank
well for 69 distinct intents.

There is also a concrete technical gain: the JSON-LD already emits all 69 as
`Course` entries, but as *data* with no page behind them. Real `Course` pages
with `hasCourseInstance` fed from the schedule dates are eligible for Google's
course rich results, which only works with separate pages.

**The blocker is content, not engineering.** 69 pages carrying only a program
name plus shared boilerplate are textbook thin content — they would rank *worse*
than today's page and risk quality problems. Each needs real substance: what it
covers, who it is for, duration, format, outcomes. That is 69 x a few
paragraphs, and it is a writing job.

Engineering side is contained: Angular's prerenderer handles many routes
(`getPrerenderParams`), the Sanity schema gains a per-program document type,
plus routing, internal linking and sitemap entries.

**Recommended shape if it goes ahead:** keep the single page as the homepage and
add program pages **progressively**, starting with the 10-15 programs that
actually sell, each with real content. Prove the pattern rather than publishing
54 stubs. The schedule is a second candidate, since dated public runs are exactly
what `hasCourseInstance` describes.

### 12. Move the mailboxes off GoDaddy

Note that **the website is already off GoDaddy** - it runs on Cloudflare Pages.
GoDaddy now does only two things: hold the domain, and host the mailboxes.

**The trap:** the mailboxes are bundled with the hosting plan. Cancelling the
hosting destroys them. This is a migration, not a billing change.

Current cost is about EUR 100/year *including* email, which is cheap for email
alone. **The renewal price is the trigger to move, not today.**

On AWS, asked 2026-08-28 - two unrelated products, and the distinction matters:

- **SES** is for *sending* only. It is what Resend does for the contact form; you
  cannot log in and read mail. Excellent and cheap (~$0.10/1000), but needs
  domain verification, a sandbox-exit request and IAM credentials. Resend's free
  tier already covers 3,000/month, so switching is not worth it.
- **WorkMail** does host real mailboxes, around $4/seat/month. Judged the wrong
  choice here: dated webmail, weaker calendar and contacts than the
  alternatives, and unremarkable pricing - roughly $480/year at ten mailboxes.
  Only sensible if the business is already deep in AWS and wants one bill.

Shortlist that stands, for 4-10 mailboxes:

| | Roughly |
|---|---|
| **Migadu** - flat rate, unlimited mailboxes | ~EUR 90/yr |
| **Zoho Mail** - per seat, IMAP on paid tiers only | ~$1/seat/mo |
| **Microsoft 365** - if Office is already paid for, near-zero marginal cost | ~$6/seat/mo |
| **Google Workspace** - if the team already lives in Gmail | ~$7/seat/mo |

Before choosing: **count how many of the addresses are people rather than role
addresses.** `layanan@`, `info@` and similar should be aliases or shared
mailboxes, which are free everywhere. Paying a seat for each is the common and
expensive mistake.

Migration recipe, in the order that avoids losing mail:

1. A day ahead, drop the MX TTL to 300.
2. Export the **whole** DNS zone, especially MX, SPF, DKIM and DMARC.
3. Create the mailboxes and sync **while the old MX is still live**, using the
   provider's own migration tool.
4. Switch MX.
5. **Re-run the sync** - this sweeps up anything delivered during propagation.
6. Test send *and* receive on every address, especially `layanan@`.
7. SPF, DKIM and DMARC must be **regenerated** for the new provider, not copied.
8. Anything sending through the old SMTP credentials - printers, a CRM - needs
   new settings or it silently stops.

### 13. Domain registration

Worth moving separately from anything else. Cloudflare Registrar sells at
wholesale with no markup, which usually beats GoDaddy's renewal rates
noticeably.

**Do not transfer mid-migration.** A transfer imposes a 60-day lock, and DNS
should stay stable while the site and mail are being cut over.

### 14. Content decisions for a human

- **`HARD_PROGRAMS` lists "DEBT RESTRUCTURING" twice.** In the design source.
  The "69 programs" copy depends on the duplicate; fixing it makes the number 68.
- **The page is English, all fourteen testimonials are Indonesian.** Marked with
  `lang="id"` so screen readers pronounce them correctly, but whether an
  English-only site is right for Indonesian organizations is a real question.
- **`sameAs` in the JSON-LD has Instagram only.** The YouTube entry is a channel
  name with no handle. Add a real URL to the Sanity contact rows and it is
  picked up.
- **The share image at `app/public/og.png` is my invention**, built from the real
  brand mark, typeface and palette. Worth a human eye before it is what everyone
  sees on WhatsApp.

## Reference

- `CLAUDE.md` — architecture rules that are load-bearing, and why
- `README.md` — commands, deploy settings, how to edit content
- `.claude/tasks/todo-angular-variant.md` — the port, and what it cost
- `.claude/tasks/todo-enquiry-form.md` — the form, and the no-JavaScript bug
- `.claude/tasks/todo-seo-og.md` — metadata and structured data
- branch `feat/eleventy` — the earlier implementation, frozen at parity
