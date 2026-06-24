/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paper': '#FFFFFF',
        'bg': '#F7F3ED',
        'ink': '#3A2E28',
        'ink-soft': '#6B5D54',
        'muted': '#A89684',
        'faint': '#C4B4A2',
        'line': '#ECE3D8',
        'accent': '#D98E5F',
        'accent-deep': '#B06B3E',
        'accent-soft': '#F6E5D6',
        'accent-tint': '#FBF3EC',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif SC', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
