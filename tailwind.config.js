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
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9', // Bynex Electric Cyan
          600: '#0284C7',
          700: '#0369A1',
        },
        yellow: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        amber: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#2563EB',
        },
        cyan: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        dark: {
          950: '#070B14',
          900: '#0F172A',
          800: '#1E293B',
        }
      }
    }
  },
  plugins: [],
}
