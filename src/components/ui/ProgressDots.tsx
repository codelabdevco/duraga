"use client";

import { motion } from "framer-motion";
import { Screen } from "@/types/tarot";

const SCREENS = [Screen.WELCOME, Screen.SHUFFLE, Screen.MEDITATE, Screen.SELECT, Screen.REVEAL, Screen.READING];

export default function ProgressDots({ current }: { current: Screen }) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-50">
      {SCREENS.map((s, i) => (
        <motion.div
          key={i}
          className="h-1.5 rounded-full bg-gold"
          animate={{
            width: s === current ? 20 : 6,
            opacity: s === current ? 1 : 0.25,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
