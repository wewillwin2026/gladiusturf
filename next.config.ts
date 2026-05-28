import type { NextConfig } from "next";

/**
 * Content Security Policy — GladiusTurf.
 *
 * Self-only by default. Inline script/style allowed because Next.js
 * hydration + Tailwind injected styles require it (migration to
 * nonce-based strict-dynamic is queued for Phase-E hardening).
 *
 * Connect-src includes Supabase (data plane) and the gladiusturf
 * tracker beacon. Frame ancestors fully denied — the marketing site
 * is never embedded.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: https://*.stripe.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://hooks.stripe.com",
  // Allow embedding by the Ecosystem HQ (founders portal at gladiuscrm.com)
  // for the Verticals tab's live-preview iframes. Everywhere else is locked.
  "frame-ancestors 'self' https://gladiuscrm.com https://www.gladiuscrm.com",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  // SAMEORIGIN (not DENY) so CSP frame-ancestors can layer in the HQ
  // exception. Modern browsers prefer CSP frame-ancestors; X-Frame-Options
  // is the legacy fallback.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  outputFileTracingIncludes: {
    "/api/contract/bright-lights/sign": [
      "./public/contracts/bright-lights-proposal-agreement.pdf",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default config;
