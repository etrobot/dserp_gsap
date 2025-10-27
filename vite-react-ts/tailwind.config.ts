import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'star-movement-clockwise': 'star-movement-clockwise linear infinite',
      },
      keyframes: {
        'star-movement-clockwise': {
          '0%': { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' },
          '25%': { top: '50%', left: '100%', transform: 'translate(-50%, -50%)' },
          '50%': { top: '100%', left: '50%', transform: 'translate(-50%, -50%)' },
          '75%': { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' },
          '100%': { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
