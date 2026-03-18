"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTarotStore } from "@/store/useTarotStore";
import { AIReading } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import Button from "@/components/ui/Button";

// ── Loading messages ──
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
    const timer = setInterval(() => setIdx((i) => (i + 1) % LOADING_MSGS.length), 2800);
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

// ── Trend config ──
const TREND_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  very_positive: { icon: "✦", label: "ดีมาก", color: "#e8d48b", bg: "rgba(232,212,139,0.12)" },
  positive:      { icon: "✦", label: "ดี",     color: "#a8d48b", bg: "rgba(168,212,139,0.10)" },
  neutral:       { icon: "☯", label: "กลางๆ",  color: "#8bb8d4", bg: "rgba(139,184,212,0.10)" },
  caution:       { icon: "⚡", label: "ระวัง",  color: "#d4a84b", bg: "rgba(212,168,75,0.10)" },
  challenging:   { icon: "☁", label: "ท้าทาย", color: "#b48bd4", bg: "rgba(180,139,212,0.10)" },
};

// ── Trend meter ──
function TrendMeter({ trend, trendText }: { trend: string; trendText: string }) {
  const config = TREND_CONFIG[trend] || TREND_CONFIG.neutral;
  const levels = ["challenging", "caution", "neutral", "positive", "very_positive"];
  const activeIdx = levels.indexOf(trend);

  return (
    <motion.div
      className="rounded-2xl p-4 border"
      style={{ background: config.bg, borderColor: `${config.color}30` }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: `${config.color}20`, border: `1px solid ${config.color}40` }}
        >
          <span style={{ color: config.color }}>{config.icon}</span>
        </div>
        <div>
          <p className="text-xs text-white/40">แนวโน้มโดยรวม</p>
          <p className="text-sm font-semibold" style={{ color: config.color }}>{config.label}</p>
        </div>
      </div>

      {/* 5-step meter */}
      <div className="flex gap-1.5 mb-3">
        {levels.map((lv, i) => (
          <motion.div
            key={lv}
            className="flex-1 h-1.5 rounded-full"
            style={{
              background: i <= activeIdx ? config.color : "rgba(255,255,255,0.08)",
              opacity: i <= activeIdx ? 0.8 : 0.3,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4 + i * 0.08, duration: 0.3 }}
          />
        ))}
      </div>

      <p className="text-xs text-white/50 leading-5">{trendText}</p>
    </motion.div>
  );
}

// ── Main ──
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

  // Fetch AI reading
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
        if (data.error) {
          setAiReading({ trend: "neutral", trendText: "", summary: data.error, advice: "", cardInsights: [] });
        } else {
          setAiReading(data.reading as AIReading);
        }
      } catch {
        setAiReading({ trend: "neutral", trendText: "", summary: "ไม่สามารถเชื่อมต่อเพื่อสร้างคำทำนายได้", advice: "", cardInsights: [] });
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
      <div className="w-full max-w-[420px] mb-4 text-center">
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

      {/* Card thumbnail row */}
      <div className="flex gap-1.5 flex-wrap justify-center mb-5 max-w-[420px]">
        {pickedCards.map((card, i) => (
          <motion.div
            key={i}
            className={`w-[46px] h-[69px] rounded-md border border-gold/20 overflow-hidden relative bg-[#08090e] ${card.isReversed ? "rotate-180" : ""}`}
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

      <div className="w-full max-w-[420px] space-y-4">
        {/* ── Loading ── */}
        {isLoadingAI && (
          <motion.div
            className="bg-gradient-to-br from-gold/[0.06] to-transparent border border-gold/20 rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
          >
            <div className="flex flex-col items-center py-6 gap-5">
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
              <LoadingMessages />
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
          </motion.div>
        )}

        {/* ── Result ── */}
        {aiReading && (
          <>
            {/* Trend meter */}
            <TrendMeter trend={aiReading.trend} trendText={aiReading.trendText} />

            {/* Summary */}
            <motion.div
              className="bg-gradient-to-br from-gold/[0.06] to-transparent border border-gold/20 rounded-2xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
            >
              <p className="text-xs text-gold/60 font-semibold mb-2.5 tracking-wide">สรุปภาพรวม</p>
              <p className="text-sm leading-7 text-white/80">{aiReading.summary}</p>
            </motion.div>

            {/* Advice */}
            {aiReading.advice && (
              <motion.div
                className="bg-gradient-to-r from-gold/[0.08] to-gold/[0.03] border border-gold/25 rounded-2xl p-4 flex gap-3 items-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
              >
                <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gold text-xs">&#10023;</span>
                </div>
                <div>
                  <p className="text-xs text-gold/60 font-semibold mb-1">คำแนะนำ</p>
                  <p className="text-sm leading-7 text-white/75">{aiReading.advice}</p>
                </div>
              </motion.div>
            )}

            {/* Per-card insights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <p className="text-xs text-gold/50 font-semibold mb-3 tracking-wide mt-2">รายละเอียดแต่ละใบ</p>
            </motion.div>

            {pickedCards.map((card, i) => {
              const pos = selectedSpread?.positions[i];
              const insight = aiReading.cardInsights?.[i];

              return (
                <motion.div
                  key={i}
                  className="bg-gradient-to-br from-[#10111a]/90 to-[#08090e]/95 border border-gold/10 rounded-2xl overflow-hidden"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.08, duration: 0.5, ease: EASE }}
                >
                  <div className="flex gap-3.5 p-4 items-start">
                    <div
                      className={`w-[65px] h-[100px] rounded-lg border border-gold/20 overflow-hidden relative flex-shrink-0 bg-[#08090e] ${card.isReversed ? "rotate-180" : ""}`}
                    >
                      {card.image && (
                        <img src={card.image} alt={card.nameEn} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm text-gold-light font-semibold">
                          {card.nameTh}
                        </h3>
                        {card.isReversed && (
                          <span className="text-[0.6rem] text-red-400/60 border border-red-400/20 rounded-full px-1.5 py-0.5">กลับหัว</span>
                        )}
                      </div>
                      <p className="text-[0.65rem] text-gold/35 mb-2">{pos?.nameTH}</p>

                      {/* AI insight for this card */}
                      {insight ? (
                        <p className="text-[0.8rem] text-white/65 leading-6">{insight}</p>
                      ) : (
                        <p className="text-xs text-white/50 leading-6">{card.meaningTh || card.meaning}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* Actions */}
      {(aiReading || !isLoadingAI) && (
        <motion.div
          className="flex gap-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Button variant="outline" onClick={reset}>จั่วไพ่ใหม่</Button>
        </motion.div>
      )}
    </motion.div>
  );
}
