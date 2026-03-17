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
  nameTh: string;
  icon: string;
  upright: string;
  highlightText: string;
  bodyText: string;
}

export interface DrawnCard extends TarotCard {
  position: string;
  positionIndex: number;
}
