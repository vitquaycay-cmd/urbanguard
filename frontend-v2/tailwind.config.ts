import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'float-1': 'float 4s ease-in-out infinite alternate',
        'float-2': 'float 6s ease-in-out infinite alternate',
        'float-3': 'float 5s ease-in-out infinite alternate',
        'float-4': 'float 7s ease-in-out infinite alternate',
        'float-5': 'float 4.5s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '100%': { transform: 'translateY(-20px) rotate(10deg)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
