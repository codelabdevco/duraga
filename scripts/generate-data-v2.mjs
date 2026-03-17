/**
 * Generate tarot data from tarot-cards-collection
 * Uses sacred-texts.com Rider-Waite images (public domain since 1909)
 */
import tarotCards from "tarot-cards-collection";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Rider-Waite image mapping from wikimedia commons (public domain)
// Using the standard numbering: Major 00-21, then suits
const rwImageBase = "https://upload.wikimedia.org/wikipedia/commons";
const rwImages = {
  "The Fool": "/9/90/RWS_Tarot_00_Fool.jpg",
  "The Magician": "/d/de/RWS_Tarot_01_Magician.jpg",
  "The High Priestess": "/8/88/RWS_Tarot_02_High_Priestess.jpg",
  "The Empress": "/d/d2/RWS_Tarot_03_Empress.jpg",
  "The Emperor": "/c/c3/RWS_Tarot_04_Emperor.jpg",
  "The Hierophant": "/8/8d/RWS_Tarot_05_Hierophant.jpg",
  "The Lovers": "/3/3a/TheLovers.jpg",
  "The Chariot": "/9/9b/RWS_Tarot_07_Chariot.jpg",
  "Strength": "/f/f5/RWS_Tarot_08_Strength.jpg",
  "The Hermit": "/4/4d/RWS_Tarot_09_Hermit.jpg",
  "The Wheel of Fortune": "/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg",
  "Justice": "/e/e0/RWS_Tarot_11_Justice.jpg",
  "The Hanged Man": "/2/2b/RWS_Tarot_12_Hanged_Man.jpg",
  "Death": "/d/d7/RWS_Tarot_13_Death.jpg",
  "Temperance": "/f/f8/RWS_Tarot_14_Temperance.jpg",
  "The Devil": "/5/55/RWS_Tarot_15_Devil.jpg",
  "The Tower": "/5/53/RWS_Tarot_16_Tower.jpg",
  "The Star": "/d/db/RWS_Tarot_17_Star.jpg",
  "The Moon": "/7/7f/RWS_Tarot_18_Moon.jpg",
  "The Sun": "/1/17/RWS_Tarot_19_Sun.jpg",
  "Judgement": "/d/dd/RWS_Tarot_20_Judgement.jpg",
  "The World": "/f/ff/RWS_Tarot_21_World.jpg",
  // Cups
  "Ace of Cups": "/3/36/Cups01.jpg",
  "Two of Cups": "/f/f8/Cups02.jpg",
  "Three of Cups": "/7/7a/Cups03.jpg",
  "Four of Cups": "/3/35/Cups04.jpg",
  "Five of Cups": "/d/d7/Cups05.jpg",
  "Six of Cups": "/1/17/Cups06.jpg",
  "Seven of Cups": "/a/ae/Cups07.jpg",
  "Eight of Cups": "/6/60/Cups08.jpg",
  "Nine of Cups": "/2/24/Cups09.jpg",
  "Ten of Cups": "/8/84/Cups10.jpg",
  "Page of Cups": "/a/ad/Cups11.jpg",
  "Knight of Cups": "/f/fa/Cups12.jpg",
  "Queen of Cups": "/6/62/Cups13.jpg",
  "King of Cups": "/0/04/Cups14.jpg",
  // Swords
  "Ace of Swords": "/1/1a/Swords01.jpg",
  "Two of Swords": "/9/9e/Swords02.jpg",
  "Three of Swords": "/0/02/Swords03.jpg",
  "Four of Swords": "/b/bf/Swords04.jpg",
  "Five of Swords": "/2/23/Swords05.jpg",
  "Six of Swords": "/2/29/Swords06.jpg",
  "Seven of Swords": "/3/34/Swords07.jpg",
  "Eight of Swords": "/a/a7/Swords08.jpg",
  "Nine of Swords": "/2/2f/Swords09.jpg",
  "Ten of Swords": "/d/d4/Swords10.jpg",
  "Page of Swords": "/4/4c/Swords11.jpg",
  "Knight of Swords": "/b/b0/Swords12.jpg",
  "Queen of Swords": "/d/d4/Swords13.jpg",
  "King of Swords": "/3/33/Swords14.jpg",
  // Wands
  "Ace of Wands": "/1/11/Wands01.jpg",
  "Two of Wands": "/0/0f/Wands02.jpg",
  "Three of Wands": "/f/ff/Wands03.jpg",
  "Four of Wands": "/a/a4/Wands04.jpg",
  "Five of Wands": "/9/9d/Wands05.jpg",
  "Six of Wands": "/3/3b/Wands06.jpg",
  "Seven of Wands": "/e/e4/Wands07.jpg",
  "Eight of Wands": "/6/6b/Wands08.jpg",
  "Nine of Wands": "/e/e7/Wands09.jpg",
  "Ten of Wands": "/0/0b/Wands10.jpg",
  "Page of Wands": "/6/6a/Wands11.jpg",
  "Knight of Wands": "/1/16/Wands12.jpg",
  "Queen of Wands": "/0/0d/Wands13.jpg",
  "King of Wands": "/c/ce/Wands14.jpg",
  // Pentacles
  "Ace of Pentacles": "/f/fd/Pents01.jpg",
  "Two of Pentacles": "/9/9f/Pents02.jpg",
  "Three of Pentacles": "/4/42/Pents03.jpg",
  "Four of Pentacles": "/3/35/Pents04.jpg",
  "Five of Pentacles": "/9/96/Pents05.jpg",
  "Six of Pentacles": "/a/a6/Pents06.jpg",
  "Seven of Pentacles": "/6/6a/Pents07.jpg",
  "Eight of Pentacles": "/4/49/Pents08.jpg",
  "Nine of Pentacles": "/f/f0/Pents09.jpg",
  "Ten of Pentacles": "/4/42/Pents10.jpg",
  "Page of Pentacles": "/e/ec/Pents11.jpg",
  "Knight of Pentacles": "/d/d5/Pents12.jpg",
  "Queen of Pentacles": "/8/88/Pents13.jpg",
  "King of Pentacles": "/1/1c/Pents14.jpg",
};

const thaiNames = {
  "The Fool": "คนโง่", "The Magician": "นักมายากล", "The High Priestess": "นักบวชหญิง",
  "The Empress": "จักรพรรดินี", "The Emperor": "จักรพรรดิ", "The Hierophant": "นักบวช",
  "The Lovers": "คู่รัก", "The Chariot": "รถศึก", "Strength": "พลัง",
  "The Hermit": "ฤๅษี", "The Wheel of Fortune": "วงล้อโชคชะตา", "Justice": "ความยุติธรรม",
  "The Hanged Man": "คนแขวนคอ", "Death": "ความตาย", "Temperance": "ความพอดี",
  "The Devil": "ปีศาจ", "The Tower": "หอคอย", "The Star": "ดวงดาว",
  "The Moon": "ดวงจันทร์", "The Sun": "ดวงอาทิตย์", "Judgement": "การพิพากษา",
  "The World": "โลก",
  "Ace of Cups": "เอส ถ้วย", "Two of Cups": "สอง ถ้วย", "Three of Cups": "สาม ถ้วย",
  "Four of Cups": "สี่ ถ้วย", "Five of Cups": "ห้า ถ้วย", "Six of Cups": "หก ถ้วย",
  "Seven of Cups": "เจ็ด ถ้วย", "Eight of Cups": "แปด ถ้วย", "Nine of Cups": "เก้า ถ้วย",
  "Ten of Cups": "สิบ ถ้วย", "Page of Cups": "เด็กรับใช้ ถ้วย", "Knight of Cups": "อัศวิน ถ้วย",
  "Queen of Cups": "ราชินี ถ้วย", "King of Cups": "ราชา ถ้วย",
  "Ace of Swords": "เอส ดาบ", "Two of Swords": "สอง ดาบ", "Three of Swords": "สาม ดาบ",
  "Four of Swords": "สี่ ดาบ", "Five of Swords": "ห้า ดาบ", "Six of Swords": "หก ดาบ",
  "Seven of Swords": "เจ็ด ดาบ", "Eight of Swords": "แปด ดาบ", "Nine of Swords": "เก้า ดาบ",
  "Ten of Swords": "สิบ ดาบ", "Page of Swords": "เด็กรับใช้ ดาบ", "Knight of Swords": "อัศวิน ดาบ",
  "Queen of Swords": "ราชินี ดาบ", "King of Swords": "ราชา ดาบ",
  "Ace of Wands": "เอส ไม้เท้า", "Two of Wands": "สอง ไม้เท้า", "Three of Wands": "สาม ไม้เท้า",
  "Four of Wands": "สี่ ไม้เท้า", "Five of Wands": "ห้า ไม้เท้า", "Six of Wands": "หก ไม้เท้า",
  "Seven of Wands": "เจ็ด ไม้เท้า", "Eight of Wands": "แปด ไม้เท้า", "Nine of Wands": "เก้า ไม้เท้า",
  "Ten of Wands": "สิบ ไม้เท้า", "Page of Wands": "เด็กรับใช้ ไม้เท้า", "Knight of Wands": "อัศวิน ไม้เท้า",
  "Queen of Wands": "ราชินี ไม้เท้า", "King of Wands": "ราชา ไม้เท้า",
  "Ace of Pentacles": "เอส เหรียญ", "Two of Pentacles": "สอง เหรียญ", "Three of Pentacles": "สาม เหรียญ",
  "Four of Pentacles": "สี่ เหรียญ", "Five of Pentacles": "ห้า เหรียญ", "Six of Pentacles": "หก เหรียญ",
  "Seven of Pentacles": "เจ็ด เหรียญ", "Eight of Pentacles": "แปด เหรียญ", "Nine of Pentacles": "เก้า เหรียญ",
  "Ten of Pentacles": "สิบ เหรียญ", "Page of Pentacles": "เด็กรับใช้ เหรียญ", "Knight of Pentacles": "อัศวิน เหรียญ",
  "Queen of Pentacles": "ราชินี เหรียญ", "King of Pentacles": "ราชา เหรียญ",
};

function getSuit(nameEn) {
  if (nameEn.includes("Cups")) return "cups";
  if (nameEn.includes("Swords")) return "swords";
  if (nameEn.includes("Wands")) return "wands";
  if (nameEn.includes("Pentacles")) return "pentacles";
  return "major";
}

const cards = tarotCards.map((c, i) => {
  const imgPath = rwImages[c.nameEn];
  const image = imgPath ? `${rwImageBase}${imgPath}` : "";

  return {
    id: i,
    name: c.name,
    nameEn: c.nameEn,
    nameTh: thaiNames[c.nameEn] || c.nameEn,
    meaning: c.meaningEn,
    analysis: c.analysisEn,
    goldenSentence: c.goldenSentenceEn,
    image,
    suit: getSuit(c.nameEn),
  };
});

const ts = `// Auto-generated from tarot-cards-collection + Wikimedia Rider-Waite images (public domain)
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
console.log(`Generated ${cards.length} cards with Wikimedia Commons images.`);
console.log(`Cards with images: ${cards.filter(c => c.image).length}`);
console.log(`Cards without images: ${cards.filter(c => !c.image).length}`);
