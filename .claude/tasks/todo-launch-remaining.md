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

### 10. Content decisions for a human

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
