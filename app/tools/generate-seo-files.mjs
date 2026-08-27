/* Generate robots.txt and sitemap.xml into public/ before the build.
 *
 * Generated rather than committed so the canonical origin lives in exactly one
 * place (site.config.json) and lastmod reflects the build.
 */
import fs from 'node:fs';
import path from 'node:path';

const config = JSON.parse(fs.readFileSync('site.config.json', 'utf8'));
const { origin } = config;
const today = new Date().toISOString().slice(0, 10);

fs.mkdirSync('public', { recursive: true });

fs.writeFileSync(
  path.join('public', 'robots.txt'),
  `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`
);

/* One page. The in-page anchors are not separate URLs and must not be listed —
   duplicate-looking entries dilute rather than help. */
fs.writeFileSync(
  path.join('public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
);

console.log(`  public/robots.txt  -> sitemap at ${origin}/sitemap.xml`);
console.log(`  public/sitemap.xml -> ${origin}/ (lastmod ${today})`);
