/* Copy the shared stylesheets and brand assets into the Angular workspace.
 *
 * The repo root stays the single source of truth for these files; Angular
 * refuses asset paths outside its own workspace root, so they are copied in
 * before each build. The copies are generated output and gitignored.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join('..');
const jobs = [
  ['assets/styles.css', 'src/styles/ds.css'],
  ['assets/site.css', 'src/styles/site.css'],
  ['assets/logo-mark.png', 'public/assets/logo-mark.png'],
  ['assets/logo-full.png', 'public/assets/logo-full.png'],
  ['favicon.png', 'public/favicon.png'],
  ['apple-touch-icon.png', 'public/apple-touch-icon.png'],
];

for (const [from, to] of jobs) {
  const src = path.join(ROOT, from);
  if (!fs.existsSync(src)) throw new Error(`missing shared asset: ${src}`);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(src, to);
  console.log(`  ${from} -> ${to}`);
}
