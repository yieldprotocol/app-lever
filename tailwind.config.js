const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    fontFamily: { sans: ['Inter', 'sans-serif'], serif: ['Inter', 'sans-serif'] },
    
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        green: colors.emerald,
        primary: colors.teal,
        secondary: colors.magenta,
        gradient: colors.emerald
      },
      borderWidth: { '0.5':'0.5px' },
    }

  },
  
  plugins: [],
};
