"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen, SPREAD_CONFIG } from "@/types/tarot";
import { useEffect, useRef } from "react";
import MiniCardBack from "@/components/ui/MiniCardBack";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.025, delayChildren: 0.1 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 14 } },
};

export default function SelectScreen() {
  const { selectedCardIndices, toggleCard, goToScreen, drawAndAssign, spreadType } = useTarotStore();
  const hasAdvanced = useRef(false);
  const config = SPREAD_CONFIG[spreadType];

  useEffect(() => {
    if (selectedCardIndices.length === config.count && !hasAdvanced.current) {
      hasAdvanced.current = true;
      drawAndAssign();
      setTimeout(() => goToScreen(Screen.REVEAL), 800);
    }
  }, [selectedCardIndices.length, config.count, goToScreen, drawAndAssign]);

  const cols = config.gridCards <= 5 ? 3 : config.gridCards <= 9 ? 3 : 5;

  return (
    <motion.div
      className="flex flex-col items-center min-h-full px-4 pt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <p className="text-gold font-semibold text-base mb-1">
        เลือกการ์ด {config.count} ใบ
      </p>
      <p className="text-white/30 text-xs mb-4">แตะไพ่ที่คุณรู้สึกดึงดูด</p>

      <motion.div
        className="px-4 py-1.5 border border-gold/20 rounded-full text-gold text-sm mb-4"
        key={selectedCardIndices.length}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {selectedCardIndices.length} / {config.count}
      </motion.div>

      <motion.div
        className="w-full max-w-[360px]"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "8px",
        }}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {Array.from({ length: config.gridCards }, (_, i) => {
          const isSelected = selectedCardIndices.includes(i);
          const isDisabled = selectedCardIndices.length >= config.count && !isSelected;

          return (
            <motion.div
              key={i}
              variants={itemVariant}
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
