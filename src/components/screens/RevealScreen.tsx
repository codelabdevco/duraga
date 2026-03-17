"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen } from "@/types/tarot";

const cardContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.3 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 14 },
  },
};

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
        }, 1800 + i * 350)
      );
    });

    timers.push(
      setTimeout(() => {
        if (!hasAdvanced.current) {
          hasAdvanced.current = true;
          goToScreen(Screen.READING);
        }
      }, 1800 + drawnCards.length * 350 + 1500)
    );

    return () => timers.forEach(clearTimeout);
  }, [drawnCards, goToScreen]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-full px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.p
        className="text-lg text-gold tracking-[0.15em] font-semibold mb-6"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        กำลังดีดไพ่
      </motion.p>

      <motion.div
        className="flex flex-wrap gap-2 justify-center max-w-[380px]"
        variants={cardContainer}
        initial="hidden"
        animate="show"
      >
        {drawnCards.map((card, i) => {
          const isFlipped = flippedIndices.has(i);
          return (
            <motion.div
              key={i}
              variants={cardItem}
              className="w-[65px] h-[100px] [perspective:800px]"
            >
              <motion.div
                className="w-full h-full relative [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Back */}
                <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg overflow-hidden">
                  <svg width="100%" height="100%" viewBox="0 0 140 224" xmlns="http://www.w3.org/2000/svg">
                    <rect width="140" height="224" rx="10" fill="#08090e" />
                    <rect x="6" y="6" width="128" height="212" rx="7" fill="none" stroke="#e8d48b" strokeWidth="1" opacity=".4" />
                    <polygon points="70,28 126,112 70,196 14,112" fill="none" stroke="#e8d48b" strokeWidth="1.5" opacity=".5" />
                    <circle cx="70" cy="72" r="12" fill="none" stroke="#e8d48b" strokeWidth="1.5" />
                    <circle cx="76" cy="69" r="10" fill="#08090e" />
                    <g transform="translate(70,106)" fill="#e8d48b" opacity=".7">
                      <polygon points="0,-8 2,-2.5 8,-2.5 3,1.5 5,7.5 0,3.5 -5,7.5 -3,1.5 -8,-2.5 -2,-2.5" />
                    </g>
                  </svg>
                </div>
                {/* Front */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border-[1.5px] border-gold/40 overflow-hidden bg-[#08090e]">
                  {card.image && (
                    <img
                      src={card.image}
                      alt={card.nameEn}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="eager"
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
      </motion.div>
    </motion.div>
  );
}
