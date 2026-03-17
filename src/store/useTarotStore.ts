import { create } from "zustand";
import { Screen, DrawnCard, SpreadType, SPREAD_CONFIG } from "@/types/tarot";
import { allTarotCards, positionNamesBySpread } from "@/data/tarot";
import { shuffleArray } from "@/lib/utils";

interface TarotState {
  currentScreen: Screen;
  spreadType: SpreadType;
  selectedCardIndices: number[];
  drawnCards: DrawnCard[];

  goToScreen: (screen: Screen) => void;
  setSpreadType: (spread: SpreadType) => void;
  toggleCard: (index: number) => void;
  drawAndAssign: () => void;
  reset: () => void;
}

export const useTarotStore = create<TarotState>((set, get) => ({
  currentScreen: Screen.WELCOME,
  spreadType: "celtic",
  selectedCardIndices: [],
  drawnCards: [],

  goToScreen: (screen) => set({ currentScreen: screen }),

  setSpreadType: (spread) => set({ spreadType: spread }),

  toggleCard: (index) =>
    set((state) => {
      const selected = state.selectedCardIndices;
      const max = SPREAD_CONFIG[state.spreadType].count;
      if (selected.includes(index)) {
        return { selectedCardIndices: selected.filter((i) => i !== index) };
      }
      if (selected.length >= max) return state;
      return { selectedCardIndices: [...selected, index] };
    }),

  drawAndAssign: () =>
    set(() => {
      const spread = get().spreadType;
      const count = SPREAD_CONFIG[spread].count;
      const positions = positionNamesBySpread[spread];
      const cards = shuffleArray(allTarotCards).slice(0, count);
      const drawn: DrawnCard[] = cards.map((card, i) => ({
        ...card,
        position: positions[i] || `ตำแหน่ง ${i + 1}`,
        positionIndex: i,
      }));
      return { drawnCards: drawn };
    }),

  reset: () =>
    set({
      currentScreen: Screen.WELCOME,
      spreadType: "celtic",
      selectedCardIndices: [],
      drawnCards: [],
    }),
}));
