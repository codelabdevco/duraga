"use client";

import SunSymbol from "./SunSymbol";

interface CardBackProps {
  width?: number;
  height?: number;
  sunSize?: number;
  className?: string;
}

export default function CardBack({ width = 160, height = 250, sunSize = 50, className = "" }: CardBackProps) {
  return (
    <div
      className={`card-back-shell ${className}`}
      style={{ width, height }}
    >
      <div className="card-back-inner">
        <SunSymbol size={sunSize} />
      </div>
    </div>
  );
}
