export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Poppins', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: '#6366f1', dark: '#4f46e5' },
        success: '#10b981',
        error: '#ef4444',
        sjc: '#036176',
      },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(0,0,0,0.06)',
        hover: '0 20px 40px -5px rgba(99,102,241,0.12)',
        glow: '0 0 15px rgba(99,102,241,0.5)',
      },
    }
  },
  plugins: [],
}
