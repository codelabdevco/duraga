"use client";

import { AnimatePresence, motion } from "framer-motion";
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
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 py-3 bg-gradient-to-b from-[#08090e] via-[#08090e]/90 to-transparent">
        <span className="text-sm text-gold/80 tracking-[0.2em] font-medium">
          สัมผัส ดีวาย
        </span>
        <div className="flex gap-3 items-center">
          <div className="w-6 h-6 rounded-full border border-gold/30 flex items-center justify-center text-[0.55rem] text-gold/60">
            ☽
          </div>
          <div className="w-6 h-6 rounded-full border border-gold/30 flex items-center justify-center text-[0.55rem] text-gold/60">
            ☀
          </div>
        </div>
      </header>

      {/* Screen area — crossfade with spring */}
      <main className="fixed inset-0 z-10 pt-[60px] pb-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="min-h-full"
          >
            <ActiveScreen />
          </motion.div>
        </AnimatePresence>
      </main>

      <ProgressDots current={currentScreen} />
    </>
  );
}
