/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7b896f",
        secondary: "#9333ea",
        background: "#f9f9f9",
        secondaryBackground: "#ededed",
        textBlack: "#3e3b34",
        textGrey: "#7c7c7c",
        textWhite: "#f9f9f9",
      },
      fontFamily: {
        athauss: "At Hauss Std TRIAL",
      },
    },
  },
  plugins: [],
};
