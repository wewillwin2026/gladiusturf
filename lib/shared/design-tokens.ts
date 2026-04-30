// Option-2 Linear/Stripe operator palette
// Source of truth for both /app (demo CRM) and /founders/war-room.
// CSS vars are defined in app/(app-and-founders)/app.css.

export const colors = {
  bg: "var(--g-bg)",
  surface: "var(--g-surface)",
  surface2: "var(--g-surface-2)",
  border: "var(--g-border)",
  borderSubtle: "var(--g-border-subtle)",
  text: "var(--g-text)",
  textMuted: "var(--g-text-muted)",
  textFaint: "var(--g-text-faint)",
  accent: "var(--g-accent)",
  accentHover: "var(--g-accent-hover)",
  accentFaint: "var(--g-accent-faint)",
  success: "var(--g-success)",
  warning: "var(--g-warning)",
  danger: "var(--g-danger)",
  info: "var(--g-info)",
} as const;

export const radii = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  full: 9999,
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  bodySize: 14,
  bodyLine: 1.5,
  h1: { size: 24, weight: 500, tracking: "-0.02em" },
  h2: { size: 18, weight: 500, tracking: "-0.01em" },
  h3: { size: 14, weight: 500, tracking: "0" },
} as const;
