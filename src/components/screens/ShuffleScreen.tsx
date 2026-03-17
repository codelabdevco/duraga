"use client";

import { motion, useAnimate } from "framer-motion";
import { useEffect } from "react";
import CardBack from "@/components/ui/CardBack";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen } from "@/types/tarot";

const CARD_COUNT = 7;
const EASE = [0.22, 1, 0.36, 1] as const;

export default function ShuffleScreen() {
  const goToScreen = useTarotStore((s) => s.goToScreen);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const cards = scope.current?.querySelectorAll(".s-card");
      if (!cards) return;
      const arr = Array.from(cards) as Element[];
      const mid = Math.floor(CARD_COUNT / 2);

      // === Phase 1: Fan out from stack ===
      await Promise.all(
        arr.map((card, i) =>
          animate(card, {
            x: (i - mid) * 28,
            rotate: (i - mid) * 6,
            y: Math.abs(i - mid) * 8,
          }, { duration: 0.7, ease: EASE })
        )
      );
      if (cancelled) return;

      // === Phase 2: Riffle shuffle (3 rounds) ===
      for (let round = 0; round < 3; round++) {
        if (cancelled) return;

        // Split: left half goes left, right goes right
        const leftCards = arr.slice(0, mid);
        const rightCards = arr.slice(mid);

        await Promise.all([
          ...leftCards.map((card, i) =>
            animate(card, {
              x: -60 + i * 4,
              rotate: -3 + Math.random() * 2,
              y: i * 3,
            }, { duration: 0.4, ease: EASE })
          ),
          ...rightCards.map((card, i) =>
            animate(card, {
              x: 60 - i * 4,
              rotate: 3 - Math.random() * 2,
              y: i * 3,
            }, { duration: 0.4, ease: EASE })
          ),
        ]);
        if (cancelled) return;

        // Interleave: cards fly to center one by one
        const order = [];
        for (let i = 0; i < Math.max(leftCards.length, rightCards.length); i++) {
          if (i < rightCards.length) order.push({ card: rightCards[i], from: "right" });
          if (i < leftCards.length) order.push({ card: leftCards[i], from: "left" });
        }

        for (let j = 0; j < order.length; j++) {
          if (cancelled) return;
          const { card } = order[j];
          const stackY = -j * 1.5;
          animate(card, {
            x: 0,
            y: stackY,
            rotate: (Math.random() - 0.5) * 3,
            scale: 1,
          }, { duration: 0.15, ease: "easeOut" });
          await new Promise(r => setTimeout(r, 50));
        }

        if (cancelled) return;
        // Brief pause between rounds
        await new Promise(r => setTimeout(r, 200));
      }
      if (cancelled) return;

      // === Phase 3: Cascade fan and gather ===
      // Cascade: cards fly out in an arc
      await Promise.all(
        arr.map((card, i) => {
          const angle = ((i - mid) / mid) * 0.6;
          const radius = 120;
          return animate(card, {
            x: Math.sin(angle) * radius,
            y: -Math.cos(angle) * radius + radius - 30,
            rotate: (i - mid) * 10,
            scale: 0.9,
          }, { duration: 0.6, ease: EASE });
        })
      );
      if (cancelled) return;

      await new Promise(r => setTimeout(r, 300));
      if (cancelled) return;

      // Gather back to stack with slight spring
      await Promise.all(
        arr.map((card, i) =>
          animate(card, {
            x: 0,
            y: -i * 1.5,
            rotate: 0,
            scale: 1,
          }, { duration: 0.5, ease: EASE, delay: i * 0.04 })
        )
      );
      if (cancelled) return;

      // === Phase 4: Final glow pulse ===
      const glow = scope.current?.querySelector(".glow-ring");
      if (glow) {
        await animate(glow as Element, { opacity: [0, 0.6, 0], scale: [0.8, 1.3, 1.5] }, { duration: 1, ease: "easeOut" });
      }

      if (!cancelled) {
        setTimeout(() => goToScreen(Screen.MEDITATE), 400);
      }
    }

    run();
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
        className="text-lg text-gold tracking-[0.15em] font-semibold mb-3"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        กำลังสับไพ่
      </motion.p>
      <p className="text-white/25 text-xs mb-12">เตรียมสำรับไพ่ให้คุณ...</p>

      <div ref={scope} className="relative w-[200px] h-[280px]">
        {/* Glow ring */}
        <div
          className="glow-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full opacity-0"
          style={{
            background: "radial-gradient(circle, rgba(232,212,139,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Cards */}
        {Array.from({ length: CARD_COUNT }, (_, i) => (
          <div
            key={i}
            className="s-card absolute left-1/2 top-1/2 -ml-[56px] -mt-[90px]"
            style={{
              zIndex: CARD_COUNT - i,
              filter: `brightness(${1 - i * 0.03})`,
            }}
          >
            <CardBack width={112} height={180} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
