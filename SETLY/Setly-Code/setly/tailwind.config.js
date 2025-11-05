/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    'z-[9999]',
    'opacity-0', 'opacity-100',
    'pointer-events-none', 'pointer-events-auto',
    'translate-y-4'
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        white: '#ffffff',
        black: '#ffffff',
        brand: { blue: '#007BFF', ink: '#6c757d' },
        gray: { 50:'#F8F9FA',100:'#E9ECEF',200:'#DEE2E6',300:'#CED4DA',400:'#ADB5BD',500:'#6C757D',600:'#495057',700:'#343A40',800:'#212529',900:'#000000' }
      }
    },
  },
  plugins: [],
}
