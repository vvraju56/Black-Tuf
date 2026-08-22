/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#6366f1',
        accent: '#3b82f6',
        background: '#0a0a0f',
        foreground: '#e5e7eb',
        card: '#111218',
        'card-foreground': '#e5e7eb',
        muted: '#1a1b23',
        'muted-foreground': '#9ca3af',
        border: '#23242d',
        input: '#23242d',
        ring: '#3b82f6',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #111218 40%, #171821 100%)',
        'accent-gradient': 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(17, 18, 24, 0.55), inset 0 1px 0 0 rgba(255,255,255,0.05)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
