"use client";

import { AnimatePresence } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen } from "@/types/tarot";
import Starfield from "@/components/canvas/Starfield";
import GoldenMist from "@/components/effects/GoldenMist";
import DustParticles from "@/components/effects/DustParticles";
import ProgressDots from "@/components/ui/ProgressDots";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import ShuffleScreen from "@/components/screens/ShuffleScreen";
import MeditateScreen from "@/components/screens/MeditateScreen";
import SelectScreen from "@/components/screens/SelectScreen";
import RevealScreen from "@/components/screens/RevealScreen";
import ReadingScreen from "@/components/screens/ReadingScreen";

const screenComponents: Record<Screen, React.ComponentType> = {
  [Screen.WELCOME]: WelcomeScreen,
  [Screen.SHUFFLE]: ShuffleScreen,
  [Screen.MEDITATE]: MeditateScreen,
  [Screen.SELECT]: SelectScreen,
  [Screen.REVEAL]: RevealScreen,
  [Screen.READING]: ReadingScreen,
};

export default function TarotApp() {
  const currentScreen = useTarotStore((s) => s.currentScreen);
  const ActiveScreen = screenComponents[currentScreen];

  return (
    <>
      <Starfield />
      <GoldenMist />
      <DustParticles />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 py-3 bg-gradient-to-b from-[#0a0a0f]/95 to-transparent">
        <span className="font-cinzel text-base text-gold tracking-widest font-semibold">
          สัมผัส ดีวาย
        </span>
        <div className="flex gap-3 items-center">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold to-[#8b6914] flex items-center justify-center text-[0.65rem] text-[#0a0a0f] font-bold">
            ☽
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold to-[#8b6914] flex items-center justify-center text-[0.65rem] text-[#0a0a0f] font-bold">
            ☀
          </div>
        </div>
      </header>

      {/* Screen area */}
      <main className="fixed inset-0 z-10 pt-[60px] pb-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <ActiveScreen key={currentScreen} />
        </AnimatePresence>
      </main>

      <ProgressDots current={currentScreen} />
    </>
  );
}
