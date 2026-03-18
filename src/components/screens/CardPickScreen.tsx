"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import MiniCardBack from "@/components/ui/MiniCardBack";

const GATHERING_DURATION = 1200;

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

  useEffect(() => {
    return () => {
      gatheringTriggered.current = false;
    };
  }, []);

  if (!selectedSpread) return null;

  const remaining = selectedSpread.cardCount - pickedCards.length;
  const isFull = pickedCards.length >= selectedSpread.cardCount;

  return (
    <motion.div
      key="fan"
      className="flex flex-col items-center h-full px-3 pb-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Header */}
      <div className="text-center py-2 flex-shrink-0">
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

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-1.5">
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

      {/* Selected cards preview */}
      {pickedCards.length > 0 && !isGathering && (
        <motion.div
          className="flex gap-1.5 justify-center flex-wrap mb-2 flex-shrink-0"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          {pickedCards.map((card, i) => (
            <motion.button
              key={card.id}
              type="button"
              className="relative flex-shrink-0"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              onClick={() => store.unpickCard(card.id)}
            >
              <MiniCardBack width={28} height={42} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gold/70 border border-gold flex items-center justify-center">
                  <span className="text-[0.45rem] text-[#08090e] font-bold">{i + 1}</span>
                </div>
              </div>
            </motion.button>
          ))}
          <p className="w-full text-center text-white/20 text-[0.5rem] mt-0.5">แตะเพื่อยกเลิก</p>
        </motion.div>
      )}

      {/* Card grid */}
      <div className="flex-1 min-h-0 w-full max-w-[420px] overflow-y-auto overflow-x-hidden rounded-xl">
        <div className="grid grid-cols-9 gap-[5px] p-1.5">
          {shuffledDeck.map((card, deckIndex) => {
            const isPicked = pickedCards.some((p) => p.id === card.id);
            const isDisabled = isFull && !isPicked;

            return (
              <motion.button
                key={card.id}
                type="button"
                className={`relative aspect-[5/8] rounded-md overflow-hidden transition-all ${
                  isPicked
                    ? "ring-1 ring-gold shadow-[0_0_8px_rgba(232,212,139,0.3)] scale-90 opacity-40"
                    : isDisabled
                    ? "opacity-15"
                    : "active:scale-90"
                }`}
                disabled={isGathering}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  opacity: isGathering ? (isPicked ? 0 : 0.3) : isDisabled ? 0.15 : 1,
                  scale: isGathering && isPicked ? 0 : 1,
                }}
                transition={{
                  delay: deckIndex * 0.003,
                  duration: 0.4,
                  ease: EASE,
                }}
                onClick={() => {
                  if (isGathering) return;
                  if (isPicked) store.unpickCard(card.id);
                  else if (!isDisabled) pickCard(deckIndex);
                }}
              >
                <MiniCardBack width={38} height={60} className="w-full h-full" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      {!isGathering && pickedCards.length === 0 && (
        <p className="text-white/25 text-[0.6rem] mt-2 flex-shrink-0">
          แตะไพ่ที่คุณรู้สึกสัมผัสได้
        </p>
      )}
    </motion.div>
  );
}
