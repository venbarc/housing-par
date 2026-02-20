import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f6f9fc",
        surface: "#ffffff",
        primary: {
          50: "#e8f4ff",
          100: "#cfe6ff",
          200: "#9dceff",
          300: "#6bb5ff",
          400: "#399dff",
          500: "#0f7fe0",
          600: "#0a62b3",
          700: "#084d8f",
          800: "#063a6d",
          900: "#04294f",
        },
        teal: {
          500: "#11b3a3",
        },
        accent: "#11b3a3",
        muted: "#6b7280",
        warning: "#f59e0b",
        danger: "#ef4444",
        success: "#10b981",
      },
      boxShadow: {
        card: "0 10px 35px rgba(15, 127, 224, 0.08)",
        soft: "0 8px 20px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl: "18px",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
