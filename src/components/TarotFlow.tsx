"use client";

import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { Screen, SPREAD_CONFIG, SpreadType } from "@/types/tarot";
import CardBack from "@/components/ui/CardBack";
import MiniCardBack from "@/components/ui/MiniCardBack";
import Button from "@/components/ui/Button";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const MAX_CARDS = 20;

export default function TarotFlow() {
  const {
    currentScreen: screen, goToScreen,
    spreadType, setSpreadType,
    selectedCardIndices, toggleCard,
    drawnCards, drawAndAssign,
    reset,
  } = useTarotStore();

  const [cardScope, animateCard] = useAnimate();
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());
  const hasAutoAdvanced = useRef(false);
  const prevScreen = useRef(screen);
  const floatRef = useRef<number | null>(null);

  // ===== SCREEN CHANGE HANDLER =====
  useEffect(() => {
    const prev = prevScreen.current;
    prevScreen.current = screen;

    if (screen === Screen.SHUFFLE) {
      hasAutoAdvanced.current = false;
      runShuffle();
    } else if (screen === Screen.MEDITATE) {
      runMeditate();
    } else if (screen === Screen.SPREAD_PICK) {
      runSpreadPick();
    } else if (screen === Screen.SELECT) {
      runSelect();
    } else if (screen === Screen.REVEAL) {
      runReveal();
    } else if (screen === Screen.READING) {
      // Cards handled by reading section, hide persistent cards
      hideAllCards(0.4);
    }
  }, [screen]);

  // ===== SELECT AUTO-ADVANCE =====
  useEffect(() => {
    const cfg = SPREAD_CONFIG[spreadType];
    if (screen === Screen.SELECT && selectedCardIndices.length === cfg.count && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true;
      drawAndAssign();
      // Animate selected cards gathering to center before reveal
      gatherSelectedCards().then(() => {
        goToScreen(Screen.REVEAL);
      });
    }
  }, [selectedCardIndices.length, screen]);

  // ===== REVEAL AUTO-FLIP =====
  useEffect(() => {
    if (screen === Screen.REVEAL && drawnCards.length > 0) {
      setFlippedSet(new Set());
      const timers: NodeJS.Timeout[] = [];
      drawnCards.forEach((_, i) => {
        timers.push(setTimeout(() => setFlippedSet(prev => new Set(prev).add(i)), 1200 + i * 350));
      });
      timers.push(setTimeout(() => goToScreen(Screen.READING), 1200 + drawnCards.length * 350 + 1200));
      return () => timers.forEach(clearTimeout);
    }
  }, [screen, drawnCards.length]);

  // ===== HELPERS =====
  function getCards() {
    return Array.from(cardScope.current?.querySelectorAll(".pcard") || []) as Element[];
  }

  function hideAllCards(dur = 0.3) {
    stopFloat();
    getCards().forEach(c => animateCard(c, { opacity: 0, scale: 0.5 }, { duration: dur, ease: EASE }));
  }

  function stopFloat() {
    if (floatRef.current) { cancelAnimationFrame(floatRef.current); floatRef.current = null; }
  }

  // ===== SHUFFLE =====
  async function runShuffle() {
    stopFloat();
    const cards = getCards();
    const mid = 3;
    // Show 7 cards stacked at center, hide rest
    cards.forEach((c, i) => {
      animateCard(c, {
        x: 0, y: 0, rotate: 0, scale: 1, opacity: i < 7 ? 1 : 0,
      }, { duration: 0.01 });
    });
    await new Promise(r => setTimeout(r, 200));

    const arr = cards.slice(0, 7);

    // Phase 1: Fan
    await Promise.all(arr.map((c, i) =>
      animateCard(c, { x: (i - mid) * 30, rotate: (i - mid) * 6, y: Math.abs(i - mid) * 8 }, { duration: 0.7, ease: EASE })
    ));

    // Phase 2: Riffle x2
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

    // Phase 3: Arc
    await Promise.all(arr.map((c, i) => {
      const angle = ((i - mid) / mid) * 0.6;
      return animateCard(c, { x: Math.sin(angle) * 110, y: -Math.cos(angle) * 110 + 80, rotate: (i - mid) * 10, scale: 0.9 }, { duration: 0.5, ease: EASE });
    }));
    await new Promise(r => setTimeout(r, 250));

    // Phase 4: Gather
    await Promise.all(arr.map((c, i) =>
      animateCard(c, { x: 0, y: 0, rotate: 0, scale: 1 }, { duration: 0.5, ease: EASE, delay: i * 0.03 })
    ));

    goToScreen(Screen.MEDITATE);
  }

  // ===== MEDITATE: single card floating =====
  async function runMeditate() {
    const cards = getCards();
    // Hide all except first, stack first at center
    await Promise.all(cards.map((c, i) =>
      animateCard(c, { x: 0, y: 0, rotate: 0, scale: 1, opacity: i === 0 ? 1 : 0 }, { duration: 0.5, ease: EASE })
    ));
    // Float animation loop
    let dir = -1;
    function floatLoop() {
      dir *= -1;
      const card = cards[0];
      if (card) {
        animateCard(card, { y: dir * 12 }, { duration: 2, ease: "easeInOut" });
      }
      floatRef.current = requestAnimationFrame(() => {
        setTimeout(floatLoop, 2000);
      });
    }
    floatLoop();
  }

  // ===== SPREAD PICK: card shrinks to top =====
  async function runSpreadPick() {
    stopFloat();
    const cards = getCards();
    // Shrink card to small at top
    await animateCard(cards[0], { y: -120, scale: 0.4, opacity: 0.6 }, { duration: 0.5, ease: EASE });
    // Then fade out
    await animateCard(cards[0], { opacity: 0 }, { duration: 0.3 });
  }

  // ===== SELECT: cards deal into grid =====
  async function runSelect() {
    stopFloat();
    const cards = getCards();
    const cfg = SPREAD_CONFIG[spreadType];
    const cols = cfg.gridCards <= 9 ? 3 : 5;
    const cardW = 80, cardH = 128, gap = 10;
    const gridW = cols * cardW + (cols - 1) * gap;
    const rows = Math.ceil(cfg.gridCards / cols);
    const gridH = rows * cardH + (rows - 1) * gap;
    const startX = -gridW / 2 + cardW / 2;
    const startY = -gridH / 2 + cardH / 2 + 40; // offset for header

    // Start all from center, then deal out
    cards.forEach((c, i) => {
      animateCard(c, { x: 0, y: 0, scale: 0.3, opacity: 0, rotate: 0 }, { duration: 0.01 });
    });
    await new Promise(r => setTimeout(r, 100));

    for (let i = 0; i < cfg.gridCards; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);
      animateCard(cards[i], {
        x, y, scale: 0.57, opacity: 1, rotate: 0,
      }, { duration: 0.4, ease: EASE, delay: i * 0.03 });
    }
  }

  // ===== Gather selected before reveal =====
  async function gatherSelectedCards() {
    const cards = getCards();
    const cfg = SPREAD_CONFIG[spreadType];
    // Fade out unselected
    cards.forEach((c, i) => {
      if (i >= cfg.gridCards || !selectedCardIndices.includes(i)) {
        animateCard(c, { opacity: 0, scale: 0.3 }, { duration: 0.3, ease: EASE });
      }
    });
    await new Promise(r => setTimeout(r, 200));
    // Gather selected to center
    const selected = selectedCardIndices.map(idx => cards[idx]).filter(Boolean);
    await Promise.all(selected.map((c, i) =>
      animateCard(c, { x: (i - selected.length / 2) * 20, y: 0, scale: 0.5, rotate: (i - selected.length / 2) * 3 }, { duration: 0.5, ease: EASE })
    ));
    await new Promise(r => setTimeout(r, 300));
  }

  // ===== REVEAL: spread cards out face-down then flip =====
  async function runReveal() {
    stopFloat();
    const cards = getCards();
    const count = drawnCards.length;
    const cols = count <= 3 ? count : 5;
    const cardW = 85, gap = 10;
    const totalW = Math.min(count, cols) * (cardW + gap) - gap;
    const startX = -totalW / 2 + cardW / 2;
    const rows = Math.ceil(count / cols);

    // Hide all first
    cards.forEach(c => animateCard(c, { opacity: 0 }, { duration: 0.01 }));
    await new Promise(r => setTimeout(r, 100));

    // Position and spring in
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardW + gap);
      const y = -40 + row * (cardW * 1.6 + gap);
      animateCard(cards[i], {
        x, y, scale: 0.6, opacity: 1, rotate: 0,
      }, { duration: 0.5, ease: EASE, delay: i * 0.06 });
    }
  }

  // ===== CARD TAP HANDLER (for select screen) =====
  function handleCardTap(i: number) {
    if (screen !== Screen.SELECT) return;
    const cards = getCards();
    const cfg = SPREAD_CONFIG[spreadType];
    const isSel = selectedCardIndices.includes(i);

    if (!isSel && selectedCardIndices.length >= cfg.count) return;

    toggleCard(i);

    // Visual feedback
    if (!isSel) {
      // Selecting: pulse + slight shrink
      animateCard(cards[i], { scale: 0.52 }, { duration: 0.15 }).then(() =>
        animateCard(cards[i], { scale: 0.54 }, { duration: 0.2 })
      );
    } else {
      // Deselecting: back to normal
      animateCard(cards[i], { scale: 0.57 }, { duration: 0.2 });
    }
  }

  function handleReset() {
    stopFloat();
    setFlippedSet(new Set());
    hasAutoAdvanced.current = false;
    reset();
  }

  const showRevealOverlay = screen === Screen.REVEAL && drawnCards.length > 0;

  return (
    <div className="fixed inset-0 z-10 pt-[60px] pb-10">

      {/* ===== PERSISTENT CARD LAYER ===== */}
      <div
        ref={cardScope}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
        style={{ perspective: 800 }}
      >
        {Array.from({ length: MAX_CARDS }, (_, i) => (
          <div
            key={i}
            className="pcard absolute opacity-0"
            style={{ pointerEvents: screen === Screen.SELECT ? "auto" : "none" }}
            onClick={() => handleCardTap(i)}
          >
            {/* Show flipped card image in reveal, otherwise card back */}
            {showRevealOverlay && i < drawnCards.length && flippedSet.has(i) ? (
              <div className="w-[85px] h-[136px] rounded-lg border-[1.5px] border-gold/40 overflow-hidden bg-[#08090e] relative">
                {drawnCards[i].image && (
                  <img src={drawnCards[i].image} alt={drawnCards[i].nameEn}
                    className="absolute inset-0 w-full h-full object-cover" loading="eager" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                  <p className="text-[0.45rem] text-gold text-center leading-tight truncate">{drawnCards[i].nameTh}</p>
                </div>
              </div>
            ) : (
              <CardBack width={140} height={224} />
            )}
          </div>
        ))}
      </div>

      {/* ===== TEXT/UI OVERLAY LAYER ===== */}
      <div className="absolute inset-0 z-40 overflow-y-auto">

        {/* SHUFFLE text */}
        <AnimatePresence>
          {screen === Screen.SHUFFLE && (
            <motion.div key="shuf-ui" className="absolute inset-x-0 top-8 text-center z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
              <motion.p className="text-lg text-gold tracking-[0.15em] font-semibold mb-2"
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
                กำลังสับไพ่
              </motion.p>
              <p className="text-white/25 text-xs">เตรียมสำรับไพ่ให้คุณ...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MEDITATE text + button */}
        <AnimatePresence>
          {screen === Screen.MEDITATE && (
            <motion.div key="med-ui" className="absolute inset-0 flex flex-col items-center justify-end pb-24 z-40"
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
            <motion.div key="pick-ui" className="absolute inset-0 flex flex-col items-center justify-center px-5 z-40"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
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

        {/* SELECT counter */}
        <AnimatePresence>
          {screen === Screen.SELECT && (
            <motion.div key="sel-ui" className="absolute inset-x-0 top-4 flex flex-col items-center z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <p className="text-gold font-semibold text-base mb-1">เลือกการ์ด {SPREAD_CONFIG[spreadType].count} ใบ</p>
              <p className="text-white/30 text-xs mb-3">แตะไพ่ที่คุณรู้สึกดึงดูด</p>
              <motion.div className="px-4 py-1.5 border border-gold/20 rounded-full text-gold text-sm"
                key={selectedCardIndices.length} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.3 }}>
                {selectedCardIndices.length} / {SPREAD_CONFIG[spreadType].count}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REVEAL text */}
        <AnimatePresence>
          {screen === Screen.REVEAL && (
            <motion.div key="rev-ui" className="absolute inset-x-0 top-4 text-center z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <motion.p className="text-lg text-gold tracking-[0.15em] font-semibold"
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
                กำลังดีดไพ่
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* READING (full content — cards are hidden, images inline) */}
        <AnimatePresence>
          {screen === Screen.READING && (
            <motion.div key="read-ui" className="flex flex-col items-center min-h-full px-4 pt-2 pb-16"
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
