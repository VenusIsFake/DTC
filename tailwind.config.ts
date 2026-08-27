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
          gold: {
            DEFAULT: "#755B18",
            dark: "#755B18",
            bright: "#D4AF37",
            muted: "#8A6D1F",
          },
          goldBright: "#D4AF37",
          goldDark: "#755B18",
          navy: {
            DEFAULT: "#16233A",
            surface: "#1E2E47",
            deep: "#0B132B",
          },
          semantic: {
            success: "#16A34A",
            warning: "#D97706",
            error: "#DC2626",
            info: "#2563EB",
          },
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
