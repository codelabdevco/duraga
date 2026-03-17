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
