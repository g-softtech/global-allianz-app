/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GAIB Brand Colors
        gblue: {
          900: "#1E3A8A", // Deep Blue - Trust, security, professionalism
          800: "#1C3B8F",
          700: "#1E40AF",
          600: "#2563EB", // Royal Blue - Primary actions, highlights
          500: "#3B82F6",
          400: "#60A5FA",
          300: "#93C5FD",
          200: "#BFDBFE",
          100: "#DBEAFE",
          50: "#E0F2FE",  // Light Blue - Backgrounds, soft UI
        },
        gsuccess: {
          600: "#16A34A", // Green - Approved claims, positive actions
        },
        gerror: {
          600: "#DC2626", // Red - Errors, failed payments
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
