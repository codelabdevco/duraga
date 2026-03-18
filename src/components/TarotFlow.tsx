"use client";

import { AnimatePresence } from "framer-motion";
import { useTarotStore } from "@/store/useTarotStore";
import TopicScreen from "@/components/screens/TopicScreen";
import SpreadScreen from "@/components/screens/SpreadScreen";
import QuestionScreen from "@/components/screens/QuestionScreen";
import ShuffleScreen from "@/components/screens/ShuffleScreen";
import CardPickScreen from "@/components/screens/CardPickScreen";
import ReadingScreen from "@/components/screens/ReadingScreen";

export default function TarotFlow() {
  const phase = useTarotStore((s) => s.phase);

  return (
    <div className="fixed inset-0 z-10 pt-[56px] pb-8 overflow-y-auto">
      <AnimatePresence mode="wait">
        {phase === "topic" && <TopicScreen />}
        {phase === "spread" && <SpreadScreen />}
        {phase === "question" && <QuestionScreen />}
        {phase === "shuffle" && <ShuffleScreen />}
        {phase === "fan" && <CardPickScreen />}
        {phase === "reading" && <ReadingScreen />}
      </AnimatePresence>
    </div>
  );
}
