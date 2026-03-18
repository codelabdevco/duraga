export const CELTIC_LAYOUT: Record<number, { x: string; y: string; rotate: number }> = {
  1:  { x: "28%", y: "42%", rotate: 0 },
  2:  { x: "28%", y: "42%", rotate: 90 },
  3:  { x: "28%", y: "8%",  rotate: 0 },
  4:  { x: "28%", y: "72%", rotate: 0 },
  5:  { x: "10%", y: "42%", rotate: 0 },
  6:  { x: "46%", y: "42%", rotate: 0 },
  7:  { x: "72%", y: "74%", rotate: 0 },
  8:  { x: "72%", y: "52%", rotate: 0 },
  9:  { x: "72%", y: "30%", rotate: 0 },
  10: { x: "72%", y: "8%",  rotate: 0 },
};

export const FIVE_LAYOUT: Record<number, { x: string; y: string }> = {
  1: { x: "15%", y: "45%" },
  2: { x: "42%", y: "45%" },
  3: { x: "70%", y: "45%" },
  4: { x: "42%", y: "75%" },
  5: { x: "42%", y: "15%" },
};

export const HORSESHOE_LAYOUT: Record<number, { x: string; y: string }> = {
  1: { x: "8%",  y: "75%" },
  2: { x: "8%",  y: "45%" },
  3: { x: "25%", y: "15%" },
  4: { x: "50%", y: "8%"  },
  5: { x: "75%", y: "15%" },
  6: { x: "92%", y: "45%" },
  7: { x: "92%", y: "75%" },
};

export const FAN_ARCS = [
  { from: 0,  to: 26, pivot: 230, bottom: 240, spread: 140, zBase: 0 },
  { from: 26, to: 52, pivot: 155, bottom: 165, spread: 120, zBase: 30 },
  { from: 52, to: 78, pivot: 85,  bottom: 95,  spread: 95,  zBase: 60 },
] as const;

export const FAN_CARD = { width: 40, height: 62 } as const;
