"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen, SpreadType, SPREAD_CONFIG } from "@/types/tarot";
import MiniCardBack from "@/components/ui/MiniCardBack";

const spreads: SpreadType[] = ["single", "three", "celtic"];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 14 },
  },
};

export default function SpreadPickScreen() {
  const { setSpreadType, goToScreen } = useTarotStore();

  function handlePick(spread: SpreadType) {
    setSpreadType(spread);
    goToScreen(Screen.SELECT);
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-full px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.p
        className="text-lg text-gold tracking-[0.1em] font-semibold mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        เลือกรูปแบบการดูไพ่
      </motion.p>
      <motion.p
        className="text-white/30 text-xs mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        แต่ละแบบให้ความลึกต่างกัน
      </motion.p>

      <motion.div
        className="w-full max-w-[340px] space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {spreads.map((spread) => {
          const cfg = SPREAD_CONFIG[spread];
          return (
            <motion.button
              key={spread}
              variants={item}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gold/20 bg-[#0c0d14]/80 text-left transition-colors active:bg-gold/5"
              whileTap={{ scale: 0.97 }}
              onClick={() => handlePick(spread)}
            >
              {/* Card preview */}
              <div className="flex-shrink-0 flex items-end gap-[2px]">
                {Array.from({ length: Math.min(cfg.count, 3) }, (_, i) => (
                  <motion.div
                    key={i}
                    style={{
                      rotate: cfg.count === 1 ? 0 : (i - 1) * 8,
                      y: cfg.count === 1 ? 0 : Math.abs(i - 1) * 4,
                    }}
                  >
                    <MiniCardBack width={32} height={51} />
                  </motion.div>
                ))}
                {cfg.count > 3 && (
                  <span className="text-[0.6rem] text-gold/40 ml-1 self-center">+{cfg.count - 3}</span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gold/50 text-sm">{cfg.icon}</span>
                  <span className="text-gold font-semibold text-sm">{cfg.label}</span>
                  <span className="text-[0.65rem] text-white/20 ml-auto">{cfg.count} ใบ</span>
                </div>
                <p className="text-xs text-white/40 leading-5">{cfg.desc}</p>
              </div>

              {/* Arrow */}
              <span className="text-gold/30 text-sm flex-shrink-0">›</span>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
