/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "right-md":
          "4px 0 6px -1px rgba(0, 0, 0, 0.1), 4px 0 4px -2px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  variants: {
    boxShadow: ["responsive"],
  },
  daisyui: {
    themes: ["light"],
  },
  plugins: [require("daisyui")],
};
