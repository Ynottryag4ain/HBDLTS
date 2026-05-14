import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        pink: {
          50: '#fff0f6', 100: '#ffd6e7', 200: '#ffb3d0',
          300: '#ff9ac1', 400: '#ff6b9d', 500: '#ff4785',
          600: '#e8336f', 700: '#c0255a',
        },
        purple: {
          50: '#f5eeff', 100: '#e5d0ff', 200: '#cba8ff',
          300: '#b07abb', 400: '#9b59b6', 500: '#8e44ad',
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        heartbeat: 'heartbeat 1.2s ease-in-out infinite',
        wiggle: 'wiggle 0.3s ease-in-out',
        fadeIn: 'fadeIn 0.5s ease both',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        heartbeat: {
          '0%,100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
