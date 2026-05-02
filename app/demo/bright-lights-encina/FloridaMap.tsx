"use client";

import * as React from "react";
import Image from "next/image";

type Pin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  cluster?: string;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// West-coast Florida bounds — roughly Naples → Clearwater.
const BOUNDS = { south: 26.6, north: 28.05, west: -82.85, east: -82.0 } as const;

function project(lat: number, lng: number, w: number, h: number) {
  const x = ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * w;
  const y = ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * h;
  return { x: Math.max(8, Math.min(w - 8, x)), y: Math.max(8, Math.min(h - 8, y)) };
}

export function FloridaMap({
  customers,
  height = 360,
  highlightId,
}: {
  customers: Pin[];
  height?: number;
  highlightId?: string;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 800, h: height });
  const [hover, setHover] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      const w = wrapRef.current?.clientWidth ?? 800;
      setSize({ w, h: height });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [height]);

  const mapboxUrl = MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/[${BOUNDS.west},${BOUNDS.south},${BOUNDS.east},${BOUNDS.north}]/${Math.round(size.w)}x${height}@2x?access_token=${MAPBOX_TOKEN}&attribution=false&logo=false`
    : null;

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden"
      style={{ height, background: "rgba(0,0,0,0.32)" }}
    >
      {mapboxUrl ? (
        <Image
          src={mapboxUrl}
          alt="West-coast Florida service map"
          fill
          unoptimized
          priority
          className="object-cover opacity-90"
          sizes="100vw"
        />
      ) : (
        <FallbackBackdrop />
      )}

      {customers.map((c) => {
        const { x, y } = project(c.lat, c.lng, size.w, size.h);
        const isHover = hover === c.id;
        const isHighlight = highlightId === c.id;
        return (
          <div
            key={c.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
            onMouseEnter={() => setHover(c.id)}
            onMouseLeave={() => setHover(null)}
          >
            <span
              className="block rounded-full"
              style={{
                width: isHighlight ? 16 : 12,
                height: isHighlight ? 16 : 12,
                background: c.color,
                border: "2px solid rgba(0,0,0,0.55)",
                boxShadow: isHover || isHighlight
                  ? `0 0 0 4px ${c.color}55, 0 0 14px ${c.color}99`
                  : "0 0 0 2px rgba(0,0,0,0.35)",
                transition: "box-shadow 200ms ease",
              }}
            />
            {(isHover || isHighlight) && (
              <div
                className="absolute left-1/2 top-full z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[10px]"
                style={{
                  background: "var(--bl-bg-2)",
                  color: "var(--bl-text)",
                  border: "1px solid var(--bl-border-strong)",
                }}
              >
                {c.name}
                {c.cluster && (
                  <span
                    className="ml-1.5 text-[9px] uppercase tracking-[0.14em]"
                    style={{ color: "var(--bl-text-faint)" }}
                  >
                    · {c.cluster}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div
        className="absolute bottom-2 right-3 text-[9px] uppercase tracking-[0.16em]"
        style={{ color: "var(--bl-text-faint)" }}
      >
        Mapbox · West-coast FL
      </div>
    </div>
  );
}

function FallbackBackdrop() {
  return (
    <svg
      viewBox="0 0 800 360"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="bl-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1428" />
          <stop offset="1" stopColor="#0e1a32" />
        </linearGradient>
        <linearGradient id="bl-land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2438" />
          <stop offset="1" stopColor="#243049" />
        </linearGradient>
      </defs>
      <rect width="800" height="360" fill="url(#bl-water)" />
      <path
        d="M 400 0 L 540 80 L 580 160 L 540 240 L 480 320 L 400 360 L 380 280 L 360 200 L 380 100 Z"
        fill="url(#bl-land)"
        stroke="rgba(244,184,96,0.16)"
        strokeWidth={1}
      />
    </svg>
  );
}
