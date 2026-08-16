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
        primary: {
          // Anchored on the site's brand teal (#1A7A6E, see Header.jsx) so admin
          // and the public site share one accent color instead of two greens.
          50: '#f0faf8',
          100: '#d7f0ea',
          200: '#b0e0d6',
          300: '#7cc9bc',
          400: '#45a996',
          500: '#228979',
          600: '#1A7A6E',
          700: '#146157',
          800: '#124f47',
          900: '#0f423c',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
    },
  },
  plugins: [],
}

