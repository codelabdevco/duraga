"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import Starfield from "@/components/canvas/Starfield";
import GoldenMist from "@/components/effects/GoldenMist";
import DustParticles from "@/components/effects/DustParticles";
import WelcomeScreen from "@/components/screens/WelcomeScreen";
import TarotFlow from "@/components/TarotFlow";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function TarotApp() {
  const phase = useTarotStore((s) => s.phase);

  return (
    <>
      <Starfield />
      <GoldenMist />
      <DustParticles />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 py-3 bg-gradient-to-b from-[#08090e] via-[#08090e]/90 to-transparent">
        <span className="text-sm text-gold/70 tracking-[0.2em] font-medium">
          Mystic Tarot
        </span>
        <div className="flex gap-3 items-center">
          <div className="w-6 h-6 rounded-full border border-gold/25 flex items-center justify-center text-[0.5rem] text-gold/50">
            ☽
          </div>
        </div>
      </header>

      {/* Landing */}
      <AnimatePresence>
        {phase === "landing" && (
          <motion.div
            className="fixed inset-0 z-10 pt-[56px] pb-8"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.5, ease: EASE } }}
          >
            <WelcomeScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main flow */}
      {phase !== "landing" && <TarotFlow />}
    </>
  );
}
