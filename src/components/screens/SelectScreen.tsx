"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen } from "@/types/tarot";
import { useEffect, useRef } from "react";
import MiniCardBack from "@/components/ui/MiniCardBack";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.025, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 14 } },
};

export default function SelectScreen() {
  const { selectedCardIndices, toggleCard, goToScreen, drawAndAssign } = useTarotStore();
  const hasAdvanced = useRef(false);

  useEffect(() => {
    if (selectedCardIndices.length === 10 && !hasAdvanced.current) {
      hasAdvanced.current = true;
      drawAndAssign();
      setTimeout(() => goToScreen(Screen.REVEAL), 800);
    }
  }, [selectedCardIndices.length, goToScreen, drawAndAssign]);

  return (
    <motion.div
      className="flex flex-col items-center min-h-full px-4 pt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <p className="text-gold font-semibold text-base mb-1">เลือกการ์ด 10 ใบ</p>
      <p className="text-white/30 text-xs mb-4">แตะไพ่ที่คุณรู้สึกดึงดูด</p>

      <motion.div
        className="px-4 py-1.5 border border-gold/20 rounded-full text-gold text-sm mb-4"
        key={selectedCardIndices.length}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {selectedCardIndices.length} / 10
      </motion.div>

      <motion.div
        className="grid grid-cols-5 gap-2 w-full max-w-[360px]"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {Array.from({ length: 20 }, (_, i) => {
          const isSelected = selectedCardIndices.includes(i);
          const isDisabled = selectedCardIndices.length >= 10 && !isSelected;

          return (
            <motion.div
              key={i}
              variants={item}
              className={`relative rounded-lg cursor-pointer overflow-hidden transition-all duration-300
                ${isSelected ? "ring-1 ring-gold shadow-[0_0_16px_rgba(232,212,139,.2)]" : ""}
                ${isDisabled ? "opacity-20 pointer-events-none" : ""}
              `}
              animate={{ scale: isSelected ? 0.9 : 1, opacity: isDisabled ? 0.15 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              whileTap={{ scale: 0.82 }}
              onClick={() => toggleCard(i)}
            >
              <MiniCardBack width={64} height={102} />
              {isSelected && (
                <motion.div
                  className="absolute inset-0 bg-gold/10 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
