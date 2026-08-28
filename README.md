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
build through Cloudflare's runtime rather than a plain static server — a plain
static server cannot run Functions or apply `_headers`:

```sh
npm run deploy:preview
```

## Deploying to Cloudflare Pages

Two routes. **Git integration is the one to use** — direct upload cannot
auto-deploy on push, and Deploy Hooks are a Git-integration feature, so the
Sanity webhook that rebuilds on publish only works with it.

### Git integration (preferred)

Connect the GitHub repository, then:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `app/dist/app/browser` |
| Root directory | `/` |

Cloudflare then builds on every push to `main`. There is no deploy command in
this mode.

### Direct upload (quick previews)

```sh
npx wrangler login    # once
npm run deploy
```

Uploads the built output straight to Cloudflare, skipping Git. Useful for a
one-off preview; it will not rebuild when you push, and environment variables
still have to be set in the dashboard.

### Notes on both

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

## Changing content

**Studio: https://rumahmanusia.sanity.studio/** — sign in with the Sanity account
that owns the project. Nothing to install and no terminal needed.

The left-hand list has one entry per area of the page: Site, Hero, Section
headings, Services, Strategies, Formats, Programs, Schedule, Online learning,
Advantages, Testimonials, Clients, Team. Each is a single document, so there is
no way to accidentally create a second copy of a section.

Edit, then **Publish**. Drafts save as you type and change nothing on the site
until published.

Some things worth knowing:

- **Order is the order on the page.** Drag items within a list to reorder them;
  program numbering is generated, not stored.
- **Icons are picked from a list**, never pasted as SVG. To add a new one it has
  to be added in two places: `app/src/app/ui/icons.ts` and
  `studio/schemaTypes/_helpers.js`.
- **Schedule months are `YYYY-MM`.** Labels, the timeline and the bar chart are
  all generated from that, so adding or removing a month redraws both charts.
- **Photos**: upload in Studio. The six empty placeholders show their caption
  until an image is added, then swap to the image automatically.

To let someone else edit, invite them under Members at
`manage.sanity.io/project/k01eodu7` (the free plan covers three users).

Redeploying Studio after a schema change: `npm run studio:deploy`.

### Making a publish rebuild the site

Publishing does not rebuild the site on its own. Two steps, once:

1. **Cloudflare** → your Pages project → Settings → Builds & deployments →
   *Deploy hooks* → Add. Name it, branch `main`, and copy the URL.
2. **Sanity** → `manage.sanity.io/project/k01eodu7/api/webhooks` → Create
   webhook:

   | Field | Value |
   |---|---|
   | Dataset | `production` |
   | URL | the deploy hook URL |
   | Trigger on | Create, Update, Delete |
   | Filter | `!(_id in path("drafts.**"))` |
   | HTTP method | `POST` |

The filter matters. Without it the hook fires on every draft autosave — a build
every few seconds while someone types, which would exhaust the free build
allowance quickly. With it, only publishing triggers a build.

Do not use `sanity hook create` for this; it makes the older unfiltered kind.

Until the hook exists, content changes appear on the next build from any cause:
a push to `main`, or `npm run deploy`.

## Content model

Sanity project `k01eodu7`, dataset `production`. `content/*.json` is the original
seed and a readable mirror, not what the site serves. See `CLAUDE.md` for the
architecture rules that are load-bearing.
