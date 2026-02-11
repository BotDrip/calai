/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#F4FAFB',
        primary: '#0EA5E9',
        accent: '#22C55E',
        charcoal: '#1F2937',
        mist: '#E7F2F4',
      },
      boxShadow: {
        glass: '0 10px 30px rgba(15, 23, 42, 0.08)',
        soft: '0 12px 24px rgba(15, 23, 42, 0.08)',
      },
      backgroundImage: {
        hero: 'linear-gradient(120deg, rgba(14,165,233,0.18), rgba(34,197,94,0.12))',
      },
      fontFamily: {
        heading: ['Poppins', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
