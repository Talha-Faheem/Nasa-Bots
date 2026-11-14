/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lunar: {
          dark: '#0b0f19',
          card: '#161e2e',
          accent: '#38bdf8',
          border: '#334155',
        }
      }
    },
  },
  plugins: [],
}

