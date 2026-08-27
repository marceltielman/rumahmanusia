/* Upload the team photographs as Sanity assets and point the team document at
 * them. Run from studio/:
 *
 *   npx sanity exec scripts/upload-team.mjs --with-user-token
 *
 * Idempotent: an asset already carrying the same originalFilename is reused
 * rather than uploaded again, so re-running does not duplicate assets.
 */
import fs from "node:fs";
import path from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2024-01-01" });
const TEAM_DIR = path.join("..", "team");

const imageRef = (id) => ({
  _type: "image",
  asset: { _type: "reference", _ref: id },
});

async function ensureAsset(file) {
  const filename = path.basename(file);
  const existing = await client.fetch(
    `*[_type=="sanity.imageAsset" && originalFilename==$f][0]._id`,
    { f: filename }
  );
  if (existing) {
    console.log(`  reuse  ${filename}`);
    return existing;
  }
  const asset = await client.assets.upload("image", fs.createReadStream(file), {
    filename,
  });
  console.log(`  upload ${filename} -> ${asset._id}`);
  return asset._id;
}

const team = await client.fetch(`*[_id=="team"][0]`);
if (!team) throw new Error("team document not found — run the dataset import first");

const founderId = await ensureAsset(path.join(TEAM_DIR, "founder.png"));

const members = [];
for (const [i, member] of (team.members || []).entries()) {
  const file = path.join(TEAM_DIR, `t${String(i + 1).padStart(2, "0")}.png`);
  if (!fs.existsSync(file)) {
    console.log(`  skip   ${file} (missing)`);
    members.push(member);
    continue;
  }
  members.push({ ...member, photo: imageRef(await ensureAsset(file)) });
}

await client
  .patch("team")
  .set({ "founder.photo": imageRef(founderId), members })
  .commit();

console.log(`\npatched team: founder + ${members.filter((m) => m.photo).length} members`);
