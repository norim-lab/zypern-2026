/** @type {import('tailwindcss').Config} */
// Zypern-Design-Tokens (Blau / Sand / Weiß) + Darkmode via class-Strategie.
// Mobile-first, kartenbasiertes Layout, farbige Warn-/Hinweiskarten.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Mittelmeer-Blau als Primärfarbe
        zypern: {
          blue: '#0c7fa8',
          'blue-dark': '#085d7d',
          'blue-light': '#e6f3f9',
          sand: '#f0dcb4',
          'sand-light': '#faf3e0',
          white: '#ffffff',
        },
        // Warnstufen für Hinweiskarten
        danger: { DEFAULT: '#dc2626', soft: '#fee2e2' },
        warn: { DEFAULT: '#f59e0b', soft: '#fef3c7' },
        ok: { DEFAULT: '#16a34a', soft: '#dcfce7' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      // Mindestgröße für Touch-Ziele
      spacing: {
        touch: '3rem', // 48px
      },
    },
  },
  plugins: [],
}
