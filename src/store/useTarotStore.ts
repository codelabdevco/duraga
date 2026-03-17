import { create } from "zustand";
import { Screen, TarotCard, DrawnCard } from "@/types/tarot";
import { allTarotCards, positionNames } from "@/data/tarot";
import { shuffleArray } from "@/lib/utils";

interface TarotState {
  currentScreen: Screen;
  selectedCardIndices: number[];
  drawnCards: DrawnCard[];

  goToScreen: (screen: Screen) => void;
  toggleCard: (index: number) => void;
  drawAndAssign: () => void;
  reset: () => void;
}

export const useTarotStore = create<TarotState>((set) => ({
  currentScreen: Screen.WELCOME,
  selectedCardIndices: [],
  drawnCards: [],

  goToScreen: (screen) => set({ currentScreen: screen }),

  toggleCard: (index) =>
    set((state) => {
      const selected = state.selectedCardIndices;
      if (selected.includes(index)) {
        return { selectedCardIndices: selected.filter((i) => i !== index) };
      }
      if (selected.length >= 10) return state;
      return { selectedCardIndices: [...selected, index] };
    }),

  drawAndAssign: () =>
    set(() => {
      const cards = shuffleArray(allTarotCards).slice(0, 10);
      const drawn: DrawnCard[] = cards.map((card, i) => ({
        ...card,
        position: positionNames[i],
        positionIndex: i,
      }));
      return { drawnCards: drawn };
    }),

  reset: () =>
    set({
      currentScreen: Screen.WELCOME,
      selectedCardIndices: [],
      drawnCards: [],
    }),
}));
