export default {
  content: [
    'display-components/**/*.{vue,ts,js}',
    '.playground/blocks/**/*.{vue,ts,js}',
    'stories/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extends: {
      screens: {
        lg: '1070px',
      },
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
}
