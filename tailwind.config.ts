import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070c",
        carbon: "#0a1020",
        electric: "#0ea5ff",
        action: "#e5092f",
        metal: "#d7e2f1",
        gold: "#f6c84c"
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 42px rgba(14, 165, 255, .28)",
        red: "0 18px 45px rgba(229, 9, 47, .28)"
      },
      backgroundImage: {
        "grid-glow": "linear-gradient(rgba(14,165,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,255,.07) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
