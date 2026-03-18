"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import { getSpreadLayout } from "@/constants/layouts";
import MiniCardBack from "@/components/ui/MiniCardBack";
import Button from "@/components/ui/Button";

// pick → gather → layout (all in one component, zero flash)
type Stage = "pick" | "gather" | "layout";

export default function CardPickScreen() {
  const store = useTarotStore();
  const { shuffledDeck, pickedCards, selectedSpread, flippedCardIds } = store;
  const { pickCard, flipCard, flipAll, setPhase } = store;

  const [stage, setStage] = useState<Stage>("pick");
  const triggered = useRef(false);

  const layout = selectedSpread
    ? getSpreadLayout(selectedSpread.id, selectedSpread.cardCount)
    : null;

  // All cards picked → gather → layout (seamless)
  useEffect(() => {
    if (!selectedSpread || !layout) return;
    if (pickedCards.length === selectedSpread.cardCount && !triggered.current) {
      triggered.current = true;
      setStage("gather");
      // After gather completes → fly to layout positions
      setTimeout(() => setStage("layout"), 1600);
    }
  }, [pickedCards.length, selectedSpread, layout]);

  useEffect(() => {
    return () => { triggered.current = false; };
  }, []);

  if (!selectedSpread || !layout) return null;

  const remaining = selectedSpread.cardCount - pickedCards.length;
  const isFull = pickedCards.length >= selectedSpread.cardCount;
  const { cardW, cardH, positions, aspectRatio } = layout;
  const allFlipped = flippedCardIds.size === pickedCards.length && pickedCards.length > 0;
  const isCardPhase = stage === "gather" || stage === "layout";

  return (
    <motion.div
      key="fan"
      className="flex flex-col items-center h-full px-3 pb-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* ─── Header ─── */}
      <div className="text-center py-2 flex-shrink-0 w-full">
        <AnimatePresence mode="wait">
          {stage === "pick" && (
            <motion.div key="pick-h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <p className="text-gold font-semibold text-sm">
                {remaining > 0 ? `เลือกอีก ${remaining} ใบ` : "เลือกครบแล้ว!"}
              </p>
              <div className="flex justify-center gap-1 mt-1.5">
                {Array.from({ length: selectedSpread.cardCount }, (_, i) => (
                  <div key={i} className={`w-[6px] h-[6px] rounded-full ${i < pickedCards.length ? "bg-gold" : "bg-white/15"}`} />
                ))}
              </div>
            </motion.div>
          )}
          {stage === "gather" && (
            <motion.div key="gather-h" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <p className="text-gold font-semibold text-sm">กำลังเตรียมวางไพ่...</p>
              <div className="flex justify-center gap-1 mt-1.5">
                {Array.from({ length: selectedSpread.cardCount }, (_, i) => (
                  <motion.div
                    key={i}
                    className="w-[6px] h-[6px] rounded-full bg-gold"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.06 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          {stage === "layout" && (
            <motion.div key="layout-h" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <p className="text-gold font-semibold text-sm mb-0.5">{selectedSpread.nameTH}</p>
              <p className="text-white/25 text-xs">แตะไพ่เพื่อเปิด</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Pick: selected preview ─── */}
      {stage === "pick" && pickedCards.length > 0 && (
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

      {/* ─── Pick: card grid ─── */}
      {stage === "pick" && (
        <motion.div
          className="flex-1 min-h-0 w-full max-w-[420px] overflow-y-auto overflow-x-hidden rounded-xl"
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
        >
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
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: isDisabled ? 0.15 : 1, scale: 1 }}
                  transition={{ delay: deckIndex * 0.003, duration: 0.4, ease: EASE }}
                  onClick={() => {
                    if (isPicked) store.unpickCard(card.id);
                    else if (!isDisabled) pickCard(deckIndex);
                  }}
                >
                  <MiniCardBack width={38} height={60} className="w-full h-full" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ─── Gather + Layout: card elements (SAME DOM, seamless) ─── */}
      {isCardPhase && (
        <motion.div
          className="flex-1 flex items-center justify-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="relative w-full max-w-[360px]"
            style={{ aspectRatio: `1 / ${aspectRatio}` }}
          >
            {/* Gather: center glow */}
            {stage === "gather" && (
              <>
                <motion.div
                  className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(232,212,139,0.18) 0%, transparent 70%)" }}
                  animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-gold/20 pointer-events-none"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.4, 0.15] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />
              </>
            )}

            {/* Layout: landing glows */}
            {stage === "layout" && positions.map((lp, i) => (
              <motion.div
                key={`glow-${i}`}
                className="absolute w-16 h-16 rounded-full pointer-events-none"
                style={{
                  left: lp.x,
                  top: lp.y,
                  marginLeft: -32,
                  marginTop: -32,
                  background: "radial-gradient(circle, rgba(232,212,139,0.2) 0%, transparent 70%)",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.7, 0], scale: [0.3, 1.4, 1.6] }}
                transition={{ delay: i * 0.15 + 0.3, duration: 0.6, ease: "easeOut" }}
              />
            ))}

            {/* ★ THE CARDS — same elements across gather↔layout ★ */}
            {pickedCards.map((card, i) => {
              const lp = positions[i] || { x: "50%", y: "50%" };
              const posInfo = selectedSpread.positions[i];
              const rotate = lp.rotate || 0;
              const isFlipped = flippedCardIds.has(i);
              const total = pickedCards.length;
              const isGather = stage === "gather";

              // Gather: stacked at center. Layout: at spread positions.
              const targetLeft = isGather ? "50%" : lp.x;
              const targetTop = isGather ? "45%" : lp.y;
              const stackOffset = (i - (total - 1) / 2) * 3;

              return (
                <motion.div
                  key={card.id}
                  className={`absolute [perspective:600px] ${stage === "layout" ? "cursor-pointer" : ""}`}
                  style={{
                    width: cardW,
                    height: cardH,
                    marginLeft: -cardW / 2,
                    marginTop: -cardH / 2,
                    zIndex: isGather ? 10 + i : rotate ? 5 : 10 + i,
                  }}
                  initial={{
                    left: "50%",
                    top: "50%",
                    opacity: 0,
                    scale: 0.2,
                  }}
                  animate={{
                    left: targetLeft,
                    top: targetTop,
                    opacity: 1,
                    scale: isGather ? 0.85 : 1,
                    x: isGather ? stackOffset : 0,
                    y: isGather ? -i * 2.5 : 0,
                  }}
                  transition={isGather ? {
                    delay: i * 0.07,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 130,
                    damping: 15,
                  } : {
                    delay: i * 0.15,
                    duration: 1,
                    type: "spring",
                    stiffness: 55,
                    damping: 12,
                  }}
                  onClick={stage === "layout" ? () => flipCard(i) : undefined}
                >
                  {/* Flip + rotation container */}
                  <motion.div
                    className="w-full h-full relative [transform-style:preserve-3d]"
                    animate={{
                      rotateY: isFlipped ? 180 : 0,
                      rotateZ: stage === "layout" ? rotate : 0,
                    }}
                    transition={{ duration: 0.75, ease: [0.4, 0, 0.15, 1] }}
                  >
                    {/* Back */}
                    <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                      <MiniCardBack width={cardW} height={cardH} />
                    </div>

                    {/* Front */}
                    <div
                      className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border border-gold/30 overflow-hidden bg-[#08090e] shadow-[0_2px_12px_rgba(0,0,0,0.4)] ${
                        card.isReversed ? "rotate-180" : ""
                      }`}
                    >
                      {card.image && (
                        <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                        <p className="text-[0.4rem] text-gold text-center truncate">{card.nameTh}</p>
                        {card.isReversed && <p className="text-[0.35rem] text-red-400/70 text-center">กลับหัว</p>}
                      </div>
                    </div>
                  </motion.div>

                  {/* Gather: number badge */}
                  <AnimatePresence>
                    {isGather && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
                        transition={{ delay: i * 0.07 + 0.3, type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <div className="w-5 h-5 rounded-full bg-gold/60 border border-gold flex items-center justify-center shadow-[0_0_10px_rgba(232,212,139,0.4)]">
                          <span className="text-[0.5rem] text-[#08090e] font-bold">{i + 1}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Layout: position label */}
                  {stage === "layout" && (
                    <motion.p
                      className="text-[0.5rem] text-white/30 text-center mt-1 truncate w-full"
                      style={rotate ? { transform: `rotate(${-rotate}deg)` } : undefined}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.15 + 0.5, duration: 0.4 }}
                    >
                      {posInfo?.nameTH}
                    </motion.p>
                  )}
                </motion.div>
              );
            })}

            {/* Gather → Layout burst */}
            {stage === "layout" && (
              <motion.div
                className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(232,212,139,0.25) 0%, transparent 60%)" }}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 2, 2.5], opacity: [0, 0.7, 0] }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* ─── Pick: hint ─── */}
      {stage === "pick" && pickedCards.length === 0 && (
        <p className="text-white/25 text-[0.6rem] mt-2 flex-shrink-0">
          แตะไพ่ที่คุณรู้สึกสัมผัสได้
        </p>
      )}

      {/* ─── Layout: action buttons ─── */}
      {stage === "layout" && (
        <motion.div
          className="flex gap-3 mt-4 flex-shrink-0"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: pickedCards.length * 0.15 + 0.8, duration: 0.5, ease: EASE }}
        >
          <Button variant="outline" onClick={flipAll}>เปิดทั้งหมด</Button>
          {allFlipped && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Button onClick={() => setPhase("reading")}>อ่านคำทำนาย</Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
