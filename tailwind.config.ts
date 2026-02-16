import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          primary: "#1a1a2e",
          secondary: "#16213e",
          tertiary: "#0f3460",
          accent: "#e94560",
          text: "#eaeaea",
          muted: "#a0a0a0",
        },
      },
    },
  },
  plugins: [],
};

export default config;
