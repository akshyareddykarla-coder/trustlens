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
        navy: {
          950: '#060B13',
          900: '#0B1220', // Primary Navy
          800: '#0F1A2E',
          700: '#16243D',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6', // TrustLens Teal
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        bg: {
          light: '#F8FAFC', // Light Background
          dark: '#090F1A',  // Dark Background
        },
        content: {
          primary: '#0F172A',   // Primary Text
          secondary: '#64748B', // Secondary Text
        },
        border: {
          DEFAULT: '#E2E8F0', // Border
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
