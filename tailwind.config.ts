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
      "forest-deep": "#062018",
      "forest-mid": "#0A2D22",
      moss: "#7FE27A",
      "moss-bright": "#9DFF8A",
      lime: "#C6F352",
      "lime-bright": "#D4FF4A",
      honey: "#E8B86B",
      "honey-deep": "#B8893E",
      "honey-bright": "#F4CC85",
      copper: "#C68A56",
      bone: "#F5F1E8",
      obsidian: "#0C0C0C",
      pitch: "#050505",
      "slate-deep": "#131512",
      parchment: "#EAE3D2",
      champagne: "#C9A87A",
      "champagne-bright": "#D4B27A",
      sage: "#7A9B72",
      paper: "#FAFAF7",
      stone: "#6B6B6B",
      white: "#FFFFFF",
      black: "#000000",
      // Gladius app/War-Room palette (Option-2). CSS vars defined in app.css.
      // These only render correctly inside the .gladius-app wrapper.
      "g-bg": "var(--g-bg)",
      "g-surface": "var(--g-surface)",
      "g-surface-2": "var(--g-surface-2)",
      "g-border": "var(--g-border)",
      "g-border-subtle": "var(--g-border-subtle)",
      "g-text": "var(--g-text)",
      "g-text-muted": "var(--g-text-muted)",
      "g-text-faint": "var(--g-text-faint)",
      "g-accent": "var(--g-accent)",
      "g-accent-hover": "var(--g-accent-hover)",
      "g-accent-faint": "var(--g-accent-faint)",
      "g-success": "var(--g-success)",
      "g-warning": "var(--g-warning)",
      "g-danger": "var(--g-danger)",
      "g-info": "var(--g-info)",
    },
    fontFamily: {
      sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      serif: ["var(--font-fraunces)", "ui-serif", "serif"],
      mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      // App/War Room only — used inside .gladius-app
      "geist-sans": ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      "geist-mono": ["var(--font-geist-mono)", "ui-monospace", "monospace"],
    },
    borderRadius: {
      none: "0",
      sm: "4px",
      DEFAULT: "8px",
      md: "8px",
      lg: "12px",
      xl: "16px",
      "2xl": "20px",
      "3xl": "24px",
      full: "9999px",
    },
    extend: {
      maxWidth: {
        content: "1200px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,61,46,0.08)",
        pop: "0 0 0 1px rgba(127,226,122,0.2), 0 30px 80px -20px rgba(127,226,122,0.3)",
        "pop-honey":
          "0 0 0 1px rgba(232,184,107,0.2), 0 30px 80px -20px rgba(232,184,107,0.3)",
        cta: "0 0 0 1px rgba(198,243,82,0.4), 0 20px 40px -12px rgba(198,243,82,0.6)",
        "cta-hover":
          "0 0 0 1px rgba(198,243,82,0.7), 0 24px 48px -12px rgba(198,243,82,0.8)",
        "pop-champagne":
          "0 0 0 1px rgba(201,168,122,0.25), 0 30px 80px -20px rgba(201,168,122,0.35)",
        "cta-champagne":
          "0 0 0 1px rgba(212,178,122,0.4), 0 20px 40px -12px rgba(212,178,122,0.5)",
        "crest-glow":
          "0 0 80px -20px rgba(157,255,138,0.15), 0 0 200px -40px rgba(201,168,122,0.2)",
        none: "none",
      },
      borderColor: {
        DEFAULT: "rgba(245, 241, 232, 0.10)",
        emphasis: "rgba(127, 226, 122, 0.32)",
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
        crest: "0.22em",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.4)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
