/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#163A5F",
          50: "#eef3f8",
          100: "#d6e2ee",
          200: "#aec5dd",
          300: "#7fa3c6",
          400: "#4f7ba8",
          500: "#2f5b88",
          600: "#163A5F",
          700: "#122f4d",
          800: "#0f273f",
          900: "#0b1d2f",
        },
        success: "#B7D8B2",
        warning: "#EADFCF",
      },
      fontFamily: {
        sans: ['Assistant', 'Heebo', 'system-ui', 'sans-serif'],
        display: ['Heebo', 'Assistant', 'sans-serif'],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(22, 58, 95, 0.06)",
        card: "0 4px 24px rgba(22, 58, 95, 0.08)",
        float: "0 8px 32px rgba(22, 58, 95, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};
