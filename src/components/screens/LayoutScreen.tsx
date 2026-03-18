"use client";

import { motion } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import { EASE } from "@/constants/animation";
import { getSpreadLayout } from "@/constants/layouts";
import MiniCardBack from "@/components/ui/MiniCardBack";
import Button from "@/components/ui/Button";

export default function LayoutScreen() {
  const selectedSpread = useTarotStore((s) => s.selectedSpread);
  const pickedCards = useTarotStore((s) => s.pickedCards);
  const flippedCardIds = useTarotStore((s) => s.flippedCardIds);
  const flipCard = useTarotStore((s) => s.flipCard);
  const flipAll = useTarotStore((s) => s.flipAll);
  const setPhase = useTarotStore((s) => s.setPhase);

  if (!selectedSpread) return null;

  const layout = getSpreadLayout(selectedSpread.id, selectedSpread.cardCount);
  const { cardW, cardH, positions, aspectRatio } = layout;
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
      <p className="text-white/25 text-xs mb-3">แตะไพ่เพื่อเปิด</p>

      {/* Card layout area */}
      <div
        className="relative w-full max-w-[360px]"
        style={{ aspectRatio: `1 / ${aspectRatio}` }}
      >
        {pickedCards.map((card, i) => {
          const pos = selectedSpread.positions[i];
          const lp = positions[i] || { x: "50%", y: "50%" };
          const rotate = lp.rotate || 0;
          const isFlipped = flippedCardIds.has(i);

          return (
            <motion.div
              key={i}
              className="absolute [perspective:600px] cursor-pointer"
              style={{
                left: lp.x,
                top: lp.y,
                width: cardW,
                height: cardH,
                marginLeft: -cardW / 2,
                marginTop: -cardH / 2,
                zIndex: rotate ? 5 : 10 + i,
              }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.3 + i * 0.15,
                duration: 0.7,
                type: "spring",
                stiffness: 80,
                damping: 14,
              }}
              onClick={() => flipCard(i)}
            >
              {/* Flip + rotation container */}
              <motion.div
                className="w-full h-full relative [transform-style:preserve-3d]"
                animate={{
                  rotateY: isFlipped ? 180 : 0,
                  rotateZ: rotate,
                }}
                transition={{ duration: 0.75, ease: [0.4, 0, 0.15, 1] }}
              >
                {/* Back face */}
                <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg overflow-hidden">
                  <MiniCardBack width={cardW} height={cardH} />
                </div>

                {/* Front face */}
                <div
                  className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border border-gold/30 overflow-hidden bg-[#08090e] ${
                    card.isReversed ? "rotate-180" : ""
                  }`}
                >
                  {card.image && (
                    <img
                      src={card.image}
                      alt={card.nameEn}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                    <p className="text-[0.4rem] text-gold text-center truncate">
                      {card.nameTh}
                    </p>
                    {card.isReversed && (
                      <p className="text-[0.35rem] text-red-400/70 text-center">
                        กลับหัว
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Position label — counter-rotate if card is rotated */}
              <p
                className="text-[0.5rem] text-white/30 text-center mt-1 truncate w-full"
                style={rotate ? { transform: `rotate(${-rotate}deg)` } : undefined}
              >
                {pos?.nameTH}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={flipAll}>
          เปิดทั้งหมด
        </Button>
        {allFlipped && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button onClick={() => setPhase("reading")}>อ่านคำทำนาย</Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
