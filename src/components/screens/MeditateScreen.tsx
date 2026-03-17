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
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8"
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 20px 60px rgba(0,0,0,.5), 0 0 30px rgba(212,168,67,.05)",
              "0 25px 70px rgba(0,0,0,.5), 0 0 50px rgba(212,168,67,.12)",
              "0 20px 60px rgba(0,0,0,.5), 0 0 30px rgba(212,168,67,.05)",
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-xl"
        >
          <CardBack width={170} height={260} sunSize={60} />
        </motion.div>
      </motion.div>

      <motion.p
        className="text-lg text-gold-light text-center font-semibold mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        หลับตาแล้วอธิษฐาน
      </motion.p>
      <motion.p
        className="text-white/40 text-sm text-center mb-9 leading-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        ตั้งจิตนึกถึงคำถามที่อยากรู้
        <br />
        แล้วกดปุ่มด้านล่าง
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Button onClick={() => goToScreen(Screen.SELECT)}>พร้อมแล้ว</Button>
      </motion.div>
    </motion.div>
  );
}
