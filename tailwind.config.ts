import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: [
          "Open Sans",
          "var(--font-opensans)",
          "Arial",
          "Helvetica",
          "sans-serif",
        ],
      },
      colors: {
        "zinc-850": "#202023",
      },
      keyframes: {
        "details-open": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "details-close": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "details-open": "details-open 0.5s ease-in-out forwards",
        "details-close": "details-close 0.5s ease-in-out forwards",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwind-scrollbar")({
      nocompatible: true,
      preferredStrategy: "pseudoelements",
    }),
  ],
};
export default config;
