/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          black: '#1a1a1a',
          gold: 'var(--premium-gold, #c5a059)',
          goldLight: '#d4b782',
          gray: '#333333',
          lightGray: '#f5f5f5',
        }
      }
    },
  },
  plugins: [],
}
