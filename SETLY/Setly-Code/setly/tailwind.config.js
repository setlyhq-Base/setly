/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    'z-[9999]',
    'opacity-0', 'opacity-100',
    'pointer-events-none', 'pointer-events-auto',
    'translate-y-4',
    // Premium animations
    'animate-fade-in', 'animate-slide-up', 'animate-scale-in',
    // Premium buttons
    'btn-primary', 'btn-secondary', 'btn-ghost',
    // Premium cards
    'card-premium', 'card-glass',
    // Premium inputs
    'input-premium',
    // Premium sections
    'section-premium', 'section-gradient',
    // Premium typography
    'text-premium', 'heading-premium', 'subheading-premium',
    // Premium effects
    'hover-lift', 'hover-glow', 'hover-premium',
    // Premium utilities
    'text-gradient', 'shadow-premium', 'shadow-premium-lg',
    'focus-premium', 'loading-shimmer', 'glass'
    // Brand typography & color utilities (style guide)
    ,'heading-h1','heading-h2','heading-h3','heading-h4','text-body','text-small'
    ,'text-midnight','text-gold','bg-midnight','bg-gold','border-midnight','border-gold','ring-gold'
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        // Core palette (3-tier system)
        transparent: 'transparent',
        current: 'currentColor',
        white: '#ffffff',
        black: '#000000',
        'black-primary': '#0B0B0F',
        brand: {
          primary: '#0A1A3F', // Midnight Blue – primary brand color (Buttons, Icons, Nav, CTAs)
          accent: '#F5C75D',  // North Star Gold – highlights, selected states
          azure: '#3E8FFF',   // Clean Apple-like secondary blue
          aqua: '#5DAEFF',    // Optional freshness accent (use sparingly)
          midnight: '#0A1A3F', // Alias for clarity
          gold: '#F5C75D'      // Alias for clarity
        },
      /* Deprecated aliases removed: use bg-brand-primary / text-brand-primary / border-brand-primary.
        If you need the azure mid-stop use custom gradient utilities or brand-deep backgroundImage. */
        midnight: '#0A1A3F',
        gold: '#F5C75D',
        // Trust neutrals (inspired by premium product palettes)
        neutral: {
          50: '#F7F8FA',      // Background (Off-White)
          100: '#E6E6E6',     // Borders (Soft Slate)
          400: '#6F7785',     // Subtext (Cool Grey)
          900: '#1A1A1A'      // Body text
        },
        success: '#28a745', // Semantic success
        error: '#dc3545',   // Semantic error
        // Legacy ramps retained for backwards compatibility (can be pruned later)
        gray: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#6C757D',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#000000'
        },
        blue: {
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
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'premium-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
      },
      backgroundImage: {
        // Premium deep brand gradient (Midnight Blue → Electric Azure → soft white glow)
        'brand-deep': 'linear-gradient(135deg,#0A1A3F 0%, #0F5FFF 55%, #E8F4FF 85%, #FFFFFF 100%)'
      },
    },
  },
  plugins: [],
}
