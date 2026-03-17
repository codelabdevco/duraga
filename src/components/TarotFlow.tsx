"use client";

import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen, SPREAD_CONFIG, SpreadType } from "@/types/tarot";
import CardBack from "@/components/ui/CardBack";
import MiniCardBack from "@/components/ui/MiniCardBack";
import Button from "@/components/ui/Button";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const SHUFFLE_CARDS = 7;

export default function TarotFlow() {
  const store = useTarotStore();
  const {
    currentScreen, goToScreen,
    spreadType, setSpreadType,
    selectedCardIndices, toggleCard,
    drawnCards, drawAndAssign,
    reset,
  } = store;

  const [scope, animate] = useAnimate();
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());
  const hasAutoAdvanced = useRef(false);

  // ===== SHUFFLE AUTO-START =====
  useEffect(() => {
    if (currentScreen === Screen.SHUFFLE) {
      hasAutoAdvanced.current = false;
      runShuffle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen]);

  // ===== SELECT AUTO-ADVANCE =====
  useEffect(() => {
    const cfg = SPREAD_CONFIG[spreadType];
    if (currentScreen === Screen.SELECT && selectedCardIndices.length === cfg.count && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true;
      drawAndAssign();
      setTimeout(() => goToScreen(Screen.REVEAL), 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCardIndices.length, currentScreen]);

  // ===== REVEAL AUTO-FLIP =====
  useEffect(() => {
    if (currentScreen === Screen.REVEAL && drawnCards.length > 0) {
      setFlippedSet(new Set());
      const timers: NodeJS.Timeout[] = [];
      drawnCards.forEach((_, i) => {
        timers.push(setTimeout(() => setFlippedSet(prev => new Set(prev).add(i)), 1200 + i * 350));
      });
      timers.push(setTimeout(() => goToScreen(Screen.READING), 1200 + drawnCards.length * 350 + 1200));
      return () => timers.forEach(clearTimeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen, drawnCards.length]);

  // ===== SHUFFLE ANIMATION =====
  async function runShuffle() {
    await new Promise(r => setTimeout(r, 150));
    const cards = scope.current?.querySelectorAll(".s-card");
    if (!cards) return;
    const arr = Array.from(cards) as Element[];
    const mid = Math.floor(SHUFFLE_CARDS / 2);

    // Phase 1: Fan
    await Promise.all(arr.map((c, i) =>
      animate(c, { x: (i - mid) * 30, rotate: (i - mid) * 6, y: Math.abs(i - mid) * 8, opacity: 1 }, { duration: 0.7, ease: EASE })
    ));

    // Phase 2: Riffle x2
    for (let round = 0; round < 2; round++) {
      const left = arr.slice(0, mid), right = arr.slice(mid);
      await Promise.all([
        ...left.map((c, i) => animate(c, { x: -60 + i * 4, rotate: -3, y: i * 3 }, { duration: 0.35, ease: EASE })),
        ...right.map((c, i) => animate(c, { x: 60 - i * 4, rotate: 3, y: i * 3 }, { duration: 0.35, ease: EASE })),
      ]);
      const order: Element[] = [];
      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if (i < right.length) order.push(right[i]);
        if (i < left.length) order.push(left[i]);
      }
      for (const c of order) {
        animate(c, { x: 0, y: 0, rotate: (Math.random() - 0.5) * 2 }, { duration: 0.12, ease: "easeOut" });
        await new Promise(r => setTimeout(r, 40));
      }
      await new Promise(r => setTimeout(r, 150));
    }

    // Phase 3: Arc
    await Promise.all(arr.map((c, i) => {
      const angle = ((i - mid) / mid) * 0.6;
      return animate(c, { x: Math.sin(angle) * 110, y: -Math.cos(angle) * 110 + 80, rotate: (i - mid) * 10, scale: 0.9 }, { duration: 0.5, ease: EASE });
    }));
    await new Promise(r => setTimeout(r, 250));

    // Phase 4: Gather
    await Promise.all(arr.map((c, i) =>
      animate(c, { x: 0, y: 0, rotate: 0, scale: 1 }, { duration: 0.5, ease: EASE, delay: i * 0.03 })
    ));

    // Glow
    const glow = scope.current?.querySelector(".glow-ring");
    if (glow) await animate(glow as Element, { opacity: [0, 0.5, 0], scale: [0.8, 1.3, 1.5] }, { duration: 0.8, ease: "easeOut" });

    goToScreen(Screen.MEDITATE);
  }

  function handleReset() {
    setFlippedSet(new Set());
    hasAutoAdvanced.current = false;
    reset();
  }

  // ===== RENDER =====
  const screen = currentScreen;

  return (
    <div className="fixed inset-0 z-10 pt-[60px] pb-10 overflow-y-auto">

      {/* ============ SHUFFLE + MEDITATE (shared card stage) ============ */}
      {(screen === Screen.SHUFFLE || screen === Screen.MEDITATE) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">

          {/* Text area */}
          <div className="text-center mb-8 min-h-[60px]">
            <AnimatePresence mode="wait">
              {screen === Screen.SHUFFLE ? (
                <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
                  <motion.p className="text-lg text-gold tracking-[0.15em] font-semibold mb-2"
                    animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
                    กำลังสับไพ่
                  </motion.p>
                  <p className="text-white/25 text-xs">เตรียมสำรับไพ่ให้คุณ...</p>
                </motion.div>
              ) : (
                <motion.div key="m" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: EASE }}>
                  <p className="text-lg text-gold-light font-semibold mb-2">หลับตาแล้วอธิษฐาน</p>
                  <p className="text-white/30 text-xs leading-6">ตั้งจิตนึกถึงคำถามที่อยากรู้</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card stage */}
          <div ref={scope} className="relative w-[240px] h-[300px]">
            <div className="glow-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full opacity-0"
              style={{ background: "radial-gradient(circle, rgba(232,212,139,0.15) 0%, transparent 70%)" }} />
            {Array.from({ length: SHUFFLE_CARDS }, (_, i) => (
              <motion.div
                key={i}
                className="s-card absolute left-1/2 top-1/2"
                style={{ zIndex: SHUFFLE_CARDS - i, filter: `brightness(${1 - i * 0.03})`, marginLeft: -70, marginTop: -112 }}
                animate={screen === Screen.MEDITATE ? { y: [0, -12, 0], opacity: i === 0 ? 1 : 0 } : {}}
                transition={screen === Screen.MEDITATE ? { y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.5 } } : {}}
              >
                <CardBack width={140} height={224} />
              </motion.div>
            ))}
          </div>

          {/* Meditate button */}
          {screen === Screen.MEDITATE && (
            <motion.div
              className="mt-8 relative z-30"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: EASE }}
            >
              <Button onClick={() => goToScreen(Screen.SPREAD_PICK)}>พร้อมแล้ว</Button>
            </motion.div>
          )}
        </div>
      )}

      {/* ============ SPREAD PICK ============ */}
      {screen === Screen.SPREAD_PICK && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-5 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="text-lg text-gold tracking-[0.1em] font-semibold mb-2">เลือกรูปแบบการดูไพ่</p>
          <p className="text-white/30 text-xs mb-8">แต่ละแบบให้ความลึกต่างกัน</p>
          <div className="w-full max-w-[340px] space-y-3">
            {(["single", "three", "celtic"] as SpreadType[]).map((sp, idx) => {
              const cfg = SPREAD_CONFIG[sp];
              return (
                <motion.button
                  key={sp}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gold/20 bg-[#0c0d14]/80 text-left active:bg-gold/5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.1, duration: 0.5, ease: EASE }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setSpreadType(sp); hasAutoAdvanced.current = false; goToScreen(Screen.SELECT); }}
                >
                  <div className="flex-shrink-0 flex items-end gap-[2px]">
                    {Array.from({ length: Math.min(cfg.count, 3) }, (_, i) => (
                      <div key={i} style={{ transform: `rotate(${cfg.count === 1 ? 0 : (i - 1) * 8}deg)` }}>
                        <MiniCardBack width={28} height={45} />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gold/50 text-sm">{cfg.icon}</span>
                      <span className="text-gold font-semibold text-sm">{cfg.label}</span>
                      <span className="text-[0.65rem] text-white/20 ml-auto">{cfg.count} ใบ</span>
                    </div>
                    <p className="text-xs text-white/40 leading-5">{cfg.desc}</p>
                  </div>
                  <span className="text-gold/30 text-sm">›</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ============ SELECT CARDS ============ */}
      {screen === Screen.SELECT && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center pt-4 px-4 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <p className="text-gold font-semibold text-base mb-1">เลือกการ์ด {SPREAD_CONFIG[spreadType].count} ใบ</p>
          <p className="text-white/30 text-xs mb-3">แตะไพ่ที่คุณรู้สึกดึงดูด</p>
          <motion.div className="px-4 py-1.5 border border-gold/20 rounded-full text-gold text-sm mb-4"
            key={selectedCardIndices.length} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.3 }}>
            {selectedCardIndices.length} / {SPREAD_CONFIG[spreadType].count}
          </motion.div>
          <div className="w-full max-w-[380px]"
            style={{ display: "grid", gridTemplateColumns: `repeat(${SPREAD_CONFIG[spreadType].gridCards <= 9 ? 3 : 5}, 1fr)`, gap: "10px" }}>
            {Array.from({ length: SPREAD_CONFIG[spreadType].gridCards }, (_, i) => {
              const isSel = selectedCardIndices.includes(i);
              const isDis = selectedCardIndices.length >= SPREAD_CONFIG[spreadType].count && !isSel;
              return (
                <motion.div key={i}
                  className={`relative rounded-lg cursor-pointer overflow-hidden
                    ${isSel ? "ring-1 ring-gold shadow-[0_0_16px_rgba(232,212,139,.2)]" : ""}
                    ${isDis ? "opacity-15 pointer-events-none" : ""}`}
                  initial={{ opacity: 0, scale: 0.85, y: 12 }}
                  animate={{ opacity: isDis ? 0.15 : 1, scale: isSel ? 0.92 : 1, y: 0 }}
                  transition={{ delay: i * 0.02, type: "spring", stiffness: 150, damping: 16 }}
                  whileTap={{ scale: 0.82 }}
                  onClick={() => toggleCard(i)}>
                  <MiniCardBack width={68} height={109} />
                  {isSel && <div className="absolute inset-0 bg-gold/10 rounded-lg" />}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ============ REVEAL ============ */}
      {screen === Screen.REVEAL && (
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-20"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <motion.p className="text-lg text-gold tracking-[0.15em] font-semibold mb-6"
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
            กำลังดีดไพ่
          </motion.p>
          <div className="flex flex-wrap gap-2.5 justify-center max-w-[400px]">
            {drawnCards.map((card, i) => (
              <motion.div key={i} className="w-[72px] h-[115px] [perspective:800px]"
                initial={{ opacity: 0, y: 30, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 100, damping: 14 }}>
                <motion.div className="w-full h-full relative [transform-style:preserve-3d]"
                  animate={{ rotateY: flippedSet.has(i) ? 180 : 0 }} transition={{ duration: 1, ease: EASE }}>
                  <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg overflow-hidden">
                    <MiniCardBack width={72} height={115} />
                  </div>
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border-[1.5px] border-gold/40 overflow-hidden bg-[#08090e]">
                    {card.image && <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" loading="eager" />}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                      <p className="text-[0.45rem] text-gold text-center leading-tight truncate">{card.nameTh}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ============ READING ============ */}
      {screen === Screen.READING && (
        <motion.div className="flex flex-col items-center min-h-full px-4 pt-2 pb-16 z-20"
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <h2 className="text-xl text-gold text-center mb-5 tracking-[0.15em] font-semibold">คำทำนายไพ่ทาโร่</h2>
          <div className="flex gap-1.5 flex-wrap justify-center mb-6 max-w-[420px]">
            {drawnCards.map((card, i) => (
              <motion.div key={i} className="w-[52px] h-[78px] rounded-md border border-gold/20 overflow-hidden relative bg-[#08090e]"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }}>
                {card.image && <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" loading="eager" />}
              </motion.div>
            ))}
          </div>
          <div className="w-full max-w-[420px] space-y-4">
            {drawnCards.map((card, i) => (
              <motion.div key={i} className="bg-gradient-to-br from-surface/90 to-[#08090e]/95 border border-gold/15 rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: "easeOut" }}>
                <div className="flex gap-4 p-4 items-start">
                  <div className="w-[75px] h-[112px] rounded-lg border border-gold/20 overflow-hidden relative flex-shrink-0 bg-[#08090e]">
                    {card.image && <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base text-gold-light font-semibold mb-0.5">{card.nameEn}</h3>
                    <p className="text-sm text-gold/60 mb-1">{card.nameTh}</p>
                    <p className="text-[0.7rem] text-white/30 mb-2">ตำแหน่ง {i + 1}: {card.position}</p>
                    <p className="text-xs text-white/50 leading-5">{card.meaningTh || card.meaning}</p>
                  </div>
                </div>
                {(card.analysisTh || card.analysis) && (
                  <div className="px-4 pb-4">
                    <p className="text-sm leading-7 text-white/75">{card.analysisTh || card.analysis}</p>
                    {(card.goldenSentenceTh || card.goldenSentence) && (
                      <p className="mt-3 text-sm text-gold/80 italic leading-6 border-l-2 border-gold/30 pl-3">
                        &ldquo;{card.goldenSentenceTh || card.goldenSentence}&rdquo;
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <Button variant="outline" onClick={handleReset}>ดูไพ่อีกครั้ง</Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
