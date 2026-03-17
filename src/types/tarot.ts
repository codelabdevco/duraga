export enum Screen {
  WELCOME,
  SHUFFLE,
  MEDITATE,
  SELECT,
  REVEAL,
  READING,
}

export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  nameTh: string;
  meaning: string;
  analysis?: string;
  goldenSentence: string;
  image: string;
  suit: "major" | "cups" | "swords" | "wands" | "pentacles";
}

export interface DrawnCard extends TarotCard {
  position: string;
  positionIndex: number;
}
