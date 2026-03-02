/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        monitor: {
          bg: '#0a0f1c',
          surface: '#111827',
          surface2: '#1a2236',
          border: '#1f2937',
          accent: '#3b82f6',
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#3b82f6',
          success: '#22c55e',
          info: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        glow: 'glow 2s ease-in-out infinite alternate',
        scan: 'scan 3s linear infinite',
      },
    },
  },
  plugins: [],
};
