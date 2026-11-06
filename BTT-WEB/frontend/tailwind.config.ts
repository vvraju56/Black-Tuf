import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        background: '#050505',
        surface: '#080808',
        elevated: '#0d0d12',
        accent: {
          DEFAULT: '#ff79ee',
          soft: '#ffb8f4',
          deep: '#c63fb3',
        },
        ink: {
          DEFAULT: '#f7f5f8',
          muted: '#a1a0a8',
          faint: '#73727b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,121,238,0.25), 0 20px 60px -20px rgba(255,121,238,0.35)',
        'glow-sm': '0 0 30px -8px rgba(255,121,238,0.45)',
        card: '0 24px 70px -35px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at 78% 8%, rgba(255,121,238,0.16), transparent 34%), radial-gradient(circle at 10% 30%, rgba(124,58,237,0.10), transparent 32%)',
        'grid-fade':
          'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 7s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
