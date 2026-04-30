"use client";

import * as React from "react";
import { Loader2, Satellite } from "lucide-react";

type Measurements = {
  address: string;
  lat: number;
  lng: number;
  turfSqft: number;
  drivewaySqft: number;
  bedsSqft: number;
  trees: number;
  polygon: [number, number][];
};

/**
 * Satellite measurement viewer. Two modes:
 *
 *   1. Real Mapbox satellite tile via Mapbox Static Tile API (no JS dep, just
 *      an <img>) when NEXT_PUBLIC_MAPBOX_TOKEN is present. Animated polygon
 *      is drawn via SVG overlay.
 *
 *   2. Stylized abstract satellite view (gradient + grid + animated polygon)
 *      when no token. Demo still works visually; just looks like a stylized
 *      mock instead of real satellite imagery.
 */
export function SatelliteCanvas({
  mapboxToken,
  measuring,
  measurements,
}: {
  mapboxToken: string | null;
  measuring: boolean;
  measurements: Measurements | null;
}) {
  if (measuring && !measurements) {
    return (
      <div className="relative w-full h-full bg-g-surface-2 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,210,106,0.08),transparent_60%)]" />
        <div className="flex flex-col items-center gap-3 text-g-text-muted">
          <div className="relative h-12 w-12">
            <Satellite className="h-12 w-12 text-g-accent animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-g-accent/30 animate-ping" />
          </div>
          <div className="flex items-center gap-2 text-[12px] font-geist-mono">
            <Loader2 className="h-3 w-3 animate-spin" />
            Measuring property…
          </div>
          <div className="text-[10px] text-g-text-faint">
            Pulling satellite tile · drawing lot polygon · counting trees
          </div>
        </div>
      </div>
    );
  }

  if (!measurements) {
    return (
      <div className="w-full h-full bg-g-surface-2 flex items-center justify-center text-g-text-faint text-[12px]">
        Enter an address to begin
      </div>
    );
  }

  if (mapboxToken) {
    return <RealSatellite token={mapboxToken} m={measurements} />;
  }
  return <FallbackSatellite m={measurements} />;
}

function RealSatellite({
  token,
  m,
}: {
  token: string;
  m: Measurements;
}) {
  // Mapbox Static Images API — single PNG, no JS bundle hit.
  const w = 1280;
  const h = 800;
  const zoom = 18;
  const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${m.lng},${m.lat},${zoom},0/${w}x${h}@2x?access_token=${encodeURIComponent(token)}`;

  return (
    <div className="relative w-full h-full bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Satellite view of ${m.address}`}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <PolygonOverlay m={m} />
      <Legend m={m} />
    </div>
  );
}

function FallbackSatellite({ m }: { m: Measurements }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #1a3a25 0%, #0a1a13 60%, #050a08 100%)",
        }}
      />
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <path
              d="M 4 0 L 0 0 0 4"
              fill="none"
              stroke="rgba(0, 210, 106, 0.18)"
              strokeWidth="0.1"
            />
          </pattern>
        </defs>
        <rect width="100" height="60" fill="url(#grid)" />
      </svg>
      <PolygonOverlay m={m} />
      <Legend m={m} />
    </div>
  );
}

function PolygonOverlay({ m }: { m: Measurements }) {
  // Compute polygon bounds, scale into a 1:1 svg viewport with padding.
  const lats = m.polygon.map((p) => p[0]);
  const lngs = m.polygon.map((p) => p[1]);
  const minLat = Math.min(...lats),
    maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs),
    maxLng = Math.max(...lngs);
  const padding = 0.18;
  const w = 100;
  const h = 60;
  const dLat = maxLat - minLat || 0.0001;
  const dLng = maxLng - minLng || 0.0001;

  const points = m.polygon
    .map(([lat, lng]) => {
      const x = ((lng - minLng) / dLng) * (w * (1 - padding * 2)) + w * padding;
      // Invert latitude so north is up.
      const y = ((maxLat - lat) / dLat) * (h * (1 - padding * 2)) + h * padding;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
    >
      <polygon
        points={points}
        fill="rgba(0, 210, 106, 0.18)"
        stroke="rgb(0, 210, 106)"
        strokeWidth="0.4"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 200,
          strokeDashoffset: 200,
          animation: "gladius-draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      />
      <style>{`@keyframes gladius-draw { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  );
}

function Legend({ m }: { m: Measurements }) {
  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-g-accent/30 bg-black/70 backdrop-blur px-2.5 py-1.5 text-[10px] font-geist-mono text-white tabular-nums">
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-g-accent" />
        {m.lat.toFixed(5)}, {m.lng.toFixed(5)}
      </span>
      <span className="text-white/40">·</span>
      <span>z 18</span>
    </div>
  );
}
