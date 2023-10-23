/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./html/**/*.html",
    "./src/**/*.{vue,js,ts,jsx,tsx,html}",
    "./assets/icons/*.svg",
    "./test/**/*.{vue,js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
