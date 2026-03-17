"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen } from "@/types/tarot";

export default function RevealScreen() {
  const { drawnCards, goToScreen } = useTarotStore();
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const hasAdvanced = useRef(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    drawnCards.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setFlippedIndices((prev) => new Set(prev).add(i));
        }, 1500 + i * 400)
      );
    });

    timers.push(
      setTimeout(() => {
        if (!hasAdvanced.current) {
          hasAdvanced.current = true;
          goToScreen(Screen.READING);
        }
      }, 1500 + drawnCards.length * 400 + 1500)
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
              className="w-[65px] h-[100px] [perspective:600px]"
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
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border-[1.5px] border-gold overflow-hidden bg-[#1a1824]">
                  {card.image && (
                    <Image
                      src={card.image}
                      alt={card.nameEn}
                      fill
                      className="object-cover"
                      sizes="65px"
                      unoptimized
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                    <p className="text-[0.4rem] text-gold text-center leading-tight truncate">{card.nameTh}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
