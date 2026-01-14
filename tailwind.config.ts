import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4791EA',
          50: '#e8f3fd',
          100: '#d1e7fb',
          200: '#a3d0f7',
          300: '#75b8f3',
          400: '#4791EA',
          500: '#4791EA',
          600: '#2874d1',
          700: '#1f5ba8',
          800: '#16427e',
          900: '#0d2954',
        },
        secondary: {
          DEFAULT: '#F5F5F5',
          50: '#ffffff',
          100: '#fafafa',
          200: '#F5F5F5',
          300: '#e5e5e5',
          400: '#d4d4d4',
          500: '#a3a3a3',
          600: '#737373',
          700: '#525252',
          800: '#404040',
          900: '#262626',
        },
        dark: {
          DEFAULT: '#0A0909',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0A0909',
        },
        background: '#FFFFFF',
        surface: '#FFFFFF',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 15px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}
export default config
