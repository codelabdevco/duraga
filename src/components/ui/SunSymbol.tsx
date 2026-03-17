"use client";

export default function SunSymbol({ size = 60 }: { size?: number }) {
  return <div className="sun-symbol" style={{ width: size, height: size }} />;
}
