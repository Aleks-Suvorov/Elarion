import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#08080e',
          1: '#0e0e18',
          2: '#141420',
          3: '#1a1a28',
          4: '#212130',
        },
        accent: {
          gold:       '#c9a84c',
          'gold-dim': '#7a6028',
          red:        '#c94c4c',
          green:      '#4caa6f',
          blue:       '#4c7ec9',
          purple:     '#8b4cc9',
          orange:     '#c97c4c',
          cyan:       '#4cb8c9',
        },
        muted:  '#6b7280',
        faint:  '#2a2a3a',
      },
      fontFamily: {
        mono: ['Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'slide-in':   'slideIn 0.15s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'flicker':    'flicker 9s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'orb':        'orb 12s ease-in-out infinite',
        'blink':      'blink 1.1s step-end infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'hp-crit':    'hpPulse 1.5s ease-in-out infinite',
        'status':     'statusPulse 2.5s ease-in-out infinite',
        'gradient':   'gradientShift 4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flicker: {
          '0%, 92%, 98%, 100%': { opacity: '1',    filter: 'brightness(1)' },
          '94%':                 { opacity: '0.88', filter: 'brightness(0.9)' },
          '96%':                 { opacity: '1',    filter: 'brightness(1.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        orb: {
          '0%':   { transform: 'translate(0, 0) scale(1)' },
          '33%':  { transform: 'translate(20px, -30px) scale(1.05)' },
          '66%':  { transform: 'translate(-15px, 20px) scale(0.95)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.15)' },
          '50%':      { boxShadow: '0 0 30px rgba(201,168,76,0.3), 0 0 60px rgba(201,168,76,0.1)' },
        },
        hpPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.55' },
        },
        statusPulse: {
          '0%, 100%': { boxShadow: '0 0 4px rgba(76,170,111,0.5)' },
          '50%':      { boxShadow: '0 0 10px rgba(76,170,111,1), 0 0 20px rgba(76,170,111,0.4)' },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      boxShadow: {
        'glow-gold':   '0 0 20px rgba(201,168,76,0.3), 0 0 40px rgba(201,168,76,0.1)',
        'glow-gold-sm':'0 0 10px rgba(201,168,76,0.25)',
        'glow-red':    '0 0 20px rgba(201,76,76,0.3)',
        'glow-blue':   '0 0 20px rgba(76,126,201,0.3)',
        'glow-purple': '0 0 20px rgba(139,76,201,0.3)',
        'glow-green':  '0 0 20px rgba(76,170,111,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
