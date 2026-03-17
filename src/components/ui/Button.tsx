"use client";

import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "gold" | "outline";
  className?: string;
}

export default function Button({ children, onClick, variant = "gold", className = "" }: ButtonProps) {
  const base = "px-10 py-3.5 rounded-full font-semibold text-base tracking-wide transition-all";
  const variants = {
    gold: "bg-gradient-to-br from-gold to-[#8b6914] text-[#0a0a0f] shadow-[0_4px_24px_rgba(212,168,67,.4)]",
    outline: "border-[1.5px] border-gold bg-transparent text-gold",
  };

  return (
    <motion.button
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.button>
  );
}
