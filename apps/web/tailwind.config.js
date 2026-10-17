/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--bg-app)',
          surface: 'var(--bg-surface)',
          'surface-hover': 'var(--bg-surface-hover)',
          'surface-active': 'var(--bg-surface-active)',
          border: 'var(--border-default)',
          'border-subtle': 'var(--border-subtle)',
          'border-strong': 'var(--border-strong)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          'accent-subtle': 'var(--accent-subtle)',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Linear / Figma Crisp Blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        DEFAULT: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '18px',
      },
      boxShadow: {
        panel: '0 4px 16px -2px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--border-subtle)',
        float: '0 12px 32px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--border-default)',
        dropdown: '0 8px 24px -2px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--border-default)',
      },
      transitionDuration: {
        fast: '120ms',
        normal: '180ms',
        modal: '220ms',
      },
    },
  },
  plugins: [],
};
