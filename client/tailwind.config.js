/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#030B1A",
          900: "#061226",
          800: "#0A1F3F",
          700: "#0D2B57",
          600: "#1A3A6B",
          500: "#1E4A8A",
          400: "#2563EB",
          300: "#60A5FA",
          200: "#BAD8FF",
          100: "#DDEEFF",
          50:  "#EEF6FF",
        },
        gold: {
          700: "#92620A",
          600: "#B8860B",
          500: "#D4AF37",
          400: "#E8C84A",
          300: "#F3D96A",
          200: "#F9EAA3",
          100: "#FDF6D6",
          50:  "#FFFDF0",
        },
        gsuccess: { 600: "#16A34A", 50: "#F0FDF4", 200: "#BBF7D0" },
        gerror:   { 600: "#DC2626", 50: "#FEF2F2", 200: "#FECACA" },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans:    ["'DM Sans'", "system-ui", "sans-serif"],
      },
      fontWeight: {
        300: "300",
        400: "400",
        500: "500",
        600: "600",
        700: "700",
        800: "800",
      },
      animation: {
        "fade-up":    "fadeUp 0.6s ease-out forwards",
        "fade-in":    "fadeIn 0.5s ease-out forwards",
        "ken-burns":  "kenBurns 8s ease-in-out infinite alternate",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:    { "0%": { opacity: 0, transform: "translateY(24px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        fadeIn:    { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        kenBurns:  { "0%": { transform: "scale(1.0)" }, "100%": { transform: "scale(1.08)" } },
        pulseSoft: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.7 } },
      },
      boxShadow: {
        "gold":       "0 4px 24px -4px rgba(212,175,55,0.35)",
        "navy":       "0 4px 24px -4px rgba(6,18,38,0.45)",
        "card":       "0 2px 16px -2px rgba(6,18,38,0.12), 0 1px 4px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 32px -4px rgba(6,18,38,0.2), 0 2px 8px rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #E8C84A 100%)",
        "navy-gradient": "linear-gradient(135deg, #030B1A 0%, #061226 50%, #0A1F3F 100%)",
        "section-gradient": "linear-gradient(180deg, #F8FAFF 0%, #EEF4FF 100%)",
      },
    },
  },
  plugins: [],
}
