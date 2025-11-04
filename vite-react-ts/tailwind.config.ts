import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'border-top': 'border-top linear infinite',
        'border-right': 'border-right linear infinite',
        'border-bottom': 'border-bottom linear infinite',
        'border-left': 'border-left linear infinite',
      },
      keyframes: {
        'border-top': {
          '0%': { left: '5%', opacity: '0' },
          '5%': { opacity: '1' },
          '95%': { opacity: '1' },
          '100%': { left: '75%', opacity: '0' },
        },
        'border-right': {
          '0%': { top: '5%', opacity: '0' },
          '5%': { opacity: '1' },
          '95%': { opacity: '1' },
          '100%': { top: '75%', opacity: '0' },
        },
        'border-bottom': {
          '0%': { left: '75%', opacity: '0' },
          '5%': { opacity: '1' },
          '95%': { opacity: '1' },
          '100%': { left: '5%', opacity: '0' },
        },
        'border-left': {
          '0%': { top: '75%', opacity: '0' },
          '5%': { opacity: '1' },
          '95%': { opacity: '1' },
          '100%': { top: '5%', opacity: '0' },
        },
      },
      spacing: {
        'border-px': '1px',
      },
    },
  },
  plugins: [],
} satisfies Config;
