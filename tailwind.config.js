/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          dark: '#1d4ed8'
        }
      },
      fontFamily: {
        primary: ['Space Grotesk', 'sans-serif'],
        secondary: ['Montserrat', 'sans-serif']
      }
    },
  },
  plugins: [],
}

