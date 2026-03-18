"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import Button from "@/components/ui/Button";

const LOADING_MSGS = [
  "กำลังอ่านไพ่ให้คุณ...",
  "สัมผัสพลังงานจากไพ่...",
  "เชื่อมต่อกับจักรวาล...",
  "ถอดรหัสสัญลักษณ์...",
  "รวบรวมคำทำนาย...",
];

function LoadingMessages() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % LOADING_MSGS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-5 relative w-full text-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          className="text-sm text-white/45 absolute inset-x-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          {LOADING_MSGS[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function ReadingScreen() {
  const selectedTopic = useTarotStore((s) => s.selectedTopic);
  const selectedSpread = useTarotStore((s) => s.selectedSpread);
  const userQuestion = useTarotStore((s) => s.userQuestion);
  const pickedCards = useTarotStore((s) => s.pickedCards);
  const aiReading = useTarotStore((s) => s.aiReading);
  const isLoadingAI = useTarotStore((s) => s.isLoadingAI);
  const setAiReading = useTarotStore((s) => s.setAiReading);
  const setLoadingAI = useTarotStore((s) => s.setLoadingAI);
  const reset = useTarotStore((s) => s.reset);

  // Fetch AI reading on mount
  useEffect(() => {
    if (aiReading || isLoadingAI || !selectedTopic || !selectedSpread) return;

    async function fetchReading() {
      setLoadingAI(true);
      try {
        const res = await fetch("/api/reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: selectedTopic!.nameTH,
            spread: selectedSpread!.nameTH,
            question: userQuestion || "ดูดวงทั่วไป",
            cards: pickedCards.map((c, i) => ({
              nameTh: c.nameTh,
              nameEn: c.nameEn,
              meaningTh: c.meaningTh,
              meaning: c.meaning,
              isReversed: c.isReversed,
              positionName: selectedSpread!.positions[i]?.nameTH || `ใบที่ ${i + 1}`,
            })),
          }),
        });
        const data = await res.json();
        setAiReading(data.reading || data.error);
      } catch {
        setAiReading("ไม่สามารถเชื่อมต่อเพื่อสร้างคำทำนายได้");
      }
    }

    fetchReading();
  }, [aiReading, isLoadingAI, selectedTopic, selectedSpread, userQuestion, pickedCards, setAiReading, setLoadingAI]);

  return (
    <motion.div
      key="reading"
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-16"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <h2 className="text-xl text-gold text-center mb-3 tracking-[0.15em] font-semibold">คำทำนาย</h2>

      {/* Context */}
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
          <motion.div
            key={i}
            className={`w-[50px] h-[75px] rounded-md border border-gold/20 overflow-hidden relative bg-[#08090e] ${card.isReversed ? "rotate-180" : ""}`}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}
          >
            {card.image && (
              <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" />
            )}
          </motion.div>
        ))}
      </div>

      {/* AI Summary */}
      <motion.div
        className="w-full max-w-[420px] mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
      >
        <div className="bg-gradient-to-br from-gold/[0.06] to-transparent border border-gold/20 rounded-2xl p-5">
          <p className="text-xs text-gold/60 font-semibold mb-3 tracking-wide">สรุปคำทำนาย</p>
          {isLoadingAI ? (
            <div className="flex flex-col items-center py-6 gap-5">
              {/* Mystical orb animation */}
              <div className="relative w-16 h-16">
                <motion.div
                  className="absolute inset-0 rounded-full border border-gold/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border border-gold/40"
                  animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/5"
                  animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-xl"
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-gold/80">&#10022;</span>
                </motion.div>
              </div>

              {/* Cycling messages */}
              <LoadingMessages />

              {/* Shimmer lines */}
              <div className="w-full space-y-2.5 mt-1">
                {[0.85, 1, 0.7, 0.9, 0.6].map((w, i) => (
                  <motion.div
                    key={i}
                    className="h-3 rounded-full bg-gradient-to-r from-gold/[0.06] via-gold/[0.12] to-gold/[0.06]"
                    style={{ width: `${w * 100}%` }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          ) : aiReading ? (
            <div className="text-sm leading-7 text-white/80 space-y-3">
              {aiReading.split("\n").filter(Boolean).map((line, i) => (
                <p key={i}>
                  {line.split(/(\*\*[^*]+\*\*)/).map((seg, j) =>
                    seg.startsWith("**") && seg.endsWith("**") ? (
                      <strong key={j} className="text-gold-light font-semibold">{seg.slice(2, -2)}</strong>
                    ) : (
                      <span key={j}>{seg}</span>
                    )
                  )}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* Detailed reading per card */}
      <div className="w-full max-w-[420px] space-y-4">
        {pickedCards.map((card, i) => {
          const pos = selectedSpread?.positions[i];
          return (
            <motion.div
              key={i}
              className="bg-gradient-to-br from-surface/90 to-[#08090e]/95 border border-gold/15 rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: EASE }}
            >
              <div className="flex gap-4 p-4 items-start">
                <div
                  className={`w-[80px] h-[120px] rounded-lg border border-gold/20 overflow-hidden relative flex-shrink-0 bg-[#08090e] ${card.isReversed ? "rotate-180" : ""}`}
                >
                  {card.image && (
                    <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" />
                  )}
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
  );
}
