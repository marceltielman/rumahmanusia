/* Pull the published content out of Sanity into src/content/content.json,
 * ahead of the Angular build. Fetching here rather than at runtime keeps the
 * prerender pure and means the browser never talks to Sanity.
 *
 * Image fields are resolved to their CDN URLs; the NgOptimizedImage loader
 * appends width and format parameters per request.
 *
 *   node tools/fetch-content.mjs
 */
import fs from "node:fs";
import path from "node:path";

const PROJECT = "k01eodu7";
const DATASET = "production";
const API = "2024-01-01";

/* Drafts share an id prefixed with "drafts."; the dataset is public, so they
 * must be excluded explicitly or unpublished edits would leak onto the site. */
const published = (id) => `*[_id=="${id}"][0]`;

const QUERY = `{
  "site": ${published("site")},
  "hero": ${published("hero")}{
    ...,
    "images": { "panel": images.panel.asset->url, "wide": images.wide.asset->url }
  },
  "sections": ${published("sections")}{
    ...,
    "formats": formats{ ..., "images": images[].asset->url },
    "online": online{ ..., "image": image.asset->url }
  },
  "services": ${published("services")}.items,
  "strategies": ${published("strategies")}.items,
  "audiences": ${published("audiences")}.items,
  "advantages": ${published("advantages")}.items,
  "online": ${published("online")},
  "programs": ${published("programs")},
  "schedule": ${published("schedule")}.months,
  "testimonials": ${published("testimonials")}.items,
  "clients": ${published("clients")}{
    "featured": featured[]{ name, domain, "logo": logo.asset->url },
    all
  },
  "team": ${published("team")}{
    founder{ name, role, "photo": photo.asset->url },
    "members": members[]{ name, "photo": photo.asset->url },
    note
  }
}`;

const url =
  `https://${PROJECT}.api.sanity.io/v${API}/data/query/${DATASET}` +
  `?query=${encodeURIComponent(QUERY)}`;

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Sanity query failed: ${response.status} ${await response.text()}`);
}

const { result } = await response.json();

const missing = Object.entries(result)
  .filter(([, v]) => v === null || v === undefined)
  .map(([k]) => k);
if (missing.length) throw new Error(`No content for: ${missing.join(", ")}`);

const out = path.join("src", "content", "content.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(result, null, 2) + "\n");

console.log(`wrote ${out}`);
console.log(`  programs   ${result.programs.tracks.map((t) => t.programs.length).join(" + ")}`);
console.log(`  schedule   ${result.schedule.length} months`);
console.log(`  quotes     ${result.testimonials.length}`);
console.log(`  clients    ${result.clients.all.length} (${result.clients.featured.length} featured)`);
console.log(`  team       ${result.team.members.length} members`);
console.log(`  photos     ${result.team.members.filter((m) => m.photo).length} resolved`);
