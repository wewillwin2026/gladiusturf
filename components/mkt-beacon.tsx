"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Cross-origin marketing beacon — loads gladiuscrm.com/m.js for unified
 * ecosystem-wide attribution. PUBLIC marketing routes only.
 *
 * Hard gate: never mounted under `/app/*` (tenant CRM workspace) or any
 * authenticated surface where customer activity must not bleed into the
 * marketing tracking pipeline.
 *
 * Per Ecosystem HQ Marketing/Tracking spec — see
 * project_gladius_hq_marketing_tracking memory.
 */
export function MktBeacon() {
  const pathname = usePathname() ?? "";

  // Block: tenant CRM workspace + tenant auth surfaces.
  if (pathname === "/app" || pathname.startsWith("/app/")) {
    return null;
  }

  return (
    <Script
      src="https://gladiuscrm.com/m.js"
      strategy="afterInteractive"
      data-mkt-source="gladiusturf"
    />
  );
}
