"use client";

import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { TOPICS, SPREADS, TOPIC_DEFAULT_SPREAD, Phase } from "@/types/tarot";
import CardBack from "@/components/ui/CardBack";
import MiniCardBack from "@/components/ui/MiniCardBack";
import Button from "@/components/ui/Button";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Layout positions for Celtic Cross (percentage-based)
const CELTIC_LAYOUT: Record<number, { x: string; y: string; rotate: number }> = {
  1: { x: "28%", y: "42%", rotate: 0 },
  2: { x: "28%", y: "42%", rotate: 90 },
  3: { x: "28%", y: "8%", rotate: 0 },
  4: { x: "28%", y: "72%", rotate: 0 },
  5: { x: "10%", y: "42%", rotate: 0 },
  6: { x: "46%", y: "42%", rotate: 0 },
  7: { x: "72%", y: "74%", rotate: 0 },
  8: { x: "72%", y: "52%", rotate: 0 },
  9: { x: "72%", y: "30%", rotate: 0 },
  10: { x: "72%", y: "8%", rotate: 0 },
};

const FIVE_LAYOUT: Record<number, { x: string; y: string }> = {
  1: { x: "15%", y: "45%" }, 2: { x: "42%", y: "45%" }, 3: { x: "70%", y: "45%" },
  4: { x: "42%", y: "75%" }, 5: { x: "42%", y: "15%" },
};

const HORSESHOE_LAYOUT: Record<number, { x: string; y: string }> = {
  1: { x: "8%", y: "75%" }, 2: { x: "8%", y: "45%" }, 3: { x: "25%", y: "15%" },
  4: { x: "50%", y: "8%" }, 5: { x: "75%", y: "15%" }, 6: { x: "92%", y: "45%" },
  7: { x: "92%", y: "75%" },
};

export default function TarotFlow() {
  const store = useTarotStore();
  const { phase, selectedTopic, selectedSpread, userQuestion, shuffledDeck, pickedCards, flippedCardIds, hasShuffled, aiReading, isLoadingAI } = store;
  const { setPhase, selectTopic, selectSpread, setQuestion, shuffleDeck, pickCard, flipCard, flipAll, reset } = store;

  const [shuffleScope, animateShuffle] = useAnimate();

  // ===== SHUFFLE ANIMATION (4-phase: fan → riffle → cascade → glow) =====
  async function handleShuffle() {
    shuffleDeck();
    const cards = shuffleScope.current?.querySelectorAll(".shuf-card");
    if (!cards) return;
    const arr = Array.from(cards) as Element[];
    const mid = 3; // center index for 7 cards

    // Phase 1: Fan out from stack
    await Promise.all(arr.map((c, i) =>
      animateShuffle(c, {
        x: (i - mid) * 32,
        rotate: (i - mid) * 7,
        y: Math.abs(i - mid) * 10,
        opacity: 1,
      }, { duration: 0.7, ease: EASE })
    ));

    // Phase 2: Riffle shuffle × 2
    for (let round = 0; round < 2; round++) {
      const left = arr.slice(0, mid);
      const right = arr.slice(mid);

      // Split left/right
      await Promise.all([
        ...left.map((c, i) => animateShuffle(c, { x: -65 + i * 5, rotate: -4 + Math.random() * 2, y: i * 4 }, { duration: 0.4, ease: EASE })),
        ...right.map((c, i) => animateShuffle(c, { x: 65 - i * 5, rotate: 4 - Math.random() * 2, y: i * 4 }, { duration: 0.4, ease: EASE })),
      ]);

      // Interleave one by one
      const order: Element[] = [];
      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if (i < right.length) order.push(right[i]);
        if (i < left.length) order.push(left[i]);
      }
      for (let j = 0; j < order.length; j++) {
        animateShuffle(order[j], {
          x: 0, y: -j * 2,
          rotate: (Math.random() - 0.5) * 3,
        }, { duration: 0.13, ease: "easeOut" });
        await new Promise(r => setTimeout(r, 45));
      }
      await new Promise(r => setTimeout(r, 180));
    }

    // Phase 3: Cascade arc
    await Promise.all(arr.map((c, i) => {
      const angle = ((i - mid) / mid) * 0.65;
      const radius = 120;
      return animateShuffle(c, {
        x: Math.sin(angle) * radius,
        y: -Math.cos(angle) * radius + radius - 25,
        rotate: (i - mid) * 12,
        scale: 0.88,
      }, { duration: 0.55, ease: EASE });
    }));
    await new Promise(r => setTimeout(r, 280));

    // Gather back to stack
    await Promise.all(arr.map((c, i) =>
      animateShuffle(c, {
        x: 0, y: -i * 2, rotate: 0, scale: 1,
      }, { duration: 0.5, ease: EASE, delay: i * 0.035 })
    ));

    // Phase 4: Glow pulse
    const glow = shuffleScope.current?.querySelector(".glow-ring");
    if (glow) {
      await animateShuffle(glow as Element, {
        opacity: [0, 0.6, 0],
        scale: [0.7, 1.4, 1.6],
      }, { duration: 0.9, ease: "easeOut" });
    }
  }

  // ===== RENDER =====
  return (
    <div className="fixed inset-0 z-10 pt-[56px] pb-8 overflow-y-auto">
      <AnimatePresence mode="wait">

        {/* ===== STEP 2: TOPIC ===== */}
        {phase === "topic" && (
          <motion.div key="topic" className="flex flex-col items-center min-h-full px-4 pt-4 pb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <p className="text-lg text-gold font-semibold mb-1 tracking-wide">เลือกหมวดคำถาม</p>
            <p className="text-white/30 text-xs mb-5">เลือกเรื่องที่อยากถามไพ่</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-[380px]">
              {TOPICS.map((t, idx) => (
                <motion.button key={t.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-[#0c0d14]/80 text-left active:bg-white/5"
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.04, duration: 0.4, ease: EASE }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => selectTopic(t)}>
                  <span className="text-2xl mt-0.5" style={{ color: t.color }}>{t.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-white/90 font-medium leading-tight">{t.nameTH}</p>
                    <p className="text-[0.65rem] text-white/30 mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== STEP 3: SPREAD ===== */}
        {phase === "spread" && (
          <motion.div key="spread" className="flex flex-col items-center min-h-full px-4 pt-4 pb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <p className="text-lg text-gold font-semibold mb-1 tracking-wide">เลือกรูปแบบการวาง</p>
            <p className="text-white/30 text-xs mb-5">
              แนะนำ: <span className="text-gold/60">{selectedSpread?.nameTH}</span> สำหรับ {selectedTopic?.nameTH}
            </p>
            <div className="w-full max-w-[380px] space-y-2.5">
              {SPREADS.map((s, idx) => {
                const isDefault = s.id === selectedSpread?.id;
                return (
                  <motion.button key={s.id}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left active:bg-gold/5
                      ${isDefault ? "border-gold/40 bg-gold/5" : "border-white/10 bg-[#0c0d14]/80"}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + idx * 0.04, duration: 0.4, ease: EASE }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { selectSpread(s); setPhase("question"); }}>
                    <div className="flex-shrink-0 flex items-end gap-[1px]">
                      {Array.from({ length: Math.min(s.cardCount, 4) }, (_, i) => (
                        <div key={i} style={{ transform: `rotate(${(i - 1) * 6}deg)`, opacity: 0.6 }}>
                          <MiniCardBack width={18} height={29} />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/90 font-medium">{s.nameTH}</span>
                        <span className="text-[0.6rem] text-white/25">{s.cardCount} ใบ</span>
                        {isDefault && <span className="text-[0.55rem] text-gold/60 ml-auto">แนะนำ</span>}
                      </div>
                      <p className="text-[0.65rem] text-white/30 mt-0.5">{s.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===== STEP 4: QUESTION ===== */}
        {phase === "question" && (
          <motion.div key="question" className="flex flex-col items-center justify-center min-h-full px-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <p className="text-lg text-gold font-semibold mb-1 tracking-wide">ตั้งคำถาม</p>
            <p className="text-white/30 text-xs mb-6">พิมพ์คำถามของคุณ หรือข้ามไปเลยก็ได้</p>

            <textarea
              className="w-full max-w-[340px] h-[100px] bg-[#0c0d14] border border-gold/20 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-gold/40"
              placeholder="พิมพ์คำถามของคุณ... (ไม่บังคับ)"
              value={userQuestion}
              onChange={e => setQuestion(e.target.value)}
            />

            {selectedTopic && (
              <div className="flex flex-wrap gap-2 mt-3 max-w-[340px]">
                {selectedTopic.examples.map((ex, i) => (
                  <button key={i}
                    className="text-[0.65rem] text-gold/50 border border-gold/15 rounded-full px-3 py-1 active:bg-gold/5"
                    onClick={() => setQuestion(ex)}>
                    {ex}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="outline" onClick={() => setPhase("shuffle")}>ข้าม</Button>
              <Button onClick={() => setPhase("shuffle")}>ต่อไป</Button>
            </div>
          </motion.div>
        )}

        {/* ===== STEP 5: SHUFFLE ===== */}
        {phase === "shuffle" && (
          <motion.div key="shuffle" className="flex flex-col items-center justify-center min-h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <p className="text-white/30 text-xs mb-2 text-center leading-6">
              หายใจลึกๆ ตั้งจิตสมาธิ<br />นึกถึงคำถามของคุณ...
            </p>
            <p className="text-lg text-gold font-semibold mb-8 tracking-wide">สับไพ่</p>

            <div ref={shuffleScope} className="relative w-[240px] h-[300px] mb-8">
              {/* Glow ring */}
              <div className="glow-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full opacity-0"
                style={{ background: "radial-gradient(circle, rgba(232,212,139,0.18) 0%, transparent 70%)" }} />
              {/* 7 cards */}
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="shuf-card absolute left-1/2 top-1/2"
                  style={{ marginLeft: -75, marginTop: -120, zIndex: 7 - i, filter: `brightness(${1 - i * 0.03})` }}>
                  <CardBack width={150} height={240} />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleShuffle}>สับไพ่</Button>
              {hasShuffled && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}>
                  <Button variant="outline" onClick={() => setPhase("fan")}>เลือกไพ่</Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===== STEP 6: PICK CARDS (5 rows, 70° arc) ===== */}
        {phase === "fan" && selectedSpread && (() => {
          const ROWS = 5;
          const PER_ROW = Math.ceil(78 / ROWS); // 16
          const ARC_DEG = 220; // deep arc
          const remaining = selectedSpread.cardCount - pickedCards.length;

          return (
            <motion.div key="fan" className="flex flex-col items-center min-h-full pt-1 pb-3 px-1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>

              <div className="text-center mb-2">
                <motion.p className="text-gold font-semibold text-sm"
                  key={pickedCards.length}
                  animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.3 }}>
                  {remaining > 0 ? `เลือกอีก ${remaining} ใบ` : "เลือกครบแล้ว!"}
                </motion.p>
                <div className="flex justify-center gap-[3px] mt-1">
                  {Array.from({ length: selectedSpread.cardCount }, (_, i) => (
                    <div key={i} className={`w-[6px] h-[6px] rounded-full ${i < pickedCards.length ? "bg-gold" : "bg-white/15"}`} />
                  ))}
                </div>
              </div>

              {/* 5 arc rows */}
              <div className="flex flex-col items-center gap-0">
                {Array.from({ length: ROWS }, (_, row) => {
                  const start = row * PER_ROW;
                  const rowCards = shuffledDeck.slice(start, start + PER_ROW);
                  const count = rowCards.length;

                  return (
                    <motion.div key={row}
                      className="grid gap-0"
                      style={{ gridTemplateColumns: `repeat(${count}, 24px)`, justifyContent: "center" }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: row * 0.08, duration: 0.5, ease: EASE }}>
                      {rowCards.map((card, col) => {
                        const globalIdx = start + col;
                        const isPicked = pickedCards.some(p => p.id === card.id);
                        const pickNum = pickedCards.findIndex(p => p.id === card.id) + 1;
                        const isFull = pickedCards.length >= selectedSpread.cardCount;
                        const isDisabled = isFull && !isPicked;

                        // Arc rotation: -35° to +35° (70° total)
                        const t = count > 1 ? col / (count - 1) : 0.5;
                        const angle = -ARC_DEG / 2 + ARC_DEG * t;
                        // Vertical offset: deeper arc for half circle
                        const liftY = 50 * (1 - 4 * t * (1 - t));

                        return (
                          <motion.button key={card.id} type="button"
                            className="relative p-0 border-0 bg-transparent"
                            style={{ height: 115, overflow: "visible" }}
                            animate={{ opacity: isDisabled ? 0.15 : isPicked ? 0.4 : 1 }}
                            transition={{ duration: 0.2 }}
                            whileTap={{ scale: 0.88 }}
                            onClick={() => {
                              if (isPicked) store.unpickCard(card.id);
                              else if (!isDisabled) pickCard(globalIdx);
                            }}>
                            {/* Card visual — rotated for arc effect */}
                            <motion.div
                              className="pointer-events-none"
                              style={{
                                width: 40, height: 64,
                                position: "absolute",
                                left: "50%", top: liftY,
                                marginLeft: -20,
                                transformOrigin: "center bottom",
                                transform: `rotate(${angle}deg)`,
                              }}
                              animate={{
                                y: isPicked ? -12 : 0,
                                scale: isPicked ? 0.85 : 1,
                              }}
                              transition={{ duration: 0.2 }}>
                              <MiniCardBack width={40} height={64} />
                              {isPicked && (
                                <motion.div className="absolute inset-0 flex items-center justify-center"
                                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                                  <div className="w-5 h-5 rounded-full bg-gold/60 border border-gold flex items-center justify-center shadow-[0_0_8px_rgba(232,212,139,.4)]">
                                    <span className="text-[0.45rem] text-[#08090e] font-bold">{pickNum}</span>
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-white/20 text-[0.55rem] mt-1">แตะเลือก · แตะอีกทีเพื่อยกเลิก</p>
            </motion.div>
          );
        })()}

        {/* ===== STEP 7: LAYOUT (card placement) ===== */}
        {phase === "layout" && selectedSpread && (
          <motion.div key="layout" className="flex flex-col items-center min-h-full px-4 pt-2 pb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <p className="text-gold font-semibold text-sm mb-1">{selectedSpread.nameTH}</p>
            <p className="text-white/25 text-xs mb-4">แตะไพ่เพื่อเปิด</p>

            {/* Layout area */}
            <div className="relative w-full max-w-[380px]" style={{ aspectRatio: selectedSpread.cardCount <= 3 ? "3/1" : "1.2/1" }}>
              {pickedCards.map((card, i) => {
                const pos = selectedSpread.positions[i];
                const isFlipped = flippedCardIds.has(i);
                let layoutPos: { x: string; y: string; rotate?: number };

                if (selectedSpread.id === "celtic") {
                  layoutPos = CELTIC_LAYOUT[i + 1] || { x: "50%", y: "50%" };
                } else if (selectedSpread.id === "five") {
                  layoutPos = FIVE_LAYOUT[i + 1] || { x: "50%", y: "50%" };
                } else if (selectedSpread.id === "horseshoe") {
                  layoutPos = HORSESHOE_LAYOUT[i + 1] || { x: "50%", y: "50%" };
                } else if (selectedSpread.cardCount === 3) {
                  layoutPos = { x: `${20 + i * 30}%`, y: "50%" };
                } else {
                  layoutPos = { x: "50%", y: "50%" };
                }

                const w = selectedSpread.cardCount <= 3 ? 80 : selectedSpread.cardCount <= 5 ? 65 : 55;
                const h = w * 1.6;

                return (
                  <motion.div
                    key={i}
                    className="absolute [perspective:600px] cursor-pointer"
                    style={{
                      left: layoutPos.x, top: layoutPos.y,
                      transform: "translate(-50%, -50%)",
                      width: w, height: h,
                    }}
                    initial={{ opacity: 0, scale: 0.5, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.5, ease: EASE }}
                    onClick={() => flipCard(i)}
                  >
                    <motion.div
                      className="w-full h-full relative [transform-style:preserve-3d]"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.75, ease: [0.4, 0, 0.15, 1] }}
                    >
                      {/* Back */}
                      <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg overflow-hidden"
                        style={{ transform: `rotate(${layoutPos.rotate || 0}deg)` }}>
                        <MiniCardBack width={w} height={h} />
                      </div>
                      {/* Front */}
                      <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border border-gold/30 overflow-hidden bg-[#08090e] ${card.isReversed ? "rotate-180" : ""}`}>
                        {card.image && <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" />}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                          <p className="text-[0.4rem] text-gold text-center truncate">{card.nameTh}</p>
                          {card.isReversed && <p className="text-[0.35rem] text-red-400/70 text-center">กลับหัว</p>}
                        </div>
                      </div>
                    </motion.div>
                    {/* Position label */}
                    <p className="text-[0.5rem] text-white/25 text-center mt-1 truncate">{pos?.nameTH}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={flipAll}>เปิดทั้งหมด</Button>
              {flippedCardIds.size === pickedCards.length && pickedCards.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <Button onClick={() => setPhase("reading")}>อ่านคำทำนาย</Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===== STEP 8-9: READING ===== */}
        {phase === "reading" && (
          <motion.div key="reading" className="flex flex-col items-center min-h-full px-4 pt-2 pb-16"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}>
            <h2 className="text-xl text-gold text-center mb-3 tracking-[0.15em] font-semibold">คำทำนาย</h2>

            {/* Context: topic + spread + question */}
            <div className="w-full max-w-[420px] mb-5 text-center">
              {selectedTopic && (
                <p className="text-xs text-white/40">
                  <span style={{ color: selectedTopic.color }}>{selectedTopic.icon}</span>
                  {" "}{selectedTopic.nameTH}
                  {selectedSpread && <span className="text-white/20"> · {selectedSpread.nameTH}</span>}
                </p>
              )}
              {userQuestion && (
                <p className="text-sm text-white/50 mt-2 italic leading-6">
                  &ldquo;{userQuestion}&rdquo;
                </p>
              )}
            </div>

            {/* Card summary row */}
            <div className="flex gap-1.5 flex-wrap justify-center mb-6 max-w-[420px]">
              {pickedCards.map((card, i) => (
                <motion.div key={i}
                  className={`w-[50px] h-[75px] rounded-md border border-gold/20 overflow-hidden relative bg-[#08090e] ${card.isReversed ? "rotate-180" : ""}`}
                  initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}>
                  {card.image && <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" />}
                </motion.div>
              ))}
            </div>

            {/* Detailed reading */}
            <div className="w-full max-w-[420px] space-y-4">
              {pickedCards.map((card, i) => {
                const pos = selectedSpread?.positions[i];
                return (
                  <motion.div key={i} className="bg-gradient-to-br from-surface/90 to-[#08090e]/95 border border-gold/15 rounded-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: EASE }}>
                    <div className="flex gap-4 p-4 items-start">
                      <div className={`w-[80px] h-[120px] rounded-lg border border-gold/20 overflow-hidden relative flex-shrink-0 bg-[#08090e] ${card.isReversed ? "rotate-180" : ""}`}>
                        {card.image && <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-gold-light font-semibold mb-0.5">
                          {card.nameTh} {card.isReversed && <span className="text-red-400/60 text-xs">(กลับหัว)</span>}
                        </h3>
                        <p className="text-[0.65rem] text-gold/40 mb-2">{pos?.nameTH}</p>
                        <p className="text-xs text-white/60 leading-6">{card.meaningTh || card.meaning}</p>
                      </div>
                    </div>
                    {(card.analysisTh || card.analysis) && (
                      <div className="px-4 pb-4">
                        <p className="text-sm leading-7 text-white/70">{card.analysisTh || card.analysis}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={reset}>จั่วไพ่ใหม่</Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
