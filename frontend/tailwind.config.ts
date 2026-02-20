import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#5B3EFF",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#10B981",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#9B51E0",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "rgba(255,255,255,0.8)",
          foreground: "#0F172A",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        sidebar: {
          DEFAULT: "rgba(255,255,255,0.85)",
          foreground: "#64748B",
          primary: "#5B3EFF",
          "primary-foreground": "#ffffff",
          accent: "rgba(91,62,255,0.08)",
          "accent-foreground": "#5B3EFF",
          border: "rgba(255,255,255,0.4)",
          ring: "#5B3EFF",
          hover: "rgba(91,62,255,0.08)",
          muted: "#64748B",
        },
      },
      borderRadius: {
        lg: "20px",
        md: "12px",
        sm: "8px",
        xl: "24px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 10px 25px -5px rgba(91, 62, 255, 0.12)",
        "primary": "0 4px 14px 0 rgba(91, 62, 255, 0.3)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
