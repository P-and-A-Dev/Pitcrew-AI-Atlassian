import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        williams: {
          bg: "#0A0F1F",
          surface: "#111827",
          surfaceAlt: "#0B2A4A",
          accent: "#00AEEF",

          text: "#E5E7EB",
          muted: "#9CA3AF",

          danger: "#EF4444",
          warning: "#F59E0B",
          success: "#22C55E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
