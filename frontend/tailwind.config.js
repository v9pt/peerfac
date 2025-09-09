/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '25%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          },
          '75%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': {
                color: 'inherit',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    // Dynamic color classes for components
    {
      pattern: /bg-(red|green|blue|yellow|purple|orange|pink|indigo|gray)-(100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus', 'dark', 'dark:hover', 'dark:focus'],
    },
    {
      pattern: /text-(red|green|blue|yellow|purple|orange|pink|indigo|gray)-(100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus', 'dark', 'dark:hover', 'dark:focus'],
    },
    {
      pattern: /border-(red|green|blue|yellow|purple|orange|pink|indigo|gray)-(100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus', 'dark', 'dark:hover', 'dark:focus'],
    },
    {
      pattern: /from-(red|green|blue|yellow|purple|orange|pink|indigo|gray)-(100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /to-(red|green|blue|yellow|purple|orange|pink|indigo|gray)-(100|200|300|400|500|600|700|800|900)/,
    },
    'animate-pulse',
    'animate-spin',
    'animate-bounce',
    'animate-float',
    'animate-pulse-slow',
    'animate-gradient-x',
    'animate-gradient-y',
    'animate-gradient-xy',
  ]
};