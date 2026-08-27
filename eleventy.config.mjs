import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";

const CONTENT_DIR = "content";

/* Photos are generated at build time and served from our own origin rather than
 * a CMS image CDN — one origin, and Cloudflare Pages bandwidth is unmetered.
 * Accepts local paths now and remote Sanity asset URLs later, unchanged. */
async function renderPhoto(src, alt, widths, sizes, attrs = {}) {
  const metadata = await Image(src, {
    widths,
    formats: ["webp", "jpeg"],
    outputDir: "_site/img/",
    urlPath: "/img/",
    sharpJpegOptions: { quality: 82, mozjpeg: true },
    sharpWebpOptions: { quality: 78 },
  });

  return Image.generateHTML(metadata, {
    alt,
    sizes,
    loading: attrs.loading ?? "lazy",
    decoding: "async",
    ...(attrs.class ? { class: attrs.class } : {}),
  });
}

export default function (eleventyConfig) {
  eleventyConfig.addAsyncShortcode("photo", renderPhoto);

  /* Zero-padded ordinals ("01", "02") as the design numbers its lists. */
  eleventyConfig.addFilter("pad", (n, len = 2) => String(n).padStart(len, "0"));
  /* Content lives in content/*.json and is exposed under its filename, so a
   * template says {{ services }} rather than {{ content.services }}. When the
   * Sanity project exists, this loop is replaced by a fetch of the same shapes
   * and no template changes.  */
  for (const file of fs.readdirSync(CONTENT_DIR)) {
    if (!file.endsWith(".json")) continue;
    const key = path.basename(file, ".json");
    eleventyConfig.addGlobalData(key, () =>
      JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"))
    );
  }

  eleventyConfig.addPassthroughCopy("assets/styles.css");
  eleventyConfig.addPassthroughCopy("assets/site.css");
  eleventyConfig.addPassthroughCopy("assets/app.js");
  eleventyConfig.addPassthroughCopy("assets/logo-mark.png");
  eleventyConfig.addPassthroughCopy("assets/logo-full.png");
  eleventyConfig.addPassthroughCopy("favicon.png");
  eleventyConfig.addPassthroughCopy("apple-touch-icon.png");

  eleventyConfig.addWatchTarget(CONTENT_DIR);
  eleventyConfig.addWatchTarget("assets/");

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
