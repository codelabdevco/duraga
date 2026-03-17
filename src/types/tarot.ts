export enum Screen {
  WELCOME,
  SHUFFLE,
  MEDITATE,
  SPREAD_PICK,
  SELECT,
  REVEAL,
  READING,
}

export type SpreadType = "single" | "three" | "celtic";

export const SPREAD_CONFIG: Record<SpreadType, { label: string; desc: string; count: number; icon: string }> = {
  single: { label: "ไพ่ใบเดียว", desc: "คำตอบสั้น กระชับ ตรงประเด็น", count: 1, icon: "✦" },
  three: { label: "3 ใบ", desc: "อดีต · ปัจจุบัน · อนาคต", count: 3, icon: "☽" },
  celtic: { label: "10 ใบ", desc: "Celtic Cross วิเคราะห์เชิงลึก", count: 10, icon: "✧" },
};

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

export interface DrawnCard extends TarotCard {
  position: string;
  positionIndex: number;
}
