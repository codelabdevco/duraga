/**
 * Script to extract tarot card data from tarot-cards-collection
 * and download images to public/cards/
 */
import tarotCards from "tarot-cards-collection";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const IMG_DIR = join(ROOT, "public", "cards");

// Thai translations for Major Arcana
const thaiNames = {
  "The Fool": "คนโง่",
  "The Magician": "นักมายากล",
  "The High Priestess": "นักบวชหญิง",
  "The Empress": "จักรพรรดินี",
  "The Emperor": "จักรพรรดิ",
  "The Hierophant": "นักบวช",
  "The Lovers": "คู่รัก",
  "The Chariot": "รถศึก",
  "Strength": "พลัง",
  "The Hermit": "ฤๅษี",
  "Wheel of Fortune": "วงล้อโชคชะตา",
  "Justice": "ความยุติธรรม",
  "The Hanged Man": "คนแขวนคอ",
  "Death": "ความตาย",
  "Temperance": "ความพอดี",
  "The Devil": "ปีศาจ",
  "The Tower": "หอคอย",
  "The Star": "ดวงดาว",
  "The Moon": "ดวงจันทร์",
  "The Sun": "ดวงอาทิตย์",
  "Judgement": "การพิพากษา",
  "The World": "โลก",
  // Cups
  "Ace of Cups": "เอส ถ้วย",
  "Two of Cups": "สอง ถ้วย",
  "Three of Cups": "สาม ถ้วย",
  "Four of Cups": "สี่ ถ้วย",
  "Five of Cups": "ห้า ถ้วย",
  "Six of Cups": "หก ถ้วย",
  "Seven of Cups": "เจ็ด ถ้วย",
  "Eight of Cups": "แปด ถ้วย",
  "Nine of Cups": "เก้า ถ้วย",
  "Ten of Cups": "สิบ ถ้วย",
  "Page of Cups": "เด็กรับใช้ ถ้วย",
  "Knight of Cups": "อัศวิน ถ้วย",
  "Queen of Cups": "ราชินี ถ้วย",
  "King of Cups": "ราชา ถ้วย",
  // Swords
  "Ace of Swords": "เอส ดาบ",
  "Two of Swords": "สอง ดาบ",
  "Three of Swords": "สาม ดาบ",
  "Four of Swords": "สี่ ดาบ",
  "Five of Swords": "ห้า ดาบ",
  "Six of Swords": "หก ดาบ",
  "Seven of Swords": "เจ็ด ดาบ",
  "Eight of Swords": "แปด ดาบ",
  "Nine of Swords": "เก้า ดาบ",
  "Ten of Swords": "สิบ ดาบ",
  "Page of Swords": "เด็กรับใช้ ดาบ",
  "Knight of Swords": "อัศวิน ดาบ",
  "Queen of Swords": "ราชินี ดาบ",
  "King of Swords": "ราชา ดาบ",
  // Wands
  "Ace of Wands": "เอส ไม้เท้า",
  "Two of Wands": "สอง ไม้เท้า",
  "Three of Wands": "สาม ไม้เท้า",
  "Four of Wands": "สี่ ไม้เท้า",
  "Five of Wands": "ห้า ไม้เท้า",
  "Six of Wands": "หก ไม้เท้า",
  "Seven of Wands": "เจ็ด ไม้เท้า",
  "Eight of Wands": "แปด ไม้เท้า",
  "Nine of Wands": "เก้า ไม้เท้า",
  "Ten of Wands": "สิบ ไม้เท้า",
  "Page of Wands": "เด็กรับใช้ ไม้เท้า",
  "Knight of Wands": "อัศวิน ไม้เท้า",
  "Queen of Wands": "ราชินี ไม้เท้า",
  "King of Wands": "ราชา ไม้เท้า",
  // Pentacles
  "Ace of Pentacles": "เอส เหรียญ",
  "Two of Pentacles": "สอง เหรียญ",
  "Three of Pentacles": "สาม เหรียญ",
  "Four of Pentacles": "สี่ เหรียญ",
  "Five of Pentacles": "ห้า เหรียญ",
  "Six of Pentacles": "หก เหรียญ",
  "Seven of Pentacles": "เจ็ด เหรียญ",
  "Eight of Pentacles": "แปด เหรียญ",
  "Nine of Pentacles": "เก้า เหรียญ",
  "Ten of Pentacles": "สิบ เหรียญ",
  "Page of Pentacles": "เด็กรับใช้ เหรียญ",
  "Knight of Pentacles": "อัศวิน เหรียญ",
  "Queen of Pentacles": "ราชินี เหรียญ",
  "King of Pentacles": "ราชา เหรียญ",
};

function getSuit(nameEn) {
  if (nameEn.includes("Cups")) return "cups";
  if (nameEn.includes("Swords")) return "swords";
  if (nameEn.includes("Wands")) return "wands";
  if (nameEn.includes("Pentacles")) return "pentacles";
  return "major";
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const { writeFileSync: wfs } = require ? { writeFileSync } : {};
        writeFileSync(dest, Buffer.concat(chunks));
        resolve();
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  if (!existsSync(IMG_DIR)) mkdirSync(IMG_DIR, { recursive: true });

  const cards = [];

  for (let i = 0; i < tarotCards.length; i++) {
    const c = tarotCards[i];
    const nameEn = c.nameEn;
    const slug = nameEn.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const imgFile = `${slug}.jpg`;
    const imgPath = join(IMG_DIR, imgFile);

    // Download image
    if (!existsSync(imgPath) && c.image) {
      try {
        console.log(`Downloading ${nameEn}...`);
        await downloadFile(c.image, imgPath);
      } catch (e) {
        console.error(`  Failed: ${e.message}`);
      }
    } else {
      console.log(`Skip ${nameEn} (exists)`);
    }

    cards.push({
      id: i,
      name: c.name,
      nameEn: c.nameEn,
      nameTh: thaiNames[c.nameEn] || c.nameEn,
      meaning: c.meaningEn,
      analysis: c.analysisEn,
      goldenSentence: c.goldenSentenceEn,
      image: `/cards/${imgFile}`,
      suit: getSuit(c.nameEn),
    });
  }

  // Write TypeScript data file
  const ts = `// Auto-generated from tarot-cards-collection
import { TarotCard } from "@/types/tarot";

export const allTarotCards: TarotCard[] = ${JSON.stringify(cards, null, 2)};

export const majorArcana = allTarotCards.filter(c => c.suit === "major");
export const minorArcana = allTarotCards.filter(c => c.suit !== "major");

export const positionNames = [
  "ตัวคุณในปัจจุบัน",
  "อุปสรรคที่เผชิญ",
  "เป้าหมายสูงสุด",
  "รากฐาน/อดีต",
  "อดีตอันใกล้",
  "อนาคตอันใกล้",
  "ตัวตนภายใน",
  "สิ่งแวดล้อม",
  "ความหวัง/ความกลัว",
  "ผลลัพธ์สุดท้าย",
];
`;

  writeFileSync(join(ROOT, "src", "data", "tarot.ts"), ts);
  console.log(`\nDone! Generated ${cards.length} cards.`);
}

main().catch(console.error);
