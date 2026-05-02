"use client";

import * as React from "react";

export function StormToggle() {
  const [active, setActive] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => setActive((v) => !v)}
      role="switch"
      aria-checked={active}
      className="flex flex-col items-end gap-1.5 transition-opacity"
    >
      <span
        className="text-[10px] uppercase tracking-[0.16em]"
        style={{
          color: active ? "var(--bl-success)" : "var(--bl-text-faint)",
        }}
      >
        {active ? "Storm response · Active" : "Storm response · Standby"}
      </span>
      <span
        className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors"
        style={{
          background: active
            ? "rgba(156,216,110,0.32)"
            : "rgba(245,239,230,0.12)",
          border: `1px solid ${active ? "rgba(156,216,110,0.6)" : "var(--bl-border-strong)"}`,
        }}
      >
        <span
          className="absolute h-5 w-5 rounded-full transition-all"
          style={{
            background: active ? "var(--bl-success)" : "var(--bl-text-muted)",
            left: active ? 30 : 4,
            top: 2,
          }}
        />
      </span>
    </button>
  );
}
