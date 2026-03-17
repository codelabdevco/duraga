"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTarotStore } from "@/store/useTarotStore";
import Button from "@/components/ui/Button";

export default function ReadingScreen() {
  const { drawnCards, reset } = useTarotStore();

  return (
    <motion.div
      className="flex flex-col items-center min-h-full px-4 pt-2 pb-16 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <h2 className="font-cinzel text-xl text-gold text-center mb-5 tracking-widest">
        คำทำนายไพ่ทาโร่
      </h2>

      {/* Mini card row */}
      <div className="flex gap-1.5 flex-wrap justify-center mb-6 max-w-[400px]">
        {drawnCards.map((card, i) => (
          <motion.div
            key={i}
            className="w-[50px] h-[75px] rounded-md border border-gold/30 overflow-hidden relative bg-[#1a1824]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {card.image && (
              <Image
                src={card.image}
                alt={card.nameEn}
                fill
                className="object-cover"
                sizes="50px"
                unoptimized
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Reading results */}
      <div className="w-full max-w-[400px] space-y-4">
        {drawnCards.map((card, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-br from-[#1a1824]/90 to-[#0d0c14]/95 border border-gold/20 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: "easeOut" }}
          >
            {/* Card image header */}
            <div className="flex gap-4 p-4 items-start">
              <div className="w-[70px] h-[105px] rounded-lg border border-gold/30 overflow-hidden relative flex-shrink-0 bg-[#0d0c14]">
                {card.image && (
                  <Image
                    src={card.image}
                    alt={card.nameEn}
                    fill
                    className="object-cover"
                    sizes="70px"
                    unoptimized
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base text-gold-light font-semibold mb-0.5">
                  {card.nameEn}
                </h3>
                <p className="text-sm text-gold/60 mb-1">{card.nameTh}</p>
                <p className="text-[0.7rem] text-white/30 mb-2">
                  ตำแหน่ง {i + 1}: {card.position}
                </p>
                <p className="text-xs text-white/50 leading-5">
                  {card.meaning}
                </p>
              </div>
            </div>

            {/* Analysis */}
            {card.analysis && (
              <div className="px-4 pb-4">
                <p className="text-sm leading-7 text-white/75">
                  {card.analysis}
                </p>
                {card.goldenSentence && (
                  <p className="mt-3 text-sm text-gold/80 italic leading-6 border-l-2 border-gold/30 pl-3">
                    &ldquo;{card.goldenSentence}&rdquo;
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <Button variant="outline" onClick={reset}>
          ดูไพ่อีกครั้ง
        </Button>
      </motion.div>
    </motion.div>
  );
}
