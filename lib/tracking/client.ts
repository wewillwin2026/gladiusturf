"use client";

/**
 * Gladius client tracker. Fires events to /api/track via sendBeacon.
 * Respects DNT and `?notrack`. Auto-captures pageview, scroll depth,
 * rage-click, dead-click, exit. Explicit `track(type, meta)` for the rest.
 */

type Product = "marketing" | "demo_crm" | "war_room";

type Event = {
  type: string;
  product?: Product;
  path?: string;
  target?: string;
  meta?: Record<string, unknown>;
  conversionValueCents?: number;
  ts?: string;
};

type Queue = Event[];

const STORAGE_FINGERPRINT = "gladius_visitor";
const STORAGE_SESSION_ID = "gladius_session_id";
const STORAGE_SESSION_TS = "gladius_session_last_ts";
const SESSION_IDLE_MS = 30 * 60 * 1000;
const FLUSH_INTERVAL_MS = 4000;
const MAX_BATCH = 25;

let queue: Queue = [];
let flushTimer: number | null = null;
let started = false;
let lastFlushPayload: string | null = null;

function isOptedOut(): boolean {
  if (typeof window === "undefined") return true;
  if (window.location.search.includes("notrack")) return true;
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") {
    return true;
  }
  return false;
}

function inferProduct(): Product {
  const p = typeof window !== "undefined" ? window.location.pathname : "";
  if (p.startsWith("/founders")) return "war_room";
  if (p.startsWith("/app")) return "demo_crm";
  return "marketing";
}

async function ensureFingerprint(): Promise<string> {
  let fp = localStorage.getItem(STORAGE_FINGERPRINT);
  if (fp) return fp;
  const seed = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    Math.random(),
    Date.now(),
  ].join("|");
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = new TextEncoder().encode(seed);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    fp = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } else {
    fp = btoa(seed).slice(0, 64);
  }
  localStorage.setItem(STORAGE_FINGERPRINT, fp);
  return fp;
}

function ensureSession(): string {
  const now = Date.now();
  const lastTs = Number(sessionStorage.getItem(STORAGE_SESSION_TS) || "0");
  let id = sessionStorage.getItem(STORAGE_SESSION_ID);
  if (!id || now - lastTs > SESSION_IDLE_MS) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `s_${now}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(STORAGE_SESSION_ID, id);
  }
  sessionStorage.setItem(STORAGE_SESSION_TS, String(now));
  return id;
}

function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(
    (k) => {
      const v = sp.get(k);
      if (v) out[k] = v;
    },
  );
  return out;
}

async function flush(reason: "interval" | "unload" | "size" = "interval") {
  if (queue.length === 0) return;
  const events = queue.splice(0, MAX_BATCH);
  const fingerprint = await ensureFingerprint();
  const sessionId = ensureSession();
  const payload = {
    fingerprint,
    sessionId,
    product: inferProduct(),
    utm: readUtm(),
    referrer: document.referrer || null,
    screen: { w: window.innerWidth, h: window.innerHeight },
    events,
  };
  const json = JSON.stringify(payload);
  // Skip empty duplicate flushes during quick navigations.
  if (json === lastFlushPayload) return;
  lastFlushPayload = json;
  try {
    if (reason === "unload" && navigator.sendBeacon) {
      const blob = new Blob([json], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
      return;
    }
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: true,
    });
  } catch {
    // Re-queue on failure so we try again next tick.
    queue = [...events, ...queue].slice(0, 200);
  }
}

function scheduleFlush() {
  if (flushTimer !== null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flush("interval");
  }, FLUSH_INTERVAL_MS);
}

export function track(type: string, meta?: Record<string, unknown>) {
  if (isOptedOut() || typeof window === "undefined") return;
  queue.push({
    type,
    product: inferProduct(),
    path: window.location.pathname + window.location.search,
    meta,
    ts: new Date().toISOString(),
  });
  if (queue.length >= MAX_BATCH) {
    void flush("size");
  } else {
    scheduleFlush();
  }
}

export function trackConversion(
  type: string,
  valueCents: number,
  meta?: Record<string, unknown>,
) {
  if (isOptedOut() || typeof window === "undefined") return;
  queue.push({
    type,
    product: inferProduct(),
    path: window.location.pathname + window.location.search,
    meta,
    conversionValueCents: valueCents,
    ts: new Date().toISOString(),
  });
  void flush("size");
}

// ----- auto-capture wiring -----

let lastClickAt = 0;
let lastClickX = 0;
let lastClickY = 0;
let recentClicks = 0;
let recentClickResetTimer: number | null = null;
const SCROLL_DEPTHS_FIRED = new Set<number>();

function targetDescriptor(el: Element | null): string {
  if (!el) return "";
  const explicit = (el.closest("[data-track]") as HTMLElement | null)?.dataset
    ?.track;
  if (explicit) return explicit;
  const tag = el.tagName.toLowerCase();
  const id = (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : "";
  const text = (el.textContent || "").trim().slice(0, 48);
  return `${tag}${id}${text ? `:${text}` : ""}`;
}

function onClick(e: MouseEvent) {
  const now = Date.now();
  const target = e.target as Element | null;
  const desc = targetDescriptor(target);

  // Rage-click detection: 3+ clicks within 800ms in a 40px radius.
  const dx = Math.abs(e.clientX - lastClickX);
  const dy = Math.abs(e.clientY - lastClickY);
  if (now - lastClickAt < 800 && dx < 40 && dy < 40) {
    recentClicks += 1;
    if (recentClicks >= 3) {
      track("rage_click", { target: desc, x: e.clientX, y: e.clientY });
      recentClicks = 0;
    }
  } else {
    recentClicks = 1;
  }
  lastClickAt = now;
  lastClickX = e.clientX;
  lastClickY = e.clientY;
  if (recentClickResetTimer) window.clearTimeout(recentClickResetTimer);
  recentClickResetTimer = window.setTimeout(() => {
    recentClicks = 0;
  }, 1500);

  // Dead-click: click on something that isn't a link/button/input/[role].
  const interactive = target?.closest(
    "a,button,input,textarea,select,[role=button],[role=link],[data-track]",
  );
  if (!interactive) {
    track("dead_click", { target: desc, x: e.clientX, y: e.clientY });
    return;
  }
  track("click", { target: desc });
}

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return;
  const pct = Math.min(100, Math.round((window.scrollY / max) * 100));
  for (const milestone of [25, 50, 75, 90]) {
    if (pct >= milestone && !SCROLL_DEPTHS_FIRED.has(milestone)) {
      SCROLL_DEPTHS_FIRED.add(milestone);
      track(`scroll_depth_${milestone}`, { pct });
    }
  }
}

function onPagehide() {
  track("exit");
  void flush("unload");
}

function firePageview() {
  SCROLL_DEPTHS_FIRED.clear();
  track("pageview", {
    title: document.title,
    referrer: document.referrer || null,
  });
}

let lastPath = "";
function watchRouteChange() {
  const cur = window.location.pathname + window.location.search;
  if (cur !== lastPath) {
    lastPath = cur;
    firePageview();
  }
}

export function startTracking() {
  if (started || typeof window === "undefined") return;
  if (isOptedOut()) return;
  started = true;
  lastPath = window.location.pathname + window.location.search;

  firePageview();

  document.addEventListener("click", onClick, true);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", onPagehide);
  window.addEventListener("beforeunload", () => void flush("unload"));

  // Patch history methods so SPA route changes fire pageviews.
  const origPush = history.pushState;
  const origReplace = history.replaceState;
  history.pushState = function (...args) {
    const r = origPush.apply(this, args as Parameters<typeof origPush>);
    queueMicrotask(watchRouteChange);
    return r;
  };
  history.replaceState = function (...args) {
    const r = origReplace.apply(this, args as Parameters<typeof origReplace>);
    queueMicrotask(watchRouteChange);
    return r;
  };
  window.addEventListener("popstate", watchRouteChange);

  // Periodic flush.
  window.setInterval(() => void flush("interval"), FLUSH_INTERVAL_MS);
}
