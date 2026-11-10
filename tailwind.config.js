/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f4f2ec',
        parchment: '#fbfaf6',
        ink: '#1f2a2e',
        civic: '#2f5d62',
        civicLight: '#e6efee',
      },
      fontFamily: {
        sans: ['"Inter var"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(31,42,46,0.05), 0 12px 24px -18px rgba(31,42,46,0.35)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in .18s ease-out both',
        'pop-in': 'pop-in .22s ease-out both',
        'slide-up': 'slide-up .25s ease-out both',
      },
    },
  },
  plugins: [],
}
