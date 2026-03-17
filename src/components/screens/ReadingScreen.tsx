"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import Button from "@/components/ui/Button";

export default function ReadingScreen() {
  const { drawnCards, reset } = useTarotStore();

  return (
    <motion.div
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-16 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <h2 className="font-cinzel text-xl text-gold text-center mb-5 tracking-widest">
        คำทำนายไพ่ทาโร่
      </h2>

      {/* Mini card row */}
      <div className="flex gap-1.5 flex-wrap justify-center mb-6 max-w-[380px]">
        {drawnCards.map((card, i) => (
          <motion.div
            key={i}
            className="w-[48px] h-[72px] rounded-md border border-gold/25 bg-gradient-to-br from-[#2a2435] to-[#1a1824] flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <span className="text-xl">{card.icon}</span>
            <span className="text-[0.3rem] text-gold mt-0.5 text-center leading-tight">{card.nameTh}</span>
          </motion.div>
        ))}
      </div>

      {/* Reading results */}
      <div className="w-full max-w-[400px] space-y-4">
        {drawnCards.map((card, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-br from-[#1a1824]/90 to-[#0d0c14]/95 border border-gold/20 rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: "easeOut" }}
          >
            <h3 className="text-base text-gold-light flex items-center gap-2 mb-1">
              <span className="text-xl">{card.icon}</span>
              {card.name}
            </h3>
            <p className="text-[0.7rem] text-gold/50 mb-3">
              ตำแหน่ง {i + 1}: {card.position}
            </p>
            <p className="text-sm leading-7 text-white/80">
              <strong className="text-gold-light">{card.highlightText}</strong>
              {" "}
              {card.bodyText}
            </p>
            <p className="text-xs text-white/30 mt-2">
              {card.upright}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <Button variant="outline" onClick={reset}>
          ดูไพ่อีกครั้ง
        </Button>
      </motion.div>
    </motion.div>
  );
}
