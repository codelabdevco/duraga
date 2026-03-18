"use client";

import { motion, useAnimate } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import CardBack from "@/components/ui/CardBack";
import Button from "@/components/ui/Button";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ShuffleScreen() {
  const shuffleDeck = useTarotStore((s) => s.shuffleDeck);
  const hasShuffled = useTarotStore((s) => s.hasShuffled);
  const setPhase = useTarotStore((s) => s.setPhase);

  const [scope, animate] = useAnimate();

  async function handleShuffle() {
    shuffleDeck();
    const cards = scope.current?.querySelectorAll(".shuf-card");
    if (!cards) return;
    const arr = Array.from(cards) as Element[];
    const mid = 3;

    // Phase 1: Fan out from stack
    await Promise.all(
      arr.map((c, i) =>
        animate(c, {
          x: (i - mid) * 32,
          rotate: (i - mid) * 7,
          y: Math.abs(i - mid) * 10,
          opacity: 1,
        }, { duration: 0.7, ease: EASE })
      )
    );

    // Phase 2: Riffle shuffle × 2
    for (let round = 0; round < 2; round++) {
      const left = arr.slice(0, mid);
      const right = arr.slice(mid);

      await Promise.all([
        ...left.map((c, i) =>
          animate(c, { x: -65 + i * 5, rotate: -4 + Math.random() * 2, y: i * 4 }, { duration: 0.4, ease: EASE })
        ),
        ...right.map((c, i) =>
          animate(c, { x: 65 - i * 5, rotate: 4 - Math.random() * 2, y: i * 4 }, { duration: 0.4, ease: EASE })
        ),
      ]);

      const order: Element[] = [];
      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if (i < right.length) order.push(right[i]);
        if (i < left.length) order.push(left[i]);
      }
      for (let j = 0; j < order.length; j++) {
        animate(order[j], {
          x: 0, y: -j * 2,
          rotate: (Math.random() - 0.5) * 3,
        }, { duration: 0.13, ease: "easeOut" });
        await wait(45);
      }
      await wait(180);
    }

    // Phase 3: Cascade arc
    await Promise.all(
      arr.map((c, i) => {
        const angle = ((i - mid) / mid) * 0.65;
        const radius = 120;
        return animate(c, {
          x: Math.sin(angle) * radius,
          y: -Math.cos(angle) * radius + radius - 25,
          rotate: (i - mid) * 12,
          scale: 0.88,
        }, { duration: 0.55, ease: EASE });
      })
    );
    await wait(280);

    // Gather back to stack
    await Promise.all(
      arr.map((c, i) =>
        animate(c, { x: 0, y: -i * 2, rotate: 0, scale: 1 }, { duration: 0.5, ease: EASE, delay: i * 0.035 })
      )
    );

    // Phase 4: Glow pulse
    const glow = scope.current?.querySelector(".glow-ring");
    if (glow) {
      await animate(glow as Element, {
        opacity: [0, 0.6, 0],
        scale: [0.7, 1.4, 1.6],
      }, { duration: 0.9, ease: "easeOut" });
    }

    // Auto-advance to card pick
    await wait(300);
    setPhase("fan");
  }

  return (
    <motion.div
      key="shuffle"
      className="flex flex-col items-center justify-center min-h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <p className="text-white/30 text-xs mb-2 text-center leading-6">
        หายใจลึกๆ ตั้งจิตสมาธิ<br />นึกถึงคำถามของคุณ...
      </p>
      <p className="text-lg text-gold font-semibold mb-8 tracking-wide">สับไพ่</p>

      <div ref={scope} className="relative w-[240px] h-[300px] mb-8">
        <div
          className="glow-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full opacity-0"
          style={{ background: "radial-gradient(circle, rgba(232,212,139,0.18) 0%, transparent 70%)" }}
        />
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="shuf-card absolute left-1/2 top-1/2"
            style={{ marginLeft: -75, marginTop: -120, zIndex: 7 - i, filter: `brightness(${1 - i * 0.03})` }}
          >
            <CardBack width={150} height={240} />
          </div>
        ))}
      </div>

      {!hasShuffled && (
        <Button onClick={handleShuffle}>สับไพ่</Button>
      )}
    </motion.div>
  );
}
