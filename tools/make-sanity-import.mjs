/* Turn content/*.json into an NDJSON seed file for `sanity dataset import`.
 *
 * Each content file becomes one singleton document whose _id matches its
 * schema type, so the Studio desk can address them directly. Images are not
 * included — they are uploaded separately by tools/upload-assets.mjs, because
 * assets need an authenticated write and a reference patch.
 *
 *   node tools/make-sanity-import.mjs            -> content/.seed.ndjson
 */
import fs from "node:fs";
import path from "node:path";

const read = (name) =>
  JSON.parse(fs.readFileSync(path.join("content", name + ".json"), "utf8"));

/* Sanity needs a stable _key on every object inside an array. Derived from the
 * position so re-running the export produces an identical file. */
let counter = 0;
function keyed(value) {
  if (Array.isArray(value)) {
    return value.map((item) =>
      item && typeof item === "object" && !Array.isArray(item)
        ? { _key: `k${counter++}`, ...keyed(item) }
        : keyed(item)
    );
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, keyed(v)])
    );
  }
  return value;
}

const doc = (type, fields) => ({ _id: type, _type: type, ...keyed(fields) });

const site = read("site");
const hero = read("hero");

const docs = [
  doc("site", site),
  doc("hero", {
    eyebrow: hero.eyebrow,
    heading: hero.heading,
    lead: hero.lead,
    secondaryCta: hero.secondaryCta,
    tags: hero.tags,
    stats: hero.stats,
    slots: hero.slots,
  }),
  doc("sections", read("sections")),
  doc("services", { items: read("services") }),
  doc("strategies", { items: read("strategies") }),
  doc("audiences", { items: read("audiences") }),
  doc("advantages", { items: read("advantages") }),
  doc("online", read("online")),
  doc("programs", read("programs")),
  doc("schedule", { months: read("schedule") }),
  doc("testimonials", { items: read("testimonials") }),
  doc("clients", read("clients")),
  doc("team", read("team")),
];

const out = "content/.seed.ndjson";
fs.writeFileSync(out, docs.map((d) => JSON.stringify(d)).join("\n") + "\n");

console.log(`wrote ${out}`);
for (const d of docs) {
  const size = JSON.stringify(d).length;
  console.log(`  ${d._id.padEnd(14)} ${String(size).padStart(6)} bytes`);
}
