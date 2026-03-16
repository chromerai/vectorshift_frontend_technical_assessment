/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        canvas:  '#0f1117',
        surface: '#1a1d27',
        panel:   '#21253a',
        border:  '#2e3250',
        accent:  '#6366f1',
        'accent-light': '#818cf8',
        'accent-dark':  '#4f46e5',
        muted:   '#4b5280',
        soft:    '#9ca3c8',
      },
      boxShadow: {
        node: '0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(99,102,241,0.25)',
        chip: '0 2px 8px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0, transform: 'scale(0.97)' },
          to:   { opacity: 1, transform: 'scale(1)'    },
        },
      },
    },
  },
  plugins: [],
};

