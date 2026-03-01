import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        orange: {
          DEFAULT: '#FF7B00',
          light:   '#FF9A33',
          lighter: '#FFB566',
          dark:    '#CC6200',
        },
        // Blacks
        black: {
          DEFAULT: '#0A0A0A',
          2: '#111111',
          3: '#1A1A1A',
          4: '#222222',
        },
        // Greys
        grey: {
          DEFAULT: '#888888',
          dark:    '#444444',
          light:   '#BBBBBB',
        },
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        body:    ['var(--font-barlow)', 'sans-serif'],
        mono:    ['var(--font-ibm-mono)', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.4em',
      },
      borderColor: {
        DEFAULT: 'rgba(255,123,0,0.2)',
      },
      animation: {
        'fade-up':    'fadeUp 0.7s ease forwards',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow':  'spin 20s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #FF7B00, #FF9A33)',
        'dark-gradient':   'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
