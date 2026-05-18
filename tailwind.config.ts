import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px -18px rgba(15, 23, 42, 0.25)"
      },
      colors: {
        panel: "#f8fafc",
        background: "#0A0A0B",
        surface: "#16161A",
        surfaceElevated: "#1C1C22",
        border: "#2A2A30",
        borderHover: "#3A3A42",
        textPrimary: "#FFFFFF",
        textSecondary: "#A1A1AA",
        textMuted: "#71717A",
        brand: "#1FBA5A",
        brandHover: "#27D366",
        competitor: "#EF4444",
        neutral: "#3B82F6",
        warning: "#F59E0B",
        success: "#1FBA5A"
      }
    }
  },
  plugins: []
};

export default config;
