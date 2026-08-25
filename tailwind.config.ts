import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dtc: {
          navy: "#0B132B",
          navyDark: "#070C1B",
          navyLight: "#1B2E4B",
          steel: "#385A75",
          steelLight: "#4A7294",
          gold: "#D4AF37",
          goldLight: "#F59E0B",
          goldGlow: "#FBBF24",
          slate: "#94A3B8",
          card: "rgba(15, 23, 42, 0.8)",
          glass: "rgba(27, 46, 75, 0.5)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
