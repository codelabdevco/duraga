// Generate simple PWA icons as SVG-based PNGs
// Since we don't have canvas, create SVG files that Next.js can serve
import { writeFileSync } from "fs";
import { join } from "path";

const ICONS_DIR = join(import.meta.dirname, "..", "public", "icons");

function createSVG(size) {
  const fontSize = Math.round(size * 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#08090e"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.4}" fill="none" stroke="#e8d48b" stroke-width="${size*0.02}" opacity="0.3"/>
  <text x="${size/2}" y="${size/2 + fontSize*0.35}" text-anchor="middle" fill="#e8d48b" font-size="${fontSize}" font-family="serif">&#10022;</text>
</svg>`;
}

for (const size of [192, 512]) {
  writeFileSync(join(ICONS_DIR, `icon-${size}.svg`), createSVG(size));
  console.log(`Created icon-${size}.svg`);
}
