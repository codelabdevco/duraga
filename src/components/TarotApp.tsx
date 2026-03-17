"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen } from "@/types/tarot";
import Starfield from "@/components/canvas/Starfield";
import GoldenMist from "@/components/effects/GoldenMist";
import DustParticles from "@/components/effects/DustParticles";
import ProgressDots from "@/components/ui/ProgressDots";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import TarotFlow from "@/components/TarotFlow";

export default function TarotApp() {
  const currentScreen = useTarotStore((s) => s.currentScreen);

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

      {/* Welcome screen with exit animation */}
      <AnimatePresence>
        {currentScreen === Screen.WELCOME && (
          <motion.div
            className="fixed inset-0 z-10 pt-[60px] pb-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          >
            <WelcomeScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main flow (Shuffle → Meditate → Pick → Select → Reveal → Reading) */}
      {currentScreen !== Screen.WELCOME && <TarotFlow />}

      <ProgressDots current={currentScreen} />
    </>
  );
}
