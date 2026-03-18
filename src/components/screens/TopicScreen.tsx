"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { TOPICS } from "@/types/tarot";
import { EASE } from "@/constants/animation";

export default function TopicScreen() {
  const selectTopic = useTarotStore((s) => s.selectTopic);

  return (
    <motion.div
      key="topic"
      className="flex flex-col items-center min-h-full px-4 pt-4 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <p className="text-lg text-gold font-semibold mb-1 tracking-wide">เลือกหมวดคำถาม</p>
      <p className="text-white/30 text-xs mb-5">เลือกเรื่องที่อยากถามไพ่</p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[380px]">
        {TOPICS.map((t, idx) => (
          <motion.button
            key={t.id}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-[#0c0d14]/80 text-left active:bg-white/5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + idx * 0.04, duration: 0.4, ease: EASE }}
            whileTap={{ scale: 0.97 }}
            onClick={() => selectTopic(t)}
          >
            <span className="text-2xl mt-0.5" style={{ color: t.color }}>{t.icon}</span>
            <div className="min-w-0">
              <p className="text-sm text-white/90 font-medium leading-tight">{t.nameTH}</p>
              <p className="text-[0.65rem] text-white/30 mt-0.5 leading-snug">{t.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
