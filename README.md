# rumahmanusia

home for human

The single-page site for Rumah Manusia. A prerendered Angular application with
content in Sanity, deployed as static files to Cloudflare Pages.

## Layout

| | |
|---|---|
| `app/` | the Angular application |
| `studio/` | Sanity Studio, separate so the site build never installs it |
| `content/` | seed/mirror of the Sanity content — the site does not read this |
| `functions/` | Cloudflare Pages Functions (the enquiry endpoint) |
| `assets/`, `team/` | shared stylesheets, brand marks, original portraits |
| `tools/` | one-off extraction and asset scripts |

## Local development

```sh
npm install        # also installs app/
npm start          # dev server
npm run build      # prebuild fetches Sanity, then prerenders
npm test
npm run studio     # Sanity Studio (needs: npm --prefix studio install)
```

To exercise the enquiry Function and the `_headers` rules locally, serve the
build through Cloudflare's runtime rather than a plain static server:

```sh
npx wrangler pages dev app/dist/app/browser --compatibility-date=2026-08-27
```

## Deploying to Cloudflare Pages

Connect the GitHub repository, then:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `app/dist/app/browser` |
| Root directory | `/` |

`functions/` is picked up automatically from the repo root. The Node version is
pinned by `.node-version` — Angular 22 requires ≥22.22, above Cloudflare's
default, so removing that file will break the build.

The build fetches content from Sanity, so it needs network access and will fail
loudly if the dataset is unreachable. That is deliberate: better a failed deploy
than a silently stale one.

### Environment variables

Set these under Settings → Environment variables. Without them the enquiry form
reports that it is not configured and offers an email fallback, rather than
failing silently.

| Variable | Notes |
|---|---|
| `RESEND_API_KEY` | from resend.com |
| `ENQUIRY_TO` | `layanan@rumahmanusia.com` |
| `ENQUIRY_FROM` | must be on a domain **verified in Resend** |

See `.env.example`. No key belongs in this repository.

Verifying `rumahmanusia.com` in Resend means adding DKIM records. Take care not
to disturb the existing mail DNS while doing it.

### Rebuilding when content changes

Publishing in Studio does not rebuild the site by itself. Create a Deploy Hook
in Pages and add it as a webhook in the Sanity project so a publish triggers a
new build.

## Content

Sanity project `k01eodu7`, dataset `production`. Editing happens in Studio;
`content/*.json` is the original seed and a readable mirror, not what the site
serves. See `CLAUDE.md` for the architecture rules that are load-bearing.
