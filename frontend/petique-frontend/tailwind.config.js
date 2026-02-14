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
          50: '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFEA00',
          300: '#FFE135',
          400: '#FFD500',
          500: '#FFBF00',
          600: '#E5AB00',
          700: '#CC9800',
          800: '#997200',
          900: '#664C00',
        },
        accent: '#EC4899',
        ink: '#1E293B',
        fog: '#FFFDF5',
        border: '#F5E6B8',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        card: '0 10px 40px rgba(255, 191, 0, 0.06)',
      },
      width: {
        sidebar: '260px',
        'sidebar-collapsed': '72px',
      },
      transitionProperty: {
        sidebar: 'width, padding, opacity',
      },
    },
  },
  plugins: [],
}
