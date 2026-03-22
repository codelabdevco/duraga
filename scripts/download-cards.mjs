import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const CARDS_DIR = join(import.meta.dirname, "..", "public", "cards");
if (!existsSync(CARDS_DIR)) mkdirSync(CARDS_DIR, { recursive: true });

const tarotFile = readFileSync(join(import.meta.dirname, "..", "src", "data", "tarot.ts"), "utf-8");

// Extract URL and derive a stable filename from the URL itself
const imageRegex = /"image":\s*"(https?:\/\/[^"]+)"/g;
const entries = [];
let match;
while ((match = imageRegex.exec(tarotFile)) !== null) {
  const url = match[1];
  // Use the original filename from the URL as the local filename
  const urlFilename = url.split("/").pop().replace(/[^a-zA-Z0-9_.-]/g, "_");
  entries.push({ url, localFilename: urlFilename });
}

console.log(`Found ${entries.length} card images to download`);

async function downloadImage(entry) {
  const { url, localFilename } = entry;
  const filepath = join(CARDS_DIR, localFilename);

  if (existsSync(filepath)) {
    console.log(`  [skip] ${localFilename}`);
    return { url, localPath: `/cards/${localFilename}` };
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 3000 * attempt));
      const res = await fetch(url, {
        headers: { "User-Agent": "DuragaTarotApp/1.0 (public domain Rider-Waite)" }
      });
      if (res.status === 429) {
        console.log(`  [429] ${localFilename} — retrying in ${3 * (attempt + 1)}s...`);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      writeFileSync(filepath, buffer);
      console.log(`  [done] ${localFilename} (${(buffer.length / 1024).toFixed(0)}KB)`);
      return { url, localPath: `/cards/${localFilename}` };
    } catch (err) {
      if (attempt === 2) {
        console.error(`  [fail] ${localFilename}: ${err.message}`);
        return { url, localPath: null };
      }
    }
  }
  return { url, localPath: null };
}

// Download one at a time with delay
const results = [];
for (let i = 0; i < entries.length; i++) {
  const result = await downloadImage(entries[i]);
  results.push(result);
  await new Promise(r => setTimeout(r, 1500));
}

// Update tarot.ts — replace each URL with its local path
let updatedTarot = tarotFile;
for (const { url, localPath } of results) {
  if (localPath) {
    updatedTarot = updatedTarot.split(url).join(localPath);
  }
}
writeFileSync(join(import.meta.dirname, "..", "src", "data", "tarot.ts"), updatedTarot);

const success = results.filter(r => r.localPath).length;
const failed = results.filter(r => !r.localPath).length;
console.log(`\nDone! ${success} downloaded, ${failed} failed`);
if (failed > 0) {
  console.log("Failed URLs:");
  results.filter(r => !r.localPath).forEach(r => console.log(`  ${r.url}`));
}
