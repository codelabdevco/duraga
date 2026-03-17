// ===== PHASES =====
export type Phase = "landing" | "topic" | "spread" | "question" | "shuffle" | "fan" | "layout" | "flip" | "reading";

// ===== TOPICS =====
export interface Topic {
  id: string;
  icon: string;
  nameTH: string;
  nameEN: string;
  color: string;
  desc: string;
  examples: string[];
}

export const TOPICS: Topic[] = [
  { id: "love", icon: "♥", nameTH: "ความรัก / คู่ครอง", nameEN: "Love & Relationships", color: "#c44a5a", desc: "เนื้อคู่ แอบชอบ คืนดี คู่รัก", examples: ["เขาคิดอย่างไรกับฉัน", "จะเจอเนื้อคู่เมื่อไร"] },
  { id: "career", icon: "⚙", nameTH: "การงาน / อาชีพ", nameEN: "Career", color: "#c9a84c", desc: "เลื่อนขั้น เปลี่ยนงาน เพื่อนร่วมงาน", examples: ["ควรเปลี่ยนงานไหม", "จะได้เลื่อนตำแหน่งไหม"] },
  { id: "money", icon: "★", nameTH: "การเงิน / โชคลาภ", nameEN: "Money & Fortune", color: "#4a9e6e", desc: "รายได้ หนี้สิน ลงทุน ค้าขาย", examples: ["การเงินช่วงนี้เป็นอย่างไร", "ควรลงทุนไหม"] },
  { id: "health", icon: "✚", nameTH: "สุขภาพ / พลังงาน", nameEN: "Health & Energy", color: "#9b7dd4", desc: "กาย จิต ความเครียด สมดุลชีวิต", examples: ["สุขภาพช่วงนี้เป็นอย่างไร"] },
  { id: "education", icon: "✎", nameTH: "การเรียน / สอบ", nameEN: "Education", color: "#378add", desc: "เรียนต่อ ทุน สอบ ทักษะใหม่", examples: ["จะสอบผ่านไหม", "ควรเรียนต่อไหม"] },
  { id: "family", icon: "⌂", nameTH: "ครอบครัว / บ้าน", nameEN: "Family & Home", color: "#d4537e", desc: "พ่อแม่ ลูก คู่สมรส ย้ายบ้าน", examples: ["ความสัมพันธ์ในครอบครัว"] },
  { id: "spiritual", icon: "☀", nameTH: "จิตวิญญาณ / ค้นหาตัวเอง", nameEN: "Spiritual Growth", color: "#639922", desc: "เป้าหมายชีวิต กรรม บทเรียน", examples: ["บทเรียนชีวิตตอนนี้คืออะไร"] },
  { id: "decision", icon: "⚖", nameTH: "การตัดสินใจ", nameEN: "Decision Making", color: "#d85a30", desc: "ทางสองแพร่ง เลือก A หรือ B", examples: ["ควรเลือกทางไหน"] },
  { id: "travel", icon: "✈", nameTH: "การเดินทาง / ย้ายถิ่น", nameEN: "Travel & Relocation", color: "#1d9e75", desc: "ต่างประเทศ ย้ายเมือง เที่ยว", examples: ["ควรย้ายไปเมืองใหม่ไหม"] },
  { id: "general", icon: "✦", nameTH: "ดวงรวม / ภาพรวม", nameEN: "General Reading", color: "#888780", desc: "วันนี้ สัปดาห์ เดือน ปี", examples: ["ดวงช่วงนี้เป็นอย่างไร"] },
];

// ===== SPREADS =====
export interface SpreadPosition {
  id: number;
  nameTH: string;
  nameEN: string;
}

export interface Spread {
  id: string;
  name: string;
  nameTH: string;
  cardCount: number;
  desc: string;
  positions: SpreadPosition[];
}

export const SPREADS: Spread[] = [
  { id: "daily", name: "Daily Card", nameTH: "ไพ่ประจำวัน", cardCount: 1, desc: "จั่ว 1 ใบ ดูพลังงาน/ข้อความวันนี้",
    positions: [{ id: 1, nameTH: "ข้อความวันนี้", nameEN: "Daily message" }] },
  { id: "yesno", name: "Yes or No", nameTH: "ใช่หรือไม่", cardCount: 1, desc: "จั่ว 1 ใบ หงาย=ใช่ คว่ำ=ไม่",
    positions: [{ id: 1, nameTH: "คำตอบ", nameEN: "The answer" }] },
  { id: "three", name: "Three Card", nameTH: "อดีต ปัจจุบัน อนาคต", cardCount: 3, desc: "3 ใบเรียงแนวนอน ดูทิศทาง",
    positions: [
      { id: 1, nameTH: "อดีต / ที่มา", nameEN: "Past" },
      { id: 2, nameTH: "ปัจจุบัน", nameEN: "Present" },
      { id: 3, nameTH: "อนาคต / ทิศทาง", nameEN: "Future" },
    ] },
  { id: "five", name: "Five Card Cross", nameTH: "กากบาท 5 ใบ", cardCount: 5, desc: "5 ใบรูปกากบาท เห็นสาเหตุ+ศักยภาพ",
    positions: [
      { id: 1, nameTH: "อดีต / ที่มา", nameEN: "Past" },
      { id: 2, nameTH: "ปัจจุบัน", nameEN: "Present" },
      { id: 3, nameTH: "อนาคต", nameEN: "Future" },
      { id: 4, nameTH: "สาเหตุลึก / รากฐาน", nameEN: "Root cause" },
      { id: 5, nameTH: "ศักยภาพ / คำแนะนำ", nameEN: "Potential / Advice" },
    ] },
  { id: "horseshoe", name: "Horseshoe", nameTH: "เกือกม้า 7 ใบ", cardCount: 7, desc: "7 ใบโค้งเกือกม้า ละเอียดดี",
    positions: [
      { id: 1, nameTH: "อดีต", nameEN: "Past" },
      { id: 2, nameTH: "ปัจจุบัน", nameEN: "Present" },
      { id: 3, nameTH: "สิ่งที่ซ่อนอยู่", nameEN: "Hidden influences" },
      { id: 4, nameTH: "คำแนะนำ", nameEN: "Advice" },
      { id: 5, nameTH: "คนรอบข้าง", nameEN: "People around you" },
      { id: 6, nameTH: "อุปสรรค", nameEN: "Obstacle" },
      { id: 7, nameTH: "ผลลัพธ์", nameEN: "Outcome" },
    ] },
  { id: "celtic", name: "Celtic Cross", nameTH: "เซลติกครอส 10 ใบ", cardCount: 10, desc: "10 ใบ วิเคราะห์ครบทุกมิติ คลาสสิคที่สุด",
    positions: [
      { id: 1, nameTH: "สถานการณ์ปัจจุบัน", nameEN: "Present situation" },
      { id: 2, nameTH: "อุปสรรค / ท้าทาย", nameEN: "Challenge" },
      { id: 3, nameTH: "เป้าหมาย / อุดมคติ", nameEN: "Goal / Ideal" },
      { id: 4, nameTH: "รากฐาน / อดีตไกล", nameEN: "Foundation" },
      { id: 5, nameTH: "อดีตที่ผ่านมา", nameEN: "Recent past" },
      { id: 6, nameTH: "อนาคตอันใกล้", nameEN: "Near future" },
      { id: 7, nameTH: "ตัวคุณเอง", nameEN: "Self" },
      { id: 8, nameTH: "สิ่งแวดล้อม / คนรอบข้าง", nameEN: "Environment" },
      { id: 9, nameTH: "ความหวัง / ความกลัว", nameEN: "Hopes & Fears" },
      { id: 10, nameTH: "ผลลัพธ์สุดท้าย", nameEN: "Final outcome" },
    ] },
];

export const TOPIC_DEFAULT_SPREAD: Record<string, string> = {
  love: "celtic", career: "five", money: "horseshoe", health: "three",
  education: "three", family: "five", spiritual: "five", decision: "yesno",
  travel: "three", general: "daily",
};

// ===== CARD TYPES =====
export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  nameTh: string;
  meaning: string;
  meaningTh?: string;
  analysis?: string;
  analysisTh?: string;
  goldenSentence: string;
  goldenSentenceTh?: string;
  image: string;
  suit: "major" | "cups" | "swords" | "wands" | "pentacles";
}

export interface PickedCard extends TarotCard {
  positionIndex: number;
  isReversed: boolean;
}
