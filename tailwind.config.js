/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FACC15',
          500: '#F5B700',
          600: '#D97706',
          700: '#B45309',
        },
        yellow: {
          300: '#FDE047',
          400: '#FACC15',
          500: '#F5B700',
          600: '#CA8A04',
        },
        amber: {
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F5B700',
          600: '#D97706',
        },
        dark: {
          950: '#050505',
          900: '#0D0D0D',
          800: '#171717',
        }
      }
    }
  },
  plugins: [],
}
