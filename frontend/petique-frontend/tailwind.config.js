/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#e6faf7',
          100: '#c7f3eb',
          200: '#92e2d5',
          300: '#5fcfbf',
          400: '#2fb9a7',
          500: '#0f9f8f',
          600: '#0c7f72',
          700: '#0e6660',
          800: '#0f5250',
          900: '#0f4543',
        },
        ink: '#0f172a',
        fog: '#f1f5f9',
        border: '#dce4ec',
      },
      boxShadow: {
        card: '0 10px 40px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}

