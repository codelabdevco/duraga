import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "var(--gold)",
        "gold-light": "var(--gold-light)",
        "gold-dim": "var(--gold-dim)",
        bg: "var(--bg)",
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        thai: ["Noto Sans Thai", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
