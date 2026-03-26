/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#11131c',
        surface: '#191b24',
        surfaceHigh: '#32343e',
        primary: '#cdbdff',
        primaryContainer: '#5d21df',
        tertiaryContainer: '#6c37a9',
        outlineVariant: '#494456'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
