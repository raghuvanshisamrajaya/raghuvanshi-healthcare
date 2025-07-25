/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'healthcare-blue': '#004AAD',
        'healthcare-green': '#29AB87',
        'healthcare-light-blue': '#E6F3FF',
        'healthcare-light-green': '#E6F7F1',
        'healthcare-dark-blue': '#003285',
        'healthcare-dark-green': '#1F8A66',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-healthcare': 'linear-gradient(135deg, #004AAD 0%, #29AB87 100%)',
        'gradient-healthcare-light': 'linear-gradient(135deg, #E6F3FF 0%, #E6F7F1 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      boxShadow: {
        'healthcare': '0 25px 50px -12px rgba(0, 74, 173, 0.25)',
        'healthcare-green': '0 25px 50px -12px rgba(41, 171, 135, 0.25)',
        'glow': '0 0 20px rgba(0, 74, 173, 0.3)',
        'glow-green': '0 0 20px rgba(41, 171, 135, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
