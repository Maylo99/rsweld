/**
 * Generates brushed-steel placeholder images for the reference gallery.
 * Deterministic per slug so re-runs produce identical files.
 *
 * Usage: node scripts/generate-placeholders.mjs
 * Output: public/references/*.jpg (+ about.jpg, og.jpg)
 *
 * These are stand-ins until the client delivers real photos — swap the files
 * and keep the names, nothing else needs to change.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.join(process.cwd(), "public", "references");
const WIDTH = 1600;
const HEIGHT = 1200;

const GALLERY_SLUGS = [
  "cable-railing",
  "rod-railing",
  "vertical-railing",
  "french-balcony",
  "design-table",
  "conveyor",
  "piping",
  "engineering-component",
  "water-industry-component",
  "ladder",
];

// Small deterministic PRNG (mulberry32) seeded from the slug.
function createRng(seedText) {
  let seed = 0;
  for (const char of seedText) {
    seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  }
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function brushedSteelSvg(slug, { dark = false } = {}) {
  const rng = createRng(slug);
  const angle = 15 + Math.round(rng() * 40);
  const base = dark
    ? ["#27272a", "#3f3f46", "#18181b", "#2e2e33"]
    : ["#e4e4e7", "#c8c8cd", "#f1f1f3", "#d4d4d8"];

  // Horizontal brushed-metal strokes with varying opacity/width.
  let strokes = "";
  for (let i = 0; i < 90; i++) {
    const y = Math.round(rng() * HEIGHT);
    const opacity = (0.02 + rng() * 0.07).toFixed(3);
    const strokeWidth = (0.6 + rng() * 2.2).toFixed(1);
    const shade = rng() > 0.5 ? "#ffffff" : "#09090b";
    strokes += `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="${shade}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`;
  }

  // A few soft vertical highlight bands, like light reflecting off a sheet.
  let bands = "";
  for (let i = 0; i < 3; i++) {
    const x = Math.round(rng() * WIDTH);
    const bandWidth = Math.round(80 + rng() * 260);
    const opacity = (0.05 + rng() * 0.08).toFixed(3);
    bands += `<rect x="${x}" y="0" width="${bandWidth}" height="${HEIGHT}" fill="url(#band)" opacity="${opacity}"/>`;
  }

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="steel" gradientTransform="rotate(${angle})">
      <stop offset="0" stop-color="${base[0]}"/>
      <stop offset="0.35" stop-color="${base[1]}"/>
      <stop offset="0.7" stop-color="${base[2]}"/>
      <stop offset="1" stop-color="${base[3]}"/>
    </linearGradient>
    <linearGradient id="band" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.85">
      <stop offset="0.6" stop-color="#09090b" stop-opacity="0"/>
      <stop offset="1" stop-color="#09090b" stop-opacity="${dark ? "0.5" : "0.22"}"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#steel)"/>
  ${bands}
  ${strokes}
  <rect width="100%" height="100%" fill="url(#vignette)"/>
</svg>`;
}

function ogSvg() {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(25)">
      <stop offset="0" stop-color="#18181b"/>
      <stop offset="1" stop-color="#27272a"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="8" fill="#114ED9"/>
  <text x="80" y="330" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="700" fill="#fafafa">RSweld</text>
  <text x="84" y="400" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#a1a1aa">Zváranie nerezu · Považská Bystrica</text>
  <rect x="84" y="440" width="120" height="6" fill="#114ED9"/>
</svg>`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const slug of GALLERY_SLUGS) {
    const svg = brushedSteelSvg(slug);
    const file = path.join(OUT_DIR, `${slug}.jpg`);
    await sharp(Buffer.from(svg)).jpeg({ quality: 72, mozjpeg: true }).toFile(file);
    console.log(`generated ${file}`);
  }

  // Dark variant used in the about section.
  await sharp(Buffer.from(brushedSteelSvg("about-workshop", { dark: true })))
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(path.join(OUT_DIR, "about.jpg"));
  console.log("generated about.jpg");

  // Open Graph image (1200×630).
  await sharp(Buffer.from(ogSvg()))
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(process.cwd(), "public", "og.jpg"));
  console.log("generated og.jpg");
}

await main();
