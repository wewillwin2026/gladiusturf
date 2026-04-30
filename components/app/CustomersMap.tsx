"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Customer } from "@/lib/shared/types";
import { money } from "@/lib/shared/format";

/**
 * Lightweight customer map. Real Mapbox GL renders interactively when the
 * token is present; otherwise falls back to a styled SVG plot of the same
 * coordinates. Both modes link each pin to /app/customers/[id].
 */
export function CustomersMap({
  customers,
  mapboxToken,
  selected,
}: {
  customers: Customer[];
  mapboxToken: string | null;
  selected: Set<string>;
}) {
  if (!customers.length) {
    return (
      <div className="g-card p-12 flex items-center justify-center text-g-text-muted text-[13px]">
        No customers match the current filters.
      </div>
    );
  }

  if (mapboxToken) {
    return <RealMap customers={customers} token={mapboxToken} selected={selected} />;
  }
  return <FallbackMap customers={customers} selected={selected} />;
}

function bounds(customers: Customer[]) {
  const lats = customers.map((c) => c.lat);
  const lngs = customers.map((c) => c.lng);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

function RealMap({
  customers,
  token,
  selected,
}: {
  customers: Customer[];
  token: string;
  selected: Set<string>;
}) {
  // Static Tiles API + absolute-positioned pins. Fast, no GL bundle hit on
  // first paint, links work as plain <a>'s.
  const b = bounds(customers);
  const centerLat = (b.minLat + b.maxLat) / 2;
  const centerLng = (b.minLng + b.maxLng) / 2;
  const w = 1280;
  const h = 720;
  const zoom = 11;
  const url = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${centerLng},${centerLat},${zoom},0/${w}x${h}@2x?access_token=${encodeURIComponent(token)}`;

  return (
    <div
      className="g-card overflow-hidden relative"
      style={{ height: 540 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Map of ${customers.length} customers`}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <Pins customers={customers} bounds={b} selected={selected} />
    </div>
  );
}

function FallbackMap({
  customers,
  selected,
}: {
  customers: Customer[];
  selected: Set<string>;
}) {
  const b = bounds(customers);
  return (
    <div
      className="g-card overflow-hidden relative"
      style={{
        height: 540,
        background:
          "radial-gradient(ellipse at 30% 30%, #102018 0%, #0a1612 60%, #050a08 100%)",
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="map-grid"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 6 0 L 0 0 0 6"
              fill="none"
              stroke="rgba(0, 210, 106, 0.15)"
              strokeWidth="0.1"
            />
          </pattern>
        </defs>
        <rect width="100" height="60" fill="url(#map-grid)" />
      </svg>
      <Pins customers={customers} bounds={b} selected={selected} />
      <div className="absolute bottom-3 right-3 text-[10px] text-g-text-faint border border-g-border-subtle bg-black/40 backdrop-blur rounded px-2 py-1 font-geist-mono">
        Stylized fallback · add NEXT_PUBLIC_MAPBOX_TOKEN for satellite
      </div>
    </div>
  );
}

function Pins({
  customers,
  bounds: b,
  selected,
}: {
  customers: Customer[];
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  selected: Set<string>;
}) {
  const dLat = b.maxLat - b.minLat || 0.001;
  const dLng = b.maxLng - b.minLng || 0.001;
  const padding = 0.06;
  return (
    <>
      {customers.slice(0, 200).map((c) => {
        const x = ((c.lng - b.minLng) / dLng) * (1 - padding * 2) + padding;
        const y = ((b.maxLat - c.lat) / dLat) * (1 - padding * 2) + padding;
        const isSelected = selected.has(c.id);
        return (
          <Link
            key={c.id}
            href={`/app/customers/${c.id}`}
            prefetch
            className="absolute group"
            style={{
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            title={`${c.name} · ${money(c.ltvCents)}`}
          >
            <span className="relative flex items-center justify-center">
              <span
                className={
                  isSelected
                    ? "absolute h-3.5 w-3.5 rounded-full bg-g-accent/30 animate-ping"
                    : ""
                }
              />
              <MapPin
                className={
                  isSelected
                    ? "h-4 w-4 text-g-accent drop-shadow-[0_0_6px_rgba(0,210,106,0.8)]"
                    : c.tier === "Enterprise"
                      ? "h-3.5 w-3.5 text-g-warning"
                      : c.tier === "Pro"
                        ? "h-3.5 w-3.5 text-g-info"
                        : "h-3 w-3 text-g-accent/80"
                }
              />
            </span>
            <span className="hidden group-hover:block absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-g-border bg-g-surface px-2 py-1 text-[11px] text-g-text shadow-xl z-10">
              {c.name} · {money(c.ltvCents)}
            </span>
          </Link>
        );
      })}
      {customers.length > 200 && (
        <div className="absolute top-3 left-3 text-[10px] font-geist-mono text-g-text-faint bg-black/60 border border-g-border-subtle rounded px-2 py-1">
          Showing first 200 of {customers.length} pins
        </div>
      )}
    </>
  );
}
