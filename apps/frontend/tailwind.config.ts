import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        background: "#FAFBFF",
        foreground: "#1A1A2E",
        primary: {
          DEFAULT: "#6C5CE7",
          foreground: "#FFFFFF",
          light: "#A29BFE",
          dark: "#5A4BD1",
        },
        muted: {
          DEFAULT: "#F4F3FF",
          foreground: "#6B7280",
        },
        accent: {
          purple: "#6C5CE7",
          pink: "#E84393",
          blue: "#0984E3",
          green: "#00B894",
          yellow: "#FDCB6E",
          red: "#FF6B6B",
          orange: "#E17055",
        },
        card: {
          DEFAULT: "#FFFFFF",
          border: "#E8E5FF",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        "glow-sm": "0 0 20px rgba(108, 92, 231, 0.15)",
        "glow-md": "0 0 40px rgba(108, 92, 231, 0.2)",
        "glow-lg": "0 0 60px rgba(108, 92, 231, 0.3)",
        "card": "0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(108, 92, 231, 0.06)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.06), 0 12px 28px rgba(108, 92, 231, 0.12)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "gradient-shift": "gradientShift 8s ease infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
