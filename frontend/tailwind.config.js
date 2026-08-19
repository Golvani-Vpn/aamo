/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef1ff", 100: "#dfe4ff", 500: "#5b6cff", 600: "#4a58e6", 700: "#3a46c2",
        },
      },
    },
  },
  plugins: [],
};
