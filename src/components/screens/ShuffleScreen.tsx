"use client";

import { motion, useAnimate } from "framer-motion";
import { useEffect } from "react";
import SunSymbol from "@/components/ui/SunSymbol";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen } from "@/types/tarot";

export default function ShuffleScreen() {
  const goToScreen = useTarotStore((s) => s.goToScreen);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    let cancelled = false;

    async function runShuffle() {
      const cards = scope.current?.querySelectorAll(".shuffle-card");
      if (!cards) return;

      for (let step = 0; step < 10; step++) {
        if (cancelled) return;
        // Spread out
        const promises = Array.from(cards).map((card, i) => {
          const offset = (i - 2) * 35;
          const rot = (i - 2) * 10 + (Math.random() * 6 - 3);
          const extraX = (step % 2 === 0 ? 1 : -1) * (Math.random() * 15);
          return animate(
            card as Element,
            { x: offset + extraX, y: Math.random() * 8 - 4, rotate: rot },
            { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
          );
        });
        await Promise.all(promises);

        if (cancelled) return;
        // Stack back
        const stackPromises = Array.from(cards).map((card) =>
          animate(card as Element, { x: 0, y: 0, rotate: 0 }, { duration: 0.25, ease: "easeOut" })
        );
        await Promise.all(stackPromises);
      }

      if (!cancelled) {
        setTimeout(() => goToScreen(Screen.MEDITATE), 400);
      }
    }

    runShuffle();
    return () => { cancelled = true; };
  }, [animate, goToScreen, scope]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.p
        className="font-cinzel text-lg text-gold tracking-widest mb-4"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        กำลังสับการ์ด
      </motion.p>
      <p className="text-white/40 text-sm mb-10">โปรดรอสักครู่...</p>

      <div ref={scope} className="relative w-[180px] h-[260px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="shuffle-card absolute left-1/2 top-1/2 -ml-[75px] -mt-[115px] w-[150px] h-[230px] rounded-xl border-[1.5px] border-gold bg-gradient-to-br from-[#1a1824] to-[#0d0c14] flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,.5)]"
          >
            <SunSymbol size={45} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
