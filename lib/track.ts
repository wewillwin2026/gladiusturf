/**
 * Conversion tracking — Plausible custom events.
 *
 * Mirrors the funnel-event API from gofetchauto.com (GA4 wrappers) but adapted
 * to Plausible since gladiusturf.com is on Plausible. Use these wrappers from
 * client components only — server inserts to demo_requests already give us the
 * source-of-truth count; this is for marketing-side attribution.
 */

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

function fire(name: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  if (typeof window.plausible !== "function") return;
  try {
    window.plausible(name, props ? { props } : undefined);
  } catch {
    /* noop — never break the UI for analytics */
  }
}

/* === Funnel events === */

export function trackDemoFormStart() {
  fire("demo_form_start");
}

export function trackDemoTierSelected(tier: string) {
  fire("demo_tier_selected", { tier });
}

export function trackDemoSlotPicked(date: string, time: string) {
  fire("demo_slot_picked", { date, time });
}

export function trackDemoBooked(tier: string, wantsBdc: boolean, crewSize: string) {
  fire("demo_booked", { tier, wants_bdc: wantsBdc, crew_size: crewSize });
}

export function trackWaitlistJoin(source: string) {
  fire("waitlist_join", { source });
}

export function trackRoiCompleted(annualRecovery: number) {
  fire("roi_completed", { annual_recovery: Math.round(annualRecovery) });
}

export function trackContactClicked(channel: "phone" | "email" | "sms", which: string) {
  fire("contact_clicked", { channel, which });
}

/* === First-touch UTM capture (call once on landing) === */

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export function captureFirstTouchUtm() {
  if (typeof window === "undefined") return;
  const STORAGE_KEY = "gt_first_touch";
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return;
  const url = new URL(window.location.href);
  const captured: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = url.searchParams.get(k);
    if (v) captured[k] = v;
  }
  if (document.referrer && !document.referrer.includes(window.location.host)) {
    captured["referrer"] = document.referrer;
  }
  captured["landing_page"] = url.pathname;
  captured["captured_at"] = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
}

export function readFirstTouchUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("gt_first_touch");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
