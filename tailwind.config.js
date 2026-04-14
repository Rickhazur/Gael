/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{tsx,ts}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Nova ICFES Brand
        'nova-primary': '#1B4D3E',
        'nova-primary-light': '#2D7A5F',
        'nova-primary-dark': '#143A2F',
        'nova-accent': '#F5A623',
        'nova-accent-light': '#FFB84D',
        'nova-bg': '#FAFAF8',
        'nova-surface': '#FFFFFF',
        'nova-border': '#E5E7EB',
        'nova-success': '#059669',
        'nova-warning': '#D97706',
        'nova-error': '#DC2626',
        // Legacy compatibility
        'kid-blue': '#4CC9F0',
        'kid-purple': '#7209B7',
        'kid-pink': '#F72585',
        'kid-yellow': '#FFD60A',
        'kid-orange': '#FF9F1C',
        'kid-green': '#06D6A0',
        'kid-navy': '#3A0CA3',
        'cream': '#FFFDF5',
        'comic-border': '#222222',
        'elite-blue': '#4361EE',
        'elite-indigo': '#3A0CA3',
        'elite-purple': '#7209B7',
        'elite-pink': '#F72585',
        'elite-orange': '#FB8500',
        'elite-cyan': '#4CC9F0',
        'elite-dark': '#1A1A1A',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
        'streak-glow': 'streak-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'streak-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(245,166,35,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(245,166,35,0.7)' },
        },
      },
    },
  },
  plugins: [],
}
