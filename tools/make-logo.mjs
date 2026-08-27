/* One-off: derive the brandmark from the full Rumah Manusia lockup.
 *
 * Already run; assets/logo-mark.png and logo-full.png are committed. Kept as a
 * record of how they were produced. Needs sharp, which used to arrive with the
 * Eleventy image plugin — to re-run it, `npm i --no-save sharp` first.
 * The lockup stacks the symbol above a "rumah manusia" wordmark; the header,
 * loader and footer each place it beside a text wordmark, so only the symbol
 * is wanted. Run: node tools/make-logo.mjs <source.png>
 */
import sharp from "sharp";

const src = process.argv[2];
const meta = await sharp(src).metadata();
console.log(`source ${meta.width}x${meta.height}`);

// Symbol occupies the top ~62%; the wordmark begins below it.
const symbol = await sharp(src)
  .extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * 0.615) })
  .trim() // drop the transparent margin so the mark sits flush in its box
  .png()
  .toBuffer();

const trimmed = await sharp(symbol).metadata();
console.log(`symbol ${trimmed.width}x${trimmed.height}`);

await sharp(symbol).resize({ height: 320 }).png({ compressionLevel: 9 })
  .toFile("assets/logo-mark.png");

// Full lockup kept at a sane size for social cards and print.
await sharp(src).trim().resize({ height: 600 }).png({ compressionLevel: 9 })
  .toFile("assets/logo-full.png");
