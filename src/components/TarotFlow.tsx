"use client";

import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen, SPREAD_CONFIG, SpreadType } from "@/types/tarot";
import CardBack from "@/components/ui/CardBack";
import MiniCardBack from "@/components/ui/MiniCardBack";
import Button from "@/components/ui/Button";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const TOTAL_CARDS = 78;

export default function TarotFlow() {
  const {
    currentScreen: screen, goToScreen,
    spreadType, setSpreadType,
    selectedCardIndices, toggleCard,
    drawnCards, drawAndAssign,
    reset,
  } = useTarotStore();

  // Persistent card layer for shuffle/meditate
  const [cardScope, animateCard] = useAnimate();
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());
  const hasAutoAdvanced = useRef(false);
  const floatRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ===== SCREEN TRANSITIONS =====
  useEffect(() => {
    if (screen === Screen.SHUFFLE) {
      hasAutoAdvanced.current = false;
      runShuffle();
    } else if (screen === Screen.MEDITATE) {
      runMeditate();
    } else if (screen === Screen.SPREAD_PICK || screen === Screen.SELECT) {
      stopFloat();
      // Burst persistent cards outward then hide
      burstAndHide();
    }
  }, [screen]);

  // Select auto-advance
  useEffect(() => {
    const cfg = SPREAD_CONFIG[spreadType];
    if (screen === Screen.SELECT && selectedCardIndices.length === cfg.count && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true;
      drawAndAssign();
      setTimeout(() => goToScreen(Screen.REVEAL), 800);
    }
  }, [selectedCardIndices.length, screen]);

  // Reveal auto-flip
  useEffect(() => {
    if (screen === Screen.REVEAL && drawnCards.length > 0) {
      setFlippedSet(new Set());
      const timers: NodeJS.Timeout[] = [];
      drawnCards.forEach((_, i) => {
        timers.push(setTimeout(() => setFlippedSet(prev => new Set(prev).add(i)), 1200 + i * 300));
      });
      timers.push(setTimeout(() => goToScreen(Screen.READING), 1200 + drawnCards.length * 300 + 1200));
      return () => timers.forEach(clearTimeout);
    }
  }, [screen, drawnCards.length]);

  // ===== HELPERS =====
  function getCards() {
    return Array.from(cardScope.current?.querySelectorAll(".pcard") || []) as Element[];
  }

  function stopFloat() {
    if (floatRef.current) { clearTimeout(floatRef.current); floatRef.current = null; }
  }

  async function burstAndHide() {
    const cards = getCards();
    // Burst outward
    await Promise.all(cards.map((c, i) => {
      const angle = (i / 7) * Math.PI * 2;
      return animateCard(c, {
        x: Math.cos(angle) * 150,
        y: Math.sin(angle) * 150,
        scale: 0.3,
        opacity: 0,
        rotate: (Math.random() - 0.5) * 30,
      }, { duration: 0.6, ease: EASE });
    }));
  }

  // ===== SHUFFLE =====
  async function runShuffle() {
    stopFloat();
    const cards = getCards();
    const mid = 3;
    cards.forEach((c, i) => {
      animateCard(c, { x: 0, y: 0, rotate: 0, scale: 1, opacity: i < 7 ? 1 : 0 }, { duration: 0.01 });
    });
    await new Promise(r => setTimeout(r, 200));
    const arr = cards.slice(0, 7);

    // Fan
    await Promise.all(arr.map((c, i) =>
      animateCard(c, { x: (i - mid) * 30, rotate: (i - mid) * 6, y: Math.abs(i - mid) * 8 }, { duration: 0.7, ease: EASE })
    ));
    // Riffle x2
    for (let round = 0; round < 2; round++) {
      const left = arr.slice(0, mid), right = arr.slice(mid);
      await Promise.all([
        ...left.map((c, i) => animateCard(c, { x: -60 + i * 4, rotate: -3, y: i * 3 }, { duration: 0.35, ease: EASE })),
        ...right.map((c, i) => animateCard(c, { x: 60 - i * 4, rotate: 3, y: i * 3 }, { duration: 0.35, ease: EASE })),
      ]);
      const order: Element[] = [];
      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if (i < right.length) order.push(right[i]);
        if (i < left.length) order.push(left[i]);
      }
      for (const c of order) {
        animateCard(c, { x: 0, y: 0, rotate: (Math.random() - 0.5) * 2 }, { duration: 0.12, ease: "easeOut" });
        await new Promise(r => setTimeout(r, 40));
      }
      await new Promise(r => setTimeout(r, 150));
    }
    // Arc
    await Promise.all(arr.map((c, i) => {
      const angle = ((i - mid) / mid) * 0.6;
      return animateCard(c, { x: Math.sin(angle) * 110, y: -Math.cos(angle) * 110 + 80, rotate: (i - mid) * 10, scale: 0.9 }, { duration: 0.5, ease: EASE });
    }));
    await new Promise(r => setTimeout(r, 250));
    // Gather
    await Promise.all(arr.map((c, i) =>
      animateCard(c, { x: 0, y: 0, rotate: 0, scale: 1 }, { duration: 0.5, ease: EASE, delay: i * 0.03 })
    ));
    // Glow
    const glow = cardScope.current?.querySelector(".glow-ring");
    if (glow) await animateCard(glow as Element, { opacity: [0, 0.5, 0], scale: [0.8, 1.3, 1.5] }, { duration: 0.8, ease: "easeOut" });

    goToScreen(Screen.MEDITATE);
  }

  // ===== MEDITATE =====
  async function runMeditate() {
    const cards = getCards();
    await Promise.all(cards.map((c, i) =>
      animateCard(c, { x: 0, y: 0, rotate: 0, scale: 1, opacity: i === 0 ? 1 : 0 }, { duration: 0.5, ease: EASE })
    ));
    function floatLoop() {
      const card = cards[0];
      if (!card) return;
      animateCard(card, { y: -12 }, { duration: 2, ease: "easeInOut" }).then(() => {
        animateCard(card, { y: 12 }, { duration: 2, ease: "easeInOut" }).then(() => {
          floatRef.current = setTimeout(floatLoop, 0);
        });
      });
    }
    floatLoop();
  }

  function handleReset() {
    stopFloat();
    setFlippedSet(new Set());
    hasAutoAdvanced.current = false;
    reset();
  }

  // ===== show persistent cards only during shuffle/meditate =====
  const showPersistent = screen === Screen.SHUFFLE || screen === Screen.MEDITATE;

  return (
    <div className="fixed inset-0 z-10 pt-[60px] pb-10">

      {/* ===== PERSISTENT CARD LAYER (shuffle + meditate only) ===== */}
      <div
        ref={cardScope}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
      >
        <div className="glow-ring absolute w-[300px] h-[300px] rounded-full opacity-0"
          style={{ background: "radial-gradient(circle, rgba(232,212,139,0.15) 0%, transparent 70%)" }} />
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="pcard absolute opacity-0"
            style={{ zIndex: 7 - i, filter: `brightness(${1 - i * 0.03})` }}
          >
            <CardBack width={160} height={256} />
          </div>
        ))}
      </div>

      {/* ===== UI OVERLAY ===== */}
      <div className="absolute inset-0 z-40 overflow-y-auto">

        {/* SHUFFLE text */}
        <AnimatePresence>
          {screen === Screen.SHUFFLE && (
            <motion.div key="shuf" className="absolute inset-x-0 top-8 text-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <motion.p className="text-lg text-gold tracking-[0.15em] font-semibold mb-2"
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
                กำลังสับไพ่
              </motion.p>
              <p className="text-white/25 text-xs">เตรียมสำรับไพ่ให้คุณ...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MEDITATE */}
        <AnimatePresence>
          {screen === Screen.MEDITATE && (
            <motion.div key="med" className="absolute inset-0 flex flex-col items-center justify-end pb-20"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
              <p className="text-lg text-gold-light font-semibold mb-2">หลับตาแล้วอธิษฐาน</p>
              <p className="text-white/30 text-xs leading-6 mb-6 text-center">ตั้งจิตนึกถึงคำถามที่อยากรู้</p>
              <Button onClick={() => goToScreen(Screen.SPREAD_PICK)}>พร้อมแล้ว</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SPREAD PICK */}
        <AnimatePresence>
          {screen === Screen.SPREAD_PICK && (
            <motion.div key="pick" className="absolute inset-0 flex flex-col items-center justify-center px-5"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: EASE }}>
              <p className="text-lg text-gold tracking-[0.1em] font-semibold mb-2">เลือกรูปแบบการดูไพ่</p>
              <p className="text-white/30 text-xs mb-8">แต่ละแบบให้ความลึกต่างกัน</p>
              <div className="w-full max-w-[340px] space-y-3">
                {(["single", "three", "celtic"] as SpreadType[]).map((sp, idx) => {
                  const cfg = SPREAD_CONFIG[sp];
                  return (
                    <motion.button key={sp}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gold/20 bg-[#0c0d14]/90 text-left active:bg-gold/5 backdrop-blur-sm"
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + idx * 0.1, duration: 0.5, ease: EASE }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSpreadType(sp); hasAutoAdvanced.current = false; goToScreen(Screen.SELECT); }}>
                      <div className="flex-shrink-0 flex items-end gap-[2px]">
                        {Array.from({ length: Math.min(cfg.count, 3) }, (_, i) => (
                          <div key={i} style={{ transform: `rotate(${cfg.count === 1 ? 0 : (i - 1) * 8}deg)` }}>
                            <MiniCardBack width={32} height={51} />
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
        </AnimatePresence>

        {/* SELECT — 78 cards grid */}
        <AnimatePresence>
          {screen === Screen.SELECT && (
            <motion.div key="sel" className="flex flex-col items-center min-h-full px-3 pt-2 pb-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: EASE }}>
              <p className="text-gold font-semibold text-base mb-1">เลือกการ์ด {SPREAD_CONFIG[spreadType].count} ใบ</p>
              <p className="text-white/30 text-xs mb-2">แตะไพ่ที่คุณรู้สึกดึงดูด</p>
              <motion.div className="px-4 py-1 border border-gold/20 rounded-full text-gold text-sm mb-3"
                key={selectedCardIndices.length} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.3 }}>
                {selectedCardIndices.length} / {SPREAD_CONFIG[spreadType].count}
              </motion.div>
              <div className="grid grid-cols-6 gap-[6px] w-full max-w-[360px]">
                {Array.from({ length: TOTAL_CARDS }, (_, i) => {
                  const isSel = selectedCardIndices.includes(i);
                  const isFull = selectedCardIndices.length >= SPREAD_CONFIG[spreadType].count;
                  const isDis = isFull && !isSel;
                  return (
                    <motion.div
                      key={i}
                      className={`relative rounded cursor-pointer overflow-hidden
                        ${isSel ? "ring-1 ring-gold shadow-[0_0_12px_rgba(232,212,139,.25)]" : ""}
                        ${isDis ? "opacity-20 pointer-events-none" : ""}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: isDis ? 0.2 : 1, scale: isSel ? 0.9 : 1 }}
                      transition={{ delay: 0.05 + i * 0.008, duration: 0.4, ease: EASE }}
                      whileTap={{ scale: 0.82 }}
                      onClick={() => {
                        if (isDis) return;
                        toggleCard(i);
                      }}
                    >
                      <MiniCardBack width={55} height={88} />
                      {isSel && (
                        <motion.div className="absolute inset-0 bg-gold/15 rounded"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REVEAL */}
        <AnimatePresence>
          {screen === Screen.REVEAL && (
            <motion.div key="rev" className="absolute inset-0 flex flex-col items-center justify-center px-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}>
              <motion.p className="text-lg text-gold tracking-[0.15em] font-semibold mb-6"
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
                กำลังดีดไพ่
              </motion.p>
              <div className="flex flex-wrap gap-2.5 justify-center max-w-[420px]">
                {drawnCards.map((card, i) => (
                  <motion.div key={i} className="[perspective:800px]"
                    style={{ width: drawnCards.length <= 3 ? 100 : 80, height: drawnCards.length <= 3 ? 160 : 128 }}
                    initial={{ opacity: 0, y: 40, scale: 0.8, rotate: (Math.random() - 0.5) * 10 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 80, damping: 12 }}>
                    <motion.div className="w-full h-full relative [transform-style:preserve-3d]"
                      animate={{ rotateY: flippedSet.has(i) ? 180 : 0 }}
                      transition={{ duration: 1, ease: EASE }}>
                      {/* Back */}
                      <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg overflow-hidden">
                        <MiniCardBack width={drawnCards.length <= 3 ? 100 : 80} height={drawnCards.length <= 3 ? 160 : 128} />
                      </div>
                      {/* Front */}
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
        </AnimatePresence>

        {/* READING */}
        <AnimatePresence>
          {screen === Screen.READING && (
            <motion.div key="read" className="flex flex-col items-center min-h-full px-4 pt-2 pb-16"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}>
              <h2 className="text-xl text-gold text-center mb-5 tracking-[0.15em] font-semibold">คำทำนายไพ่ทาโร่</h2>
              <div className="flex gap-1.5 flex-wrap justify-center mb-6 max-w-[420px]">
                {drawnCards.map((card, i) => (
                  <motion.div key={i} className="w-[58px] h-[87px] rounded-md border border-gold/20 overflow-hidden relative bg-[#08090e]"
                    initial={{ opacity: 0, scale: 0.7, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}>
                    {card.image && <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" loading="eager" />}
                  </motion.div>
                ))}
              </div>
              <div className="w-full max-w-[420px] space-y-4">
                {drawnCards.map((card, i) => (
                  <motion.div key={i} className="bg-gradient-to-br from-surface/90 to-[#08090e]/95 border border-gold/15 rounded-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: EASE }}>
                    <div className="flex gap-4 p-4 items-start">
                      <div className="w-[90px] h-[135px] rounded-lg border border-gold/20 overflow-hidden relative flex-shrink-0 bg-[#08090e]">
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
              <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                <Button variant="outline" onClick={handleReset}>ดูไพ่อีกครั้ง</Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
