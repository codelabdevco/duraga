"use client";

import { motion, useAnimate } from "framer-motion";
import { useEffect } from "react";
import MiniCardBack from "@/components/ui/MiniCardBack";
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

      for (let step = 0; step < 8; step++) {
        if (cancelled) return;
        const dir = step % 2 === 0 ? 1 : -1;
        const promises = Array.from(cards).map((card, i) => {
          const offset = (i - 2) * 32 * dir;
          const rot = (i - 2) * 8 * dir + (Math.random() * 4 - 2);
          return animate(
            card as Element,
            { x: offset, y: Math.random() * 6 - 3, rotate: rot },
            { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
          );
        });
        await Promise.all(promises);

        if (cancelled) return;
        const stackPromises = Array.from(cards).map((card) =>
          animate(card as Element, { x: 0, y: 0, rotate: 0 }, { duration: 0.35, ease: [0.22, 1, 0.36, 1] })
        );
        await Promise.all(stackPromises);
      }

      if (!cancelled) {
        setTimeout(() => goToScreen(Screen.MEDITATE), 500);
      }
    }

    runShuffle();
    return () => { cancelled = true; };
  }, [animate, goToScreen, scope]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.p
        className="text-lg text-gold tracking-[0.15em] font-semibold mb-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        กำลังสับการ์ด
      </motion.p>
      <p className="text-white/30 text-sm mb-10">โปรดรอสักครู่...</p>

      <div ref={scope} className="relative w-[180px] h-[260px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="shuffle-card absolute left-1/2 top-1/2 -ml-[70px] -mt-[112px]"
            style={{ filter: `brightness(${1 - i * 0.05})` }}
          >
            <MiniCardBack width={140} height={224} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
