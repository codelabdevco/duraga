"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen } from "@/types/tarot";
import { useEffect, useRef } from "react";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <p className="text-gold font-semibold text-base mb-1">เลือกการ์ด 10 ใบ</p>
      <p className="text-white/40 text-xs mb-4">แตะไพ่ที่คุณรู้สึกดึงดูด</p>

      <motion.div
        className="px-4 py-1.5 border border-gold/25 rounded-full text-gold text-sm mb-4"
        key={selectedCardIndices.length}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
      >
        {selectedCardIndices.length} / 10
      </motion.div>

      <div className="grid grid-cols-5 gap-2 w-full max-w-[360px]">
        {Array.from({ length: 20 }, (_, i) => {
          const isSelected = selectedCardIndices.includes(i);
          const isDisabled = selectedCardIndices.length >= 10 && !isSelected;

          return (
            <motion.div
              key={i}
              className={`aspect-[2/3] rounded-lg border-[1.5px] flex items-center justify-center cursor-pointer relative overflow-hidden
                ${isSelected
                  ? "border-gold shadow-[0_0_20px_rgba(212,168,67,.3)] bg-gold/10"
                  : "border-gold/30 bg-gradient-to-br from-[#1a1824] to-[#0d0c14]"
                }
                ${isDisabled ? "opacity-25 pointer-events-none" : ""}
              `}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{
                opacity: isDisabled ? 0.25 : 1,
                scale: isSelected ? 0.92 : 1,
                y: 0,
              }}
              transition={{
                delay: i * 0.03,
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              whileTap={{ scale: 0.85 }}
              onClick={() => toggleCard(i)}
            >
              <div className="absolute inset-[4px] border border-gold/15 rounded" />
              <div className="mini-sun w-6 h-6" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
