/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0D',
        surface: 'rgba(255,255,255,0.03)',
        accent: '#FFB86C',
        accent2: '#E9C46A',
        accent3: '#84A59D',
        glow: '#F4A261',
        t1: '#FAF7F2',
        t2: 'rgba(250,247,242,0.75)',
        success: '#8AC926',
        warning: '#FFB703',
        error: '#E76F51',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Geist', 'Satoshi', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        ticker: 'ticker 25s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
