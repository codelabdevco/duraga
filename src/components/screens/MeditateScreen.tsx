"use client";

import { motion } from "framer-motion";
import CardBack from "@/components/ui/CardBack";
import Button from "@/components/ui/Button";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen } from "@/types/tarot";

export default function MeditateScreen() {
  const goToScreen = useTarotStore((s) => s.goToScreen);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-full px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8"
      >
        <CardBack width={170} height={260} sunSize={60} className="shadow-[0_20px_60px_rgba(0,0,0,.5),0_0_40px_rgba(212,168,67,.08)]" />
      </motion.div>

      <motion.p
        className="text-lg text-gold-light text-center font-semibold mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        หลับตาแล้วอธิษฐาน
      </motion.p>
      <motion.p
        className="text-white/40 text-sm text-center mb-9 leading-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        ตั้งจิตนึกถึงคำถามที่อยากรู้
        <br />
        แล้วกดปุ่มด้านล่าง
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button onClick={() => goToScreen(Screen.SELECT)}>พร้อมแล้ว</Button>
      </motion.div>
    </motion.div>
  );
}
