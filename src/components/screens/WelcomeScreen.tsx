"use client";

import { motion } from "framer-motion";
import CardBack from "@/components/ui/CardBack";
import Button from "@/components/ui/Button";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen } from "@/types/tarot";

const cardVariants = [
  { rotate: -12, x: -20, delay: 0 },
  { rotate: 0, x: 0, delay: 0.15 },
  { rotate: 12, x: 20, delay: 0.3 },
];

export default function WelcomeScreen() {
  const goToScreen = useTarotStore((s) => s.goToScreen);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-full px-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative w-[220px] h-[280px] mb-8">
        {cardVariants.map((v, i) => (
          <motion.div
            key={i}
            className="absolute top-0 left-1/2"
            initial={{ opacity: 0, y: 60, rotate: 0, x: "-50%" }}
            animate={{ opacity: 1, y: 0, rotate: v.rotate, x: `calc(-50% + ${v.x}px)` }}
            transition={{
              delay: 0.2 + v.delay,
              duration: 1,
              type: "spring",
              stiffness: 80,
              damping: 15,
            }}
            style={{ zIndex: i === 1 ? 2 : 1 }}
          >
            <CardBack width={150} height={230} sunSize={50} />
          </motion.div>
        ))}
      </div>

      <motion.h2
        className="text-2xl text-gold text-center mb-3 tracking-[0.15em] font-semibold"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ textShadow: "0 0 40px rgba(212,168,67,.3)" }}
      >
        เริ่มต้นดูไพ่
      </motion.h2>

      <motion.p
        className="text-center text-white/50 text-sm leading-7 mb-9 max-w-[280px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        เปิดไพ่ทาโร่เพื่อค้นหาคำตอบ
        <br />
        ที่จักรวาลมีให้คุณในวันนี้
        <br />
        หลับตาแล้วตั้งจิตอธิษฐาน
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Button onClick={() => goToScreen(Screen.SHUFFLE)}>เริ่มดูไพ่</Button>
      </motion.div>
    </motion.div>
  );
}
