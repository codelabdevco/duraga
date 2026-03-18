export const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const FADE_IN = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.5, ease: EASE } } as const;
