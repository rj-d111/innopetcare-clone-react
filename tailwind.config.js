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
      screens: {
        print: {raw: 'print'},
        // screen: {raw: 'screen'},
      },
    },
  },
  variants: {
    boxShadow: ["responsive"],
  },
  daisyui: {
    themes: ["light"],
  },
  plugins: [
    require("daisyui"),
    function ({ addUtilities }) {
      addUtilities({
        // Utility for forcing page breaks before an element
        ".page-break-before": {
          "page-break-before": "always",
          "break-before": "page",
        },
        // Utility for forcing page breaks after an element
        ".page-break-after": {
          "page-break-after": "always",
          "break-after": "page",
        },
        // Utility to avoid breaking inside an element
        ".page-break-inside-avoid": {
          "page-break-inside": "avoid",
          "break-inside": "avoid",
        },
        // Utility to allow automatic page breaks inside an element
        ".break-inside-auto": {
          "break-inside": "auto",
        },
      });
    },
  ],
};
