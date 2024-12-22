/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'logo-slide': {
          '0%': { opacity: 1, transform: 'translateX(0)' }, // Start at the center
          '50%': { opacity: 1, transform: 'translateX(0)' }, // Stay in the center for 2 seconds
          '100%': { opacity: 1, transform: 'translateX(-180px)' }, // Move to the left (adjust distance)
        },
        'text-appear': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        'fade-in': 'fade-in 2s ease-out forwards',  // Logo fade-in
        'logo-slide': 'logo-slide 4s ease-in-out forwards',  // Logo slides after fade-in
        'text-appear': 'text-appear 2s ease-out 2s forwards',  // Text fades in after logo
      },
    },
  },
  plugins: [],
};
