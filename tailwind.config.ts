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
          paper: "#F7F5F0",
          paperDeep: "#EDEAE1",
          surface: "#FFFFFF",
          wash: "#EFECE4",
          line: "#DCD7CB",
          ink: "#16233A",
          inkMuted: "#5C6672",
          gold: "#8A6D1F",
          goldBright: "#D4AF37",
          navy: "#16233A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
