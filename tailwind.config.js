/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        brand: ['"Cormorant Garamond"', 'ui-serif', 'Georgia', 'serif'],
        brandSans: ['"Montserrat"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        base: '#FAFAFA',
        surface: '#F4F4F2',
        border: '#E5E5E5',
        muted: '#737373',
        text: {
          primary:   '#0A0A0A',
          secondary: '#404040',
          muted:     '#737373',
          subtle:    '#A3A3A3',
        },
        accent: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          DEFAULT: '#E07A3A',
          600: '#C2621E',
          700: '#9A4B16',
        },
        dark: {
          50:  '#F5F5F5',
          100: '#E5E5E5',
          DEFAULT: '#0A0A0A',
          800: '#171717',
          900: '#0F0F0F',
          950: '#080808',
        },
      },
      fontSize: {
        'display-xl': ['clamp(40px, 6vw, 72px)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(32px, 5vw, 56px)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(26px, 4vw, 42px)', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(20px, 3vw, 30px)', { lineHeight: '1.2',  letterSpacing: '-0.015em' }],
      },
      animation: {
        'wa-ring':   'wa-ring 2.4s ease-out infinite',
        'fade-up':   'fade-up 0.5s ease forwards',
        'slide-in':  'slide-in 0.4s ease forwards',
      },
      keyframes: {
        'wa-ring': {
          '0%':   { transform:'scale(1)',   opacity:'0.4' },
          '100%': { transform:'scale(1.85)',opacity:'0' },
        },
        'fade-up': {
          from: { opacity:'0', transform:'translateY(16px)' },
          to:   { opacity:'1', transform:'translateY(0)' },
        },
        'slide-in': {
          from: { opacity:'0', transform:'translateX(-8px)' },
          to:   { opacity:'1', transform:'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
