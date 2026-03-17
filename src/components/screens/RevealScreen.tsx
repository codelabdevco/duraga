"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen } from "@/types/tarot";

export default function RevealScreen() {
  const { drawnCards, goToScreen } = useTarotStore();
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const hasAdvanced = useRef(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Flip cards one by one after 1.5s
    drawnCards.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setFlippedIndices((prev) => new Set(prev).add(i));
        }, 1500 + i * 350)
      );
    });

    // Go to reading after all flipped
    timers.push(
      setTimeout(() => {
        if (!hasAdvanced.current) {
          hasAdvanced.current = true;
          goToScreen(Screen.READING);
        }
      }, 1500 + drawnCards.length * 350 + 1200)
    );

    return () => timers.forEach(clearTimeout);
  }, [drawnCards, goToScreen]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-full px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.p
        className="font-cinzel text-lg text-gold tracking-widest mb-6"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        กำลังดีดไพ่
      </motion.p>

      <div className="flex flex-wrap gap-2 justify-center max-w-[380px]">
        {drawnCards.map((card, i) => {
          const isFlipped = flippedIndices.has(i);
          return (
            <motion.div
              key={i}
              className="w-[60px] h-[90px] [perspective:600px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <motion.div
                className="w-full h-full relative [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Back */}
                <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg border-[1.5px] border-gold bg-gradient-to-br from-[#1a1824] to-[#0d0c14] flex items-center justify-center">
                  <div className="mini-sun w-5 h-5" />
                </div>
                {/* Front */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border-[1.5px] border-gold bg-gradient-to-br from-[#2a2435] to-[#1a1824] flex flex-col items-center justify-center p-1">
                  <span className="text-2xl">{card.icon}</span>
                  <span className="text-[0.45rem] text-gold text-center mt-1 leading-tight">{card.nameTh}</span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
