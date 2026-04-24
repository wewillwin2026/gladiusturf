import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    // Reset Tailwind's default color palette — spec forbids default blues/purples/grays.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      forest: "#0F3D2E",
      moss: "#7FE27A",
      lime: "#C6F352",
      bone: "#F5F1E8",
      obsidian: "#0C0C0C",
      paper: "#FAFAF7",
      stone: "#6B6B6B",
      white: "#FFFFFF",
      black: "#000000",
    },
    fontFamily: {
      sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      serif: ["var(--font-fraunces)", "ui-serif", "serif"],
      mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
    },
    borderRadius: {
      none: "0",
      sm: "4px",
      DEFAULT: "8px",
      md: "8px",
      lg: "12px",
      full: "9999px",
    },
    extend: {
      maxWidth: {
        content: "1200px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,61,46,0.08)",
        none: "none",
      },
      borderColor: {
        DEFAULT: "rgba(15, 61, 46, 0.12)",
        emphasis: "rgba(15, 61, 46, 0.32)",
      },
      spacing: {
        section: "120px",
        "section-mobile": "80px",
      },
      fontSize: {
        "display-lg": ["56px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["36px", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        "h2-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "h2-md": ["24px", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        stat: ["64px", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "stat-sm": ["48px", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        tagline: "0.15em",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
