import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./views/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Core Theme */
        "bg-primary": "var(--bg-primary)",
        "bg-card": "var(--bg-card)",
        "text-main": "var(--text-main)",
        muted: "var(--text-muted)",
        ui: "var(--border-ui)",

        /* Brand */
        drxred: "#e11d48",
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
        oswald: ["Oswald", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        drx: "0 0 40px rgba(225,29,72,0.25)",
      },
      letterSpacing: {
        mega: "0.35em",
      },
    },
  },
  plugins: [],
};

export default config;
