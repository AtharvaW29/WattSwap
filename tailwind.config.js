/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./node_modules/tw-elements-react/dist/js/**/*.js"
  ],
  theme: {
      extend: {
        backgroundColor: {
        'base1': 'rgba(9, 0, 22, 1)',
        },
        transitionProperty: {
          'violet': 'background-color',
        },
        transitionDuration: {
          'violet': '300ms',
        },
      },
  },
  darkMode: "class",
  plugins: [require("tw-elements-react/dist/plugin.cjs")]
  }