import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#050505", // Almost total black
        foreground: "#E0E0E0", // Light gray for better readability
        primary: {
          DEFAULT: "#E0B76A", // Ethereal Gold
          foreground: "#050505",
        },
        secondary: {
          DEFAULT: "#3E8E8C", // Serene Teal
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#1A1A1A", // Slightly lighter black for muted backgrounds
          foreground: "#B0B0B0",
        },
        accent: {
          DEFAULT: "#6A5ACD", // Quantum Violet
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#050505",
          foreground: "#E0E0E0",
        },
        card: {
          DEFAULT: "#1A1A1A", // Slightly lighter black for cards
          foreground: "#E0E0E0",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "scroll-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scroll-x": "scroll-x 40s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
