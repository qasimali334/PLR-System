/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#0a0a1a',
          secondary: '#0f0f23',
          card: '#13132b',
          elevated: '#1a1a38',
          border: '#1e1e3f',
        },
        primary: {
          DEFAULT: '#7c6fff',
          light: '#a89bff',
          dark: '#5a4fd6',
          glow: 'rgba(124,111,255,0.3)',
        },
        secondary: {
          DEFAULT: '#00e5b0',
          light: '#4dffd5',
          dark: '#00b88c',
          glow: 'rgba(0,229,176,0.3)',
        },
        accent: {
          DEFAULT: '#ff6b9d',
          light: '#ff9bbf',
          dark: '#cc4477',
          glow: 'rgba(255,107,157,0.3)',
        },
        warning: {
          DEFAULT: '#ffcc44',
          dark: '#cc9900',
        },
        success: { DEFAULT: '#34d399' },
        danger: { DEFAULT: '#f87171' },
        text: {
          primary: '#e8e8ff',
          secondary: '#b0aed0',
          muted: '#6b6990',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7c6fff 0%, #00e5b0 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2a 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(124,111,255,0.1) 0%, rgba(0,229,176,0.05) 100%)',
        'gradient-violet': 'linear-gradient(135deg, #7c6fff 0%, #a855f7 100%)',
        'gradient-teal': 'linear-gradient(135deg, #00e5b0 0%, #0ea5e9 100%)',
        'gradient-coral': 'linear-gradient(135deg, #ff6b9d 0%, #ff9144 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(124,111,255,0.4)',
        'glow-secondary': '0 0 30px rgba(0,229,176,0.4)',
        'glow-accent': '0 0 30px rgba(255,107,157,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out infinite 2s',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
