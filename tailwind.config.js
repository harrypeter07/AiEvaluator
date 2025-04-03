/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",      // Scans the app directory
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",     // If using pages directory
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Scans your components
  ],
  theme: {
    extend: {}, // Add customizations here if needed
  },
  plugins: [],
};