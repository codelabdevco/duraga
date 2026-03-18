"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import { FAN_ARCS, FAN_CARD } from "@/constants/layouts";
import MiniCardBack from "@/components/ui/MiniCardBack";

const GATHERING_DURATION = 1400;

export default function CardPickScreen() {
  const store = useTarotStore();
  const { shuffledDeck, pickedCards, selectedSpread } = store;
  const { pickCard, setPhase } = store;

  const [isGathering, setIsGathering] = useState(false);
  const gatheringTriggered = useRef(false);

  // Auto-transition to layout when all cards picked
  useEffect(() => {
    if (!selectedSpread) return;
    if (pickedCards.length === selectedSpread.cardCount && !gatheringTriggered.current) {
      gatheringTriggered.current = true;
      setIsGathering(true);
      setTimeout(() => {
        setIsGathering(false);
        gatheringTriggered.current = false;
        setPhase("layout");
      }, GATHERING_DURATION);
    }
  }, [pickedCards.length, selectedSpread, setPhase]);

  // Reset on unmount / phase change
  useEffect(() => {
    return () => {
      gatheringTriggered.current = false;
    };
  }, []);

  if (!selectedSpread) return null;

  const remaining = selectedSpread.cardCount - pickedCards.length;
  const isFull = pickedCards.length >= selectedSpread.cardCount;
  const { width: CW, height: CH } = FAN_CARD;

  return (
    <motion.div
      key="fan"
      className="flex flex-col items-center min-h-full pt-1 pb-4 px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Progress header */}
      <div className="text-center mb-1">
        <AnimatePresence mode="wait">
          {isGathering ? (
            <motion.p
              key="g"
              className="text-gold font-semibold text-sm"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              กำลังเตรียมวางไพ่...
            </motion.p>
          ) : (
            <motion.p
              key="p"
              className="text-gold font-semibold text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {remaining > 0 ? `เลือกอีก ${remaining} ใบ` : "เลือกครบแล้ว!"}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex justify-center gap-[3px] mt-1.5">
          {Array.from({ length: selectedSpread.cardCount }, (_, i) => (
            <motion.div
              key={i}
              className={`w-[6px] h-[6px] rounded-full ${i < pickedCards.length ? "bg-gold" : "bg-white/15"}`}
              animate={isGathering ? { scale: [1, 1.4, 1] } : {}}
              transition={isGathering ? { duration: 0.6, repeat: Infinity, delay: i * 0.06 } : {}}
            />
          ))}
        </div>
      </div>

      {/* Concentric fan arcs */}
      <div className="relative w-full max-w-[420px] mx-auto overflow-hidden" style={{ height: 440 }}>
        {FAN_ARCS.flatMap((arc) =>
          shuffledDeck.slice(arc.from, arc.to).map((card, j) => {
            const deckIndex = arc.from + j;
            const count = arc.to - arc.from;
            const t = count > 1 ? j / (count - 1) : 0.5;
            const angle = -arc.spread / 2 + t * arc.spread;

            const isPicked = pickedCards.some((p) => p.id === card.id);
            const pickNum = pickedCards.findIndex((p) => p.id === card.id) + 1;
            const isDisabled = isFull && !isPicked;

            return (
              <motion.button
                key={card.id}
                type="button"
                className="absolute p-0 border-0 bg-transparent"
                style={{
                  left: "50%",
                  bottom: arc.bottom,
                  width: CW,
                  height: CH,
                  marginLeft: -CW / 2,
                  transformOrigin: `50% ${CH + arc.pivot}px`,
                  zIndex: isPicked ? 100 + pickNum : arc.zBase + j,
                }}
                initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                animate={{
                  opacity: isGathering ? (isPicked ? 1 : 0) : isDisabled ? 0.2 : 1,
                  scale: isGathering ? (isPicked ? 1.4 : 0.3) : isPicked ? 1.12 : 1,
                  rotate: angle,
                  y: isPicked && !isGathering ? -18 : 0,
                }}
                transition={{
                  delay: isGathering ? 0 : deckIndex * 0.005,
                  duration: 0.5,
                  ease: EASE,
                }}
                whileTap={!isGathering ? { scale: 0.88 } : {}}
                onClick={() => {
                  if (isGathering) return;
                  if (isPicked) store.unpickCard(card.id);
                  else if (!isDisabled) pickCard(deckIndex);
                }}
              >
                <MiniCardBack width={CW} height={CH} />

                {/* Pick number badge */}
                {isPicked && !isGathering && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-gold/60 border border-gold flex items-center justify-center shadow-[0_0_10px_rgba(232,212,139,.4)]">
                      <span className="text-[0.5rem] text-[#08090e] font-bold">{pickNum}</span>
                    </div>
                  </motion.div>
                )}

                {/* Gathering glow */}
                {isGathering && isPicked && (
                  <motion.div
                    className="absolute -inset-1 rounded-lg"
                    animate={{ opacity: [0, 0.5, 0.3] }}
                    transition={{ duration: 0.8 }}
                    style={{ background: "radial-gradient(circle, rgba(232,212,139,0.3) 0%, transparent 70%)" }}
                  />
                )}
              </motion.button>
            );
          })
        )}
      </div>

      {!isGathering && (
        <p className="text-white/20 text-[0.55rem] mt-2">แตะเลือก · แตะอีกทีเพื่อยกเลิก</p>
      )}
    </motion.div>
  );
}
