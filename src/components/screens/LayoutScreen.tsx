"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import { CELTIC_LAYOUT, FIVE_LAYOUT, HORSESHOE_LAYOUT } from "@/constants/layouts";
import MiniCardBack from "@/components/ui/MiniCardBack";
import Button from "@/components/ui/Button";

function getLayoutPos(spreadId: string, cardCount: number, index: number) {
  const pos = index + 1;
  if (spreadId === "celtic") return CELTIC_LAYOUT[pos] || { x: "50%", y: "50%" };
  if (spreadId === "five") return FIVE_LAYOUT[pos] || { x: "50%", y: "50%" };
  if (spreadId === "horseshoe") return HORSESHOE_LAYOUT[pos] || { x: "50%", y: "50%" };
  if (cardCount === 3) return { x: `${20 + index * 30}%`, y: "50%" };
  return { x: "50%", y: "50%" };
}

function getCardSize(cardCount: number) {
  const w = cardCount <= 3 ? 80 : cardCount <= 5 ? 65 : 55;
  return { w, h: w * 1.6 };
}

export default function LayoutScreen() {
  const selectedSpread = useTarotStore((s) => s.selectedSpread);
  const pickedCards = useTarotStore((s) => s.pickedCards);
  const flippedCardIds = useTarotStore((s) => s.flippedCardIds);
  const flipCard = useTarotStore((s) => s.flipCard);
  const flipAll = useTarotStore((s) => s.flipAll);
  const setPhase = useTarotStore((s) => s.setPhase);

  if (!selectedSpread) return null;

  const { w, h } = getCardSize(selectedSpread.cardCount);
  const allFlipped = flippedCardIds.size === pickedCards.length && pickedCards.length > 0;

  return (
    <motion.div
      key="layout"
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <p className="text-gold font-semibold text-sm mb-1">{selectedSpread.nameTH}</p>
      <p className="text-white/25 text-xs mb-4">แตะไพ่เพื่อเปิด</p>

      <div
        className="relative w-full max-w-[380px]"
        style={{ aspectRatio: selectedSpread.cardCount <= 3 ? "3/1" : "1.2/1" }}
      >
        {pickedCards.map((card, i) => {
          const pos = selectedSpread.positions[i];
          const isFlipped = flippedCardIds.has(i);
          const layoutPos = getLayoutPos(selectedSpread.id, selectedSpread.cardCount, i);
          const rotate = "rotate" in layoutPos ? (layoutPos as { rotate: number }).rotate : 0;

          return (
            <motion.div
              key={i}
              className="absolute [perspective:600px] cursor-pointer"
              style={{
                left: layoutPos.x,
                top: layoutPos.y,
                transform: "translate(-50%, -50%)",
                width: w,
                height: h,
              }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.2, duration: 0.7, type: "spring", stiffness: 80, damping: 14 }}
              onClick={() => flipCard(i)}
            >
              <motion.div
                className="w-full h-full relative [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.75, ease: [0.4, 0, 0.15, 1] }}
              >
                {/* Back */}
                <div
                  className="absolute inset-0 [backface-visibility:hidden] rounded-lg overflow-hidden"
                  style={{ transform: `rotate(${rotate}deg)` }}
                >
                  <MiniCardBack width={w} height={h} />
                </div>

                {/* Front */}
                <div
                  className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border border-gold/30 overflow-hidden bg-[#08090e] ${card.isReversed ? "rotate-180" : ""}`}
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

              <p className="text-[0.5rem] text-white/25 text-center mt-1 truncate">{pos?.nameTH}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={flipAll}>เปิดทั้งหมด</Button>
        {allFlipped && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Button onClick={() => setPhase("reading")}>อ่านคำทำนาย</Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
